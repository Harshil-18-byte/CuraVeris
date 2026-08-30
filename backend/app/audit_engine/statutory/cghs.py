import json
import os
import difflib
from decimal import Decimal
from typing import List, Dict, Any, Optional

STATUTORY_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "statutory_data")
CGHS_FILE = os.path.join(STATUTORY_DIR, "cghs_rates.json")

_cghs_cache: Optional[List[Dict[str, Any]]] = None


def load_cghs_rates() -> List[Dict[str, Any]]:
    global _cghs_cache
    if _cghs_cache is None:
        if os.path.exists(CGHS_FILE):
            with open(CGHS_FILE, "r", encoding="utf-8") as f:
                _cghs_cache = json.load(f)
        else:
            _cghs_cache = []
    return _cghs_cache


def audit_cghs_item(item_desc: str, charged_amount: Decimal, category: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Checks an item against official CGHS rate ceilings using fuzzy matching."""
    rates = load_cghs_rates()
    desc_clean = item_desc.lower().strip()
    
    best_match = None
    best_ratio = 0.0

    for r in rates:
        target_name = r["procedure_name"].lower()
        # Direct substring check or SequenceMatcher
        if target_name in desc_clean or desc_clean in target_name:
            ratio = 0.85
        else:
            ratio = difflib.SequenceMatcher(None, desc_clean, target_name).ratio()

        if ratio > best_ratio:
            best_ratio = ratio
            best_match = r

    if best_match and best_ratio >= 0.75:
        cghs_rate = Decimal(str(best_match["cghs_rate"]))
        allowed_max = cghs_rate * Decimal("1.10")  # 10% statutory tolerance
        
        if charged_amount > allowed_max:
            overcharge = charged_amount - cghs_rate
            pct_over = (overcharge / cghs_rate) * Decimal("100")
            
            if pct_over > 50:
                severity = "HIGH"
            elif pct_over > 20:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            return {
                "finding_type": "CGHS_OVERCHARGE",
                "finding_source": "DETERMINISTIC",
                "severity": severity,
                "item_description": item_desc,
                "billed_amount": charged_amount,
                "benchmark_amount": cghs_rate,
                "overcharge_amount": overcharge,
                "statutory_reference": f"CGHS Tariff Rate Master ({best_match['procedure_name']})",
                "legal_basis": f"Rate exceeds CGHS notified ceiling of ₹{cghs_rate} for empanelled procedures.",
                "user_explanation": f"Under government CGHS schedule, standard fee is capped at ₹{cghs_rate}. You were billed ₹{charged_amount}.",
                "is_disputable": True,
            }
    return None
