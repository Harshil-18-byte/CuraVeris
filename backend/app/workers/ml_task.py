import os
import asyncio
import json
import logging
import math
from decimal import Decimal
from pathlib import Path
from uuid import UUID
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, update
from datetime import datetime

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.redis import publish
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding

logger = logging.getLogger(__name__)

async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgresql+asyncpg://"),
    pool_size=5,
    max_overflow=5,
)
SessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False)

_xgb_model = None
_mlp_model = None
_models_loaded = False
_model_load_attempted = False


def load_models():
    global _xgb_model, _mlp_model, _models_loaded, _model_load_attempted

    if _model_load_attempted:
        return _models_loaded

    _model_load_attempted = True
    model_path = Path(os.getenv("ML_MODEL_PATH", "./ml_models"))

    try:
        import xgboost as xgb
        xgb_path = model_path / "xgboost_model.json"
        if xgb_path.exists():
            _xgb_model = xgb.Booster()
            _xgb_model.load_model(str(xgb_path))
            logger.info("XGBoost model loaded successfully")
        else:
            logger.warning(f"XGBoost model not found at {xgb_path}. Using rule-based fallback.")
    except Exception as e:
        logger.warning(f"XGBoost model unavailable: {e}. Using rule-based fallback.")

    try:
        import torch
        mlp_path = model_path / "mlp_model.pt"
        if mlp_path.exists():
            _mlp_model = torch.load(str(mlp_path), map_location="cpu")
            if hasattr(_mlp_model, "eval"):
                _mlp_model.eval()
            logger.info("MLP model loaded successfully")
        else:
            logger.warning(f"MLP model not found at {mlp_path}. Using rule-based fallback.")
    except Exception as e:
        logger.warning(f"MLP model unavailable: {e}. Using rule-based fallback.")

    _models_loaded = _xgb_model is not None or _mlp_model is not None
    return _models_loaded


def compute_rule_based_risk_score(
    statutory_violation_count: int,
    total_overcharge: float,
    total_billed: float,
    shadow_bill_detected: bool,
) -> tuple[float, float, float, str]:
    """
    Fallback risk scoring when ML models are not available.
    Returns (risk_score, uncertainty_lower, uncertainty_upper, risk_label)
    """
    score = 0.0

    if total_billed > 0:
        overcharge_ratio = total_overcharge / total_billed
        score += min(overcharge_ratio * 2.0, 0.50)

    if statutory_violation_count > 0:
        score += min(statutory_violation_count * 0.08, 0.30)

    if shadow_bill_detected:
        score += 0.20

    score = min(score, 0.95)
    score = max(score, 0.05)

    uncertainty = 0.15
    lower = max(0.0, score - uncertainty)
    upper = min(1.0, score + uncertainty)

    if score < 0.25:
        label = "LOW"
    elif score < 0.55:
        label = "MEDIUM"
    elif score < 0.80:
        label = "HIGH"
    else:
        label = "CRITICAL"

    return score, lower, upper, label


def generate_rule_based_shap(
    feature_vector: dict,
    risk_score: float,
) -> list[dict]:
    """
    Generate human-readable risk factors when SHAP is not available.
    """
    factors = []

    if feature_vector.get("statutory_violation_count", 0) > 0:
        count = feature_vector["statutory_violation_count"]
        factors.append({
            "feature_label": "Confirmed overcharges",
            "shap_value": 0.15 * min(count / 5.0, 1.0),
            "direction": "INCREASES_RISK",
            "explanation": f"{count} confirmed billing violations found against government rules.",
        })

    if feature_vector.get("drug_ratio", 0) > 0.3:
        factors.append({
            "feature_label": "High proportion of drug charges",
            "shap_value": 0.10,
            "direction": "INCREASES_RISK",
            "explanation": "A high proportion of the bill is drug charges, which are frequently overpriced.",
        })

    if feature_vector.get("shadow_bill_flag", 0) == 1:
        factors.append({
            "feature_label": "Possible duplicate charges",
            "shap_value": 0.20,
            "direction": "INCREASES_RISK",
            "explanation": "We detected items that may have been charged more than once.",
        })

    if feature_vector.get("gst_ratio", 0) > 0.05:
        factors.append({
            "feature_label": "GST charges present",
            "shap_value": 0.08,
            "direction": "INCREASES_RISK",
            "explanation": "GST was applied to some items. Healthcare services are often GST-exempt.",
        })

    if feature_vector.get("implant_present", 0) == 1:
        factors.append({
            "feature_label": "Medical implant charges",
            "shap_value": 0.12,
            "direction": "INCREASES_RISK",
            "explanation": "Implant charges are subject to government price caps and are often overcharged.",
        })

    if len(factors) < 3:
        factors.append({
            "feature_label": "Overall billing complexity",
            "shap_value": 0.05,
            "direction": "INCREASES_RISK" if risk_score > 0.5 else "DECREASES_RISK",
            "explanation": "The overall bill complexity affects the risk level.",
        })

    return sorted(factors, key=lambda x: abs(x["shap_value"]), reverse=True)[:10]


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

        # Load line items and findings
        items_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_uuid)
        line_items = (await db.execute(items_stmt)).scalars().all()

        findings_stmt = select(AuditFinding).where(AuditFinding.audit_id == audit.id)
        findings = (await db.execute(findings_stmt)).scalars().all()

        feature_vector = build_feature_vector(bill, audit, list(line_items))

        models_available = load_models()
        if models_available:
            try:
                from app.audit_engine.ml.ensemble import predict_risk_ensemble, get_loaded_xgb_booster
                from app.audit_engine.ml.explainer import explain_prediction
                from app.audit_engine.ml.features import extract_features

                items_dicts = [{
                    "category": it.category,
                    "total_price": float(it.total_price or 0.0),
                    "gst_rate_applied": float(it.gst_rate_applied or 0.0),
                } for it in line_items]

                findings_dicts = [{
                    "finding_type": f.finding_type,
                    "overcharge_amount": float(f.overcharge_amount or 0.0),
                } for f in findings]

                features_vec = extract_features(
                    total_billed=bill.total_billed_amount or Decimal("0.0"),
                    line_items=items_dicts,
                    deterministic_findings=findings_dicts,
                    insurance_type=bill.insurance_type,
                )

                score, label, lower, upper, model_ver = predict_risk_ensemble(
                    features=features_vec,
                    deterministic_violation_count=len(findings),
                )
                xgb_inst = get_loaded_xgb_booster()
                shap_values = explain_prediction(features=features_vec, xgb_model=xgb_inst)
            except Exception as e:
                logger.warning(f"ML inference exception: {e}. Using rule-based fallback.")
                score, lower, upper, label = compute_rule_based_risk_score(
                    audit.finding_count or len(findings),
                    float(audit.total_overcharge_deterministic or 0.0),
                    float(bill.total_billed_amount or 0.0),
                    audit.shadow_bill_detected or False,
                )
                shap_values = generate_rule_based_shap(feature_vector, score)
                model_ver = "rule_based_fallback_v1"
        else:
            score, lower, upper, label = compute_rule_based_risk_score(
                audit.finding_count or len(findings),
                float(audit.total_overcharge_deterministic or 0.0),
                float(bill.total_billed_amount or 0.0),
                audit.shadow_bill_detected or False,
            )
            shap_values = generate_rule_based_shap(feature_vector, score)
            model_ver = "rule_based_fallback_v1"

        audit.risk_score = Decimal(str(round(score, 4)))
        audit.risk_label = label
        audit.uncertainty_lower = Decimal(str(round(lower, 4)))
        audit.uncertainty_upper = Decimal(str(round(upper, 4)))
        audit.shap_values = shap_values
        audit.ml_model_version = model_ver

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

