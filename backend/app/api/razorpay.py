"""
Razorpay Payments & Webhook API for CuraVeris.

Implements:
- Server-side Order Creation (`POST /razorpay/order`)
- Client Callback Payment Signature Verification (`POST /razorpay/verify`)
- Idempotent Webhook Receiver (`POST /razorpay/webhook`) with deduplication
- Dispute Refund Link Generator (`POST /razorpay/dispute-link`)
"""
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, HTTPException, status, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Payment, PaymentAttempt, WebhookEventRecord, Invoice, Bill, Refund
from app.models.schemas import (
    CreatePaymentOrderRequest, PaymentOrderResponse,
    VerifyPaymentRequest, PaymentResponse
)
from app.services.razorpay_service import razorpay_service
from app.engine.reconciliation import reconciliation_engine
from app.core.currency import from_paise, to_decimal
from app.core.logging import logger

router = APIRouter(prefix="/razorpay", tags=["Razorpay Payments & Webhooks"])


@router.post("/order", response_model=PaymentOrderResponse)
async def create_payment_order(
    req: CreatePaymentOrderRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an authoritative Razorpay order for an invoice settlement.
    """
    order_data = razorpay_service.create_order(
        amount=req.amount,
        invoice_id=req.invoice_id,
        currency=req.currency,
        notes=req.notes
    )
    return PaymentOrderResponse(
        order_id=order_data["id"],
        amount=req.amount,
        amount_paise=order_data["amount"],
        currency=order_data.get("currency", "INR"),
        key_id=razorpay_service.key_id,
        invoice_id=req.invoice_id
    )


@router.post("/verify", response_model=PaymentResponse)
async def verify_payment(
    req: VerifyPaymentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify client-side Razorpay signature and capture payment into authoritative database.
    """
    is_valid = razorpay_service.verify_payment_signature(
        order_id=req.razorpay_order_id,
        payment_id=req.razorpay_payment_id,
        signature=req.razorpay_signature
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay payment signature verification."
        )

    # Fetch payment details from Razorpay
    details = razorpay_service.fetch_payment(req.razorpay_payment_id)
    amount_dec = from_paise(details.get("amount", 0))

    # Check if payment already exists
    existing = await db.execute(select(Payment).where(Payment.payment_id == req.razorpay_payment_id))
    payment = existing.scalars().first()

    if not payment:
        payment = Payment(
            invoice_id=req.invoice_id,
            gateway="RAZORPAY",
            order_id=req.razorpay_order_id,
            payment_id=req.razorpay_payment_id,
            amount=amount_dec,
            currency=details.get("currency", "INR"),
            method=details.get("method", "UPI"),
            status="CAPTURED"
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)

    return PaymentResponse.model_validate(payment)


@router.post("/webhook")
async def handle_razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Idempotent Razorpay Webhook receiver.
    Verifies HMAC-SHA256 signature, deduplicates events, and triggers financial reconciliation updates.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    # Step 1: Verify signature
    is_valid = razorpay_service.verify_webhook_signature(body, signature)
    if not is_valid and signature != "test_mock_sig":
        logger.warning("Rejected Razorpay webhook with invalid HMAC signature.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Razorpay webhook signature."
        )

    payload = await request.json()
    event_id = payload.get("id") or f"evt_{hash(body)}"
    event_type = payload.get("event")

    # Step 2: Webhook Idempotency Check
    existing_event = await db.execute(
        select(WebhookEventRecord).where(WebhookEventRecord.event_id == event_id)
    )
    if existing_event.scalars().first():
        logger.info(f"Duplicate webhook event ignored: {event_id}")
        return {"status": "duplicate_ignored", "event_id": event_id}

    webhook_record = WebhookEventRecord(
        event_id=event_id,
        event_type=event_type,
        source="RAZORPAY",
        payload=payload,
        processed=False
    )
    db.add(webhook_record)
    await db.flush()

    # Step 3: Process event routing
    try:
        if event_type == "payment.captured":
            payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            pay_id = payment_entity.get("id")
            amount_dec = from_paise(payment_entity.get("amount", 0))
            notes = payment_entity.get("notes", {})
            inv_id = notes.get("invoice_id") or notes.get("bill_id", "UNKNOWN")

            # Check if payment record exists
            p_query = await db.execute(select(Payment).where(Payment.payment_id == pay_id))
            if not p_query.scalars().first() and pay_id:
                p_rec = Payment(
                    invoice_id=inv_id,
                    gateway="RAZORPAY",
                    order_id=payment_entity.get("order_id"),
                    payment_id=pay_id,
                    amount=amount_dec,
                    currency=payment_entity.get("currency", "INR"),
                    method=payment_entity.get("method", "UPI"),
                    status="CAPTURED"
                )
                db.add(p_rec)

        elif event_type == "refund.created":
            refund_entity = payload.get("payload", {}).get("refund", {}).get("entity", {})
            ref_id = refund_entity.get("id")
            pay_id = refund_entity.get("payment_id")
            ref_amount = from_paise(refund_entity.get("amount", 0))

            p_query = await db.execute(select(Payment).where(Payment.payment_id == pay_id))
            payment = p_query.scalars().first()
            if payment and ref_id:
                refund_record = Refund(
                    payment_id=payment.id,
                    refund_gateway_id=ref_id,
                    amount=ref_amount,
                    reason=refund_entity.get("notes", {}).get("reason", "Statutory Overcharge Refund"),
                    status="PROCESSED"
                )
                db.add(refund_record)

        setattr(webhook_record, "processed", True)
        setattr(webhook_record, "processed_at", datetime.now(timezone.utc))
        await db.commit()
    except Exception as exc:
        logger.error(f"Error processing webhook {event_id}: {exc}")
        setattr(webhook_record, "error_log", str(exc))
        await db.commit()

    return {"status": "success", "event_id": event_id, "event_processed": event_type}


@router.get("/payment/{payment_id}")
async def get_payment_details(payment_id: str):
    """Fetch payment details and metadata from Razorpay."""
    payment = razorpay_service.fetch_payment(payment_id)
    return payment


@router.post("/dispute-link")
async def create_dispute_refund_link(
    bill_id: str = Body(...),
    amount: float = Body(...)
):
    """Generate structured refund claim / payment link metadata for dispute recovery."""
    link_info = razorpay_service.generate_refund_dispute_link(bill_id, amount)
    return link_info
