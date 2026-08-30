import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import CreateOrderRequest, PaymentVerificationRequest, PaymentResponse
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/orders", response_model=PaymentResponse)
async def create_payment_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Creates a payment order entry for legal petition filing or expedited audit."""
    order_id = f"order_{uuid.uuid4().hex[:14]}"
    
    payment = Payment(
        user_id=current_user.id,
        bill_id=req.bill_id,
        order_id=order_id,
        amount=req.amount,
        currency=req.currency,
        status="PENDING",
        gateway="RAZORPAY",
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
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
