import json
import os
from decimal import Decimal
from typing import List, Dict, Any, Optional

STATUTORY_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "statutory_data")
NPPA_FILE = os.path.join(STATUTORY_DIR, "nppa_caps.json")

_nppa_cache: Optional[List[Dict[str, Any]]] = None

IMPLANT_KEYWORDS = [
    "stent", "des stent", "bare metal stent", "knee implant", "hip implant",
    "femoral", "tibial", "articular insert", "patella", "bipolar hip",
    "pacemaker", "cardiac pacemaker", "cochlear", "lens", "iol", "intraocular lens",
    "bone cement", "balloon catheter", "guide wire", "locking plate"
]


def load_nppa_caps() -> List[Dict[str, Any]]:
    global _nppa_cache
    if _nppa_cache is None:
        if os.path.exists(NPPA_FILE):
            with open(NPPA_FILE, "r", encoding="utf-8") as f:
                _nppa_cache = json.load(f)
        else:
            _nppa_cache = []
    return _nppa_cache


def audit_nppa_item(item_desc: str, unit_price: Decimal, quantity: Decimal = Decimal("1.0")) -> Optional[Dict[str, Any]]:
    """Checks medical devices and implants against NPPA Gazette Price Orders."""
    caps = load_nppa_caps()
    desc_clean = item_desc.lower()

    if not any(kw in desc_clean for kw in IMPLANT_KEYWORDS):
        return None

    for cap in caps:
        cap_name = cap["item_name"].lower()
        if cap_name in desc_clean or any(word in desc_clean for word in cap_name.split() if len(word) > 3):
            ceiling = Decimal(str(cap["ceiling_price"]))
            if unit_price > ceiling:
                overcharge_per_unit = unit_price - ceiling
                total_overcharge = overcharge_per_unit * quantity
                total_billed = unit_price * quantity
                total_benchmark = ceiling * quantity

                return {
                    "finding_type": "NPPA_VIOLATION",
                    "finding_source": "DETERMINISTIC",
                    "severity": "HIGH",
                    "item_description": item_desc,
                    "billed_amount": total_billed,
                    "benchmark_amount": total_benchmark,
                    "overcharge_amount": total_overcharge,
                    "statutory_reference": f"{cap['order_ref']} ({cap['item_name']})",
                    "legal_basis": f"Overpricing notified medical device/implant violates Essential Commodities Act 1955 and DPCO 2013.",
                    "user_explanation": f"The National Pharmaceutical Pricing Authority (NPPA) statutory cap for this implant is ₹{ceiling}. The hospital charged ₹{unit_price}.",
                    "is_disputable": True,
                }
    return None
