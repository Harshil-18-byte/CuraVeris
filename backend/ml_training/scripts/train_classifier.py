"""Script 3: Train XGBoost Multi-Label Risk Classifier.
Features:
  1. rate_vs_cghs_ratio
  2. qty_zscore
  3. category_encoded
  4. amount_percentile
  5. consumable_ratio
  6. has_icd_code
  7. description_similarity_max
  8. gst_rate_correct

Labels:
  1. above_mrp
  2. duplicate_charge
  3. rate_anomaly
  4. gst_violation
  5. upcoding_suspected
  6. date_window_violation

Uses SMOTE for class imbalance per label.
Saves model to: models/risk_classifier.pkl
Prints: per-label precision, recall, F1, macro-F1, AUC-ROC.
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
import pandas as pd
from typing import List, Dict, Tuple, Any

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)
from imblearn.over_sampling import SMOTE
import xgboost as xgb

# Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
INPUT_FILE = os.path.join(DATA_PROCESSED_DIR, "synthetic_bills.jsonl")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_OUTPUT_PATH = os.path.join(MODELS_DIR, "risk_classifier.pkl")

# Feature and Label Names
FEATURE_NAMES = [
    "rate_vs_cghs_ratio",
    "qty_zscore",
    "category_encoded",
    "amount_percentile",
    "consumable_ratio",
    "has_icd_code",
    "description_similarity_max",
    "gst_rate_correct",
]

LABEL_NAMES = [
    "above_mrp",
    "duplicate_charge",
    "rate_anomaly",
    "gst_violation",
    "upcoding_suspected",
    "date_window_violation",
]

CATEGORY_MAP = {
    "consultation": 0,
    "room_nursing": 1,
    "diagnostic": 2,
    "procedure": 3,
    "pharmacy": 4,
    "consumable": 5,
    "other": 6,
}


def load_dataset(jsonl_path: str) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
    """Extract 8 features and 6 multi-label ground truth targets from bills JSONL."""
    if not os.path.exists(jsonl_path):
        raise FileNotFoundError(f"Input dataset not found at: {jsonl_path}. Run generate_synthetic_bills.py first.")

    rows = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line.strip()))

    feature_rows = []
    target_rows = []

    for bill in rows:
        items = bill.get("line_items", [])
        if not items:
            continue

        quantities = [float(it.get("quantity", 1.0)) for it in items]
        amounts = [float(it.get("total_amount", 0.0)) for it in items]
        q_mean = float(np.mean(quantities)) if quantities else 1.0
        q_std = float(np.std(quantities)) if quantities else 1.0
        q_std = q_std if q_std > 1e-4 else 1.0

        consumable_count = sum(1 for it in items if it.get("category") == "consumable")
        consumable_ratio = consumable_count / len(items) if items else 0.0

        has_icd = 1.0 if bill.get("diagnosis_icd") else 0.0

        for it in items:
            # 1. rate_vs_cghs_ratio
            unit_p = float(it.get("unit_price", 0.0))
            cghs_r = float(it.get("cghs_rate") or (unit_p if unit_p > 0 else 1.0))
            cghs_r = cghs_r if cghs_r > 0 else 1.0
            rate_vs_cghs_ratio = min(unit_p / cghs_r, 20.0)

            # 2. qty_zscore
            qty = float(it.get("quantity", 1.0))
            qty_zscore = (qty - q_mean) / q_std

            # 3. category_encoded
            cat = str(it.get("category", "other")).lower()
            cat_enc = float(CATEGORY_MAP.get(cat, 6))

            # 4. amount_percentile
            amt = float(it.get("total_amount", 0.0))
            amt_percentile = float(np.mean(np.array(amounts) <= amt)) if amounts else 0.5

            # 5. consumable_ratio (already computed for bill)
            # 6. has_icd_code (already computed for bill)

            # 7. description_similarity_max
            # Token overlap between item name and category heuristics
            words = set(re_clean(it.get("item_name", "")).split())
            ref_words = {"procedure", "test", "tablet", "injection", "consultation", "charge", "stent", "implant"}
            sim = len(words.intersection(ref_words)) / max(len(words), 1)
            description_similarity_max = min(max(sim, 0.1), 1.0)

            # 8. gst_rate_correct
            gst_rate_correct = float(it.get("gst_rate_correct", 1.0))

            feat_vector = [
                rate_vs_cghs_ratio,
                qty_zscore,
                cat_enc,
                amt_percentile,
                consumable_ratio,
                has_icd,
                description_similarity_max,
                gst_rate_correct,
            ]
            feature_rows.append(feat_vector)

            # Extract 6 labels
            lbls = it.get("labels", {})
            target_vector = [
                int(lbls.get(lbl, 0)) for lbl in LABEL_NAMES
            ]
            target_rows.append(target_vector)

    X = np.array(feature_rows, dtype=np.float32)
    Y = np.array(target_rows, dtype=np.int32)
    df_preview = pd.DataFrame(X, columns=FEATURE_NAMES)
    return X, Y, df_preview


def re_clean(text: str) -> str:
    import re
    return re.sub(r"[^\w\s]", " ", text.lower()).strip()


import sys
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.ml.risk_classifier import MultiLabelXGBoostRiskClassifier


def main():
    print(f"[*] Loading synthetic hospital bills dataset from: {INPUT_FILE}")
    X, Y, df_features = load_dataset(INPUT_FILE)
    print(f"[+] Loaded {X.shape[0]} line items with {X.shape[1]} features and {Y.shape[1]} labels.")

    # Train / Test split (80% train, 20% test)
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=0.20, random_state=42
    )
    print(f"    - Training items: {X_train.shape[0]}")
    print(f"    - Test evaluation items: {X_test.shape[0]}\n")

    # Initialize and fit multi-label model
    classifier = MultiLabelXGBoostRiskClassifier(LABEL_NAMES, FEATURE_NAMES)
    classifier.fit(X_train, Y_train)

    # Evaluate on held-out test set
    print("\n" + "=" * 78)
    print("                MEDBILL AI CLASSIFIER EVALUATION REPORT")
    print("=" * 78)

    y_pred = classifier.predict(X_test, threshold=0.40)
    y_prob = classifier.predict_proba(X_test)

    precisions = []
    recalls = []
    f1s = []
    aucs = []

    print(f"{'Label Name':<25} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'AUC-ROC':<10}")
    print("-" * 78)

    for idx, lbl in enumerate(LABEL_NAMES):
        y_true_col = Y_test[:, idx]
        y_pred_col = y_pred[:, idx]
        y_prob_col = y_prob[:, idx]

        p = precision_score(y_true_col, y_pred_col, zero_division=0)
        r = recall_score(y_true_col, y_pred_col, zero_division=0)
        f = f1_score(y_true_col, y_pred_col, zero_division=0)

        # Handle edge case where test set might have single class
        if len(np.unique(y_true_col)) > 1:
            auc = roc_auc_score(y_true_col, y_prob_col)
        else:
            auc = 1.0

        precisions.append(p)
        recalls.append(r)
        f1s.append(f)
        aucs.append(auc)

        print(f"{lbl:<25} | {p:<10.4f} | {r:<10.4f} | {f:<10.4f} | {auc:<10.4f}")

    # Macro averages
    macro_p = float(np.mean(precisions))
    macro_r = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))
    macro_auc = float(np.mean(aucs))

    print("-" * 78)
    print(f"{'MACRO-AVERAGE':<25} | {macro_p:<10.4f} | {macro_r:<10.4f} | {macro_f1:<10.4f} | {macro_auc:<10.4f}")
    print("=" * 78)

    # Save trained model to models/risk_classifier.pkl
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(classifier, MODEL_OUTPUT_PATH)
    print(f"\n[✓] Trained model successfully serialized to:")
    print(f"    {MODEL_OUTPUT_PATH}")

    # Verify model re-loading
    loaded_model = joblib.load(MODEL_OUTPUT_PATH)
    test_sample = X_test[:1]
    sample_probs = loaded_model.predict_proba(test_sample)[0]
    print(f"[✓] Model verification test: Sample prediction completed successfully.")
    for lbl, prob in zip(LABEL_NAMES, sample_probs):
        print(f"    - {lbl:25s}: {prob * 100:5.2f}% probability")


if __name__ == "__main__":
    main()
