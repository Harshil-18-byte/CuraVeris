"""Step 12: Stratified Train / Validation / Test Split Script.

Splits merged_dataset.jsonl into:
- 70% train.jsonl
- 15% val.jsonl
- 15% test.jsonl

Stratified by bill-level `risk_category` (low, medium, high, critical) to ensure
balanced class and risk distributions across all splits.

CLI:
  python split_dataset.py [--input <file>] [--output-dir <dir>] [--seed 42]
"""

import os
import sys
import json
import argparse
import numpy as np
from typing import List, Dict, Any
from sklearn.model_selection import train_test_split

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_INPUT = os.path.join(ML_DIR, "data", "processed", "merged_dataset.jsonl")
DEFAULT_SPLITS_DIR = os.path.join(ML_DIR, "data", "processed", "splits")


def load_bills(file_path: str) -> List[Dict[str, Any]]:
    bills = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    bills.append(json.loads(line.strip()))
                except Exception as e:
                    pass
    return bills


def main():
    parser = argparse.ArgumentParser(description="Stratified dataset splitter (70/15/15)")
    parser.add_argument("--input", type=str, default=DEFAULT_INPUT, help="Path to merged JSONL")
    parser.add_argument("--output-dir", type=str, default=DEFAULT_SPLITS_DIR, help="Output directory for splits")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    print("=" * 70)
    print("      STEP 12: STRATIFIED DATASET SPLIT (70% / 15% / 15%)")
    print("=" * 70)

    bills = load_bills(args.input)
    print(f"[*] Loaded {len(bills)} bills from: {args.input}")

    # Extract stratification labels (risk_category)
    strat_labels = []
    for b in bills:
        risk_assess = b.get("risk_assessment", {})
        cat = str(risk_assess.get("risk_category", "low")).lower()
        strat_labels.append(cat)

    # 1. Split 70% Train, 30% Temp (Val + Test)
    train_bills, temp_bills, train_labels, temp_labels = train_test_split(
        bills, strat_labels, test_size=0.30, random_state=args.seed, stratify=strat_labels
    )

    # 2. Split Temp 50/50 into Val (15%) and Test (15%)
    val_bills, test_bills, val_labels, test_labels = train_test_split(
        temp_bills, temp_labels, test_size=0.50, random_state=args.seed, stratify=temp_labels
    )

    os.makedirs(args.output_dir, exist_ok=True)
    train_path = os.path.join(args.output_dir, "train.jsonl")
    val_path = os.path.join(args.output_dir, "val.jsonl")
    test_path = os.path.join(args.output_dir, "test.jsonl")

    with open(train_path, "w", encoding="utf-8") as f:
        for b in train_bills:
            f.write(json.dumps(b) + "\n")

    with open(val_path, "w", encoding="utf-8") as f:
        for b in val_bills:
            f.write(json.dumps(b) + "\n")

    with open(test_path, "w", encoding="utf-8") as f:
        for b in test_bills:
            f.write(json.dumps(b) + "\n")

    def count_items(blist):
        return sum(len(b.get("line_items", [])) for b in blist)

    print(f"\n[✓] Splits successfully created in: {args.output_dir}")
    print(f"    - Train set (70%) : {len(train_bills):3d} bills, {count_items(train_bills):4d} line items -> {train_path}")
    print(f"    - Val set   (15%) : {len(val_bills):3d} bills, {count_items(val_bills):4d} line items -> {val_path}")
    print(f"    - Test set  (15%) : {len(test_bills):3d} bills, {count_items(test_bills):4d} line items -> {test_path}")

    # Verify stratification distribution
    print("\n    Stratification Check (Risk Category Proportions):")
    from collections import Counter
    for name, blist in [("Train", train_bills), ("Val", val_bills), ("Test", test_bills)]:
        counts = Counter(str(b.get("risk_assessment", {}).get("risk_category", "low")).lower() for b in blist)
        total = len(blist)
        dist = ", ".join(f"{k}: {v/total*100:.1f}%" for k, v in sorted(counts.items()))
        print(f"    - {name:5s}: {dist}")


if __name__ == "__main__":
    main()
