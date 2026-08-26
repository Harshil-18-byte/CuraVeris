#!/usr/bin/env python3
"""Generate synthetic, counterfactual, and hard-negative medical bill datasets."""

import os
import sys
import argparse
import json
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

from hospital_bill_ml.generator import ScenarioBillGenerator
from hospital_bill_ml.mutations import CounterfactualMutator
from hospital_bill_ml.hard_negatives import HardNegativeSynthesizer
from hospital_bill_ml.schema import BillRecord, BillItem, AnomalyLabels


def load_real_bills() -> list:
    real_bills = []
    pattern = os.path.join(BASE_DIR, "backend", "ml_training", "data", "tier1_real_bills", "*.json")
    for fpath in glob.glob(pattern):
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                d = json.load(f)
                items = [
                    BillItem(
                        item_id=i.get("item_id", f"LI_{idx:03d}"),
                        raw_text=i.get("raw_text", ""),
                        category=i.get("category", "other"),
                        quantity=float(i.get("quantity", 1.0)),
                        unit_price=float(i.get("unit_price", 0.0)),
                        total_amount=float(i.get("total_amount", 0.0)),
                        labels=AnomalyLabels(**i.get("labels", {}))
                    )
                    for idx, i in enumerate(d.get("line_items", []))
                ]
                real_bills.append(BillRecord(
                    bill_id=d.get("bill_id", "REAL_BILL"),
                    family_id=d.get("bill_id", "REAL_BILL"),
                    hospital_name=d.get("hospital_name", "Hospital"),
                    city=d.get("city", "City"),
                    state=d.get("state", "State"),
                    tier=d.get("tier", 1),
                    is_nabh=d.get("is_nabh", True),
                    admission_date=d.get("admission_date", "2026-01-01"),
                    discharge_date=d.get("discharge_date", "2026-01-05"),
                    days_admitted=d.get("days_admitted", 4),
                    diagnosis=d.get("diagnosis", "Diagnosis"),
                    icd10_code=d.get("icd10_code", "Z00.00"),
                    total_billed=float(d.get("total_billed", sum(i.total_amount for i in items))),
                    line_items=items,
                    source_type="real",
                    scenario_id="REAL_CURATED",
                    generation_seed=None,
                    validation_status="VALIDATED"
                ))
        except Exception:
            pass
    return real_bills


def main():
    parser = argparse.ArgumentParser(description="Generate hospital billing ML dataset.")
    parser.add_argument("--synthetic", type=int, default=100, help="Number of synthetic baseline bills")
    parser.add_argument("--counterfactual", type=int, default=50, help="Number of counterfactual mutations")
    parser.add_argument("--hard-negative", type=int, default=50, help="Number of hard negative bills")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--output", default="data/processed/all_examples.jsonl", help="Output JSONL path")
    args = parser.parse_args()

    print(f"[*] Starting dataset generation with seed={args.seed}...")
    
    # 1. Real Bills
    real_bills = load_real_bills()
    print(f"  -> Loaded {len(real_bills)} curated real anchor bills")

    # 2. Synthetic Scenario Bills
    gen = ScenarioBillGenerator(random_seed=args.seed)
    synth_bills = [gen.generate_bill(i + 1) for i in range(args.synthetic)]
    print(f"  -> Generated {len(synth_bills)} synthetic baseline bills")

    # 3. Counterfactual Mutations
    mutator = CounterfactualMutator(random_seed=args.seed)
    cf_bills = []
    sample_pool = synth_bills if synth_bills else real_bills
    if sample_pool and args.counterfactual > 0:
        for idx in range(args.counterfactual):
            base = sample_pool[idx % len(sample_pool)]
            mut_list = mutator.generate_all_mutations(base)
            cf_bills.append(mut_list[idx % len(mut_list)])
    print(f"  -> Generated {len(cf_bills)} controlled counterfactual mutations")

    # 4. Hard Negatives
    hn_syn = HardNegativeSynthesizer(random_seed=args.seed)
    hn_bills = []
    for i in range(args.hard_negative):
        if i % 2 == 0:
            hn_bills.append(hn_syn.synthesize_twin_stents(i + 1))
        else:
            hn_bills.append(hn_syn.synthesize_prolonged_icu(i + 1))
    print(f"  -> Generated {len(hn_bills)} compliant hard negatives")

    # Combined master dataset
    all_bills = real_bills + synth_bills + cf_bills + hn_bills

    out_path = os.path.join(BASE_DIR, args.output)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        for b in all_bills:
            f.write(json.dumps(b.to_dict(), ensure_ascii=False) + "\n")

    print(f"[✓] Saved {len(all_bills)} total examples to {out_path}")


if __name__ == "__main__":
    main()
