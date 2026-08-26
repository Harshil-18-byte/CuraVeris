"""Step 19 & 20: Test Set Evaluation & Verification Gates.

Evaluates the trained risk classifier on the held-out test split (test_X.npy, test_y.npy)
using tuned decision thresholds.

Target Gates (Step 20):
  - Macro F1 >= 0.70
  - Recall 'above_mrp' >= 0.78
  - Recall 'duplicate_charge' >= 0.70
  - Precision 'rate_anomaly' >= 0.70
  - Macro AUC-ROC >= 0.85

Outputs:
  - ml_training/results/evaluation_report.json

CLI:
  python evaluate_model.py [--classifier <pkl>] [--thresholds <json>] [--test-features <npy>] [--test-labels <npy>] [--output <json>]
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
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
BACKEND_ROOT = os.path.dirname(ML_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from ml_training.scripts.train_classifier import MultiLabelXGBoostRiskClassifier

DEFAULT_MODEL = os.path.join(ML_DIR, "models", "risk_classifier.pkl")
DEFAULT_THRESHOLDS = os.path.join(ML_DIR, "models", "optimal_thresholds.json")
DEFAULT_FEATURES_DIR = os.path.join(ML_DIR, "data", "processed", "features")
DEFAULT_TEST_X = os.path.join(DEFAULT_FEATURES_DIR, "test_X.npy")
DEFAULT_TEST_Y = os.path.join(DEFAULT_FEATURES_DIR, "test_y.npy")
DEFAULT_OUTPUT = os.path.join(ML_DIR, "results", "evaluation_report.json")


def main():
    parser = argparse.ArgumentParser(description="Evaluate classifier on held-out test split")
    parser.add_argument("--classifier", type=str, default=DEFAULT_MODEL, help="Path to classifier .pkl")
    parser.add_argument("--thresholds", type=str, default=DEFAULT_THRESHOLDS, help="Path to optimal_thresholds.json")
    parser.add_argument("--test-features", type=str, default=DEFAULT_TEST_X, help="Path to test_X.npy")
    parser.add_argument("--test-labels", type=str, default=DEFAULT_TEST_Y, help="Path to test_y.npy")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT, help="Path to evaluation_report.json")
    args = parser.parse_args()

    print("=" * 80)
    print("        STEP 19 & 20: HELD-OUT TEST SET EVALUATION & GATING")
    print("=" * 80)

    # Load model and thresholds
    model: MultiLabelXGBoostRiskClassifier = joblib.load(args.classifier)
    X_test = np.load(args.test_features)
    y_test = np.load(args.test_labels)

    th_data = {}
    if os.path.exists(args.thresholds):
        with open(args.thresholds, "r") as f:
            raw_th = json.load(f)
            th_data = raw_th.get("optimal_thresholds", raw_th)

    meta_path = os.path.join(os.path.dirname(args.test_features), "feature_metadata.json")
    label_names = model.label_names
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            label_names = json.load(f).get("label_names", label_names)

    print(f"[*] Test Set Size : {X_test.shape[0]} line items")
    print(f"[*] Features Count: {X_test.shape[1]}")
    print(f"[*] Labels Count  : {y_test.shape[1]}")
    print("-" * 80)

    y_prob = model.predict_proba(X_test)
    y_pred = np.zeros_like(y_prob, dtype=np.int32)
    for idx, lbl in enumerate(label_names):
        th = th_data.get(lbl, 0.40)
        y_pred[:, idx] = (y_prob[:, idx] >= th).astype(np.int32)

    per_label_metrics = {}
    precisions, recalls, f1s, aucs = [], [], [], []

    print(f"{'Label Name':<24} | {'Thresh':<7} | {'Precision':<9} | {'Recall':<9} | {'F1-Score':<9} | {'AUC-ROC':<9} | {'Support'}")
    print("-" * 85)

    for idx, lbl in enumerate(label_names):
        y_true_col = y_test[:, idx]
        y_pred_col = y_pred[:, idx]
        y_prob_col = y_prob[:, idx]
        th = th_data.get(lbl, 0.40)
        pos_count = int(np.sum(y_true_col == 1))

        p = precision_score(y_true_col, y_pred_col, zero_division=0)
        r = recall_score(y_true_col, y_pred_col, zero_division=0)
        f = f1_score(y_true_col, y_pred_col, zero_division=0)
        auc = roc_auc_score(y_true_col, y_prob_col) if len(np.unique(y_true_col)) > 1 else 1.0

        tn, fp, fn, tp = confusion_matrix(y_true_col, y_pred_col, labels=[0, 1]).ravel()

        precisions.append(p)
        recalls.append(r)
        f1s.append(f)
        aucs.append(auc)

        per_label_metrics[lbl] = {
            "threshold": th,
            "precision": float(round(p, 4)),
            "recall": float(round(r, 4)),
            "f1_score": float(round(f, 4)),
            "roc_auc": float(round(auc, 4)),
            "tp": int(tp),
            "fp": int(fp),
            "tn": int(tn),
            "fn": int(fn),
            "support": pos_count,
        }

        print(f"{lbl:<24} | {th:<7.3f} | {p:<9.4f} | {r:<9.4f} | {f:<9.4f} | {auc:<9.4f} | {pos_count:4d}")

    macro_p = float(np.mean(precisions))
    macro_r = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))
    macro_auc = float(np.mean(aucs))

    print("-" * 85)
    print(f"{'MACRO-AVERAGE':<24} | {'—':<7} | {macro_p:<9.4f} | {macro_r:<9.4f} | {macro_f1:<9.4f} | {macro_auc:<9.4f} | {int(np.sum(y_test))}")
    print("=" * 85)

    # Step 20: Target Metrics Gate Verification
    print("\n" + "=" * 80)
    print("                   STEP 20: TARGET METRICS GATES AUDIT")
    print("=" * 80)

    above_mrp_recall = per_label_metrics.get("above_mrp", {}).get("recall", 0.0)
    duplicate_recall = per_label_metrics.get("duplicate_charge", {}).get("recall", 0.0)
    rate_anomaly_prec = per_label_metrics.get("rate_anomaly", {}).get("precision", 0.0)

    gates = [
        ("Macro F1-Score >= 0.70", macro_f1, 0.70, macro_f1 >= 0.70),
        ("Recall 'above_mrp' >= 0.78", above_mrp_recall, 0.78, above_mrp_recall >= 0.78),
        ("Recall 'duplicate_charge' >= 0.70", duplicate_recall, 0.70, duplicate_recall >= 0.70),
        ("Precision 'rate_anomaly' >= 0.70", rate_anomaly_prec, 0.70, rate_anomaly_prec >= 0.70),
        ("Macro AUC-ROC >= 0.85", macro_auc, 0.85, macro_auc >= 0.85),
    ]

    all_gates_pass = True
    for gate_name, actual, target, passed in gates:
        status = "[✓] PASS" if passed else "[!] WARN"
        print(f"  {status} | {gate_name:<38} | Actual: {actual:.4f} (Target: {target:.2f})")
        if not passed:
            all_gates_pass = False

    print("=" * 80)

    # Save detailed evaluation report
    report = {
        "dataset_summary": {
            "test_samples": int(X_test.shape[0]),
            "n_features": int(X_test.shape[1]),
            "n_labels": int(y_test.shape[1]),
        },
        "macro_metrics": {
            "precision": macro_p,
            "recall": macro_r,
            "f1_score": macro_f1,
            "roc_auc": macro_auc,
        },
        "per_label_metrics": per_label_metrics,
        "gates_status": {
            "all_gates_pass": all_gates_pass,
            "gate_results": [
                {"gate": g[0], "actual": float(g[1]), "target": float(g[2]), "passed": bool(g[3])} for g in gates
            ],
        },
    }

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n[✓] Evaluation report written to: {args.output}")


if __name__ == "__main__":
    main()
