"""Deterministic Medicine & DPCO Statutory Pricing Rules."""

from typing import Dict, Any, Optional


def audit_medicine_charge(
    item_name: str,
    charged_rate: float,
    quantity: float,
    dpco_ceiling: Optional[float] = None,
    mrp: Optional[float] = None
) -> Dict[str, Any]:
    allowed_rate = dpco_ceiling or mrp or charged_rate
    is_violation = charged_rate > allowed_rate
    overcharge_per_unit = max(0.0, charged_rate - allowed_rate) if is_violation else 0.0
    total_overcharge = round(overcharge_per_unit * quantity, 2)

    return {
        "rule": "DPCO_NLEM_2023_CEILING" if dpco_ceiling else "PHARMACEUTICAL_MRP_LIMIT",
        "charged_rate": charged_rate,
        "allowed_rate": allowed_rate,
        "quantity": quantity,
        "charged_total": round(charged_rate * quantity, 2),
        "allowed_total": round(allowed_rate * quantity, 2),
        "overcharge_amount": total_overcharge,
        "is_violation": is_violation
    }
