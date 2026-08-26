# pyright: reportMissingImports=false
"""Script: Evaluate trained Risk Classifier with precision, recall, and ROC analysis."""

import os
import sys

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
BACKEND_ROOT = os.path.dirname(ML_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, roc_auc_score, hamming_loss

DATA_PATH = os.path.join(ML_DIR, "data", "processed", "synthetic_bills.jsonl")
MODEL_PATH = os.path.join(ML_DIR, "models", "risk_classifier.pkl")

from train_classifier import load_dataset, LABEL_NAMES, FEATURE_NAMES, MultiLabelXGBoostRiskClassifier


def main():
    if not os.path.exists(MODEL_PATH):
        print(f"[-] Model not found at {MODEL_PATH}")
        return

    print("[*] Loading dataset and model...")
    X, Y, df_features = load_dataset(DATA_PATH)
    model = joblib.load(MODEL_PATH)

    y_pred = model.predict(X, threshold=0.40)
    y_prob = model.predict_proba(X)

    print("\n" + "=" * 60)
    print("           MODEL EVALUATION SUMMARY REPORT")
    print("=" * 60)
    print(classification_report(Y, y_pred, target_names=LABEL_NAMES, zero_division=0))
    print(f"Hamming Loss: {hamming_loss(Y, y_pred):.4f}")
    try:
        macro_auc = roc_auc_score(Y, y_prob, average="macro")
        print(f"Macro ROC-AUC: {macro_auc:.4f}")
    except Exception as e:
        print(f"ROC-AUC note: {e}")
    print("=" * 60)


if __name__ == "__main__":
    main()
