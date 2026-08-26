"""Script 3: Train XGBoost Multi-Label Risk Classifier (Steps 15 & 16).

Consumes:
  - data/processed/features/train_X.npy, train_y.npy
  - data/processed/features/val_X.npy, val_y.npy
  - data/processed/features/test_X.npy, test_y.npy
  - data/processed/features/feature_metadata.json

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

Labels (6):
  1. above_mrp
  2. duplicate_charge
  3. rate_anomaly
  4. gst_violation
  5. upcoding_suspected
  6. date_window_violation

Uses SMOTE for minority class balancing per label.
Saves model to: models/risk_classifier.pkl

CLI:
  python train_classifier.py [--features <dir>] [--output <file>] [--n-estimators 300] [--max-depth 6] [--learning-rate 0.05]
"""

import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import sys
import json
import joblib
import argparse
import numpy as np
from typing import List, Dict, Any, Optional

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
)
from imblearn.over_sampling import SMOTE
import xgboost as xgb

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
BACKEND_ROOT = os.path.dirname(ML_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

DEFAULT_FEATURES_DIR = os.path.join(ML_DIR, "data", "processed", "features")
DEFAULT_MODEL_OUTPUT = os.path.join(ML_DIR, "models", "risk_classifier.pkl")

# Global reference list of label names
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
        print(f"[*] Fitting {len(self.label_names)} multi-label XGBoost classifiers...")
        for idx, lbl in enumerate(self.label_names):
            y_col = y_train[:, idx]
            pos_count = int(np.sum(y_col == 1))
            neg_count = int(np.sum(y_col == 0))

            X_resampled, y_resampled = X_train, y_col

            # Apply SMOTE for class balancing if minority class has enough samples
            if pos_count >= 6 and pos_count < neg_count:
                k_neighbors = min(pos_count - 1, 5)
                if k_neighbors >= 1:
                    try:
                        smote = SMOTE(k_neighbors=k_neighbors, random_state=42)
                        X_resampled, y_resampled = smote.fit_resample(X_train, y_col)
                        print(f"    [+] '{lbl:22s}': Applied SMOTE ({pos_count} pos -> {np.sum(y_resampled==1)} balanced)")
                    except Exception as e:
                        print(f"    [!] '{lbl:22s}': SMOTE skipped ({e})")
            else:
                print(f"    [-] '{lbl:22s}': Standard fit ({pos_count} pos, {neg_count} neg)")

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


def main():
    parser = argparse.ArgumentParser(description="Train multi-label XGBoost classifier")
    parser.add_argument("--features", type=str, default=DEFAULT_FEATURES_DIR, help="Path to features directory")
    parser.add_argument("--output", type=str, default=DEFAULT_MODEL_OUTPUT, help="Path to output model .pkl")
    parser.add_argument("--n-estimators", type=int, default=300, help="Number of XGBoost boosting rounds")
    parser.add_argument("--max-depth", type=int, default=6, help="Maximum tree depth")
    parser.add_argument("--learning-rate", type=float, default=0.05, help="Learning rate (eta)")
    parser.add_argument("--subsample", type=float, default=0.8, help="Subsample ratio")
    parser.add_argument("--colsample-bytree", type=float, default=0.8, help="Feature subsample ratio")
    args = parser.parse_args()

    print("=" * 78)
    print("      STEP 16: MULTI-LABEL XGBOOST RISK CLASSIFIER TRAINING")
    print("=" * 78)
    print(f"[*] Features Dir   : {args.features}")
    print(f"[*] Model Output   : {args.output}")
    print(f"[*] Hyperparams    : n_estimators={args.n_estimators}, max_depth={args.max_depth}, lr={args.learning_rate}")
    print("-" * 78)

    # Load arrays
    X_train = np.load(os.path.join(args.features, "train_X.npy"))
    y_train = np.load(os.path.join(args.features, "train_y.npy"))
    X_val = np.load(os.path.join(args.features, "val_X.npy"))
    y_val = np.load(os.path.join(args.features, "val_y.npy"))
    X_test = np.load(os.path.join(args.features, "test_X.npy"))
    y_test = np.load(os.path.join(args.features, "test_y.npy"))

    meta_path = os.path.join(args.features, "feature_metadata.json")
    with open(meta_path, "r") as f:
        meta = json.load(f)

    feature_names = meta.get("feature_names", [])
    label_names = meta.get("label_names", LABEL_NAMES)

    print(f"[*] Train set: {X_train.shape[0]} items | Val set: {X_val.shape[0]} items | Test set: {X_test.shape[0]} items")

    # Instantiate classifier
    classifier = MultiLabelXGBoostRiskClassifier(
        label_names=label_names,
        feature_names=feature_names,
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        subsample=args.subsample,
        colsample_bytree=args.colsample_bytree,
    )

    classifier.fit(X_train, y_train, X_val=X_val, y_val=y_val)

    # Validation evaluation
    print("\n" + "=" * 78)
    print("           VALIDATION SPLIT CLASSIFICATION PERFORMANCE")
    print("=" * 78)

    y_val_prob = classifier.predict_proba(X_val)
    y_val_pred = classifier.predict(X_val)

    precisions, recalls, f1s, aucs = [], [], [], []
    print(f"{'Label Name':<25} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'AUC-ROC':<10}")
    print("-" * 78)

    for idx, lbl in enumerate(label_names):
        y_t = y_val[:, idx]
        y_p = y_val_pred[:, idx]
        y_prob = y_val_prob[:, idx]

        p = precision_score(y_t, y_p, zero_division=0)
        r = recall_score(y_t, y_p, zero_division=0)
        f = f1_score(y_t, y_p, zero_division=0)
        auc = roc_auc_score(y_t, y_prob) if len(np.unique(y_t)) > 1 else 1.0

        precisions.append(p)
        recalls.append(r)
        f1s.append(f)
        aucs.append(auc)
        print(f"{lbl:<25} | {p:<10.4f} | {r:<10.4f} | {f:<10.4f} | {auc:<10.4f}")

    print("-" * 78)
    print(f"{'MACRO-AVERAGE':<25} | {np.mean(precisions):<10.4f} | {np.mean(recalls):<10.4f} | {np.mean(f1s):<10.4f} | {np.mean(aucs):<10.4f}")
    print("=" * 78)

    # Serialize trained model
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    joblib.dump(classifier, args.output)
    print(f"\n[✓] Trained model saved to: {args.output}")

    # Also update app/ml/risk_classifier.py compatibility
    app_weights_dir = os.path.join(BACKEND_ROOT, "app", "ml", "weights")
    os.makedirs(app_weights_dir, exist_ok=True)
    app_model_path = os.path.join(app_weights_dir, "risk_classifier.pkl")
    joblib.dump(classifier, app_model_path)
    print(f"[✓] Synced model to backend runtime weights: {app_model_path}")


if __name__ == "__main__":
    main()
