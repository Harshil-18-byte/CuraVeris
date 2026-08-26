"""
Model Training Script for CuraVeris Hospital Bill Risk Classifier.
Trains a multi-label classifier on engineered medical billing features.
"""
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from typing import Optional

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

from app.ml.dataset_generator import generate_synthetic_billing_data, FLAG_NAMES, CATEGORIES

MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "weights", "risk_model.joblib")


def prepare_features(samples):
    X_rows = []
    Y_rows = []

    for s in samples:
        # Category one-hot
        cat_vector = [1 if s["category"] == c else 0 for c in CATEGORIES]
        
        feature_vector = [
            s["rate_vs_cghs_ratio"],
            s["rate_vs_mrp_ratio"],
            s["qty_zscore"],
            s["days_in_hospital"],
            s["consumable_pct"],
            s["is_package_item"],
            s["has_icd_code"],
            s["amount_percentile"],
            s["description_similarity_max"],
        ] + cat_vector
        
        X_rows.append(feature_vector)
        Y_rows.append(s["labels"])

    return np.array(X_rows, dtype=np.float32), np.array(Y_rows, dtype=np.int32)


def train_and_evaluate(
    num_samples: int = 2500,
    seed: Optional[int] = None,
    learning_rate: float = 0.08
):
    import secrets
    import uuid
    import json
    from datetime import datetime, timezone

    # Production Best Practice: Generate cryptographically secure random seed and log it
    actual_seed = seed if seed is not None else secrets.randbelow(1_000_000)
    print("=" * 60)
    print(f"[REPRODUCIBILITY SEED] Training initialized with seed: {actual_seed} (LR: {learning_rate})")
    print(f"Generating {num_samples} annotated medical billing records...")
    samples = generate_synthetic_billing_data(num_samples, seed=actual_seed)
    
    X, Y = prepare_features(samples)
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=0.20, random_state=actual_seed
    )

    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    print(f"Features dimension: {X.shape[1]} | Multi-labels: {len(FLAG_NAMES)}")

    # Model definition
    if HAS_XGB:
        print(f"Using XGBoost MultiOutputClassifier (LR: {learning_rate})...")
        base_estimator = xgb.XGBClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=float(learning_rate),
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=2.0,
            eval_metric="logloss",
            random_state=actual_seed
        )
    else:
        print("Using RandomForest MultiOutputClassifier...")
        base_estimator = RandomForestClassifier(
            n_estimators=150,
            max_depth=8,
            random_state=actual_seed
        )

    classifier = MultiOutputClassifier(base_estimator, n_jobs=-1)
    print("Training Tree model (XGBoost)...")
    classifier.fit(X_train, Y_train)

    # 2. Train Deep Neural Network
    from app.ml.deep_risk_network import DeepRiskNeuralNetwork, HybridRiskEnsemble
    print("Training Deep Neural Network (MLP 128-64-32 with Adam & Early Stopping)...")
    deep_nn = DeepRiskNeuralNetwork(random_state=actual_seed)
    deep_nn.fit(X_train, Y_train)

    # 3. Construct Hybrid Stacking Ensemble
    hybrid_ensemble = HybridRiskEnsemble(tree_model=classifier, nn_model=deep_nn, nn_weight=0.45)

    # Evaluation on Test Set
    Y_pred_tree = classifier.predict(X_test)
    Y_pred_nn = deep_nn.predict(X_test)
    Y_pred = hybrid_ensemble.predict(X_test)

    print("\n" + "=" * 60)
    print("HYBRID ENSEMBLE EVALUATION RESULTS (TEST SET):")
    print("=" * 60)
    report_dict = classification_report(Y_test, Y_pred, target_names=FLAG_NAMES, output_dict=True, zero_division=0)
    print(classification_report(Y_test, Y_pred, target_names=FLAG_NAMES, zero_division=0))

    macro_f1 = f1_score(Y_test, Y_pred, average="macro", zero_division=0)
    macro_precision = precision_score(Y_test, Y_pred, average="macro", zero_division=0)
    macro_recall = recall_score(Y_test, Y_pred, average="macro", zero_division=0)

    tree_f1 = f1_score(Y_test, Y_pred_tree, average="macro", zero_division=0)
    nn_f1 = f1_score(Y_test, Y_pred_nn, average="macro", zero_division=0)

    print(f"Seed Used:                  {actual_seed}")
    print(f"Tree Model Macro F1:        {tree_f1:.4f}")
    print(f"Deep Neural Net Macro F1:   {nn_f1:.4f}")
    print(f"Hybrid Ensemble Macro F1:   {macro_f1:.4f}")
    print(f"Hybrid Macro Precision:     {macro_precision:.4f}")
    print(f"Hybrid Macro Recall:        {macro_recall:.4f}")

    # Calculate feature importances across multioutput sub-estimators
    feature_names = [
        "rate_vs_cghs_ratio", "rate_vs_mrp_ratio", "qty_zscore",
        "days_in_hospital", "consumable_pct", "is_package_item",
        "has_icd_code", "amount_percentile", "description_similarity_max"
    ] + [f"cat_{c}" for c in CATEGORIES]

    feature_importances = {}
    try:
        raw_importances = np.mean([
            est.feature_importances_ for est in classifier.estimators_ if hasattr(est, "feature_importances_")
        ], axis=0)
        for fn, imp in zip(feature_names, raw_importances):
            feature_importances[fn] = round(float(imp), 4)
    except Exception as e:
        print(f"Feature importance calculation note: {e}")

    # Build per-class breakdown for developer observability
    per_class = {}
    for flag in FLAG_NAMES:
        if flag in report_dict:
            per_class[flag] = {
                "precision": round(float(report_dict[flag]["precision"]), 4),
                "recall": round(float(report_dict[flag]["recall"]), 4),
                "f1_score": round(float(report_dict[flag]["f1-score"]), 4),
                "support": int(report_dict[flag]["support"])
            }

    run_id = f"run_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    now_human = datetime.now().strftime("%d %b %Y, %I:%M:%S %p IST")

    # Determine stability & data drift status tag against prior run
    history_file = os.path.join(os.path.dirname(MODEL_SAVE_PATH), "training_history.json")
    os.makedirs(os.path.dirname(history_file), exist_ok=True)
    history = []
    if os.path.exists(history_file):
        try:
            with open(history_file, "r") as f:
                history = json.load(f)
        except Exception:
            history = []

    if history:
        prev_f1 = history[0].get("macro_f1", macro_f1)
        variance = abs(macro_f1 - prev_f1)
        if variance > 0.08:
            status_tag = "High Variance"
            status_label = "⚠️ Review Required - High Variance"
        elif macro_f1 < 0.40:
            status_tag = "Data Drift Alert"
            status_label = "⚠️ Review Required - Data Drift"
        else:
            status_tag = "Stable"
            status_label = "✓ Stable"
    else:
        status_tag = "Baseline"
        status_label = "✓ Baseline"

    # Structured Run Record Schema
    run_record = {
        "run_id": run_id,
        "seed": actual_seed,
        "learning_rate": float(learning_rate),
        "timestamp_iso": now_iso,
        "timestamp_human": now_human,
        "num_samples": num_samples,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "macro_f1": round(float(macro_f1), 4),
        "macro_precision": round(float(macro_precision), 4),
        "macro_recall": round(float(macro_recall), 4),
        "status_tag": status_tag,
        "status_label": status_label,
        "per_class": per_class,
        "feature_importances": feature_importances
    }

    # Append to training history JSON log
    history.insert(0, run_record)
    history = history[:50]  # Retain latest 50 runs
    with open(history_file, "w") as f:
        json.dump(history, f, indent=2)

    # Package metadata with model
    model_artifact = {
        "model": classifier,
        "deep_neural_network": deep_nn,
        "hybrid_ensemble": hybrid_ensemble,
        "feature_names": feature_names,
        "categories": CATEGORIES,
        "flag_names": FLAG_NAMES,
        "metrics": {
            "run_id": run_id,
            "seed": actual_seed,
            "learning_rate": float(learning_rate),
            "macro_f1": float(macro_f1),
            "macro_precision": float(macro_precision),
            "macro_recall": float(macro_recall),
            "tree_macro_f1": float(tree_f1),
            "deep_nn_macro_f1": float(nn_f1),
            "hybrid_macro_f1": float(macro_f1),
            "status_tag": status_tag,
            "status_label": status_label,
            "per_class": per_class,
            "feature_importances": feature_importances,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "trained_at": now_human
        }
    }

    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    joblib.dump(model_artifact, MODEL_SAVE_PATH)
    
    # Save standalone hybrid ensemble and deep NN artifacts
    deep_save_path = os.path.join(os.path.dirname(MODEL_SAVE_PATH), "deep_risk_model.joblib")
    ensemble_save_path = os.path.join(os.path.dirname(MODEL_SAVE_PATH), "hybrid_ensemble.joblib")
    joblib.dump(deep_nn, deep_save_path)
    joblib.dump(hybrid_ensemble, ensemble_save_path)

    print(f"\nTrained models (run {run_id}, seed {actual_seed}) saved to:")
    print(f" - Primary Model:    {MODEL_SAVE_PATH}")
    print(f" - Deep Neural Net:  {deep_save_path}")
    print(f" - Hybrid Ensemble:  {ensemble_save_path}")
    print(f"Training history appended to: {history_file}")
    print("=" * 60)
    return model_artifact



if __name__ == "__main__":
    train_and_evaluate()
