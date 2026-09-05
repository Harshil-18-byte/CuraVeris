import asyncio
import logging
from typing import Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.models.notification import Notification
from app.audit_engine.frm.orchestrator import run_frm_assessment

logger = logging.getLogger(__name__)

async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgresql+asyncpg://"),
    pool_size=5,
    max_overflow=5,
)
SessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False)


async def _run_frm_async(bill_id_str: str, user_financial_inputs: Dict[str, Any]) -> str:
    bill_uuid = UUID(bill_id_str)
    
    async with SessionLocal() as db:
        stmt = select(Bill).where(Bill.id == bill_uuid)
        bill = (await db.execute(stmt)).scalar_one_or_none()
        if not bill:
            raise ValueError(f"Bill {bill_id_str} not found.")

        audit_stmt = select(Audit).where(Audit.bill_id == bill_uuid)
        audit = (await db.execute(audit_stmt)).scalar_one_or_none()
        if not audit:
            raise ValueError(f"Audit for bill {bill_id_str} not found or not yet completed.")

        findings_stmt = select(AuditFinding).where(AuditFinding.audit_id == audit.id)
        findings = (await db.execute(findings_stmt)).scalars().all()

        items_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_uuid).order_by(BillLineItem.item_sequence)
        line_items = (await db.execute(items_stmt)).scalars().all()

        assessment = await run_frm_assessment(
            bill=bill,
            audit=audit,
            findings=findings,
            line_items=line_items,
            user_financial_inputs=user_financial_inputs,
            db=db,
        )

        # Create notification for completion
        notif = Notification(
            user_id=bill.user_id,
            event_type="FRM_ANALYSIS_COMPLETE",
            title="Financial Risk Assessment Ready",
            body=f"Quantitative risk analysis for {bill.hospital_name or 'your hospital bill'} has been computed.",
            priority="NORMAL",
            entity_type="AUDIT",
            entity_id=audit.id,
            meta_payload={
                "bill_id": str(bill.id),
                "assessment_id": str(assessment.id),
                "expected_loss": float(assessment.expected_loss or 0),
                "lcr": float(assessment.lcr or 0),
            },
        )
        db.add(notif)
        await db.commit()

        logger.info(f"FRM assessment successfully completed for bill {bill_id_str}, assessment {assessment.id}")
        return str(assessment.id)


@celery_app.task(
    name="app.workers.frm_task.compute_frm_assessment",
    queue="frm_analysis",
    bind=True,
    max_retries=2,
    default_retry_delay=15,
)
def compute_frm_assessment(self, bill_id: str, user_financial_inputs: dict):
    """Celery worker entrypoint for FRM calculation."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_run_frm_async(bill_id, user_financial_inputs))
    except Exception as exc:
        logger.error(f"Error in FRM task for bill {bill_id}: {exc}", exc_info=True)
        raise self.retry(exc=exc)
    finally:
        loop.close()
