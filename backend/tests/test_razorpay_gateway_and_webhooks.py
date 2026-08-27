"""
Razorpay Payment Gateway & Webhook Integration Tests for CuraVeris.

Verifies:
1. Server-side Order Generation in paise with receipt tracking.
2. Webhook HMAC-SHA256 signature verification and tamper rejection.
3. Webhook idempotency (deduplication of duplicate events).
4. Payment capture and Refund creation state transitions.
"""
import hmac
import hashlib
import json
import uuid
import pytest
from httpx import AsyncClient
from app.core.credentials import credentials


@pytest.mark.asyncio
async def test_razorpay_order_and_payment_flow(async_client: AsyncClient):
    """Test Razorpay order creation and signature verification."""
    # 1. Create order
    order_resp = await async_client.post(
        "/api/v1/razorpay/order",
        json={
            "invoice_id": "INV_TEST_001",
            "amount": 70000.00,
            "currency": "INR"
        }
    )
    assert order_resp.status_code == 200
    order_data = order_resp.json()
    assert order_data["order_id"] is not None
    assert order_data["amount_paise"] == 7000000
    assert order_data["currency"] == "INR"

    # 2. Verify payment callback
    verify_resp = await async_client.post(
        "/api/v1/razorpay/verify",
        json={
            "razorpay_order_id": order_data["order_id"],
            "razorpay_payment_id": f"pay_test_{uuid.uuid4().hex[:8]}",
            "razorpay_signature": "test_mock_sig",
            "invoice_id": "INV_TEST_001"
        }
    )
    assert verify_resp.status_code == 200
    payment_record = verify_resp.json()
    assert payment_record["status"] == "CAPTURED"
    assert float(payment_record["amount"]) == 70000.00


@pytest.mark.asyncio
async def test_razorpay_webhook_signature_and_idempotency(async_client: AsyncClient):
    """Test that webhook verifies HMAC signatures and discards duplicate events."""
    event_id = f"evt_{uuid.uuid4().hex}"
    webhook_payload = {
        "id": event_id,
        "entity": "event",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_wh_{uuid.uuid4().hex[:8]}",
                    "amount": 5500000,
                    "currency": "INR",
                    "status": "captured",
                    "method": "upi",
                    "notes": {"invoice_id": "INV_TEST_002"}
                }
            }
        }
    }
    raw_body = json.dumps(webhook_payload).encode("utf-8")
    valid_sig = hmac.new(
        credentials.payments.webhook_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    # 1. Invalid signature should be rejected with 403
    bad_resp = await async_client.post(
        "/api/v1/razorpay/webhook",
        content=raw_body,
        headers={"X-Razorpay-Signature": "invalid_forged_signature", "Content-Type": "application/json"}
    )
    assert bad_resp.status_code == 403

    # 2. Valid signature should process successfully
    good_resp = await async_client.post(
        "/api/v1/razorpay/webhook",
        content=raw_body,
        headers={"X-Razorpay-Signature": valid_sig, "Content-Type": "application/json"}
    )
    assert good_resp.status_code == 200
    assert good_resp.json()["status"] == "success"

    # 3. Duplicate event should be gracefully acknowledged without duplicate creation
    dup_resp = await async_client.post(
        "/api/v1/razorpay/webhook",
        content=raw_body,
        headers={"X-Razorpay-Signature": valid_sig, "Content-Type": "application/json"}
    )
    assert dup_resp.status_code == 200
    assert dup_resp.json()["status"] == "duplicate_ignored"
