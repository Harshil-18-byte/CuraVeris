import asyncio
import json
import logging
from decimal import Decimal
from uuid import UUID
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.redis import publish
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.audit_engine.ml.features import extract_features
from app.audit_engine.ml.ensemble import predict_risk_ensemble
from app.audit_engine.ml.explainer import explain_prediction

logger = logging.getLogger(__name__)

async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgresql+asyncpg://"),
    pool_size=5,
    max_overflow=5,
)
SessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False)


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

        # Extract features
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

        shap_expls = explain_prediction(features=features_vec)

        audit.risk_score = Decimal(str(round(score, 4)))
        audit.risk_label = label
        audit.uncertainty_lower = Decimal(str(round(lower, 4)))
        audit.uncertainty_upper = Decimal(str(round(upper, 4)))
        audit.shap_values = shap_expls
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
