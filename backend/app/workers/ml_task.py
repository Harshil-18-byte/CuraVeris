import os
import asyncio
import json
import logging
import math
import numpy as np
from decimal import Decimal
from pathlib import Path
from uuid import UUID
from sqlalchemy import select
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal as SessionLocal
from app.core.redis import publish
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding

logger = logging.getLogger(__name__)


def get_risk_score(
    feature_vector: dict,
    statutory_violation_count: int,
    total_overcharge: float,
    total_billed: float,
    shadow_bill_detected: bool,
) -> tuple[float, float, float, str, list, str]:
    """
    Returns (risk_score, lower, upper, label, shap_values, model_version)
    Always returns a result — never raises an exception.
    Uses ML models if available, rule-based scoring if not.
    """

    # Try ML models first
    ml_result = _try_ml_inference(feature_vector)
    if ml_result:
        return ml_result

    # Fall back to rule-based scoring
    return _rule_based_scoring(
        statutory_violation_count,
        total_overcharge,
        total_billed,
        shadow_bill_detected,
        feature_vector,
    )


def _try_ml_inference(feature_vector: dict):
    """Returns None if ML is unavailable or fails."""
    model_path = Path(os.getenv("ML_MODEL_PATH", "./ml_models"))

    try:
        import xgboost as xgb
        xgb_path = model_path / "xgboost_model.json"
        if not xgb_path.exists():
            return None

        model = xgb.XGBClassifier()
        model.load_model(str(xgb_path))

        feature_array = np.array([[
            feature_vector.get("total_billed_log", 0),
            feature_vector.get("line_item_count", 0),
            feature_vector.get("drug_ratio", 0),
            feature_vector.get("procedure_ratio", 0),
            feature_vector.get("gst_ratio", 0),
            feature_vector.get("max_single_item", 0),
            feature_vector.get("statutory_violation_count", 0),
            feature_vector.get("deterministic_overcharge_log", 0),
            feature_vector.get("shadow_bill_flag", 0),
            feature_vector.get("implant_present", 0),
            feature_vector.get("insurance_cghs", 0),
            feature_vector.get("insurance_pmjay", 0),
        ]])

        prob = float(model.predict_proba(feature_array)[0][1])

        # Monte Carlo uncertainty
        noise = np.random.normal(0, 0.05, (500, feature_array.shape[1]))
        samples = np.clip(feature_array + noise, 0, None)
        preds = model.predict_proba(samples)[:, 1]
        lower = float(np.percentile(preds, 5))
        upper = float(np.percentile(preds, 95))

        label = _score_to_label(prob)

        shap_values = _compute_shap(model, feature_array, feature_vector)

        return prob, lower, upper, label, shap_values, "xgboost_v1"

    except Exception as e:
        logger.warning(f"ML inference failed: {e}. Using rule-based fallback.")
        return None


def _rule_based_scoring(
    violation_count: int,
    total_overcharge: float,
    total_billed: float,
    shadow_bill: bool,
    feature_vector: dict,
) -> tuple[float, float, float, str, list, str]:
    score = 0.05

    if total_billed > 0 and total_overcharge > 0:
        ratio = total_overcharge / total_billed
        score += min(ratio * 1.5, 0.45)

    score += min(violation_count * 0.07, 0.28)

    if shadow_bill:
        score += 0.18

    if feature_vector.get("implant_present", 0):
        score += 0.08

    if feature_vector.get("gst_ratio", 0) > 0.05:
        score += 0.05

    score = min(max(score, 0.05), 0.95)
    lower = max(0.0, score - 0.15)
    upper = min(1.0, score + 0.15)
    label = _score_to_label(score)

    shap_values = _rule_based_shap(feature_vector, score, violation_count, shadow_bill)

    return score, lower, upper, label, shap_values, "rule_based_v1"


def _score_to_label(score: float) -> str:
    if score < 0.25:
        return "LOW"
    elif score < 0.55:
        return "MEDIUM"
    elif score < 0.80:
        return "HIGH"
    else:
        return "CRITICAL"


def _compute_shap(model, feature_array, feature_vector: dict) -> list:
    try:
        import shap
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(feature_array)[0]

        feature_labels = {
            0: "Total bill amount",
            1: "Number of line items",
            2: "Proportion of drug charges",
            3: "Proportion of procedure charges",
            4: "GST charges",
            5: "Largest single charge",
            6: "Confirmed overcharges found",
            7: "Total overcharge amount",
            8: "Possible duplicate charges",
            9: "Medical implant charges",
            10: "CGHS insurance type",
            11: "PM-JAY insurance type",
        }

        results = []
        for i, val in enumerate(shap_vals):
            results.append({
                "feature_label": feature_labels.get(i, f"Factor {i+1}"),
                "shap_value": float(val),
                "direction": "INCREASES_RISK" if val > 0 else "DECREASES_RISK",
                "explanation": _shap_explanation(feature_labels.get(i, ""), val),
            })

        return sorted(results, key=lambda x: abs(x["shap_value"]), reverse=True)[:8]

    except Exception:
        return _rule_based_shap(feature_vector, 0.5, 0, False)


def _rule_based_shap(feature_vector: dict, score: float, violations: int, shadow: bool) -> list:
    factors = []

    if violations > 0:
        factors.append({
            "feature_label": "Confirmed overcharges found",
            "shap_value": min(violations * 0.06, 0.30),
            "direction": "INCREASES_RISK",
            "explanation": f"{violations} confirmed billing violations found against government rules.",
        })

    if shadow:
        factors.append({
            "feature_label": "Possible duplicate charges",
            "shap_value": 0.18,
            "direction": "INCREASES_RISK",
            "explanation": "Items appear to have been charged more than once.",
        })

    if feature_vector.get("drug_ratio", 0) > 0.30:
        factors.append({
            "feature_label": "High proportion of drug charges",
            "shap_value": 0.09,
            "direction": "INCREASES_RISK",
            "explanation": "Drug charges make up a large portion of the bill, which is often a sign of overpricing.",
        })

    if feature_vector.get("implant_present", 0):
        factors.append({
            "feature_label": "Medical implant charges",
            "shap_value": 0.12,
            "direction": "INCREASES_RISK",
            "explanation": "Implant charges are subject to government price caps and are frequently overcharged.",
        })

    if feature_vector.get("gst_ratio", 0) > 0.05:
        factors.append({
            "feature_label": "GST applied to bill",
            "shap_value": 0.07,
            "direction": "INCREASES_RISK",
            "explanation": "GST was charged on some items. Many hospital services are GST-exempt.",
        })

    if not factors:
        factors.append({
            "feature_label": "Overall bill profile",
            "shap_value": score - 0.05,
            "direction": "INCREASES_RISK" if score > 0.3 else "DECREASES_RISK",
            "explanation": "The overall bill pattern contributes to this risk level.",
        })

    return factors


def _shap_explanation(label: str, value: float) -> str:
    explanations = {
        "Total bill amount": "Higher bill amounts are associated with greater risk of overcharging.",
        "Number of line items": "More line items means more opportunities for individual overcharges.",
        "Proportion of drug charges": "Drug charges are frequently above the government price cap.",
        "Proportion of procedure charges": "Procedure charges are checked against CGHS approved rates.",
        "GST charges": "GST on healthcare services is often incorrectly applied.",
        "Largest single charge": "Very high single charges may indicate implant or device overcharging.",
        "Confirmed overcharges found": "Confirmed violations significantly raise the risk level.",
        "Total overcharge amount": "The total confirmed excess directly influences the risk score.",
        "Possible duplicate charges": "Duplicate items are a strong indicator of billing fraud.",
        "Medical implant charges": "Implants have government price caps that are regularly exceeded.",
    }
    return explanations.get(label, "This factor contributes to the overall risk assessment.")


def build_feature_vector(bill: Bill, audit: Audit, line_items: list[BillLineItem]) -> dict:
    total = float(bill.total_billed_amount or 1.0)
    drugs = sum(float(li.total_price or 0.0) for li in line_items if getattr(li, "category", "") == "drug")
    procs = sum(float(li.total_price or 0.0) for li in line_items if getattr(li, "category", "") == "procedure")
    gst = sum(float(getattr(li, "gst_amount_applied", 0.0) or 0.0) for li in line_items)
    max_item = max((float(li.total_price or 0.0) for li in line_items), default=0.0)
    return {
        "total_billed_log": math.log1p(total),
        "line_item_count": len(line_items),
        "drug_ratio": drugs / total if total > 0 else 0.0,
        "procedure_ratio": procs / total if total > 0 else 0.0,
        "gst_ratio": gst / total if total > 0 else 0.0,
        "max_single_item": max_item / total if total > 0 else 0.0,
        "statutory_violation_count": audit.finding_count or 0,
        "deterministic_overcharge_log": math.log1p(
            float(audit.total_overcharge_deterministic or 0.0)
        ),
        "shadow_bill_flag": 1 if audit.shadow_bill_detected else 0,
        "implant_present": 1 if any(getattr(li, "category", "") == "implant" for li in line_items) else 0,
        "insurance_cghs": 1 if bill.insurance_type == "cghs" else 0,
        "insurance_pmjay": 1 if bill.insurance_type == "pmjay" else 0,
    }


async def _run_ml_async(bill_id_str: str) -> str:
    bill_uuid = UUID(bill_id_str)

    async with SessionLocal() as db:
        bill_stmt = select(Bill).where(Bill.id == bill_uuid)
        bill = (await db.execute(bill_stmt)).scalar_one_or_none()
        if not bill:
            raise ValueError(f"Bill {bill_id_str} not found.")

        audit_stmt = select(Audit).where(Audit.bill_id == bill_uuid)
        audit = (await db.execute(audit_stmt)).scalar_one_or_none()
        if not audit:
            raise ValueError(f"Audit for bill {bill_id_str} not found.")

        items_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_uuid)
        line_items = (await db.execute(items_stmt)).scalars().all()

        findings_stmt = select(AuditFinding).where(AuditFinding.audit_id == audit.id)
        findings = (await db.execute(findings_stmt)).scalars().all()

        feature_vector = build_feature_vector(bill, audit, list(line_items))

        score, lower, upper, label, shap_values, model_version = get_risk_score(
            feature_vector=feature_vector,
            statutory_violation_count=audit.finding_count or len(findings),
            total_overcharge=float(audit.total_overcharge_deterministic or 0.0),
            total_billed=float(bill.total_billed_amount or 0.0),
            shadow_bill_detected=bool(audit.shadow_bill_detected),
        )

        audit.risk_score = Decimal(str(round(score, 4)))
        audit.risk_label = label
        audit.uncertainty_lower = Decimal(str(round(lower, 4)))
        audit.uncertainty_upper = Decimal(str(round(upper, 4)))
        audit.shap_values = shap_values
        audit.ml_model_version = model_version

        bill.processing_status = "FINANCIAL_ANALYSIS"
        await db.commit()
        await publish(f"bill_status:{bill_id_str}", json.dumps({"status": "FINANCIAL_ANALYSIS", "bill_id": bill_id_str}))
        return bill_id_str


@celery_app.task(
    name="app.workers.ml_task.run_ml_analysis",
    queue="bill_processing",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def run_ml_analysis(self, bill_id: str):
    """Celery entrypoint for ML inference task."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_run_ml_async(bill_id))
    except Exception as exc:
        logger.error(f"Error in ML task for bill {bill_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        loop.close()
