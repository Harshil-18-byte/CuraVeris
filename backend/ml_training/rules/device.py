"""Deterministic Medical Device & Implant NPPA Pricing Rules."""

from typing import Dict, Any, Optional

NPPA_DEVICE_CAPS = {
    "des_stent": 38260.00,
    "bms_stent": 10509.00,
    "primary_knee_cr": 63800.00,
    "primary_knee_ps": 71000.00,
    "revision_knee": 113959.00
}


def audit_device_charge(
    item_name: str,
    charged_rate: float,
    quantity: float,
    statutory_cap: Optional[float] = None
) -> Dict[str, Any]:
    # Match default cap if not provided
    cap = statutory_cap
    if cap is None:
        lower_name = item_name.lower()
        if "des" in lower_name or "drug" in lower_name:
            cap = NPPA_DEVICE_CAPS["des_stent"]
        elif "stent" in lower_name:
            cap = NPPA_DEVICE_CAPS["bms_stent"]
        elif "revision" in lower_name and "knee" in lower_name:
            cap = NPPA_DEVICE_CAPS["revision_knee"]
        elif "knee" in lower_name and "posterior" in lower_name:
            cap = NPPA_DEVICE_CAPS["primary_knee_ps"]
        elif "knee" in lower_name:
            cap = NPPA_DEVICE_CAPS["primary_knee_cr"]
        else:
            cap = charged_rate

    is_violation = charged_rate > cap
    overcharge = max(0.0, charged_rate - cap) * quantity if is_violation else 0.0

    return {
        "rule": "NPPA_GAZETTE_DEVICE_CAP",
        "charged_rate": charged_rate,
        "allowed_rate": cap,
        "quantity": quantity,
        "charged_total": round(charged_rate * quantity, 2),
        "allowed_total": round(cap * quantity, 2),
        "overcharge_amount": round(overcharge, 2),
        "is_violation": is_violation
    }
