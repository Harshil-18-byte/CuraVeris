import json
import os
from decimal import Decimal
from typing import Dict, Any, Optional

STATUTORY_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "statutory_data")
IRDAI_FILE = os.path.join(STATUTORY_DIR, "irdai_non_payable.json")

_irdai_cache: Optional[Dict[str, Any]] = None


def load_irdai_keywords() -> Dict[str, Any]:
    global _irdai_cache
    if _irdai_cache is None:
        if os.path.exists(IRDAI_FILE):
            with open(IRDAI_FILE, "r", encoding="utf-8") as f:
                _irdai_cache = json.load(f)
        else:
            _irdai_cache = {"non_payable_keywords": []}
    return _irdai_cache


def audit_irdai_item(item_desc: str, charged_amount: Decimal) -> Optional[Dict[str, Any]]:
    """Checks for illegal unbundled overheads and standardized non-payable items."""
    data = load_irdai_keywords()
    keywords = data.get("non_payable_keywords", [])
    desc_clean = item_desc.lower()

    for kw in keywords:
        if kw in desc_clean:
            return {
                "finding_type": "IRDAI_NON_PAYABLE",
                "finding_source": "DETERMINISTIC",
                "severity": "HIGH" if charged_amount > Decimal("1000") else "MEDIUM",
                "item_description": item_desc,
                "billed_amount": charged_amount,
                "benchmark_amount": Decimal("0.0"),
                "overcharge_amount": charged_amount,
                "statutory_reference": "IRDAI Master Circular on Health Insurance 2024 (Standard Non-Payable Clause)",
                "legal_basis": f"Hospitals cannot bill unbundled administrative or overhead surcharges ('{kw}') as separate patient items.",
                "user_explanation": f"This fee ('{item_desc}') is considered an illegal unbundled charge under IRDAI guidelines and should be bundled into hospital room/nursing charges.",
                "is_disputable": True,
            }
    return None
