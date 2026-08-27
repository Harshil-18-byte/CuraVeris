"""
Insurance & TPA Multi-Party Reconciliation API for CuraVeris.

Connects Hospital Invoices, Claims, TPA Adjudications, and Out-of-Pocket Payments.
Generates structured reconciliation records, exception queues, and refund recommendations.
"""
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import (
    Invoice, Claim, Reconciliation, ReconciliationException,
    Bill, PaymentReconciliation, AuditFinding
)
from app.models.schemas import (
    ReconciliationRequest, ReconciliationResponse,
    ReconciliationExceptionResponse, ClaimCreateRequest, ClaimResponse, TPAApprovalRequest
)
from app.engine.reconciliation import reconciliation_engine
from app.core.currency import to_decimal, ZERO

router = APIRouter(prefix="/insurance", tags=["Insurance & TPA Reconciliation"])


@router.post("/reconcile", response_model=ReconciliationResponse)
async def reconcile_bill_payment(req: ReconciliationRequest, db: AsyncSession = Depends(get_db)):
    """
    Perform 4-way multi-party financial reconciliation:
    Invoice Gross Billed vs Statutory Audit Deductions vs Insurance Approval vs TPA Deductions vs Patient Out-of-Pocket Paid.
    """
    invoice_id = req.invoice_id or req.bill_id
    if not invoice_id:
        raise HTTPException(status_code=400, detail="Either invoice_id or bill_id must be provided.")
    # Check Invoice or legacy Bill
    inv_result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = inv_result.scalars().first()

    bill = None
    if not invoice:
        bill_result = await db.execute(select(Bill).where(Bill.id == invoice_id))
        bill = bill_result.scalars().first()
        if not bill:
            raise HTTPException(status_code=404, detail="Referenced Invoice/Bill not found.")

    gross_billed = req.total_billed or (invoice.net_amount if invoice else to_decimal(bill.total_billed))
    overcharge = (invoice.total_overcharge if invoice else to_decimal(bill.total_overcharge)) if (invoice or bill) else ZERO

    rec_result = reconciliation_engine.reconcile_transaction(
        invoice_id=invoice_id,
        gross_billed=gross_billed,
        statutory_overcharge=overcharge,
        insurance_approved=req.insurance_approved,
        tpa_deductions=req.tpa_deductions,
        patient_paid=req.razorpay_paid,
        settled_amount=req.settled_amount,
        tpa_name=req.tpa_name or "TPA / Insurer"
    )

    # Persist or update canonical Reconciliation record
    rec_query = await db.execute(select(Reconciliation).where(Reconciliation.invoice_id == invoice_id))
    reconciliation = rec_query.scalars().first()

    if not reconciliation:
        reconciliation = Reconciliation(
            invoice_id=invoice_id,
            gross_billed=rec_result["gross_billed"],
            statutory_overcharge=rec_result["statutory_overcharge"],
            fair_bill_total=rec_result["fair_bill_total"],
            insurance_approved=rec_result["insurance_approved"],
            tpa_deductions=rec_result["tpa_deductions"],
            effective_insurer_share=rec_result["effective_insurer_share"],
            legitimate_patient_share=rec_result["legitimate_patient_share"],
            patient_paid=rec_result["patient_paid"],
            patient_unjust_gap=rec_result["patient_unjust_gap"],
            outstanding_patient_balance=rec_result["outstanding_patient_balance"],
            settled_amount=rec_result["settled_amount"],
            status=rec_result["status"],
            notes=rec_result["reconciliation_notes"]
        )
        db.add(reconciliation)
        await db.flush()
    else:
        reconciliation.gross_billed = rec_result["gross_billed"]
        reconciliation.statutory_overcharge = rec_result["statutory_overcharge"]
        reconciliation.fair_bill_total = rec_result["fair_bill_total"]
        reconciliation.insurance_approved = rec_result["insurance_approved"]
        reconciliation.tpa_deductions = rec_result["tpa_deductions"]
        reconciliation.effective_insurer_share = rec_result["effective_insurer_share"]
        reconciliation.legitimate_patient_share = rec_result["legitimate_patient_share"]
        reconciliation.patient_paid = rec_result["patient_paid"]
        reconciliation.patient_unjust_gap = rec_result["patient_unjust_gap"]
        reconciliation.outstanding_patient_balance = rec_result["outstanding_patient_balance"]
        reconciliation.settled_amount = rec_result["settled_amount"]
        reconciliation.status = rec_result["status"]
        reconciliation.notes = rec_result["reconciliation_notes"]

    # Persist generated exceptions
    for exc in rec_result["exceptions"]:
        exc_record = ReconciliationException(
            reconciliation_id=reconciliation.id,
            exception_type=exc["exception_type"],
            severity=exc["severity"],
            amount=exc["amount"],
            cause=exc["cause"],
            suggested_action=exc["suggested_action"],
            status="OPEN"
        )
        db.add(exc_record)

    # Legacy table sync
    legacy_q = await db.execute(select(PaymentReconciliation).where(PaymentReconciliation.bill_id == invoice_id))
    legacy_rec = legacy_q.scalars().first()
    if not legacy_rec:
        legacy_rec = PaymentReconciliation(
            bill_id=invoice_id,
            total_billed=float(rec_result["gross_billed"]),
            insurance_approved=float(rec_result["insurance_approved"]),
            tpa_deductions=float(rec_result["tpa_deductions"]),
            razorpay_paid=float(rec_result["patient_paid"]),
            patient_unjust_gap=float(rec_result["patient_unjust_gap"]),
            tpa_name=req.tpa_name,
            reconciliation_notes=rec_result["reconciliation_notes"],
            status="disputed" if rec_result["refund_link_recommended"] else "reconciled"
        )
        db.add(legacy_rec)

    await db.commit()
    await db.refresh(reconciliation)

    return ReconciliationResponse(
        reconciliation_id=str(reconciliation.id),
        invoice_id=str(reconciliation.invoice_id),
        gross_billed=to_decimal(reconciliation.gross_billed),
        statutory_overcharge=to_decimal(reconciliation.statutory_overcharge),
        fair_bill_total=to_decimal(reconciliation.fair_bill_total),
        insurance_approved=to_decimal(reconciliation.insurance_approved),
        tpa_deductions=to_decimal(reconciliation.tpa_deductions),
        effective_insurer_share=to_decimal(reconciliation.effective_insurer_share),
        legitimate_patient_share=to_decimal(reconciliation.legitimate_patient_share),
        patient_paid=to_decimal(reconciliation.patient_paid),
        patient_unjust_gap=to_decimal(reconciliation.patient_unjust_gap),
        outstanding_patient_balance=to_decimal(reconciliation.outstanding_patient_balance),
        settled_amount=to_decimal(reconciliation.settled_amount),
        status=str(reconciliation.status),
        reconciliation_notes=str(reconciliation.notes or ""),
        refund_link_recommended=bool(rec_result["refund_link_recommended"]),
        created_at=reconciliation.created_at or datetime.now(timezone.utc)
    )


@router.get("/exceptions", response_model=List[ReconciliationExceptionResponse])
async def list_exceptions(
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List open reconciliation exceptions for Hospital Finance and TPA Reviewers."""
    query = select(ReconciliationException)
    if status_filter:
        query = query.where(ReconciliationException.status == status_filter.upper())
    if severity_filter:
        query = query.where(ReconciliationException.severity == severity_filter.upper())

    result = await db.execute(query.order_by(ReconciliationException.created_at.desc()))
    exceptions = result.scalars().all()
    return [ReconciliationExceptionResponse.model_validate(e) for e in exceptions]


@router.post("/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def create_claim(claim_in: ClaimCreateRequest, db: AsyncSession = Depends(get_db)):
    """Submit an insurance claim linked to a hospital invoice."""
    new_claim = Claim(
        invoice_id=claim_in.invoice_id,
        patient_id=claim_in.patient_id,
        hospital_id=claim_in.hospital_id,
        insurance_provider_id=claim_in.insurance_provider_id,
        tpa_id=claim_in.tpa_id,
        claim_number=claim_in.claim_number,
        claimed_amount=claim_in.claimed_amount,
        eligible_amount=claim_in.claimed_amount,
        approved_amount=Decimal("0.00"),
        deduction_amount=Decimal("0.00"),
        co_pay_amount=Decimal("0.00"),
        status="SUBMITTED"
    )
    db.add(new_claim)
    await db.commit()
    await db.refresh(new_claim)
    return ClaimResponse.model_validate(new_claim)
