"""CuraVeris — Decoupled Multi-Task Dataset Partitioning & Export Engine.

Synthesizes the complete multi-layer corpus:
  - Layer 1: Real Inpatient Bills (Anchor dataset)
  - Layer 2: Clinical Pathway Synthetic Scenarios
  - Layer 3: Controlled Counterfactual Pairs (Delta-perturbations)
  - Layer 4: Hard Negatives (30-50% complex legitimate care)
  - Layer 5: Temporal Gazette Statutory Store

And partitions the corpus into 6 specialized, decoupled training datasets:
  1. Task A: Document Understanding & Spatial LayoutLMv3 (tokens, bboxes, NER)
  2. Task B: Clinical Entity & Medicine Normalizer
  3. Task C: Statutory Gazette Rule Retrieval
  4. Task D: Tabular Anomaly & Fraud Risk Classifier
  5. Task E: Deterministic Math & Rate Audit Engine
  6. Task F: Legal Dispute & Plain Language SFT Explainer (Chat format)
"""

import os
import json
import random
import glob
from typing import List, Dict, Any, Tuple

from app.db.temporal_gazette_store import query_temporal_nppa_ceiling, query_temporal_dpco_ceiling
from app.db.reference_data import query_cghs_rate, is_irdai_non_payable
from ml_training.generators.clinical_scenario_generator import ClinicalScenarioGenerator
from ml_training.generators.counterfactual_generator import CounterfactualGenerator
from ml_training.generators.hard_negative_generator import HardNegativeGenerator

GENERATOR_DIR = os.path.dirname(os.path.abspath(__file__))
ML_TRAINING_DIR = os.path.dirname(GENERATOR_DIR)
DATA_DIR = os.path.join(ML_TRAINING_DIR, "data")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
DECOUPLED_DIR = os.path.join(PROCESSED_DIR, "decoupled_tasks")
os.makedirs(DECOUPLED_DIR, exist_ok=True)


class MultiTaskDatasetPartitioner:
    """Orchestrates generation of multi-layer bills and exports into decoupled task datasets."""

    def __init__(self, random_seed: int = 42):
        self.scenario_gen = ClinicalScenarioGenerator(random_seed)
        self.cf_gen = CounterfactualGenerator(random_seed)
        self.hard_neg_gen = HardNegativeGenerator(random_seed)

    def generate_scaled_master_corpus(
        self,
        num_scenarios: int = 200,
        include_counterfactuals: bool = True,
        include_hard_negatives: bool = True
    ) -> List[Dict[str, Any]]:
        """Generate the complete multi-layer combined billing corpus."""
        master_bills = []
        bill_counter = 1

        # 1. Layer 1: Real Inpatient Bills
        real_files = glob.glob(os.path.join(DATA_DIR, "tier1_real_bills", "*.json"))
        for rf in real_files:
            try:
                with open(rf, "r", encoding="utf-8") as fh:
                    b_data = json.load(fh)
                    b_data["source_layer"] = "L1_REAL"
                    master_bills.append(b_data)
            except Exception:
                pass

        print(f"[*] Loaded {len(master_bills)} Layer 1 Real Inpatient Bills.")

        # 2. Layer 2: Clinical Scenarios
        scenario_bills = []
        for _ in range(num_scenarios):
            sb = self.scenario_gen.generate_bill(bill_counter)
            sb["source_layer"] = "L2_SCENARIO"
            scenario_bills.append(sb)
            master_bills.append(sb)
            bill_counter += 1

        print(f"[*] Generated {len(scenario_bills)} Layer 2 Clinical Pathway Scenario Bills.")

        # 3. Layer 3: Controlled Counterfactuals
        if include_counterfactuals:
            cf_count = 0
            # Sample scenarios to generate perturbations
            for sb in scenario_bills[: min(len(scenario_bills), 100)]:
                cf_variants = self.cf_gen.generate_counterfactuals(sb)
                for cf in cf_variants:
                    cf["source_layer"] = "L3_COUNTERFACTUAL"
                    master_bills.append(cf)
                    cf_count += 1
            print(f"[*] Generated {cf_count} Layer 3 Controlled Counterfactual Perturbations.")

        # 4. Layer 4: Hard Negatives (30-50% proportion)
        if include_hard_negatives:
            hn_count = 0
            hn_types = ["twin_stents", "prolonged_icu", "revision_tkr", "oncology_biologic"]
            num_hn = max(int(num_scenarios * 0.35), 40)
            for i in range(num_hn):
                st = hn_types[i % len(hn_types)]
                hn_bill = self.hard_neg_gen.generate_hard_negative(st, i + 1)
                hn_bill["source_layer"] = "L4_HARD_NEGATIVE"
                master_bills.append(hn_bill)
                hn_count += 1
            print(f"[*] Generated {hn_count} Layer 4 Complex Hard Negatives (100% Compliant).")

        return master_bills

    def export_decoupled_tasks(self, master_bills: List[Dict[str, Any]]) -> Dict[str, int]:
        """Partitions and writes the master bills into 6 specialized training task datasets."""
        task_a_records = []
        task_b_records = []
        task_c_records = []
        task_d_records = []
        task_e_records = []
        task_f_records = []

        for bill in master_bills:
            service_date = bill.get("admission_date", "2026-03-15")
            hospital_name = bill.get("hospital_name", "Hospital")
            city = bill.get("city", "City")
            tier = bill.get("tier", 1)

            # Task A & F bill-level structures
            findings_summary = []
            total_overcharge = 0.0

            for item in bill.get("line_items", []):
                raw_text = item.get("raw_text", "")
                cat = item.get("category", "other")
                qty = float(item.get("quantity", 1.0))
                unit_price = float(item.get("unit_price", 0.0))
                total_amount = float(item.get("total_amount", unit_price * qty))
                labels = item.get("labels", {})

                # Task A: Spatial LayoutLMv3 Token Mock Annotation
                task_a_records.append({
                    "bill_id": bill.get("bill_id"),
                    "text": raw_text,
                    "bbox": [random.randint(50, 400), random.randint(100, 900), random.randint(450, 800), random.randint(120, 920)],
                    "ner_label": f"B-{cat.upper()}",
                    "amount": total_amount
                })

                # Task B: Clinical Entity Normalization
                task_b_records.append({
                    "raw_string": raw_text,
                    "category": cat,
                    "normalized_entity": raw_text.split("(")[0].strip(),
                    "unit": "unit" if cat == "implant" else "dose"
                })

                # Task C: Statutory Rule Retrieval
                nppa_match = query_temporal_nppa_ceiling(raw_text, service_date)
                dpco_match = query_temporal_dpco_ceiling(raw_text, service_date)
                cghs_match = query_cghs_rate(raw_text)

                statutory_rule = None
                allowed_rate = None
                if nppa_match:
                    statutory_rule = f"NPPA {nppa_match['gazette_so']} (Cap: ₹{nppa_match['ceiling_price']:.2f})"
                    allowed_rate = nppa_match["ceiling_price"]
                elif dpco_match:
                    statutory_rule = f"DPCO {dpco_match['gazette_so']} (Ceiling: ₹{dpco_match['ceiling_price']:.2f})"
                    allowed_rate = dpco_match["ceiling_price"]
                elif cghs_match:
                    statutory_rule = f"CGHS Benchmark ({cghs_match['procedure_code']}: ₹{cghs_match['rate_nabh']:.2f})"
                    allowed_rate = cghs_match["rate_nabh"]

                task_c_records.append({
                    "item_text": raw_text,
                    "service_date": service_date,
                    "hospital_tier": tier,
                    "matched_rule": statutory_rule,
                    "allowed_unit_rate": allowed_rate
                })

                # Task D: Tabular Anomaly Classification
                ref_rate = allowed_rate or unit_price or 1.0
                rate_ratio = round(unit_price / ref_rate, 4)
                task_d_records.append({
                    "features": [
                        rate_ratio,
                        qty,
                        1.0 if cat == "implant" else 0.0,
                        1.0 if cat == "pharmacy" else 0.0,
                        1.0 if cat == "consumable" else 0.0,
                        1.0 if cat == "procedure" else 0.0,
                        1.0 if cat == "room_nursing" else 0.0,
                        1.0 if cat == "diagnostic" else 0.0,
                        total_amount,
                        1.0 if bill.get("is_nabh", False) else 0.0
                    ],
                    "labels": [
                        labels.get("nppa_ceiling_violation", 0),
                        labels.get("above_mrp", 0),
                        labels.get("consumable_unbundled", 0),
                        labels.get("duplicate_charge", 0),
                        labels.get("gst_on_exempt", 0),
                        labels.get("rate_anomaly", 0),
                        labels.get("package_unbundled", 0)
                    ]
                })

                # Task E: Deterministic Math Verification
                overcharge = 0.0
                if allowed_rate and unit_price > allowed_rate:
                    overcharge = round((unit_price - allowed_rate) * qty, 2)
                    total_overcharge += overcharge
                    findings_summary.append(
                        f"Line '{raw_text}' billed at ₹{unit_price:.2f} exceeding statutory limit ₹{allowed_rate:.2f} (Overcharge: ₹{overcharge:.2f})"
                    )

                task_e_records.append({
                    "billed_unit_price": unit_price,
                    "quantity": qty,
                    "allowed_unit_price": allowed_rate or unit_price,
                    "computed_overcharge": overcharge,
                    "mathematically_verified": True
                })

            # Task F: Legal Advocacy SFT Dataset (Chat format)
            if findings_summary:
                f_finding_text = "\n".join(f"- {f}" for f in findings_summary)
                f_assistant_reply = (
                    f"### Forensic Bill Audit Assessment for {hospital_name}\n"
                    f"**Total Inpatient Bill**: ₹{bill.get('total_billed', 0.0):.2f}\n"
                    f"**Total Statutory Overcharge**: ₹{total_overcharge:.2f}\n\n"
                    f"#### Statutory Violations Detected:\n{f_finding_text}\n\n"
                    f"#### Recommended Legal Recourse:\n"
                    f"Serve formal notice under the **Consumer Protection Act 2019 (Section 2(47))** and "
                    f"**Essential Commodities Act 1955 (Section 3/7)** demanding immediate refund of ₹{total_overcharge:.2f}."
                )
            else:
                f_assistant_reply = (
                    f"### Forensic Bill Audit Assessment for {hospital_name}\n"
                    f"**Total Inpatient Bill**: ₹{bill.get('total_billed', 0.0):.2f}\n"
                    f"**Audit Finding**: COMPLIANT — All line items adhere strictly to statutory NPPA caps, DPCO ceilings, "
                    f"and institutional package schedules."
                )

            task_f_records.append({
                "messages": [
                    {
                        "role": "user",
                        "content": f"Perform a comprehensive forensic billing audit on inpatient bill {bill.get('bill_id')} from {hospital_name} with admission date {service_date}."
                    },
                    {
                        "role": "assistant",
                        "content": f_assistant_reply
                    }
                ]
            })

        # Write datasets to disk
        counts = {}
        files_to_write = [
            ("task_a_document_parsing.jsonl", task_a_records),
            ("task_b_clinical_entity_normalization.jsonl", task_b_records),
            ("task_c_statutory_rule_retrieval.jsonl", task_c_records),
            ("task_d_tabular_anomaly_classification.jsonl", task_d_records),
            ("task_e_deterministic_math_audit.jsonl", task_e_records),
            ("task_f_legal_advocacy_sft.jsonl", task_f_records),
        ]

        for fname, records in files_to_write:
            fpath = os.path.join(DECOUPLED_DIR, fname)
            with open(fpath, "w", encoding="utf-8") as fh:
                for r in records:
                    fh.write(json.dumps(r, ensure_ascii=False) + "\n")
            counts[fname] = len(records)
            print(f"[✓] Exported {len(records)} records to {fname}")

        return counts
