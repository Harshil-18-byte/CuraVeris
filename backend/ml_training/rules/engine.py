"""Master Deterministic Symbolic Calculation Engine for Medical Billing Audits."""

from typing import List, Dict, Any
from .medicine import audit_medicine_charge
from .device import audit_device_charge
from .gst import audit_gst_charge
from .room import audit_room_charge


class DeterministicRuleEngine:
    """Zero-hallucination code-based calculation and statutory audit engine."""

    @staticmethod
    def audit_line_item(
        item_text: str,
        category: str,
        unit_price: float,
        quantity: float,
        gst_rate: float = 0.0,
        statutory_cap: float | None = None,
        is_nabh: bool = True,
        tier: int = 1
    ) -> Dict[str, Any]:
        """Routes item to appropriate deterministic auditor and calculates exact overcharge."""
        cat_lower = category.lower()

        if "implant" in cat_lower or "device" in cat_lower or "stent" in item_text.lower() or "knee" in item_text.lower():
            audit_res = audit_device_charge(item_text, unit_price, quantity, statutory_cap)
        elif "pharmacy" in cat_lower or "medicine" in cat_lower or "drug" in cat_lower:
            audit_res = audit_medicine_charge(item_text, unit_price, quantity, dpco_ceiling=statutory_cap)
        elif "room" in cat_lower or "nursing" in cat_lower or "bed" in item_text.lower():
            audit_res = audit_room_charge(item_text, quantity, unit_price, is_nabh, tier)
        else:
            # Default procedure / diagnostic check
            charged_total = round(unit_price * quantity, 2)
            allowed_total = round((statutory_cap or unit_price) * quantity, 2)
            overcharge = max(0.0, charged_total - allowed_total)
            audit_res = {
                "rule": "STANDARD_PROCEDURE_TARIFF",
                "charged_rate": unit_price,
                "allowed_rate": statutory_cap or unit_price,
                "quantity": quantity,
                "charged_total": charged_total,
                "allowed_total": allowed_total,
                "overcharge_amount": round(overcharge, 2),
                "is_violation": overcharge > 0.0
            }

        # Check GST
        gst_res = audit_gst_charge(category, audit_res["charged_total"], gst_rate)
        total_overcharge = round(audit_res["overcharge_amount"] + gst_res["tax_overcharge"], 2)

        return {
            "item_text": item_text,
            "category": category,
            "pricing_audit": audit_res,
            "gst_audit": gst_res,
            "total_line_overcharge": total_overcharge,
            "has_violation": total_overcharge > 0.0
        }
