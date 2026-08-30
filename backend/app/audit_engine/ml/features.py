import numpy as np
from decimal import Decimal
from typing import List, Dict, Any, Optional

FEATURE_NAMES = [
    "total_billed_log",
    "line_item_count",
    "drug_ratio",
    "procedure_ratio",
    "implant_present",
    "gst_ratio",
    "max_single_item",
    "statutory_violation_count",
    "deterministic_overcharge_log",
    "items_missing_category",
    "insurance_cghs",
    "insurance_pmjay",
    "shadow_bill_flag",
]


def extract_features(
    total_billed: Decimal,
    line_items: List[Dict[str, Any]],
    deterministic_findings: List[Dict[str, Any]],
    insurance_type: Optional[str] = None,
) -> np.ndarray:
    """Extracts a 13-dimensional numerical feature vector for the ML model."""
    tb = float(total_billed or 0.0)
    tb_safe = max(tb, 1.0)
    count = len(line_items)

    drug_sum = sum(float(it.get("total_price") or 0.0) for it in line_items if (it.get("category") or "").lower() == "drug")
    proc_sum = sum(float(it.get("total_price") or 0.0) for it in line_items if (it.get("category") or "").lower() in ["procedure", "surgical", "diagnostic"])
    gst_sum = sum((float(it.get("total_price") or 0.0) * float(it.get("gst_rate_applied") or 0.0) / 100.0) for it in line_items)
    max_single = max((float(it.get("total_price") or 0.0) for it in line_items), default=0.0)

    implant_present = 1.0 if any(f.get("finding_type") == "NPPA_VIOLATION" for f in deterministic_findings) else 0.0
    shadow_flag = 1.0 if any(f.get("finding_type") == "SHADOW_BILL" for f in deterministic_findings) else 0.0
    missing_cat = sum(1 for it in line_items if not it.get("category")) / max(count, 1)

    det_overcharge = sum(float(f.get("overcharge_amount") or 0.0) for f in deterministic_findings)
    ins = (insurance_type or "").lower()

    features = [
        np.log1p(tb),
        float(count),
        drug_sum / tb_safe,
        proc_sum / tb_safe,
        implant_present,
        gst_sum / tb_safe,
        max_single / tb_safe,
        float(len(deterministic_findings)),
        np.log1p(det_overcharge),
        float(missing_cat),
        1.0 if ins == "cghs" else 0.0,
        1.0 if ins == "pmjay" else 0.0,
        shadow_flag,
    ]

    return np.array(features, dtype=np.float32).reshape(1, -1)
