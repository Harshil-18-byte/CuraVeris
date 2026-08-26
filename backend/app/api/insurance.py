from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Bill, PaymentReconciliation
from app.models.schemas import ReconciliationRequest, ReconciliationResponse
from app.engine.reconciliation import reconcile_payments

router = APIRouter(prefix="/insurance", tags=["Insurance & TPA Reconciliation"])


@router.post("/reconcile", response_model=ReconciliationResponse)
async def reconcile_bill_payment(req: ReconciliationRequest, db: AsyncSession = Depends(get_db)):
    """
    Perform three-way audit:
    Hospital Billed vs Insurance TPA Sanctioned vs Patient Out-of-Pocket Payment.
    """
    result = await db.execute(select(Bill).where(Bill.id == req.bill_id))
    bill = result.scalars().first()
    if not bill:
        raise HTTPException(status_code=404, detail="Referenced Bill not found")

    rec_result = reconcile_payments(
        total_billed=req.total_billed,
        insurance_approved=req.insurance_approved,
        razorpay_paid=req.razorpay_paid,
        total_overcharge=bill.total_overcharge,
        tpa_name=req.tpa_name or "Insurer TPA"
    )

    # Save or update record in DB
    existing = await db.execute(select(PaymentReconciliation).where(PaymentReconciliation.bill_id == req.bill_id))
    reconciliation = existing.scalars().first()

    if not reconciliation:
        reconciliation = PaymentReconciliation(
            bill_id=req.bill_id,
            total_billed=req.total_billed,
            insurance_approved=req.insurance_approved,
            tpa_deductions=rec_result["tpa_deductions"],
            razorpay_paid=req.razorpay_paid,
            patient_unjust_gap=rec_result["patient_unjust_gap"],
            razorpay_payment_id=req.razorpay_payment_id,
            tpa_name=req.tpa_name,
            reconciliation_notes=rec_result["reconciliation_notes"],
            status="disputed" if rec_result["refund_recommended"] else "reconciled"
        )
        db.add(reconciliation)
    else:
        reconciliation.total_billed = req.total_billed
        reconciliation.insurance_approved = req.insurance_approved
        reconciliation.tpa_deductions = rec_result["tpa_deductions"]
        reconciliation.razorpay_paid = req.razorpay_paid
        reconciliation.patient_unjust_gap = rec_result["patient_unjust_gap"]
        reconciliation.razorpay_payment_id = req.razorpay_payment_id
        reconciliation.reconciliation_notes = rec_result["reconciliation_notes"]

    await db.commit()
    await db.refresh(reconciliation)

    return ReconciliationResponse(
        reconciliation_id=reconciliation.id,
        bill_id=reconciliation.bill_id,
        total_billed=reconciliation.total_billed,
        insurance_approved=reconciliation.insurance_approved,
        tpa_deductions=reconciliation.tpa_deductions,
        razorpay_paid=reconciliation.razorpay_paid,
        patient_unjust_gap=reconciliation.patient_unjust_gap,
        refundable_amount=rec_result["refundable_amount"],
        reconciliation_notes=reconciliation.reconciliation_notes,
        refund_link_recommended=rec_result["refund_recommended"],
        created_at=reconciliation.created_at
    )
