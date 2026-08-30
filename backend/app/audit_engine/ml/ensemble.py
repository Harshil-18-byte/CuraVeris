import os
import numpy as np
from typing import Tuple, Dict, Any, Optional
from app.core.config import settings

_xgb_model = None
_mlp_model = None
_models_loaded = False


def _load_models():
    global _xgb_model, _mlp_model, _models_loaded
    if _models_loaded:
        return

    xgb_path = os.path.join(settings.ML_MODEL_PATH, "xgboost_model.json")
    mlp_path = os.path.join(settings.ML_MODEL_PATH, "mlp_model.pt")

    if os.path.exists(xgb_path):
        try:
            import xgboost as xgb
            _xgb_model = xgb.Booster()
            _xgb_model.load_model(xgb_path)
        except Exception:
            _xgb_model = None

    if os.path.exists(mlp_path):
        try:
            import torch
            import torch.nn as nn
            
            class BillRiskMLP(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.net = nn.Sequential(
                        nn.Linear(13, 32),
                        nn.ReLU(),
                        nn.Linear(32, 16),
                        nn.ReLU(),
                        nn.Linear(16, 1),
                        nn.Sigmoid(),
                    )
                def forward(self, x):
                    return self.net(x)

            _mlp_model = BillRiskMLP()
            _mlp_model.load_state_dict(torch.load(mlp_path, map_location="cpu"))
            _mlp_model.eval()
        except Exception:
            _mlp_model = None

    _models_loaded = True


def predict_risk_ensemble(
    features: np.ndarray,
    deterministic_violation_count: int,
) -> Tuple[float, str, float, float, str]:
    """
    Evaluates ML ensemble (XGBoost + PyTorch MLP) or falls back to rule-based estimation.
    Returns: (blended_score, risk_label, uncertainty_lower, uncertainty_upper, model_version)
    """
    _load_models()

    if _xgb_model is None and _mlp_model is None:
        # Graceful fallback when trained weights are not located
        version = "SKIPPED_MODEL_NOT_FOUND"
        if deterministic_violation_count > 5:
            score = 0.85
        elif deterministic_violation_count > 2:
            score = 0.60
        elif deterministic_violation_count > 0:
            score = 0.40
        else:
            score = 0.15

        lower = max(0.0, score - 0.08)
        upper = min(1.0, score + 0.08)
    else:
        version = "xgb_mlp_ensemble_v1.0"
        import xgboost as xgb
        import torch

        # XGBoost prediction
        dmat = xgb.DMatrix(features)
        xgb_score = float(_xgb_model.predict(dmat)[0]) if _xgb_model else 0.5

        # MLP prediction
        if _mlp_model:
            with torch.no_grad():
                tensor_input = torch.from_numpy(features)
                mlp_score = float(_mlp_model(tensor_input).numpy()[0, 0])
        else:
            mlp_score = xgb_score

        # 60/40 blend
        score = float(xgb_score * 0.60 + mlp_score * 0.40)

        # Monte Carlo Simulation (1000 samples) for uncertainty bounds
        noise = np.random.normal(0, 0.05, size=(1000, features.shape[1]))
        mc_samples = features + noise
        dmat_mc = xgb.DMatrix(mc_samples)
        mc_preds = _xgb_model.predict(dmat_mc) if _xgb_model else np.full(1000, score)

        lower = float(np.percentile(mc_preds, 5))
        upper = float(np.percentile(mc_preds, 95))

    # Risk Label assignment
    if score < 0.25:
        label = "LOW"
    elif score <= 0.55:
        label = "MEDIUM"
    elif score <= 0.80:
        label = "HIGH"
    else:
        label = "CRITICAL"

    return score, label, lower, upper, version
