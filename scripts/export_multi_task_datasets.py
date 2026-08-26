#!/usr/bin/env python3
"""Multi-Task Dataset Partitioner for CuraVeris Neural & Transformer Architecture.

Exports the master corpus into 4 permanent layers:
1. data/raw/         (Immutable source files, crawl manifests, raw court bills)
2. data/normalized/  (Canonical JSON bills, line items, normalized reference records)
3. data/training/    (Decoupled multi-tasks: extraction, normalization, classification,
                      retrieval, audit reasoning, counterfactuals, hard negatives)
4. data/evaluation/  (Locked gold benchmark, validation split, adversarial challenge suite)
"""

import os
import sys
import json
import hashlib
from collections import defaultdict
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))


def setup_directory_layers():
    """Create the 4 permanent data layer directories."""
    layers = [
        # Layer 1: Raw
        "data/raw/real_bills",
        "data/raw/government",
        "data/raw/reference",
        "data/raw/external",
        # Layer 2: Normalized
        "data/normalized/bills",
        "data/normalized/line_items",
        "data/normalized/reference_records",
        # Layer 3: Training (7 Decoupled Tasks)
        "data/training/extraction",        # Task A
        "data/training/normalization",     # Task B
        "data/training/classification",    # Task C
        "data/training/retrieval",         # Task D
        "data/training/audit",             # Task E & G
        "data/training/counterfactual",
        "data/training/hard_negative",
        # Layer 4: Evaluation
        "data/evaluation/gold",
        "data/evaluation/validation",
        "data/evaluation/challenge",
    ]
    for layer in layers:
        os.makedirs(os.path.join(BASE_DIR, layer), exist_ok=True)
    print("[✓] Initialized 4-Layer Permanent Data Hierarchy")


def export_multi_tasks():
    setup_directory_layers()
    
    all_examples_path = os.path.join(BASE_DIR, "data", "processed", "all_examples.jsonl")
    if not os.path.exists(all_examples_path):
        print(f"[!] {all_examples_path} not found. Running dataset generation...")
        os.system(f'python "{os.path.join(BASE_DIR, "scripts", "generate_dataset.py")}" --synthetic 500 --counterfactual 150 --hard-negative 150')

    print(f"[*] Reading master examples from {all_examples_path}...")
    bills = []
    with open(all_examples_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                bills.append(json.loads(line))

    print(f"  -> Processing {len(bills)} total bills into decoupled task corpora...")

    task_a_extraction = []
    task_b_normalization = []
    task_c_classification = []
    task_d_retrieval = []
    task_e_audit = []
    task_counterfactual = []
    task_hard_negative = []

    for b in bills:
        b_id = b.get("bill_id")
        src_type = b.get("source_type", "synthetic")
        diag = b.get("diagnosis", "")
        hosp = b.get("hospital_name", "")

        # Separate counterfactuals and hard negatives
        if src_type == "counterfactual":
            task_counterfactual.append(b)
        elif src_type == "hard_negative":
            task_hard_negative.append(b)

        # Task A: Document Extraction (Tokens + Layout -> Structured items)
        doc_tokens = []
        for idx, item in enumerate(b.get("line_items", [])):
            doc_tokens.append({
                "line_index": idx,
                "raw_text": item.get("raw_text"),
                "category": item.get("category"),
                "quantity": item.get("quantity"),
                "unit_price": item.get("unit_price"),
                "total_amount": item.get("total_amount")
            })
        task_a_extraction.append({
            "bill_id": b_id,
            "document_header": {
                "hospital": hosp,
                "admission_date": b.get("admission_date"),
                "discharge_date": b.get("discharge_date"),
                "diagnosis": diag,
                "icd10": b.get("icd10_code")
            },
            "line_items": doc_tokens,
            "total_billed": b.get("total_billed")
        })

        # Process individual line items for Tasks B, C, D, E
        for item in b.get("line_items", []):
            raw_text = item.get("raw_text", "")
            cat = item.get("category", "")
            qty = float(item.get("quantity", 1.0))
            price = float(item.get("unit_price", 0.0))
            total = float(item.get("total_amount", 0.0))
            labels = item.get("labels", {})

            # Task B: Semantic Normalization
            task_b_normalization.append({
                "raw_input": raw_text,
                "category": cat,
                "canonical_name": raw_text.split("(")[0].strip() if "(" in raw_text else raw_text,
                "extracted_quantity": qty,
                "extracted_price": price
            })

            # Task C: Multi-Label Risk Classification
            has_violation = any(v == 1 for v in labels.values())
            task_c_classification.append({
                "bill_id": b_id,
                "hospital_tier": b.get("tier", 1),
                "is_nabh": b.get("is_nabh", True),
                "line_text": raw_text,
                "category": cat,
                "unit_price": price,
                "quantity": qty,
                "total_amount": total,
                "labels": labels,
                "has_anomaly": 1 if has_violation else 0
            })

            # Task D: Evidence Retrieval (Bill item ↔ Statutory reference query)
            if "Stent" in raw_text:
                task_d_retrieval.append({
                    "query_text": raw_text,
                    "target_source": "NPPA",
                    "target_statute": "NPPA Gazette S.O. 1335(E)",
                    "ceiling_price": 38260.0 if "DES" in raw_text or "Drug" in raw_text else 10509.0,
                    "relevance_label": 1
                })
            elif "Knee" in raw_text or "TKR" in raw_text:
                task_d_retrieval.append({
                    "query_text": raw_text,
                    "target_source": "NPPA",
                    "target_statute": "NPPA Gazette S.O. 2668(E)",
                    "ceiling_price": 71000.0 if "Posterior" in raw_text else 63800.0,
                    "relevance_label": 1
                })
            elif "Meropenem" in raw_text or "Pantoprazole" in raw_text or "Atorvastatin" in raw_text:
                task_d_retrieval.append({
                    "query_text": raw_text,
                    "target_source": "DPCO",
                    "target_statute": "DPCO NLEM 2023 S.O. 1480(E)",
                    "ceiling_price": 950.0 if "Meropenem" in raw_text else 54.20,
                    "relevance_label": 1
                })

            # Task E & G: Final Audit Rationale (SFT Prompt/Response pairs)
            if has_violation:
                violation_types = [k for k, v in labels.items() if v == 1]
                task_e_audit.append({
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a senior healthcare forensic auditor specializing in Indian statutory billing compliance."
                        },
                        {
                            "role": "user",
                            "content": f"Audit line item '{raw_text}' billed at ₹{price:,.2f} (Quantity: {qty}) in {hosp}."
                        },
                        {
                            "role": "assistant",
                            "content": f"### Forensic Finding: {', '.join(violation_types).upper()}\n"
                                       f"- **Charged Rate**: ₹{price:,.2f} per unit (Total: ₹{total:,.2f})\n"
                                       f"- **Violation Analysis**: The charge violates statutory guidelines ({violation_types[0]}).\n"
                                       f"- **Recommended Restitution**: File dispute notice under Consumer Protection Act 2019 Section 35."
                        }
                    ]
                })

    # Save to Layer 3 (Training)
    task_files = [
        ("data/training/extraction/task_a_document_extraction.jsonl", task_a_extraction),
        ("data/training/normalization/task_b_entity_normalization.jsonl", task_b_normalization),
        ("data/training/classification/task_c_risk_classification.jsonl", task_c_classification),
        ("data/training/retrieval/task_d_evidence_retrieval.jsonl", task_d_retrieval),
        ("data/training/audit/task_e_audit_sft_instructions.jsonl", task_e_audit),
        ("data/training/counterfactual/counterfactual_bills.jsonl", task_counterfactual),
        ("data/training/hard_negative/hard_negative_bills.jsonl", task_hard_negative),
    ]

    for rel_path, data_list in task_files:
        full_path = os.path.join(BASE_DIR, rel_path)
        with open(full_path, "w", encoding="utf-8") as f:
            for item in data_list:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")
        print(f"[✓] Exported {len(data_list):5d} records -> {rel_path}")

    # Build Layer 4 (Evaluation - Gold & Challenge)
    build_evaluation_suites(bills)


def build_evaluation_suites(bills: List[Dict[str, Any]]):
    """Builds locked gold benchmark (500 bills) and permanent adversarial challenge suite."""
    # 1. Gold Locked Benchmark (First 500 validated bills)
    gold_bills = bills[:500]
    gold_path = os.path.join(BASE_DIR, "data", "evaluation", "gold", "gold_benchmark_500.jsonl")
    with open(gold_path, "w", encoding="utf-8") as f:
        for b in gold_bills:
            f.write(json.dumps(b, ensure_ascii=False) + "\n")
    print(f"[✓] Exported {len(gold_bills)} locked benchmark bills -> data/evaluation/gold/gold_benchmark_500.jsonl")

    # 2. Adversarial Challenge Suite (Numeric, Dosage, OCR noise, Temporal mismatch)
    challenge_cases = [
        {
            "challenge_id": "ADV_NUM_001",
            "type": "subtle_penny_overcharge",
            "input_text": "Drug Eluting Coronary Stent (DES) Everolimus",
            "billed_rate": 38260.01,
            "statutory_cap": 38260.00,
            "expected_verdict": "CLEAR_VIOLATION",
            "expected_overcharge": 0.01,
            "rationale": "Even 1 paisa above the NPPA statutory gazette ceiling is an actionable violation."
        },
        {
            "challenge_id": "ADV_DOSAGE_002",
            "type": "dosage_strength_confusion",
            "input_text": "Inj. Pantoprazole 400mg IV (Typo for 40mg)",
            "billed_rate": 540.0,
            "statutory_cap": 54.20,
            "expected_verdict": "REVIEW_REQUIRED",
            "expected_overcharge": None,
            "rationale": "Unrealistic 400mg dosage must be routed to clinical review, not blindly calculated."
        },
        {
            "challenge_id": "ADV_OCR_003",
            "type": "ocr_character_substitution",
            "input_text": "Inj Meropenem 1g IV Infusion - Rate: Rs. 18S0.00",
            "billed_rate": 1850.0,
            "statutory_cap": 950.0,
            "expected_verdict": "CLEAR_VIOLATION",
            "expected_overcharge": 900.0,
            "rationale": "OCR corrupted 18S0 must resolve to numeric 1850 and detect the 900 overcharge."
        },
        {
            "challenge_id": "ADV_TEMPORAL_004",
            "type": "historical_vs_current_statute_mismatch",
            "input_text": "Coronary Stent DES Billed on 2016-12-01 (Pre-NPPA Gazette Notification)",
            "billed_rate": 125000.0,
            "admission_date": "2016-12-01",
            "statutory_cap": None,
            "expected_verdict": "LEGITIMATE_HISTORICAL",
            "expected_overcharge": 0.0,
            "rationale": "NPPA stent ceiling was gazetted on 2017-02-13; a 2016 bill cannot be retroactively penalized."
        }
    ]

    challenge_path = os.path.join(BASE_DIR, "data", "evaluation", "challenge", "adversarial_challenge_suite.json")
    with open(challenge_path, "w", encoding="utf-8") as f:
        json.dump(challenge_cases, f, indent=2)
    print(f"[✓] Exported {len(challenge_cases)} adversarial test cases -> data/evaluation/challenge/adversarial_challenge_suite.json")


if __name__ == "__main__":
    export_multi_tasks()
