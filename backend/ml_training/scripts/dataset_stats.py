"""Step 11: Dataset Statistics Inspection Script.

Outputs:
- Total bills and line item counts
- Flag distribution and rates
- Diagnosis (ICD-10) coverage
- City and hospital tier coverage
- Risk category distribution

CLI:
  python dataset_stats.py [<path_to_jsonl>]
"""

import os
import sys
import json
import argparse
from typing import List, Dict, Any
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_INPUT = os.path.join(ML_DIR, "data", "processed", "merged_dataset.jsonl")


def print_stats(file_path: str):
    if not os.path.exists(file_path):
        print(f"[!] File not found: {file_path}")
        return

    bills = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    bills.append(json.loads(line.strip()))
                except Exception as e:
                    pass

    total_bills = len(bills)
    total_line_items = sum(len(b.get("line_items", [])) for b in bills)

    # Risk categories
    risk_cats = Counter()
    # Risk flags
    flag_counts = Counter()
    # ICD diagnoses
    diagnoses = Counter()
    # Cities
    cities = Counter()
    # Hospitals
    hospitals = Counter()
    # Total billed / overcharges
    total_billed = 0.0
    total_overcharge = 0.0

    for b in bills:
        meta = b.get("metadata", {})
        patient = b.get("patient", {})
        risk_assess = b.get("risk_assessment", {})
        totals = b.get("bill_totals", {})

        cat = risk_assess.get("risk_category", "unknown")
        risk_cats[cat] += 1

        city = meta.get("hospital_city") or b.get("city", "unknown")
        cities[city] += 1

        hosp = meta.get("hospital_name") or b.get("hospital_name", "unknown")
        hospitals[hosp] += 1

        icd = patient.get("icd10_code") or b.get("diagnosis_icd", "unknown")
        diag_name = patient.get("primary_diagnosis", "unknown")
        diagnoses[f"{icd} ({diag_name})"] += 1

        total_billed += float(totals.get("total_billed", b.get("total_amount", 0.0)))
        total_overcharge += float(totals.get("total_overcharge_detected", 0.0))

        for it in b.get("line_items", []):
            flags = it.get("risk_flags", [])
            for flag in flags:
                flag_counts[flag] += 1

    print("=" * 78)
    print("                     DATASET COMPREHENSIVE STATISTICS")
    print("=" * 78)
    print(f"[*] Dataset File : {file_path}")
    print(f"[*] Total Bills  : {total_bills:,}")
    print(f"[*] Total Items  : {total_line_items:,} (avg {total_line_items/max(total_bills,1):.1f} items/bill)")
    print(f"[*] Total Billed : ₹{total_billed:,.2f}")
    print(f"[*] Overcharges  : ₹{total_overcharge:,.2f} ({total_overcharge/max(total_billed,1)*100:.1f}%)")
    print("-" * 78)

    print("\n[1] Risk Category Distribution (Bill-Level):")
    for cat, count in risk_cats.most_common():
        pct = (count / total_bills) * 100
        print(f"    - {cat.upper():12s}: {count:4d} bills ({pct:5.1f}%)")

    print("\n[2] Risk Flag Distribution (Line-Item Level):")
    for flag, count in flag_counts.most_common():
        pct = (count / total_line_items) * 100
        print(f"    - {flag:25s}: {count:4d} items ({pct:5.2f}%)")

    print(f"\n[3] Diagnosis Coverage ({len(diagnoses)} unique diagnoses):")
    for diag, count in diagnoses.most_common(10):
        print(f"    - {diag:40s}: {count:3d} bills")
    if len(diagnoses) > 10:
        print(f"      ... and {len(diagnoses)-10} more diagnoses")

    print(f"\n[4] City & Geographic Coverage ({len(cities)} cities):")
    for city, count in cities.most_common():
        print(f"    - {city:15s}: {count:3d} bills ({count/total_bills*100:4.1f}%)")

    print(f"\n[5] Hospital Coverage ({len(hospitals)} hospital networks):")
    for hosp, count in hospitals.most_common(6):
        print(f"    - {hosp:35s}: {count:3d} bills")

    print("=" * 78)


def main():
    parser = argparse.ArgumentParser(description="Display dataset statistics")
    parser.add_argument("file", nargs="?", default=DEFAULT_INPUT, help="Path to JSONL file")
    args = parser.parse_args()
    print_stats(args.file)


if __name__ == "__main__":
    main()
