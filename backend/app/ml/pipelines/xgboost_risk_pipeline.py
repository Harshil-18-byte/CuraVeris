"""Pipeline 3: Multi-Label XGBoost Risk Classification Pipeline.

Features (10):
  1. rate_vs_cghs_ratio
  2. rate_vs_mrp_ratio
  3. qty_zscore
  4. category_encoded
  5. amount_percentile
  6. consumable_pct_of_bill
  7. has_icd_code
  8. description_similarity_max
  9. gst_rate_error
  10. los_days

Targets (6):
  1. above_mrp
  2. duplicate_charge
  3. rate_anomaly
  4. gst_violation
  5. upcoding_suspected
  6. date_window_violation
"""

import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import json
import joblib
import numpy as np
import xgboost as xgb
from typing import List, Dict, Any, Optional, Tuple
from imblearn.over_sampling import SMOTE
from dataclasses import dataclass

LABEL_NAMES = [
    "above_mrp",
    "duplicate_charge",
    "rate_anomaly",
    "gst_violation",
    "upcoding_suspected",
    "date_window_violation",
]

FEATURE_NAMES = [
    "rate_vs_cghs_ratio",
    "rate_vs_mrp_ratio",
    "qty_zscore",
    "category_encoded",
    "amount_percentile",
    "consumable_pct_of_bill",
    "has_icd_code",
    "description_similarity_max",
    "gst_rate_error",
    "los_days",
]

CATEGORY_MAP = {
    "consultation": 0,
    "room_nursing": 1,
    "accommodation": 1,
    "diagnostic": 2,
    "procedure": 3,
    "pharmacy": 4,
    "medicine": 4,
    "consumable": 5,
    "implant": 3,
    "other": 6,
}


@dataclass
class AnomalyScoreResult:
    flag_type: str
    probability: float
    is_violation: bool
    severity: str
    amount_impact: float
    description: str
    statutory_citation: str


class XGBoostRiskPipeline:
    """Production Multi-Label XGBoost Risk Classifier Pipeline for Mobile Auditing."""

    def __init__(self, model_path: Optional[str] = None, thresholds_path: Optional[str] = None):
        weights_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weights")
        self.model_path = model_path or os.path.join(weights_dir, "risk_classifier.pkl")
        self.thresholds_path = thresholds_path or os.path.join(weights_dir, "optimal_thresholds.json")
        self.label_names = LABEL_NAMES
        self.feature_names = FEATURE_NAMES
        self.models: Dict[str, Any] = {}
        self.thresholds: Dict[str, float] = {lbl: 0.40 for lbl in self.label_names}
        self._load_weights()

    def _load_weights(self):
        if os.path.exists(self.model_path):
            try:
                loaded = joblib.load(self.model_path)
                if hasattr(loaded, "models"):
                    self.models = loaded.models
                elif isinstance(loaded, dict):
                    self.models = loaded.get("models", {})
            except Exception:
                pass

        if os.path.exists(self.thresholds_path):
            try:
                with open(self.thresholds_path, "r") as f:
                    raw = json.load(f)
                    self.thresholds = raw.get("optimal_thresholds", raw)
            except Exception:
                pass

    def train_and_tune(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        n_estimators: int = 300,
        max_depth: int = 6,
        learning_rate: float = 0.05
    ) -> Dict[str, Any]:
        """Trains 6 binary XGBoost classifiers with SMOTE and tunes thresholds."""
        for idx, lbl in enumerate(self.label_names):
            y_col = y_train[:, idx]
            pos_count = int(np.sum(y_col == 1))
            neg_count = int(np.sum(y_col == 0))

            X_res, y_res = X_train, y_col
            if pos_count >= 6 and pos_count < neg_count:
                k_neighbors = min(pos_count - 1, 5)
                if k_neighbors >= 1:
                    try:
                        smote = SMOTE(k_neighbors=k_neighbors, random_state=42)
                        resampled = smote.fit_resample(X_train, y_col)
                        X_res = np.asarray(resampled[0])
                        y_res = np.asarray(resampled[1])
                    except Exception:
                        pass

            pos_res = max(int(np.sum(y_res == 1)), 1)
            neg_res = int(np.sum(y_res == 0))
            scale_pos_weight = min(neg_res / pos_res, 10.0)

            model = xgb.XGBClassifier(
                n_estimators=n_estimators,
                max_depth=max_depth,
                learning_rate=learning_rate,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=scale_pos_weight,
                eval_metric="logloss",
                random_state=42,
                n_jobs=1,
            )
            val_col = y_val[:, idx]
            model.fit(X_res, y_res, eval_set=[(X_res, y_res), (X_val, val_col)], verbose=False)
            self.models[lbl] = model

        # Tune thresholds
        val_probs = self.predict_proba(X_val)
        threshold_grid = np.arange(0.15, 0.75, 0.02)
        optimal_th = {}

        for idx, lbl in enumerate(self.label_names):
            y_true = y_val[:, idx]
            probs = val_probs[:, idx]
            best_f1 = -1.0
            best_t = 0.40
            for t in threshold_grid:
                preds = (probs >= t).astype(int)
                tp = np.sum((y_true == 1) & (preds == 1))
                fp = np.sum((y_true == 0) & (preds == 1))
                fn = np.sum((y_true == 1) & (preds == 0))
                p = tp / (tp + fp) if (tp + fp) > 0 else 0.0
                r = tp / (tp + fn) if (tp + fn) > 0 else 0.0
                f1 = (2 * p * r) / (p + r) if (p + r) > 0 else 0.0
                if f1 > best_f1:
                    best_f1 = f1
                    best_t = float(round(t, 3))
            optimal_th[lbl] = float(np.clip(best_t, 0.20, 0.60))

        self.thresholds = optimal_th
        return {"status": "SUCCESS", "optimal_thresholds": optimal_th}

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        prob_cols = []
        for lbl in self.label_names:
            if lbl in self.models:
                p = self.models[lbl].predict_proba(X)[:, 1]
            else:
                p = np.zeros(X.shape[0])
            prob_cols.append(p)
        return np.column_stack(prob_cols)

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)
        preds = np.zeros_like(probs, dtype=np.int32)
        for idx, lbl in enumerate(self.label_names):
            th = self.thresholds.get(lbl, 0.40)
            preds[:, idx] = (probs[:, idx] >= th).astype(np.int32)
        return preds

    def extract_feature_vector(
        self,
        item_price: float,
        quantity: float,
        category: str,
        total_amount: float,
        cghs_benchmark: Optional[float],
        mrp_benchmark: Optional[float],
        all_amounts: List[float],
        all_quantities: List[float],
        consumable_ratio: float = 0.2,
        has_icd_code: float = 1.0,
        similarity_score: float = 0.85,
        gst_error: float = 0.0,
        los_days: float = 3.0
    ) -> np.ndarray:
        """Extracts the 10-feature vector for real-time inference on a single item."""
        ref_cghs = cghs_benchmark or item_price or 1.0
        rate_vs_cghs = min(item_price / max(ref_cghs, 1.0), 20.0)

        ref_mrp = mrp_benchmark or item_price or 1.0
        rate_vs_mrp = min(item_price / max(ref_mrp, 1.0), 10.0)

        q_mean = float(np.mean(all_quantities)) if all_quantities else 1.0
        q_std = float(np.std(all_quantities)) if all_quantities else 1.0
        q_std = q_std if q_std > 1e-4 else 1.0
        qty_zscore = float(np.clip((quantity - q_mean) / q_std, -5.0, 10.0))

        cat_enc = float(CATEGORY_MAP.get(category.lower(), 6))
        amt_percentile = float(np.mean(np.array(all_amounts) <= total_amount)) if all_amounts else 0.5

        return np.array([
            rate_vs_cghs,
            rate_vs_mrp,
            qty_zscore,
            cat_enc,
            amt_percentile,
            consumable_ratio,
            has_icd_code,
            similarity_score,
            gst_error,
            min(los_days, 30.0)
        ], dtype=np.float32)

    def analyze_item(
        self,
        features: np.ndarray,
        item_name: str,
        total_amount: float
    ) -> List[AnomalyScoreResult]:
        """Runs fast inference on a single item vector and returns active risk anomalies."""
        probs = self.predict_proba(features.reshape(1, -1))[0]
        results = []

        citations = {
            "above_mrp": "Section 3 Essential Commodities Act 1955 & DPCO 2013",
            "duplicate_charge": "Consumer Protection Act 2019 Unfair Trade Practices",
            "rate_anomaly": "CGHS Standard Rate Schedule Benchmark",
            "gst_violation": "GST Notification No. 12/2017 Central Tax (Rate)",
            "upcoding_suspected": "IRDAI Health Insurance Regulations",
            "date_window_violation": "Billing Date Synchronization Audit",
        }

        for idx, lbl in enumerate(self.label_names):
            th = self.thresholds.get(lbl, 0.40)
            p = float(probs[idx])
            if p >= th:
                sev = "CRITICAL" if p >= 0.85 else ("HIGH" if p >= 0.60 else "MEDIUM")
                amount_impact = round(total_amount * (0.6 if lbl in ["above_mrp", "rate_anomaly"] else 0.4), 2)
                desc = f"ML Anomaly detected on '{item_name}': {lbl.replace('_', ' ').title()} (prob {p*100:.1f}% >= th {th:.2f})."
                results.append(AnomalyScoreResult(
                    flag_type=lbl.upper(),
                    probability=round(p, 4),
                    is_violation=True,
                    severity=sev,
                    amount_impact=amount_impact,
                    description=desc,
                    statutory_citation=citations.get(lbl, "Consumer Protection Act 2019")
                ))

        return results
