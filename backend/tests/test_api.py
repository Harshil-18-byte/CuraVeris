import pytest
import hmac
import hashlib
import uuid
from httpx import AsyncClient
from app.core.config import settings


@pytest.mark.asyncio
async def test_auth_and_bill_workflow(async_client: AsyncClient):
    test_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    # 1. Register
    reg_payload = {
        "email": test_email,
        "password": "StrongPassword123!",
        "full_name": "Ramesh Sharma",
        "phone": "+91-9876543210",
        "role": "patient"
    }
    reg_resp = await async_client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    assert token is not None

    # 2. Login
    login_resp = await async_client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "StrongPassword123!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 3. Upload and audit sample bill
    bill_raw_text = """
    APOLLO HOSPITALS
    Patient: Ramesh Sharma
    Diagnosis: Coronary Artery Disease
    Admission Date: 12-08-2026

    PROCEDURES & SURGERY:
    Coronary Stent Drug Eluting (DES) 1 65000.00 65000.00
    Percutaneous Transluminal Angioplasty 1 70000.00 70000.00

    PHARMACY:
    Inj. Pantoprazole 40mg 3 180.00 540.00

    INVESTIGATIONS:
    ECG 12 Lead 1 200.00 200.00
    ECG 12 Lead Repeated 1 200.00 200.00

    CONSUMABLES:
    Surgical Gloves 5 150.00 750.00

    TAXES:
    GST on Healthcare 1 1200.00 1200.00
    """

    upload_resp = await async_client.post(
        "/api/v1/bills/upload",
        data={
            "raw_text": bill_raw_text,
            "hospital_name": "Apollo Hospitals",
            "city": "Mumbai",
            "diagnosis": "Coronary Artery Disease"
        }
    )
    assert upload_resp.status_code == 200
    bill_data = upload_resp.json()
    bill_id = bill_data["bill_id"]
    assert bill_id is not None
    assert float(bill_data["total_overcharge"]) > 25000.00  # Stent + Pantoprazole + GST + Duplicate ECG
    assert float(bill_data["risk_score"]) > 40.0

    # 4. Chat with the bill
    chat_resp = await async_client.post(
        "/api/v1/chat/",
        json={
            "bill_id": bill_id,
            "message": "Why is the stent price flagged as illegal?"
        }
    )
    assert chat_resp.status_code == 200
    assert "NPPA" in chat_resp.json()["reply"] or "ceiling" in chat_resp.json()["reply"].lower()

    # 5. Three-way Payment Reconciliation
    rec_resp = await async_client.post(
        "/api/v1/insurance/reconcile",
        json={
            "bill_id": bill_id,
            "total_billed": bill_data["total_billed"],
            "insurance_approved": 80000.00,
            "tpa_name": "Medi Assist TPA",
            "razorpay_paid": 55000.00
        }
    )
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert float(rec_data["patient_unjust_gap"]) > 0
    assert rec_data["refund_link_recommended"] is True

    # 6. Generate Formal Legal Dispute Petition (Hospital Grievance)
    dispute_resp = await async_client.post(
        "/api/v1/reports/dispute-letter",
        json={
            "bill_id": bill_id,
            "forum_type": "hospital_grievance",
            "patient_name": "Ramesh Sharma",
            "patient_address": "Flat 402, Mumbai"
        }
    )
    assert dispute_resp.status_code == 200
    dispute_data = dispute_resp.json()
    assert "DEMAND FOR IMMEDIATE REFUND" in dispute_data["letter_title"]
    assert "DPCO 2013" in dispute_data["letter_body"] or "NPPA" in dispute_data["letter_body"]

    # 7. Razorpay Webhook HMAC check
    fake_body = b'{"event": "payment.captured", "payload": {}}'
    # Without valid signature, must return 403
    webhook_resp = await async_client.post(
        "/api/v1/razorpay/webhook",
        content=fake_body,
        headers={"X-Razorpay-Signature": "invalid_forged_sig", "Content-Type": "application/json"}
    )
    assert webhook_resp.status_code == 403

    # With valid HMAC signature
    from app.core.credentials import credentials
    secret = credentials.payments.webhook_secret.encode("utf-8")
    valid_sig = hmac.new(secret, fake_body, hashlib.sha256).hexdigest()
    webhook_ok = await async_client.post(
        "/api/v1/razorpay/webhook",
        content=fake_body,
        headers={"X-Razorpay-Signature": valid_sig, "Content-Type": "application/json"}
    )
    assert webhook_ok.status_code == 200
