import asyncio
import json
import logging
from decimal import Decimal
from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy import select
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal as SessionLocal
from app.core.redis import publish
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.audit_engine.statutory.cghs import audit_cghs_item
from app.audit_engine.statutory.nppa import audit_nppa_item
from app.audit_engine.statutory.dpco import audit_dpco_item
from app.audit_engine.statutory.irdai import audit_irdai_item
from app.audit_engine.statutory.gst import audit_gst_item
from app.audit_engine.statutory.pmjay import audit_pmjay_package_item

logger = logging.getLogger(__name__)


async def _run_audit_async(bill_id_str: str) -> str:
    bill_uuid = UUID(bill_id_str)

    async with SessionLocal() as db:
        stmt = select(Bill).where(Bill.id == bill_uuid)
        bill = (await db.execute(stmt)).scalar_one_or_none()
        if not bill:
            raise ValueError(f"Bill {bill_id_str} not found.")

        bill.processing_status = "AUDITING"
        await db.commit()
        await publish(f"bill_status:{bill_id_str}", json.dumps({"status": "AUDITING", "bill_id": bill_id_str}))

        # Load all line items
        item_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_uuid).order_by(BillLineItem.item_sequence)
        line_items = (await db.execute(item_stmt)).scalars().all()

        findings_to_create: List[Dict[str, Any]] = []
        seen_descriptions: Dict[str, List[Decimal]] = {}

        for item in line_items:
            desc = item.raw_description
            price = item.total_price or Decimal("0.0")
            unit_p = item.unit_price or price
            qty = item.quantity or Decimal("1.0")
            gst = item.gst_rate_applied or Decimal("0.0")
            cat = item.category

            # 1. CGHS Checks
            cghs_finding = audit_cghs_item(desc, price, cat)
            if cghs_finding:
                cghs_finding["bill_line_item_id"] = item.id
                findings_to_create.append(cghs_finding)

            # 2. NPPA Checks
            nppa_finding = audit_nppa_item(desc, unit_p, qty)
            if nppa_finding:
                nppa_finding["bill_line_item_id"] = item.id
                findings_to_create.append(nppa_finding)

            # 3. DPCO Checks
            dpco_finding = audit_dpco_item(desc, price, qty, cat)
            if dpco_finding:
                dpco_finding["bill_line_item_id"] = item.id
                findings_to_create.append(dpco_finding)

            # 4. IRDAI Checks
            irdai_finding = audit_irdai_item(desc, price)
            if irdai_finding:
                irdai_finding["bill_line_item_id"] = item.id
                findings_to_create.append(irdai_finding)

            # 5. GST Checks
            gst_finding = audit_gst_item(desc, price, gst, cat)
            if gst_finding:
                gst_finding["bill_line_item_id"] = item.id
                findings_to_create.append(gst_finding)

            # 6. PM-JAY Checks
            pmjay_finding = audit_pmjay_package_item(desc, price, bill.insurance_type)
            if pmjay_finding:
                pmjay_finding["bill_line_item_id"] = item.id
                findings_to_create.append(pmjay_finding)

            # Duplicate / Shadow bill tracking
            desc_norm = desc.lower().strip()
            if desc_norm in seen_descriptions and price in seen_descriptions[desc_norm]:
                findings_to_create.append({
                    "bill_line_item_id": item.id,
                    "finding_type": "SHADOW_BILL",
                    "finding_source": "DETERMINISTIC",
                    "severity": "CRITICAL",
                    "item_description": desc,
                    "billed_amount": price,
                    "benchmark_amount": Decimal("0.0"),
                    "overcharge_amount": price,
                    "statutory_reference": "Consumer Protection Act 2019 (Unfair Trade Practice / Duplicate Billing)",
                    "legal_basis": "Identical item and identical financial magnitude billed multiple times on the same hospitalization invoice.",
                    "user_explanation": f"Duplicate entry detected for '{desc}' with identical charge ₹{price}.",
                    "is_disputable": True,
                })
            else:
                if desc_norm not in seen_descriptions:
                    seen_descriptions[desc_norm] = []
                seen_descriptions[desc_norm].append(price)

        # Check existing audit record or create new
        audit_stmt = select(Audit).where(Audit.bill_id == bill_uuid)
        audit = (await db.execute(audit_stmt)).scalar_one_or_none()
        if not audit:
            audit = Audit(
                bill_id=bill_uuid,
                user_id=bill.user_id,
                audit_version="1.0.0",
                statutory_ref_version="1.0.0",
                ml_model_version="xgb_mlp_ensemble_v1",
                total_billed=bill.total_billed_amount,
            )
            db.add(audit)
            await db.flush()

        # Calculate totals
        total_overcharge = sum(f["overcharge_amount"] for f in findings_to_create)
        audit.total_overcharge_deterministic = total_overcharge
        audit.finding_count = len(findings_to_create)
        audit.shadow_bill_detected = any(f["finding_type"] == "SHADOW_BILL" for f in findings_to_create)

        # Breakdown summary
        summary_counts: Dict[str, int] = {}
        for f in findings_to_create:
            ft = f["finding_type"]
            summary_counts[ft] = summary_counts.get(ft, 0) + 1
        audit.finding_summary = summary_counts

        # Recommendations list
        recs = []
        if total_overcharge > Decimal("0"):
            recs.append({
                "title": "Issue Statutory Demand Notice",
                "description": f"Submit dispute for confirmed ₹{total_overcharge} excess charges under CGHS/NPPA/DPCO notified statutory rules.",
                "priority": "HIGH",
            })
        if audit.shadow_bill_detected:
            recs.append({
                "title": "Dispute Duplicate Charges",
                "description": "Request immediate hospital billing reconciliation for repeated line item entries.",
                "priority": "URGENT",
            })
        audit.recommendations = recs

        # Persist finding records
        for f_data in findings_to_create:
            finding_rec = AuditFinding(
                audit_id=audit.id,
                bill_line_item_id=f_data.get("bill_line_item_id"),
                finding_type=f_data["finding_type"],
                finding_source=f_data["finding_source"],
                severity=f_data["severity"],
                item_description=f_data["item_description"],
                billed_amount=f_data["billed_amount"],
                benchmark_amount=f_data["benchmark_amount"],
                overcharge_amount=f_data["overcharge_amount"],
                statutory_reference=f_data["statutory_reference"],
                legal_basis=f_data["legal_basis"],
                user_explanation=f_data["user_explanation"],
                is_disputable=f_data["is_disputable"],
            )
            db.add(finding_rec)

        bill.processing_status = "ML_ANALYSIS"
        await db.commit()
        await publish(f"bill_status:{bill_id_str}", json.dumps({"status": "ML_ANALYSIS", "bill_id": bill_id_str}))
        return bill_id_str


@celery_app.task(
    name="app.workers.audit_task.run_statutory_audit",
    queue="bill_processing",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def run_statutory_audit(self, bill_id: str):
    """Celery entrypoint for statutory audit task."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_run_audit_async(bill_id))
    except Exception as exc:
        logger.error(f"Error in audit task for bill {bill_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        loop.close()
