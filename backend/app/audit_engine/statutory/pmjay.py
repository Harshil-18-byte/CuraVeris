from decimal import Decimal
from typing import Dict, Any, Optional


def audit_pmjay_package_item(item_desc: str, charged_amount: Decimal, insurance_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Verifies that items are not unbundled when billed under Ayushman Bharat PM-JAY pre-fixed packages."""
    if not insurance_type or insurance_type.lower() != "pmjay":
        return None

    desc_clean = item_desc.lower()
    # If PM-JAY package is active, nursing, consumables, routine diagnostics cannot be billed separately
    unbundled_terms = ["ot charges", "nursing", "diet", "bed charges", "pre-op assessment", "post-op recovery"]

    for term in unbundled_terms:
        if term in desc_clean:
            return {
                "finding_type": "PMJAY_PACKAGE_VIOLATION",
                "finding_source": "DETERMINISTIC",
                "severity": "CRITICAL",
                "item_description": item_desc,
                "billed_amount": charged_amount,
                "benchmark_amount": Decimal("0.0"),
                "overcharge_amount": charged_amount,
                "statutory_reference": "NHA PM-JAY Standard Treatment Guidelines & Package Rates (HBP 2.2)",
                "legal_basis": "Empanelled hospitals cannot charge patients any out-of-pocket expenses for items included in pre-fixed PM-JAY surgical packages.",
                "user_explanation": f"Under Ayushman Bharat PM-JAY, this procedure fee is all-inclusive. You cannot be billed separate out-of-pocket charges.",
                "is_disputable": True,
            }
    return None
