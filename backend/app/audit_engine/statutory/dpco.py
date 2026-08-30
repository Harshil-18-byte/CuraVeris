import json
import os
import re
from decimal import Decimal
from typing import List, Dict, Any, Optional

STATUTORY_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "statutory_data")
DPCO_FILE = os.path.join(STATUTORY_DIR, "dpco_prices.json")

_dpco_cache: Optional[List[Dict[str, Any]]] = None


def load_dpco_prices() -> List[Dict[str, Any]]:
    global _dpco_cache
    if _dpco_cache is None:
        if os.path.exists(DPCO_FILE):
            with open(DPCO_FILE, "r", encoding="utf-8") as f:
                _dpco_cache = json.load(f)
        else:
            _dpco_cache = []
    return _dpco_cache


def audit_dpco_item(item_desc: str, total_price: Decimal, quantity: Decimal = Decimal("1.0"), category: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Checks pharmaceutical formulations against National List of Essential Medicines (NLEM) ceilings."""
    prices = load_dpco_prices()
    desc_clean = item_desc.lower()

    for item in prices:
        gen_name = item["generic_name"].lower()
        # Search generic name pattern
        if re.search(r"\b" + re.escape(gen_name) + r"\b", desc_clean):
            ceiling_unit = Decimal(str(item["ceiling_per_unit"]))
            max_allowed = ceiling_unit * quantity * Decimal("1.05")  # 5% packaging/margin tolerance
            
            if total_price > max_allowed:
                benchmark_total = ceiling_unit * quantity
                overcharge = total_price - benchmark_total

                return {
                    "finding_type": "DPCO_VIOLATION",
                    "finding_source": "DETERMINISTIC",
                    "severity": "HIGH" if overcharge > Decimal("500") else "MEDIUM",
                    "item_description": item_desc,
                    "billed_amount": total_price,
                    "benchmark_amount": benchmark_total,
                    "overcharge_amount": overcharge,
                    "statutory_reference": f"DPCO 2013 / NLEM Schedule I ({item['generic_name']} {item['strength']})",
                    "legal_basis": f"Drug price exceeds maximum notified retail ceiling of ₹{ceiling_unit} per {item['form']}.",
                    "user_explanation": f"Under Drugs Price Control Order, standard unit ceiling is ₹{ceiling_unit}. You were billed ₹{total_price} for {quantity} units.",
                    "is_disputable": True,
                }
    return None
