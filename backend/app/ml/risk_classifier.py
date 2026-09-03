"""Risk Classifier Module.
Loads the trained XGBoost multi-label risk classifier and scores hospital bills.
"""

import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import joblib
import numpy as np
try:
    import xgboost as xgb
except ImportError:
    xgb = None
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.core.logging import logger
from app.ml.extractor import ExtractedLineItem

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "ml_training", "models", "risk_classifier.pkl"
)


@dataclass
class RiskFlagResult:
    flag_type: str
    severity: str
    amount_impact: float
    confidence: float
    statutory_citation: Optional[str]
    description: str
    recommended_action: str
    item_name: Optional[str] = None


CATEGORY_MAP = {
    "consultation": 0,
    "room_nursing": 1,
    "diagnostic": 2,
    "procedure": 3,
    "pharmacy": 4,
    "consumable": 5,
    "other": 6,
}

LABEL_NAMES = [
    "above_mrp",
    "duplicate_charge",
    "rate_anomaly",
    "gst_violation",
    "upcoding_suspected",
    "date_window_violation",
]


class MultiLabelXGBoostRiskClassifier:
    """Ensemble of tuned XGBoost binary classifiers for multi-label risk detection."""

    def __init__(
        self,
        label_names: Optional[List[str]] = None,
        feature_names: Optional[List[str]] = None,
        n_estimators: int = 300,
        max_depth: int = 6,
        learning_rate: float = 0.05,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
    ):
        self.label_names = label_names or LABEL_NAMES
        self.feature_names = feature_names or []
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.subsample = subsample
        self.colsample_bytree = colsample_bytree
        self.models: Dict[str, Any] = {}
        self.thresholds: Dict[str, float] = {lbl: 0.40 for lbl in self.label_names}

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: Optional[np.ndarray] = None, y_val: Optional[np.ndarray] = None):
        from imblearn.over_sampling import SMOTE
        for idx, lbl in enumerate(self.label_names):
            y_col = y_train[:, idx]
            pos_count = int(np.sum(y_col == 1))
            neg_count = int(np.sum(y_col == 0))

            X_resampled, y_resampled = X_train, y_col

            if pos_count >= 6 and pos_count < neg_count:
                k_neighbors = min(pos_count - 1, 5)
                if k_neighbors >= 1:
                    try:
                        smote = SMOTE(k_neighbors=k_neighbors, random_state=42)
                        resampled = smote.fit_resample(X_train, y_col)
                        X_resampled, y_resampled = resampled[0], resampled[1]
                    except Exception:
                        pass

            pos_res = max(int(np.sum(y_resampled == 1)), 1)
            neg_res = int(np.sum(y_resampled == 0))
            scale_pos_weight = min(neg_res / pos_res, 10.0)

            model = xgb.XGBClassifier(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                subsample=self.subsample,
                colsample_bytree=self.colsample_bytree,
                scale_pos_weight=scale_pos_weight,
                eval_metric="logloss",
                random_state=42,
                n_jobs=1,
            )

            if X_val is not None and y_val is not None:
                val_col = y_val[:, idx]
                model.fit(
                    X_resampled,
                    y_resampled,
                    eval_set=[(X_resampled, y_resampled), (X_val, val_col)],
                    verbose=False,
                )
            else:
                model.fit(X_resampled, y_resampled)

            self.models[lbl] = model

    def predict(self, X: np.ndarray, thresholds: Optional[Dict[str, float]] = None) -> np.ndarray:
        probs = self.predict_proba(X)
        th_dict = thresholds or self.thresholds
        preds = np.zeros_like(probs, dtype=np.int32)
        for idx, lbl in enumerate(self.label_names):
            t = th_dict.get(lbl, 0.40)
            preds[:, idx] = (probs[:, idx] >= t).astype(np.int32)
        return preds

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        prob_cols = []
        for lbl in self.label_names:
            model = self.models[lbl]
            p = model.predict_proba(X)[:, 1]
            prob_cols.append(p)
        return np.column_stack(prob_cols)


class RiskClassifier:
    """Classifies overcharges and calculates weighted FRM risk scores."""

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or getattr(settings, "RISK_CLASSIFIER_PATH", DEFAULT_MODEL_PATH)
        self.model = None
        self.thresholds = {lbl: 0.40 for lbl in LABEL_NAMES}
        self._load_model()

    def _load_model(self):
        # Ensure MultiLabelXGBoostRiskClassifier is available in __main__ for unpickling
        import sys
        sys.modules.setdefault("__main__", sys.modules[__name__])
        if not hasattr(sys.modules["__main__"], "MultiLabelXGBoostRiskClassifier"):
            setattr(sys.modules["__main__"], "MultiLabelXGBoostRiskClassifier", MultiLabelXGBoostRiskClassifier)

        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded trained risk classifier from {self.model_path}")
            except Exception as exc:
                logger.warning(f"Failed loading model from {self.model_path}: {exc}")
        else:
            # Fallback to backend runtime weights
            fallback_path = os.path.join(os.path.dirname(__file__), "weights", "risk_classifier.pkl")
            if os.path.exists(fallback_path):
                try:
                    self.model = joblib.load(fallback_path)
                    logger.info(f"Loaded trained risk classifier from fallback {fallback_path}")
                except Exception as exc:
                    logger.warning(f"Failed loading fallback model: {exc}")

        # Load optimal thresholds if present
        th_path = os.path.join(os.path.dirname(self.model_path), "optimal_thresholds.json")
        if not os.path.exists(th_path):
            th_path = os.path.join(os.path.dirname(__file__), "weights", "optimal_thresholds.json")
        if os.path.exists(th_path):
            try:
                import json
                with open(th_path, "r") as f:
                    raw_th = json.load(f)
                    self.thresholds = raw_th.get("optimal_thresholds", raw_th)
            except Exception:
                pass

    def extract_features(
        self,
        item: ExtractedLineItem,
        cghs_benchmark: Optional[float],
        all_amounts: List[float],
        all_quantities: List[float],
        consumable_ratio: float = 0.0,
        has_icd_code: float = 1.0,
        similarity_score: float = 0.85,
        gst_rate_correct: float = 1.0,
    ) -> np.ndarray:
        ref_rate = cghs_benchmark or item.unit_price or 1.0
        rate_vs_cghs_ratio = min(item.unit_price / (ref_rate or 1.0), 20.0)

        q_mean = float(np.mean(all_quantities)) if all_quantities else 1.0
        q_std = float(np.std(all_quantities)) if all_quantities else 1.0
        qty_zscore = (item.quantity - q_mean) / (q_std or 1.0)

        cat_enc = float(CATEGORY_MAP.get(item.category.lower(), 6))
        amt_percentile = float(np.mean(np.array(all_amounts) <= item.total_amount)) if all_amounts else 0.5

        return np.array([
            rate_vs_cghs_ratio,
            qty_zscore,
            cat_enc,
            amt_percentile,
            consumable_ratio,
            has_icd_code,
            similarity_score,
            gst_rate_correct,
        ], dtype=np.float32)

    def analyze_item(
        self,
        item: ExtractedLineItem,
        cghs_rate: Optional[float],
        nppa_ceiling: Optional[float],
        dpco_mrp: Optional[float],
        all_amounts: List[float],
        all_quantities: List[float],
    ) -> List[RiskFlagResult]:
        flags: List[RiskFlagResult] = []

        # 1. Statutory Ceiling Checks
        if nppa_ceiling and item.unit_price > nppa_ceiling:
            excess = (item.unit_price - nppa_ceiling) * item.quantity
            flags.append(RiskFlagResult(
                flag_type="NPPA_CEILING_EXCEEDED",
                severity="CRITICAL",
                amount_impact=round(excess, 2),
                confidence=0.98,
                statutory_citation="NPPA Gazette Price Cap Order under DPCO 2013",
                description=f"Item '{item.item_name}' charged at ₹{item.unit_price:.2f}, exceeding statutory cap of ₹{nppa_ceiling:.2f}.",
                recommended_action="Demand immediate adjustment to NPPA gazetted price.",
                item_name=item.item_name
            ))

        if dpco_mrp and item.unit_price > (dpco_mrp * 1.05):
            excess = (item.unit_price - dpco_mrp) * item.quantity
            flags.append(RiskFlagResult(
                flag_type="DPCO_OVERCHARGE",
                severity="HIGH",
                amount_impact=round(excess, 2),
                confidence=0.95,
                statutory_citation="Section 3 of Essential Commodities Act, 1955 & DPCO 2013",
                description=f"Medicine '{item.item_name}' billed at ₹{item.unit_price:.2f}, above DPCO capped MRP of ₹{dpco_mrp:.2f}.",
                recommended_action="Object to above-MRP charging under Essential Commodities Act.",
                item_name=item.item_name
            ))

        # 2. ML Classifier Prediction
        if self.model is not None:
            try:
                features = self.extract_features(item, cghs_rate, all_amounts, all_quantities)
                probs = self.model.predict_proba(features.reshape(1, -1))[0]
                threshold = 0.40

                for idx, lbl in enumerate(LABEL_NAMES):
                    if probs[idx] >= threshold and not any(f.flag_type == lbl.upper() for f in flags):
                        flags.append(RiskFlagResult(
                            flag_type=lbl.upper(),
                            severity="HIGH" if probs[idx] > 0.7 else "MEDIUM",
                            amount_impact=round(item.total_amount * 0.5, 2),
                            confidence=round(float(probs[idx]), 4),
                            statutory_citation="Consumer Protection Act, 2019",
                            description=f"ML Anomaly detected: {lbl.replace('_', ' ')} with probability {probs[idx]*100:.1f}%.",
                            recommended_action="Request audit review from hospital billing cell.",
                            item_name=item.item_name
                        ))
            except Exception as exc:
                logger.debug(f"Model prediction error: {exc}")

        return flags

    def calculate_bill_risk_score(self, total_amount: float, flags: List[RiskFlagResult]) -> int:
        if not flags or total_amount <= 0:
            return 5
        total_disputed = sum(f.amount_impact for f in flags)
        ratio = min(total_disputed / total_amount, 1.0)
        score = (ratio * 40.0) + min(len(flags) * 15.0, 60.0)
        return int(np.clip(round(score), 0, 100))
