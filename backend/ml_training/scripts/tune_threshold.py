"""Step 17: Decision Threshold Tuning Script.

Optimizes per-label decision thresholds on the validation split (val_X.npy, val_y.npy).
Objective:
  Maximize F1-score while enforcing Recall >= 0.75 for critical fraud/overcharge flags
  (above_mrp, duplicate_charge, rate_anomaly).

Outputs:
  - models/optimal_thresholds.json

CLI:
  python tune_threshold.py [--model <pkl_path>] [--features-dir <dir>] [--output <json_path>]
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
from sklearn.metrics import precision_score, recall_score, f1_score

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
BACKEND_ROOT = os.path.dirname(ML_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from ml_training.scripts.train_classifier import MultiLabelXGBoostRiskClassifier

DEFAULT_MODEL_PATH = os.path.join(ML_DIR, "models", "risk_classifier.pkl")
DEFAULT_FEATURES_DIR = os.path.join(ML_DIR, "data", "processed", "features")
DEFAULT_OUTPUT_PATH = os.path.join(ML_DIR, "models", "optimal_thresholds.json")

# Minimum recall requirements for statutory and critical fraud flags
CRITICAL_FLAGS = {"above_mrp": 0.75, "duplicate_charge": 0.75, "rate_anomaly": 0.75}


def tune_thresholds(
    model: MultiLabelXGBoostRiskClassifier,
    X_val: np.ndarray,
    y_val: np.ndarray,
    label_names: list
) -> dict:
    val_probs = model.predict_proba(X_val)
    threshold_grid = np.arange(0.15, 0.75, 0.02)
    optimal_thresholds = {}
    tuning_details = {}

    print(f"{'Label Name':<25} | {'Best Thresh':<12} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("-" * 78)

    for idx, lbl in enumerate(label_names):
        y_true = y_val[:, idx]
        probs = val_probs[:, idx]

        min_recall_req = CRITICAL_FLAGS.get(lbl, 0.50)
        best_f1 = -1.0
        best_th = 0.40
        best_p = 0.0
        best_r = 0.0

        for th in threshold_grid:
            y_pred = (probs >= th).astype(int)
            p = precision_score(y_true, y_pred, zero_division=0)
            r = recall_score(y_true, y_pred, zero_division=0)
            f = f1_score(y_true, y_pred, zero_division=0)

            # Check recall constraint
            if r >= min_recall_req:
                if f > best_f1:
                    best_f1 = f
                    best_th = float(round(th, 3))
                    best_p = p
                    best_r = r
            elif best_f1 < 0:
                # Fallback to maximize recall if target constraint not strictly met
                if r > best_r or (r == best_r and f > best_f1):
                    best_f1 = f
                    best_th = float(round(th, 3))
                    best_p = p
                    best_r = r

        # Ensure threshold is bounded reasonably
        best_th = float(np.clip(best_th, 0.20, 0.60))
        optimal_thresholds[lbl] = best_th
        tuning_details[lbl] = {
            "threshold": best_th,
            "val_precision": float(round(best_p, 4)),
            "val_recall": float(round(best_r, 4)),
            "val_f1": float(round(best_f1, 4)),
        }
        print(f"{lbl:<25} | {best_th:<12.3f} | {best_p:<10.4f} | {best_r:<10.4f} | {best_f1:<10.4f}")

    print("-" * 78)
    return {"optimal_thresholds": optimal_thresholds, "tuning_details": tuning_details}


def main():
    parser = argparse.ArgumentParser(description="Tune per-label classification decision thresholds")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL_PATH, help="Path to trained model .pkl")
    parser.add_argument("--features-dir", type=str, default=DEFAULT_FEATURES_DIR, help="Path to features dir")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT_PATH, help="Path to optimal_thresholds.json")
    args = parser.parse_args()

    print("=" * 78)
    print("         STEP 17: DECISION THRESHOLD TUNING (ON VALIDATION SET)")
    print("=" * 78)
    print(f"[*] Model File   : {args.model}")
    print(f"[*] Features Dir : {args.features_dir}")
    print(f"[*] Output JSON  : {args.output}")
    print("-" * 78)

    model = joblib.load(args.model)
    X_val = np.load(os.path.join(args.features_dir, "val_X.npy"))
    y_val = np.load(os.path.join(args.features_dir, "val_y.npy"))

    meta_path = os.path.join(args.features_dir, "feature_metadata.json")
    with open(meta_path, "r") as f:
        meta = json.load(f)

    label_names = meta.get("label_names", [])

    results = tune_thresholds(model, X_val, y_val, label_names)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)

    # Also sync to backend app weights directory
    app_weights_dir = os.path.join(BACKEND_ROOT, "app", "ml", "weights")
    os.makedirs(app_weights_dir, exist_ok=True)
    app_th_path = os.path.join(app_weights_dir, "optimal_thresholds.json")
    with open(app_th_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n[✓] Optimal thresholds saved to: {args.output}")
    print(f"[✓] Synced thresholds to runtime weights: {app_th_path}")


if __name__ == "__main__":
    main()
