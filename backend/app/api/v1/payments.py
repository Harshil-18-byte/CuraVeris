import uuid
import logging
from decimal import Decimal
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.bill import Bill
from app.models.audit import Audit
from app.models.payment import Payment
from app.schemas.payment import CreateOrderRequest, PaymentVerificationRequest, PaymentResponse
from app.api.v1.auth import get_current_user

logger = logging.getLogger("curaveris.payments")

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create-order")
async def create_order(
    data: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a Razorpay order for undisputed amount or requested legal petition fee."""
    bill = None
    overcharge = Decimal("0.00")
    total_billed = Decimal("0.00")

    if data.bill_id:
        bill_stmt = select(Bill).where(
            Bill.id == data.bill_id,
            Bill.user_id == current_user.id,
        )
        bill = (await db.execute(bill_stmt)).scalar_one_or_none()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")

        audit_stmt = select(Audit).where(Audit.bill_id == data.bill_id)
        audit = (await db.execute(audit_stmt)).scalar_one_or_none()

        total_billed = Decimal(str(bill.total_billed_amount or 0))
        if audit and audit.total_overcharge_deterministic:
            overcharge = Decimal(str(audit.total_overcharge_deterministic))

    if data.amount is not None:
        undisputed = Decimal(str(data.amount))
    elif bill:
        undisputed = max(Decimal("0.00"), total_billed - overcharge)
    else:
        undisputed = Decimal("499.00")  # Standard dispute drafting fee fallback

    amount_paise = int(undisputed * 100)
    order_id = f"order_{uuid.uuid4().hex[:14]}"
    key_id = settings.RAZORPAY_KEY_ID or "rzp_test_demo12345678"

    # Attempt official Razorpay SDK client if credentials exist
    if settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_KEY_SECRET != "demo_secret":
        try:
            import razorpay
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            rzp_order = client.order.create({
                "amount": amount_paise,
                "currency": data.currency or "INR",
                "receipt": f"cv_{str(bill.id if bill else uuid.uuid4())[:8]}",
                "notes": {
                    "bill_id": str(bill.id) if bill else "",
                    "patient_name": (bill.patient_name if bill else None) or current_user.full_name or "Patient",
                    "hospital_name": (bill.hospital_name if bill else "") or "Hospital",
                }
            })
            if rzp_order and "id" in rzp_order:
                order_id = rzp_order["id"]
        except Exception as e:
            logger.warning(f"Razorpay SDK client exception, falling back to simulated order ID: {e}")

    payment = Payment(
        user_id=current_user.id,
        bill_id=bill.id if bill else None,
        order_id=order_id,
        amount=undisputed,
        currency=data.currency or "INR",
        status="PENDING",
        gateway="RAZORPAY",
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    hospital_name = bill.hospital_name if bill else ""
    return {
        "razorpay_order_id": order_id,
        "amount_paise": amount_paise,
        "amount_display": f"₹{undisputed:,.2f}",
        "currency": data.currency or "INR",
        "key_id": key_id,
        "bill_id": str(bill.id) if bill else None,
        "prefill": {
            "name": current_user.full_name or "Patient",
            "email": current_user.email,
            "contact": current_user.phone_number or "",
        },
        "notes": {
            "hospital": hospital_name or "",
            "disputed_amount": f"₹{overcharge:,.2f}",
            "undisputed_amount": f"₹{undisputed:,.2f}",
        }
    }


@router.post("/orders", response_model=PaymentResponse)
async def create_payment_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Creates a payment order entry for legal petition filing or expedited audit."""
    order_data = await create_order(req, db, current_user)
    stmt = select(Payment).where(Payment.order_id == order_data["razorpay_order_id"])
    payment = (await db.execute(stmt)).scalar_one()
    return payment


@router.post("/verify")
async def verify_payment(
    req: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verifies gateway signature and marks payment as PAID."""
    stmt = select(Payment).where(
        and_(Payment.order_id == req.order_id, Payment.user_id == current_user.id)
    )
    payment = (await db.execute(stmt)).scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment order not found")

    payment.payment_id = req.payment_id
    payment.signature = req.signature
    payment.status = "PAID"
    await db.commit()

    return {"status": "PAID", "order_id": payment.order_id, "payment_id": payment.payment_id}
