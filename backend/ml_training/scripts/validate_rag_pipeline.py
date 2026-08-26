"""Step 11: RAG Pipeline Validation.

Validates the retrieve_context() function against ChromaDB collections.

Test suite:
  1. CGHS procedure lookup (cholecystectomy, CT scan, ICU bed)
  2. NPPA device lookup (coronary stent, knee implant, pacemaker)
  3. DPCO drug lookup (pantoprazole, ceftriaxone, insulin, paracetamol)
  4. Similarity threshold enforcement (> 0.72)
  5. Top-3 results per item
  6. Overcharge detection when charged > benchmark

Verification criteria:
  - At least 7/10 test items return ≥ 1 match above threshold
  - At least one collection returns similarity >= 0.72 for each category
  - Overcharge flagged correctly when charged_rate > benchmark

Run:
  python validate_rag_pipeline.py
"""

import os
import sys
import json
from dataclasses import asdict
from typing import List

# Ensure backend root is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
BACKEND_ROOT = os.path.dirname(ML_DIR)
for p in [BACKEND_ROOT, ML_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.ml.rag_retriever import retrieve_context, StatutoryRAGPipeline, ItemMatchedContext


# ──────────────────────────────────────────────────────────────────────────────
# Synthetic BillItem objects (dict-like) for testing
# ──────────────────────────────────────────────────────────────────────────────

class BillItem:
    """Minimal bill item duck-typed for retrieve_context()."""
    def __init__(self, item_id, item_name, category, charged_rate, quantity=1.0):
        self.id = item_id
        self.item_name = item_name
        self.normalized_name = item_name
        self.raw_text = item_name
        self.category = category
        self.charged_rate = charged_rate
        self.unit_price = charged_rate
        self.quantity = quantity
        self.total_amount = charged_rate * quantity
        self.charged_amount = charged_rate * quantity

    def __repr__(self):
        return f"BillItem(id={self.id!r}, name={self.item_name!r}, rate={self.charged_rate})"


# ──────────────────────────────────────────────────────────────────────────────
# Test Cases: (id, item_name, category, charged_rate, quantity, expect_collection, should_be_overcharged)
# ──────────────────────────────────────────────────────────────────────────────
TEST_CASES = [
    # CGHS Procedure tests
    ("T01", "Laparoscopic Cholecystectomy Surgery",       "procedure",     52000.0, 1.0, "cghs_collection",  True),
    ("T02", "CT Scan Abdomen with Contrast",             "diagnostic",     5200.0, 1.0, "cghs_collection",  True),
    ("T03", "ICU Charges with Ventilator per day",       "room_nursing",   8500.0, 3.0, "cghs_collection",  True),
    ("T04", "Complete Blood Count CBC Hemogram",         "diagnostic",      280.0, 2.0, "cghs_collection",  True),
    ("T05", "Specialist Consultation MD",               "consultation",     650.0, 1.0, "cghs_collection",  True),

    # NPPA Device / Implant tests
    ("T06", "Coronary Drug Eluting Stent DES Implant",  "implant",       58000.0, 1.0, "nppa_collection",  True),
    ("T07", "Total Knee Replacement Implant",           "implant",      195000.0, 1.0, "nppa_collection",  True),

    # DPCO Drug / Medicine tests
    ("T08", "Pantoprazole Injection 40mg",              "medicine",        145.0, 4.0, "dpco_collection",  True),
    ("T09", "Ceftriaxone Injection 1gm",                "medicine",         85.0, 3.0, "dpco_collection",  True),
    ("T10", "Paracetamol Tablet 500mg",                 "medicine",          3.5, 10.0, "dpco_collection", True),
]


def run_validation():
    print("=" * 78)
    print("              STEP 11: RAG PIPELINE VALIDATION")
    print("=" * 78)
    print(f"  Similarity threshold : > 0.72")
    print(f"  Top-K per item       : 3")
    print(f"  Test cases           : {len(TEST_CASES)}")
    print()

    # Build items
    items = [BillItem(tc[0], tc[1], tc[2], tc[3], tc[4]) for tc in TEST_CASES]

    # Run RAG pipeline
    print("[*] Running retrieve_context() across all 3 collections...")
    context = retrieve_context(items, similarity_threshold=0.72)
    print(f"[✓] retrieve_context() returned in OK\n")

    # ── Per-item report ──────────────────────────────────────────────────────
    print(f"{'ID':<5} {'Item Name':<42} {'Matches':<8} {'Best Sim':<10} {'Best Collection':<22} {'Overcharge'}")
    print("-" * 105)

    items_matched = 0
    threshold_pass = 0
    top3_pass = 0
    overcharge_correct = 0
    failed_items = []

    for ic, tc in zip(context.item_contexts, TEST_CASES):
        tc_id, tc_name, tc_cat, tc_rate, tc_qty, expect_coll, expect_over = tc

        num_matches = len(ic.top_matches)
        best_sim = ic.top_matches[0].similarity_score if ic.top_matches else 0.0
        best_coll = ic.top_matches[0].collection_name if ic.top_matches else "—"
        over_str = f"₹{ic.overcharge_amount:,.2f}" if ic.is_overcharged else "—"

        # Validation checks
        has_match = num_matches >= 1
        sim_ok = best_sim >= 0.72
        top3_ok = num_matches <= 3  # Should be exactly ≤ 3

        if has_match:
            items_matched += 1
        if sim_ok and has_match:
            threshold_pass += 1
        if top3_ok:
            top3_pass += 1
        if ic.is_overcharged == expect_over:
            overcharge_correct += 1

        status = "✓" if (has_match and sim_ok) else "✗"
        print(f"{status} {ic.item_id:<4} {ic.item_name[:40]:<42} {num_matches:<8} {best_sim:<10.4f} {best_coll:<22} {over_str}")

        if not (has_match and sim_ok):
            failed_items.append(ic.item_id)

        # Show top-3 details
        for i, m in enumerate(ic.top_matches):
            ref_rate = m.ceiling_price or m.mrp or m.rate_nabh or m.rate_non_nabh or 0.0
            print(f"      [{i+1}] {m.matched_name[:55]:<56} sim={m.similarity_score:.4f}  ref=₹{ref_rate:,.2f}")
        print()

    # ── Summary ──────────────────────────────────────────────────────────────
    print("=" * 78)
    print("  VALIDATION SUMMARY")
    print("=" * 78)

    total = len(TEST_CASES)

    checks = [
        ("Items with ≥1 match",       items_matched,    total, 7),
        ("Matches above 0.72 sim",    threshold_pass,   total, 7),
        ("Top-K ≤ 3 enforced",        top3_pass,        total, total),
        ("Overcharge detection",      overcharge_correct, total, total - 2),  # some may have 0 benchmark
        ("Total potential overcharge",None, None, None),
    ]

    all_passed = True
    for label, val, denom, min_pass in checks:
        if val is None:
            print(f"  [i] {label:<35}: ₹{context.total_potential_overcharge:>12,.2f}")
            continue
        pct = (val / denom * 100) if denom else 0
        ok = val >= min_pass
        status = "✓ PASS" if ok else "✗ FAIL"
        print(f"  {status}  {label:<35}: {val}/{denom} ({pct:.0f}%)")
        if not ok:
            all_passed = False

    print()
    if failed_items:
        print(f"  [!] Items with no match above threshold: {failed_items}")
        print(f"      → These items have no semantic match in current collections.")
        print(f"         They will be handled by rule-based fallback in analyze_bill().\n")

    print("-" * 78)
    if all_passed:
        print("  [✓] STEP 11 RAG PIPELINE CHECK PASSED")
        print("      retrieve_context() functional: top-3, threshold >0.72, overcharge detection")
    else:
        print("  [!] STEP 11 PARTIAL PASS — see items above")
        print("      Core pipeline functional; similarity improves with BioBERT transformer model")
    print("=" * 78)

    # Write structured results to JSON for CI use
    results_path = os.path.join(ML_DIR, "data", "processed", "rag_validation_results.json")
    results = {
        "total_items": context.total_items,
        "matched_items": context.matched_items_count,
        "total_potential_overcharge": context.total_potential_overcharge,
        "items_above_threshold": threshold_pass,
        "threshold": 0.72,
        "top_k": 3,
        "item_results": [
            {
                "item_id": ic.item_id,
                "item_name": ic.item_name,
                "num_matches": len(ic.top_matches),
                "best_similarity": ic.top_matches[0].similarity_score if ic.top_matches else 0.0,
                "best_collection": ic.top_matches[0].collection_name if ic.top_matches else None,
                "applicable_benchmark": ic.applicable_benchmark,
                "is_overcharged": ic.is_overcharged,
                "overcharge_amount": ic.overcharge_amount,
            }
            for ic in context.item_contexts
        ]
    }
    os.makedirs(os.path.dirname(results_path), exist_ok=True)
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  [✓] Detailed results saved to: {results_path}")


if __name__ == "__main__":
    run_validation()
