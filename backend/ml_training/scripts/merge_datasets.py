"""Step 11: Merge Datasets Script.

Merges:
1. Tier 1 Real Annotated Bills from data/tier1_real_bills/*.json (and data/raw/annotations/*.json if any)
2. Tier 2 Synthetic Bills from data/processed/synthetic_bills.jsonl

Output:
- data/processed/merged_dataset.jsonl

CLI:
  python merge_datasets.py [--tier1 <dir>] [--tier2 <file>] [--output <file>]
"""

import os
import sys
import glob
import json
import argparse
from typing import List, Dict, Any

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_TIER1_DIR = os.path.join(ML_DIR, "data", "tier1_real_bills")
DEFAULT_ANNOTATIONS_DIR = os.path.join(ML_DIR, "data", "raw", "annotations")
DEFAULT_TIER2_FILE = os.path.join(ML_DIR, "data", "processed", "synthetic_bills.jsonl")
DEFAULT_OUTPUT_FILE = os.path.join(ML_DIR, "data", "processed", "merged_dataset.jsonl")


def load_json_files(dir_path: str) -> List[Dict[str, Any]]:
    items = []
    if not os.path.exists(dir_path):
        return items
    for p in glob.glob(os.path.join(dir_path, "*.json")):
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    items.append(data)
                elif isinstance(data, list):
                    items.extend(data)
        except Exception as e:
            print(f"[!] Error loading {p}: {e}")
    return items


def load_jsonl_file(file_path: str) -> List[Dict[str, Any]]:
    items = []
    if not os.path.exists(file_path):
        return items
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if line_str:
                try:
                    items.append(json.loads(line_str))
                except Exception as e:
                    print(f"[!] JSON parsing error in line: {e}")
    return items


def main():
    parser = argparse.ArgumentParser(description="Merge Real and Synthetic Bills into merged_dataset.jsonl")
    parser.add_argument("--tier1", type=str, default=DEFAULT_TIER1_DIR, help="Path to tier 1 real bills dir")
    parser.add_argument("--tier2", type=str, default=DEFAULT_TIER2_FILE, help="Path to synthetic_bills.jsonl")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT_FILE, help="Path to output merged jsonl")
    args = parser.parse_args()

    print("=" * 70)
    print("           STEP 11: DATASET MERGER (TIER 1 + TIER 2)")
    print("=" * 70)

    # 1. Load Tier 1
    tier1_bills = load_json_files(args.tier1)
    # Also check data/raw/annotations if exists
    ann_bills = load_json_files(DEFAULT_ANNOTATIONS_DIR)
    seen_ids = set()
    unique_tier1 = []
    for b in tier1_bills + ann_bills:
        bid = b.get("bill_id", "")
        if bid and bid not in seen_ids:
            seen_ids.add(bid)
            unique_tier1.append(b)

    print(f"[*] Loaded {len(unique_tier1)} unique Tier 1 real annotated bills.")

    # 2. Load Tier 2
    tier2_bills = load_jsonl_file(args.tier2)
    print(f"[*] Loaded {len(tier2_bills)} Tier 2 synthetic bills.")

    merged_bills = unique_tier1 + tier2_bills
    total_bills = len(merged_bills)

    # 3. Write merged JSONL
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        for b in merged_bills:
            f.write(json.dumps(b) + "\n")

    print(f"\n[✓] Merged dataset successfully written to: {args.output}")
    print(f"    - Total bills : {total_bills}")
    print(f"    - Tier 1 real : {len(unique_tier1)} ({len(unique_tier1)/total_bills*100:.1f}%)")
    print(f"    - Tier 2 synth: {len(tier2_bills)} ({len(tier2_bills)/total_bills*100:.1f}%)")


if __name__ == "__main__":
    main()
