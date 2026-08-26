"""Reference Lookup Module for Statutory Rates & Benchmark Data.
Provides structured benchmark data and lookups for:
1. CGHS procedure rates (NABH & Non-NABH)
2. NPPA medical device ceiling prices (stents, orthopedic implants, catheters)
3. DPCO drug ceiling prices (NLEM schedule medicines)
4. IRDAI non-payable items
"""

import re
from typing import Dict, Any, List, Optional
from app.db.reference_data import CGHS_SEEDS, NPPA_SEEDS, DPCO_SEEDS, IRDAI_NON_PAYABLES


def get_all_cghs_procedures() -> List[Dict[str, Any]]:
    """Retrieve structured list of all CGHS benchmark procedures."""
    items = []
    for row in CGHS_SEEDS:
        items.append({
            "procedure_code": row[0],
            "name": row[1],
            "rate_non_nabh": float(row[2]),
            "rate_nabh": float(row[3]),
            "category": row[4],
        })
    return items


def get_all_nppa_devices() -> List[Dict[str, Any]]:
    """Retrieve structured list of all NPPA capped medical devices and implants."""
    items = []
    for row in NPPA_SEEDS:
        items.append({
            "device_name": row[0],
            "category": row[1],
            "ceiling_price": float(row[2]),
            "order": row[3],
        })
    return items


def get_all_dpco_drugs() -> List[Dict[str, Any]]:
    """Retrieve structured list of all DPCO essential scheduled medicines."""
    items = []
    for row in DPCO_SEEDS:
        items.append({
            "drug_name": row[0],
            "formulation": row[1],
            "mrp": float(row[2]),
            "scheduled": bool(row[3]),
        })
    return items


def get_all_irdai_non_payables() -> List[str]:
    """Retrieve standardized list of IRDAI non-payable consumables."""
    return list(IRDAI_NON_PAYABLES)


def check_is_irdai_non_payable(item_name: str) -> bool:
    """Check if item name matches any IRDAI standardized non-payable consumable."""
    cleaned = re.sub(r"[^\w\s]", " ", item_name.lower()).strip()
    for np_item in IRDAI_NON_PAYABLES:
        np_clean = re.sub(r"[^\w\s]", " ", np_item.lower()).strip()
        if any(term in cleaned for term in np_clean.split() if len(term) > 3):
            return True
    return False
