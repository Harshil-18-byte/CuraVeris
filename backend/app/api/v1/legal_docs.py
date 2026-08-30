from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.models.user import User
from app.models.bill import Bill
from app.models.audit import Audit, AuditFinding
from app.models.evidence import EvidenceRecord
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/legal-docs", tags=["Legal Documents"])


@router.get("/bills/{bill_id}/dispute-notice")
async def generate_dispute_notice(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates ready-to-file legal dispute notice under Indian statutory frameworks."""
    bill = (await db.execute(select(Bill).where(and_(Bill.id == bill_id, Bill.user_id == current_user.id)))).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    audit = (await db.execute(select(Audit).where(Audit.bill_id == bill_id))).scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not yet completed")

    findings = (await db.execute(select(AuditFinding).where(AuditFinding.audit_id == audit.id))).scalars().all()
    evidence = (await db.execute(select(EvidenceRecord).where(EvidenceRecord.bill_id == bill_id))).scalar_one_or_none()

    template = f"""
LEGAL DEMAND NOTICE UNDER SECTION 65B INDIAN EVIDENCE ACT / BSA 2023
AND RELEVANT PROVISIONS OF DPCO 2013, NPPA CEILING ORDERS & IRDAI MASTER CIRCULAR

To:
The Medical Superintendent / Billing Grievance Redressal Officer
{bill.hospital_name or 'Hospital Administration'}

Subject: Formal Dispute and Demand for Refund of Statutory Overcharges on Hospitalization Invoice #{bill.reference_number or str(bill.id)[:8]}

Dear Sir/Madam,

I, {bill.patient_name or current_user.full_name}, was admitted at your hospital facility from {bill.admission_date or 'N/A'} to {bill.discharge_date or 'N/A'}.

An automated statutory compliance audit of the final billing statement (Cryptographically Sealed with Merkle Root {evidence.merkle_root if evidence else 'N/A'}) has identified confirmed billing overcharges totaling INR {audit.total_overcharge_deterministic}:

STATUTORY INFRACTIONS SUMMARY:
"""
    for idx, f in enumerate(findings, start=1):
        template += f"\n{idx}. {f.item_description} - Billed: ₹{f.billed_amount} | Statutory Benchmark: ₹{f.benchmark_amount} | Overcharge: ₹{f.overcharge_amount}\n   Statutory Basis: {f.statutory_reference}\n   Grounds: {f.legal_basis}\n"

    template += f"""
DEMAND FOR RELIEF:
You are hereby formally requested to reconcile these accounts and credit the refund amount of INR {audit.total_overcharge_deterministic} within 15 days of this notice, failing which appropriate legal proceedings shall be instituted before the competent District Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.

Sincerely,
{bill.patient_name or current_user.full_name}
Dated: {audit.completed_at.strftime('%d %B %Y') if audit.completed_at else 'Today'}
Section 65B Cryptographic HMAC: {evidence.hmac_signature if evidence else 'N/A'}
"""

    return {
        "bill_id": str(bill.id),
        "document_type": "STATUTORY_DISPUTE_NOTICE",
        "content": template,
        "total_disputed_amount": float(audit.total_overcharge_deterministic or 0.0),
    }
