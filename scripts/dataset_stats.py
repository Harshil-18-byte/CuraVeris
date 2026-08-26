#!/usr/bin/env python3
"""Inspect coverage, anomaly balance, and family statistics across dataset splits."""

import os
import sys
import argparse
import json
from collections import Counter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def inspect_split(split_name: str, split_path: str):
    if not os.path.exists(split_path):
        print(f"[-] Split file {split_name} not found at {split_path}")
        return

    source_counter = Counter()
    label_counter = Counter()
    family_set = set()
    total_bills = 0
    total_line_items = 0
    total_billed_inr = 0.0

    with open(split_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            d = json.loads(line)
            total_bills += 1
            family_set.add(d.get("family_id", d.get("bill_id")))
            source_counter[d.get("source_type", "unknown")] += 1
            total_billed_inr += float(d.get("total_billed", 0.0))

            for item in d.get("line_items", []):
                total_line_items += 1
                for lbl, val in item.get("labels", {}).items():
                    if val == 1:
                        label_counter[lbl] += 1

    print(f"\n==================================================")
    print(f"📊 DATASET STATS: {split_name.upper()}")
    print(f"==================================================")
    print(f"Total Bills:       {total_bills:,}")
    print(f"Unique Families:   {len(family_set):,}")
    print(f"Total Line Items:  {total_line_items:,}")
    print(f"Total Volume INR:  ₹{total_billed_inr:,.2f}")
    print(f"\n--- Source Distribution ---")
    for src, count in source_counter.most_common():
        pct = (count / total_bills) * 100 if total_bills else 0
        print(f"  • {src.ljust(16)}: {count:5d} ({pct:5.1f}%)")

    print(f"\n--- Anomaly Violation Flags ---")
    for lbl, count in label_counter.most_common():
        pct = (count / total_line_items) * 100 if total_line_items else 0
        print(f"  • {lbl.ljust(24)}: {count:5d} lines ({pct:5.1f}%)")


def main():
    parser = argparse.ArgumentParser(description="Inspect dataset statistics.")
    parser.add_argument("--datadir", default="data/processed", help="Directory containing train/val/test JSONL files")
    args = parser.parse_args()

    data_dir = os.path.join(BASE_DIR, args.datadir)
    print(f"[*] Reading dataset splits from {data_dir}...")

    for split in ["train", "val", "test", "all_examples"]:
        fpath = os.path.join(data_dir, f"{split}.jsonl")
        inspect_split(split, fpath)


if __name__ == "__main__":
    main()
