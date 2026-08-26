"""Pipeline 4: Deep Neural Network & Hybrid Stacking Ensemble Pipeline.

Blends:
- Multi-Layer Perceptron Deep Neural Network (MLP 128 -> 64 -> 32 -> Sigmoids)
- Gradient Boosted Decision Trees (XGBoost)
- Monte Carlo Dropout Epistemic Uncertainty Estimation (σ per prediction)
"""

import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import joblib
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from app.ml.deep_risk_network import DeepRiskNeuralNetwork, HybridRiskEnsemble


class DeepEnsembleRiskPipeline:
    """Production Hybrid Stacking & Epistemic Uncertainty Pipeline for Mobile Risk Audits."""

    def __init__(self, ensemble_path: Optional[str] = None, dnn_path: Optional[str] = None):
        weights_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weights")
        self.ensemble_path = ensemble_path or os.path.join(weights_dir, "hybrid_ensemble.joblib")
        self.dnn_path = dnn_path or os.path.join(weights_dir, "deep_risk_network.joblib")
        self.dnn_model: Optional[DeepRiskNeuralNetwork] = None
        self.ensemble_model: Optional[HybridRiskEnsemble] = None
        self._load_models()

    def _load_models(self):
        if os.path.exists(self.dnn_path):
            try:
                self.dnn_model = joblib.load(self.dnn_path)
            except Exception:
                pass

        if os.path.exists(self.ensemble_path):
            try:
                self.ensemble_model = joblib.load(self.ensemble_path)
            except Exception:
                pass

    def train_dnn(self, X_train: np.ndarray, y_train: np.ndarray) -> DeepRiskNeuralNetwork:
        """Fits Deep MLP on feature matrices."""
        dnn = DeepRiskNeuralNetwork(random_state=42, max_iter=350, alpha=1e-4)
        dnn.fit(X_train, y_train)
        self.dnn_model = dnn
        os.makedirs(os.path.dirname(self.dnn_path), exist_ok=True)
        joblib.dump(dnn, self.dnn_path)
        return dnn

    def assemble_hybrid(self, tree_model: Any, dnn_model: Optional[DeepRiskNeuralNetwork] = None) -> HybridRiskEnsemble:
        """Combines tree model and deep neural network into hybrid ensemble."""
        nn = dnn_model or self.dnn_model
        if nn is None:
            nn = DeepRiskNeuralNetwork(random_state=42)
        ensemble = HybridRiskEnsemble(tree_model=tree_model, nn_model=nn, nn_weight=0.40)
        self.ensemble_model = ensemble
        os.makedirs(os.path.dirname(self.ensemble_path), exist_ok=True)
        joblib.dump(ensemble, self.ensemble_path)
        return ensemble

    def predict_with_confidence(self, X: np.ndarray, num_passes: int = 15) -> Dict[str, Any]:
        """Runs inference with Monte Carlo Dropout uncertainty analysis for mobile cards."""
        if self.ensemble_model is not None:
            probas = self.ensemble_model.predict_proba(X)
            unc_analysis = self.ensemble_model.estimate_uncertainty(X, num_passes=num_passes)
            return {
                "probabilities": probas,
                "predictions": (probas >= 0.40).astype(int),
                "uncertainty_analysis": unc_analysis,
                "engine": "Hybrid Stacking Ensemble (Deep Neural Net + XGBoost)"
            }
        elif self.dnn_model is not None:
            probas = self.dnn_model.predict_proba(X)
            return {
                "probabilities": probas,
                "predictions": (probas >= 0.40).astype(int),
                "uncertainty_analysis": None,
                "engine": "Deep Multi-Layer Perceptron"
            }
        return {
            "probabilities": np.zeros((X.shape[0], 6)),
            "predictions": np.zeros((X.shape[0], 6), dtype=int),
            "uncertainty_analysis": None,
            "engine": "Fallback"
        }
