import numpy as np
from typing import List, Dict, Any, Optional
from app.audit_engine.ml.features import FEATURE_NAMES

HUMAN_FEATURE_LABELS = {
    "total_billed_log": "High Gross Bill Magnitude",
    "line_item_count": "Total Volume of Billed Charges",
    "drug_ratio": "Disproportionate Pharmacy & Medication Ratio",
    "procedure_ratio": "Procedural Fee Concentration",
    "implant_present": "Implant/Device Statutory Price Cap Exposure",
    "gst_ratio": "Ineligible GST Taxation Levy",
    "max_single_item": "Single Outlier Line Item Dominance",
    "statutory_violation_count": "Confirmed Statutory Gazette Breaches",
    "deterministic_overcharge_log": "Confirmed Monetary Overcharge Sum",
    "items_missing_category": "Vague or Uncategorized Item Entries",
    "insurance_cghs": "Central Government Health Scheme Beneficiary",
    "insurance_pmjay": "Ayushman Bharat PM-JAY Empanelled Patient",
    "shadow_bill_flag": "Duplicate Charges / Shadow Billing Indicators",
}

PLAIN_EXPLANATIONS = {
    "total_billed_log": "Higher total amounts historically correlate with unbundled diagnostic fees.",
    "line_item_count": "Excessive individual line item charges suggest billing fragmentation.",
    "drug_ratio": "Medication charges exceed typical therapeutic benchmarks for this hospital stay.",
    "procedure_ratio": "Procedures make up the majority of financial exposure on this invoice.",
    "implant_present": "Cardiology or orthopaedic hardware triggers mandatory NPPA ceiling checks.",
    "gst_ratio": "Taxation applied to otherwise exempt inpatient medical care.",
    "max_single_item": "One dominant high-value item represents an outsized share of total billed cost.",
    "statutory_violation_count": "Direct breaches of published government price ceilings were confirmed.",
    "deterministic_overcharge_log": "Quantified excess fees billed above legal statutory benchmarks.",
    "items_missing_category": "Opaque billing descriptions impede standard insurance reconciliation.",
    "insurance_cghs": "Subject to strict CGHS reimbursement tariffs.",
    "insurance_pmjay": "Subject to zero out-of-pocket pre-fixed surgical package rates.",
    "shadow_bill_flag": "Identical charges billed more than once on the same invoice.",
}


def explain_prediction(
    features: np.ndarray,
    xgb_model: Optional[Any] = None,
) -> List[Dict[str, Any]]:
    """
    Computes TreeExplainer SHAP values or heuristic feature attribution with plain English explanations.
    """
    explanations: List[Dict[str, Any]] = []

    if xgb_model is not None:
        try:
            import importlib
            shap = importlib.import_module("shap")
            explainer = shap.TreeExplainer(xgb_model)
            shap_values = explainer.shap_values(features)[0]
            
            # Map top 10 features by absolute contribution
            sorted_indices = np.argsort(np.abs(shap_values))[::-1][:10]
            for idx in sorted_indices:
                feat_name = FEATURE_NAMES[idx]
                val = float(shap_values[idx])
                explanations.append({
                    "feature_label": HUMAN_FEATURE_LABELS.get(feat_name, feat_name),
                    "shap_value": round(val, 4),
                    "direction": "INCREASES_RISK" if val > 0 else "DECREASES_RISK",
                    "explanation": PLAIN_EXPLANATIONS.get(feat_name, "Contributes to overall risk determination."),
                })
            return explanations
        except Exception:
            pass

    # Heuristic fallback explanation
    feat_vec = features.flatten()
    for idx, name in enumerate(FEATURE_NAMES):
        raw_val = float(feat_vec[idx])
        if raw_val > 0:
            weight = 0.15 if name in ["statutory_violation_count", "implant_present", "shadow_bill_flag"] else 0.05
            explanations.append({
                "feature_label": HUMAN_FEATURE_LABELS.get(name, name),
                "shap_value": round(weight, 4),
                "direction": "INCREASES_RISK",
                "explanation": PLAIN_EXPLANATIONS.get(name, "Contributes to risk score."),
            })

    explanations.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
    return explanations[:10]
