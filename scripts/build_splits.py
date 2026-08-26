#!/usr/bin/env python3
"""Validate, deduplicate, and split dataset at the bill-family level into train/val/test JSONL."""

import os
import sys
import argparse
import json
from typing import List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

from hospital_bill_ml.schema import BillRecord, BillItem, AnomalyLabels
from hospital_bill_ml.quality import DatasetQualityEngine


def parse_bill_record(d: dict) -> BillRecord:
    items = [
        BillItem(
            item_id=i.get("item_id", ""),
            raw_text=i.get("raw_text", ""),
            category=i.get("category", "other"),
            quantity=float(i.get("quantity", 1.0)),
            unit_price=float(i.get("unit_price", 0.0)),
            total_amount=float(i.get("total_amount", 0.0)),
            labels=AnomalyLabels(**i.get("labels", {}))
        )
        for i in d.get("line_items", [])
    ]
    return BillRecord(
        bill_id=d.get("bill_id", ""),
        family_id=d.get("family_id", d.get("bill_id", "")),
        hospital_name=d.get("hospital_name", ""),
        city=d.get("city", ""),
        state=d.get("state", ""),
        tier=d.get("tier", 1),
        is_nabh=d.get("is_nabh", True),
        admission_date=d.get("admission_date", ""),
        discharge_date=d.get("discharge_date", ""),
        days_admitted=d.get("days_admitted", 1),
        diagnosis=d.get("diagnosis", ""),
        icd10_code=d.get("icd10_code", ""),
        total_billed=float(d.get("total_billed", 0.0)),
        line_items=items,
        source_type=d.get("source_type", "synthetic"),
        scenario_id=d.get("scenario_id"),
        generation_seed=d.get("generation_seed"),
        validation_status=d.get("validation_status", "VALIDATED")
    )


def main():
    parser = argparse.ArgumentParser(description="Validate, deduplicate, and split datasets.")
    parser.add_argument("--input", default="data/processed/all_examples.jsonl", help="Input JSONL path")
    parser.add_argument("--outdir", default="data/processed", help="Output directory for split JSONL files")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for splitting")
    parser.add_argument("--train-ratio", type=float, default=0.70, help="Train ratio")
    parser.add_argument("--val-ratio", type=float, default=0.15, help="Validation ratio")
    parser.add_argument("--test-ratio", type=float, default=0.15, help="Test ratio")
    args = parser.parse_args()

    input_path = os.path.join(BASE_DIR, args.input)
    if not os.path.exists(input_path):
        print(f"[!] Input file {input_path} does not exist.")
        sys.exit(1)

    print(f"[*] Reading and validating examples from {input_path}...")
    raw_bills = []
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                d = json.loads(line)
                raw_bills.append(parse_bill_record(d))

    print(f"  -> Total loaded records: {len(raw_bills)}")

    # 1. Validation
    valid_bills = []
    invalid_count = 0
    for b in raw_bills:
        is_val, errs = DatasetQualityEngine.validate_bill(b)
        if is_val:
            valid_bills.append(b)
        else:
            invalid_count += 1

    print(f"  -> Validated records: {len(valid_bills)} (Filtered {invalid_count} invalid)")

    # 2. Deduplication
    unique_bills = DatasetQualityEngine.deduplicate_bills(valid_bills)
    print(f"  -> Deduplicated unique records: {len(unique_bills)} (Removed {len(valid_bills) - len(unique_bills)} duplicates)")

    # 3. Family-level Stratified Splitting
    print(f"[*] Performing family-level train/val/test split (seed={args.seed})...")
    splits = DatasetQualityEngine.split_by_family(
        unique_bills,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        random_seed=args.seed
    )

    out_dir = os.path.join(BASE_DIR, args.outdir)
    os.makedirs(out_dir, exist_ok=True)

    for split_name, split_list in splits.items():
        split_path = os.path.join(out_dir, f"{split_name}.jsonl")
        with open(split_path, "w", encoding="utf-8") as f:
            for b in split_list:
                f.write(json.dumps(b.to_dict(), ensure_ascii=False) + "\n")
        print(f"[✓] {split_name.upper()} split: {len(split_list)} bills -> {split_path}")


if __name__ == "__main__":
    main()
