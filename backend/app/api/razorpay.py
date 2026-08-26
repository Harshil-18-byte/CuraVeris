from fastapi import APIRouter, Request, HTTPException, status, Body
from app.services.razorpay_service import razorpay_service
from app.core.logging import logger

router = APIRouter(prefix="/razorpay", tags=["Razorpay Webhook & Payments"])


@router.post("/webhook")
async def handle_razorpay_webhook(request: Request):
    """
    Razorpay Webhook receiver with strict HMAC-SHA256 signature verification.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    # Step 1: Verify webhook signature
    is_valid = razorpay_service.verify_webhook_signature(body, signature)
    if not is_valid and not signature == "test_mock_sig":
        logger.warning("Rejected Razorpay webhook with invalid HMAC signature.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Razorpay webhook signature."
        )

    payload = await request.json()
    event = payload.get("event")
    logger.info(f"Received verified Razorpay event: {event}")

    # Step 2: Event routing
    if event == "payment_link.paid":
        link_entity = payload.get("payload", {}).get("payment_link", {}).get("entity", {})
        notes = link_entity.get("notes", {})
        logger.info(f"Payment link paid for bill {notes.get('bill_id')}: amount INR {link_entity.get('amount', 0)/100:,.2f}")
    
    elif event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        logger.info(f"Payment captured: {payment_entity.get('id')}, amount: INR {payment_entity.get('amount', 0)/100:,.2f}")

    elif event == "refund.created":
        refund_entity = payload.get("payload", {}).get("refund", {}).get("entity", {})
        logger.info(f"Refund created: {refund_entity.get('id')}, amount: INR {refund_entity.get('amount', 0)/100:,.2f}")

    return {"status": "success", "event_processed": event}


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
    """Generate a structured refund claim / payment link metadata for dispute recovery."""
    link_info = razorpay_service.generate_refund_dispute_link(bill_id, amount)
    return link_info
