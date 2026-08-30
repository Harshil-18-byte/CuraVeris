import json
import os
from decimal import Decimal
from typing import Dict, Any, Optional

STATUTORY_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "statutory_data")
GST_FILE = os.path.join(STATUTORY_DIR, "gst_exemptions.json")

_gst_cache: Optional[Dict[str, Any]] = None


def load_gst_rules() -> Dict[str, Any]:
    global _gst_cache
    if _gst_cache is None:
        if os.path.exists(GST_FILE):
            with open(GST_FILE, "r", encoding="utf-8") as f:
                _gst_cache = json.load(f)
        else:
            _gst_cache = {"exempt_service_categories": []}
    return _gst_cache


def audit_gst_item(item_desc: str, total_price: Decimal, gst_rate_applied: Decimal, category: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Checks for illegal GST applied to exempt clinical healthcare services."""
    if gst_rate_applied <= Decimal("0.0"):
        return None

    rules = load_gst_rules()
    exempt_cats = rules.get("exempt_service_categories", [])
    desc_clean = item_desc.lower()
    cat_clean = (category or "").lower()

    is_exempt = any(ex in desc_clean or ex in cat_clean for ex in exempt_cats)

    if is_exempt:
        # Inpatient room rent <= 5000 is fully exempt
        gst_charged_amount = (total_price * gst_rate_applied) / (Decimal("100") + gst_rate_applied)
        benchmark_amount = total_price - gst_charged_amount

        return {
            "finding_type": "GST_MISAPPLICATION",
            "finding_source": "DETERMINISTIC",
            "severity": "HIGH",
            "item_description": item_desc,
            "billed_amount": total_price,
            "benchmark_amount": benchmark_amount,
            "overcharge_amount": gst_charged_amount,
            "statutory_reference": "CBIC Notification No. 12/2017-Central Tax (Rate) - Healthcare Exemption",
            "legal_basis": "Health care services provided by clinical establishments or authorized medical practitioners are 100% exempt from GST.",
            "user_explanation": f"GST @ {gst_rate_applied}% (₹{gst_charged_amount}) was illegally levied on an exempt medical service.",
            "is_disputable": True,
        }
    return None
