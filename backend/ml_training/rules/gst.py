"""GST Healthcare Exemption and Taxation Rules."""

from typing import Dict, Any

# Clinical healthcare services are exempt from GST under Notification No. 12/2017-Central Tax (Rate)
EXEMPT_CATEGORIES = {"room_nursing", "procedure", "consultation", "diagnostic"}


def audit_gst_charge(
    category: str,
    base_amount: float,
    charged_gst_rate: float
) -> Dict[str, Any]:
    is_exempt = category in EXEMPT_CATEGORIES
    correct_gst_rate = 0.0 if is_exempt else (12.0 if category == "pharmacy" else 5.0)

    charged_tax = round(base_amount * (charged_gst_rate / 100.0), 2)
    correct_tax = round(base_amount * (correct_gst_rate / 100.0), 2)
    is_violation = charged_tax > correct_tax
    tax_overcharge = max(0.0, charged_tax - correct_tax)

    return {
        "rule": "GST_HEALTHCARE_EXEMPTION_NOTIFICATION_12_2017",
        "is_exempt_service": is_exempt,
        "charged_gst_rate": charged_gst_rate,
        "correct_gst_rate": correct_gst_rate,
        "charged_tax_amount": charged_tax,
        "allowed_tax_amount": correct_tax,
        "tax_overcharge": round(tax_overcharge, 2),
        "is_violation": is_violation
    }
