import asyncio
import json
import logging
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.redis import publish
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.models.evidence import EvidenceRecord
from app.crypto.evidence import build_evidence_payload
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)

async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgresql+asyncpg://"),
    pool_size=5,
    max_overflow=5,
)
SessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False)


async def _run_evidence_async(bill_id_str: str) -> str:
    bill_uuid = UUID(bill_id_str)

    async with SessionLocal() as db:
        bill_stmt = select(Bill).where(Bill.id == bill_uuid)
        bill = (await db.execute(bill_stmt)).scalar_one_or_none()
        if not bill:
            raise ValueError(f"Bill {bill_id_str} not found.")

        audit_stmt = select(Audit).where(Audit.bill_id == bill_uuid)
        audit = (await db.execute(audit_stmt)).scalar_one_or_none()
        if not audit:
            raise ValueError(f"Audit {bill_id_str} not found.")

        # Load details for evidence sealing
        items_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_uuid).order_by(BillLineItem.item_sequence)
        line_items = (await db.execute(items_stmt)).scalars().all()

        findings_stmt = select(AuditFinding).where(AuditFinding.audit_id == audit.id)
        findings = (await db.execute(findings_stmt)).scalars().all()

        bill_dict = {
            "id": str(bill.id),
            "hospital_name": bill.hospital_name,
            "patient_name": bill.patient_name,
            "total_billed_amount": str(bill.total_billed_amount),
            "file_hash_sha256": bill.file_hash_sha256,
        }

        items_list = [{
            "sequence": it.item_sequence,
            "description": it.raw_description,
            "total_price": str(it.total_price),
            "category": it.category,
        } for it in line_items]

        audit_summary_dict = {
            "total_overcharge_deterministic": str(audit.total_overcharge_deterministic),
            "risk_score": str(audit.risk_score),
            "risk_label": audit.risk_label,
            "finding_count": audit.finding_count,
            "shadow_bill_detected": audit.shadow_bill_detected,
        }

        findings_list = [{
            "type": f.finding_type,
            "severity": f.severity,
            "overcharge": str(f.overcharge_amount),
            "statutory_ref": f.statutory_reference,
        } for f in findings]

        root, signature, payload, leaf_hashes = build_evidence_payload(
            bill_data=bill_dict,
            line_items=items_list,
            audit_summary=audit_summary_dict,
            findings=findings_list,
            statutory_version=audit.statutory_ref_version,
            ml_version=audit.ml_model_version,
        )

        now_utc = datetime.now(timezone.utc)

        # Check existing or create evidence record
        ev_stmt = select(EvidenceRecord).where(EvidenceRecord.bill_id == bill_uuid)
        evidence = (await db.execute(ev_stmt)).scalar_one_or_none()
        if not evidence:
            evidence = EvidenceRecord(
                bill_id=bill.id,
                audit_id=audit.id,
                merkle_root=root,
                hmac_signature=signature,
                canonical_payload=payload,
                leaf_hashes=leaf_hashes,
                issued_at=now_utc,
            )
            db.add(evidence)
        else:
            evidence.merkle_root = root
            evidence.hmac_signature = signature
            evidence.canonical_payload = payload
            evidence.leaf_hashes = leaf_hashes
            evidence.issued_at = now_utc

        audit.completed_at = now_utc
        bill.processing_status = "COMPLETED"
        bill.processing_completed_at = now_utc

        # Create user notification
        await create_notification(
            db=db,
            user_id=bill.user_id,
            event_type="AUDIT_COMPLETED",
            title="Audit Complete",
            body="Your medical bill audit is complete. Tap to view your report and findings.",
            priority="HIGH",
            entity_type="AUDIT",
            entity_id=audit.id,
        )

        await db.commit()
        await publish(f"bill_status:{bill_id_str}", json.dumps({
            "status": "COMPLETED",
            "bill_id": bill_id_str,
            "audit_id": str(audit.id),
        }))

        return bill_id_str


@celery_app.task(
    name="app.workers.evidence_task.generate_evidence",
    queue="bill_processing",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def generate_evidence(self, bill_id: str):
    """Celery entrypoint for cryptographic evidence generation."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_run_evidence_async(bill_id))
    except Exception as exc:
        logger.error(f"Error in evidence task for bill {bill_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        loop.close()


_generate_evidence_async = _run_evidence_async

