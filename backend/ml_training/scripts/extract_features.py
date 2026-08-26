"""Step 13: Feature Extraction Pipeline.

Extracts the 10 mandated features and 6 multi-label ground truth targets per line item
from train.jsonl, val.jsonl, and test.jsonl splits.

10 Features:
  1.  rate_vs_cghs_ratio       - Charged unit rate / CGHS NABH benchmark (capped at 20.0)
  2.  rate_vs_mrp_ratio        - Charged unit rate / (NPPA or DPCO MRP ceiling)
  3.  qty_zscore               - Line item quantity z-score within bill
  4.  category_encoded         - Categorical encoding (0:consultation, 1:room, 2:diagnostic, 3:procedure, 4:pharmacy, 5:consumable, 6:other)
  5.  amount_percentile        - Percentile rank of item's total charge within bill
  6.  consumable_pct_of_bill   - Ratio of consumable line items to total line items in bill
  7.  has_icd_code             - Binary indicator for valid ICD-10 diagnosis code
  8.  description_similarity_max - Text similarity to statutory standard terminology
  9.  gst_rate_error           - Absolute difference between charged GST and statutory GST rate (fraction)
  10. los_days                 - Length of inpatient stay in days

6 Multi-Label Targets:
  1. above_mrp
  2. duplicate_charge
  3. rate_anomaly
  4. gst_violation
  5. upcoding_suspected
  6. date_window_violation

Outputs (in data/processed/features/):
  - train_X.npy, train_y.npy
  - val_X.npy, val_y.npy
  - test_X.npy, test_y.npy
  - feature_metadata.json

CLI:
  python extract_features.py [--splits-dir <dir>] [--output-dir <dir>]
"""

import os
import sys
import json
import re
import argparse
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Any

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_SPLITS_DIR = os.path.join(ML_DIR, "data", "processed", "splits")
DEFAULT_OUTPUT_DIR = os.path.join(ML_DIR, "data", "processed", "features")

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
    "accommodation": 1,
    "diagnostic": 2,
    "procedure": 3,
    "pharmacy": 4,
    "medicine": 4,
    "consumable": 5,
    "implant": 3,
    "other": 6,
}


def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", " ", str(text).lower()).strip()


def compute_lexical_similarity(item_name: str, category: str) -> float:
    words = set(clean_text(item_name).split())
    if not words:
        return 0.1
    ref_keywords = {
        "procedure": {"surgery", "laparoscopic", "appendectomy", "cholecystectomy", "angioplasty", "stent", "biopsy", "dressing", "delivery", "lscs", "repair", "dialysis"},
        "pharmacy": {"tablet", "injection", "inj", "tab", "syrup", "infusion", "pantoprazole", "paracetamol", "ondansetron", "ceftriaxone", "meropenem", "saline", "ns", "rl"},
        "medicine": {"tablet", "injection", "inj", "tab", "syrup", "infusion", "pantoprazole", "paracetamol", "ondansetron", "ceftriaxone", "meropenem", "saline", "ns", "rl"},
        "diagnostic": {"cbc", "hemogram", "blood", "urine", "xray", "x-ray", "ct", "mri", "ultrasound", "scan", "lft", "kft", "electrolytes", "culture", "profile", "ecg", "echo"},
        "room_nursing": {"room", "bed", "ward", "icu", "nursing", "deluxe", "charges", "stay", "day", "semi-private", "general"},
        "accommodation": {"room", "bed", "ward", "icu", "nursing", "deluxe", "charges", "stay", "day", "semi-private", "general"},
        "consumable": {"gloves", "cannula", "syringe", "catheter", "gauze", "cotton", "mask", "bandage", "tube", "suture", "bag"},
        "implant": {"stent", "implant", "des", "bms", "pacemaker", "lens", "iol", "plate", "screw", "cage"},
    }
    target_set = ref_keywords.get(category.lower(), set())
    all_refs = set.union(*ref_keywords.values())

    category_overlap = len(words.intersection(target_set))
    global_overlap = len(words.intersection(all_refs))

    score = (category_overlap * 0.6 + global_overlap * 0.4) / max(len(words), 1)
    return float(np.clip(score + 0.35, 0.1, 1.0))


def extract_features_from_split(jsonl_path: str) -> Tuple[np.ndarray, np.ndarray]:
    """Reads a split JSONL and extracts (N, 10) feature matrix and (N, 6) label matrix."""
    if not os.path.exists(jsonl_path):
        raise FileNotFoundError(f"Split file not found: {jsonl_path}")

    bills = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    bills.append(json.loads(line.strip()))
                except Exception:
                    pass

    X_rows = []
    y_rows = []

    for bill in bills:
        meta = bill.get("metadata", {})
        patient = bill.get("patient", {})
        items = bill.get("line_items", [])
        if not items:
            continue

        los = float(meta.get("los_days", 3) or 3.0)
        has_icd = 1.0 if (patient.get("icd10_code") or bill.get("diagnosis_icd")) else 0.0

        quantities = [float(it.get("quantity", 1.0) or 1.0) for it in items]
        amounts = [float(it.get("charged_total", it.get("total_amount", 0.0)) or 0.0) for it in items]
        q_mean = float(np.mean(quantities)) if quantities else 1.0
        q_std = float(np.std(quantities)) if quantities else 1.0
        q_std = q_std if q_std > 1e-4 else 1.0

        consumable_count = sum(1 for it in items if str(it.get("category", "")).lower() == "consumable")
        consumable_pct = consumable_count / max(len(items), 1)

        for it in items:
            # 1. rate_vs_cghs_ratio
            unit_price = float(it.get("charged_rate", it.get("unit_price", 0.0)) or 0.0)
            cghs_ref = float(it.get("cghs_rate_nabh") or it.get("cghs_rate") or (unit_price if unit_price > 0 else 1.0))
            cghs_ref = cghs_ref if cghs_ref > 0 else 1.0
            rate_vs_cghs_ratio = min(unit_price / cghs_ref, 20.0)

            # 2. rate_vs_mrp_ratio
            mrp_ref = it.get("nppa_ceiling") or it.get("mrp")
            if mrp_ref and float(mrp_ref) > 0:
                rate_vs_mrp_ratio = min(unit_price / float(mrp_ref), 10.0)
            else:
                rate_vs_mrp_ratio = 1.0

            # 3. qty_zscore
            qty = float(it.get("quantity", 1.0) or 1.0)
            qty_zscore = float(np.clip((qty - q_mean) / q_std, -5.0, 10.0))

            # 4. category_encoded
            cat_str = str(it.get("category", "other")).lower()
            cat_enc = float(CATEGORY_MAP.get(cat_str, 6))

            # 5. amount_percentile
            total_amt = float(it.get("charged_total", it.get("total_amount", 0.0)) or 0.0)
            amt_percentile = float(np.mean(np.array(amounts) <= total_amt)) if amounts else 0.5

            # 6. consumable_pct_of_bill (already computed)
            # 7. has_icd_code (already computed)

            # 8. description_similarity_max
            item_name = str(it.get("item_name") or it.get("normalized_name") or it.get("raw_text") or "")
            sim_score = compute_lexical_similarity(item_name, cat_str)

            # 9. gst_rate_error
            charged_gst = float(it.get("gst_rate_charged", 0) or 0)
            correct_gst = float(it.get("correct_gst_rate", 0) or 0)
            gst_rate_error = abs(charged_gst - correct_gst) / 100.0

            # 10. los_days
            los_feat = min(los, 30.0)

            feat_vec = [
                rate_vs_cghs_ratio,
                rate_vs_mrp_ratio,
                qty_zscore,
                cat_enc,
                amt_percentile,
                consumable_pct,
                has_icd,
                sim_score,
                gst_rate_error,
                los_feat,
            ]
            X_rows.append(feat_vec)

            # Target labels (6)
            risk_flags = set(it.get("risk_flags", []))
            lbl_dict = it.get("labels", {})
            target_vec = []
            for lbl in LABEL_NAMES:
                val = 1 if (lbl in risk_flags or lbl_dict.get(lbl, 0) == 1) else 0
                target_vec.append(val)
            y_rows.append(target_vec)

    X = np.array(X_rows, dtype=np.float32)
    y = np.array(y_rows, dtype=np.int32)
    return X, y


def main():
    parser = argparse.ArgumentParser(description="Extract 10 features & 6 targets from split datasets")
    parser.add_argument("--splits-dir", type=str, default=DEFAULT_SPLITS_DIR, help="Path to splits dir")
    parser.add_argument("--output-dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Path to output features dir")
    args = parser.parse_args()

    print("=" * 75)
    print("             STEP 13: FEATURE EXTRACTION PIPELINE")
    print("=" * 75)
    print(f"[*] Splits Dir   : {args.splits_dir}")
    print(f"[*] Output Dir   : {args.output_dir}")
    print(f"[*] Feature List : {FEATURE_NAMES}")
    print(f"[*] Target List  : {LABEL_NAMES}")
    print("-" * 75)

    os.makedirs(args.output_dir, exist_ok=True)

    for split_name in ["train", "val", "test"]:
        jsonl_file = os.path.join(args.splits_dir, f"{split_name}.jsonl")
        print(f"[*] Processing {split_name} split: {jsonl_file}...")
        X, y = extract_features_from_split(jsonl_file)

        x_out = os.path.join(args.output_dir, f"{split_name}_X.npy")
        y_out = os.path.join(args.output_dir, f"{split_name}_y.npy")
        np.save(x_out, X)
        np.save(y_out, y)

        print(f"    - {split_name}_X.npy shape : {X.shape} (dtype: {X.dtype})")
        print(f"    - {split_name}_y.npy shape : {y.shape} (dtype: {y.dtype})")
        pos_counts = y.sum(axis=0)
        pos_dist = ", ".join(f"{lbl}: {pos_counts[i]}" for i, lbl in enumerate(LABEL_NAMES))
        print(f"    - Positive labels count : {pos_dist}\n")

    # Save feature and label metadata
    meta = {
        "feature_names": FEATURE_NAMES,
        "label_names": LABEL_NAMES,
        "category_map": CATEGORY_MAP,
        "n_features": len(FEATURE_NAMES),
        "n_labels": len(LABEL_NAMES),
    }
    meta_path = os.path.join(args.output_dir, "feature_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[✓] Feature extraction complete! Artifacts saved to: {args.output_dir}")


if __name__ == "__main__":
    main()
