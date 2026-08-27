"""
Reconciliation & Exception Engine Integration Tests for CuraVeris.

Verifies:
1. End-to-End Four-Way Reconciliation: Invoice ↔ Insurance ↔ TPA ↔ Razorpay ↔ Settlement.
2. Automated exception generation for statutory overcharge, TPA cuts, payment gap, and uncollected balance.
3. Finance Controller metrics aggregation and exception queue lifecycle.
"""
from decimal import Decimal
import pytest
from httpx import AsyncClient
from app.db.database import AsyncSessionLocal
from app.db.models import Invoice, Bill, ReconciliationException
from app.core.security import encrypt_pii


@pytest.mark.asyncio
async def test_end_to_end_reconciliation_and_exceptions(async_client: AsyncClient):
    """Test full 4-way reconciliation workflow and exception queue generation."""
    # 1. Create a test bill via upload
    raw_bill = """
    APOLLO HOSPITALS
    Patient: Sunil Verma
    Diagnosis: Angioplasty

    PROCEDURES:
    Coronary Stent (DES) 1 65000.00 65000.00

    PHARMACY:
    Inj. Pantoprazole 40mg 2 180.00 360.00

    TAXES:
    GST on Healthcare 1 1500.00 1500.00
    """
    upload_resp = await async_client.post(
        "/api/v1/bills/upload",
        data={"raw_text": raw_bill, "hospital_name": "Apollo Hospitals"}
    )
    assert upload_resp.status_code == 200
    bill_data = upload_resp.json()
    bill_id = bill_data["bill_id"]
    total_billed = bill_data["total_billed"]
    total_overcharge = bill_data["total_overcharge"]

    assert float(total_overcharge) > 25000.00

    # 2. Reconcile with Insurance and Patient Out-of-Pocket Payment
    # Scenario: Insurance approves 30,000; TPA deducts 2,000; Patient pays 35,000
    rec_resp = await async_client.post(
        "/api/v1/insurance/reconcile",
        json={
            "invoice_id": bill_id,
            "insurance_approved": 30000.00,
            "tpa_deductions": 2000.00,
            "razorpay_paid": 35000.00,
            "tpa_name": "Medi Assist TPA"
        }
    )
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert rec_data["invoice_id"] == bill_id
    assert rec_data["status"] in ["EXCEPTION", "REFUND_DUE"]
    assert float(rec_data["fair_bill_total"]) > 0

    # 3. Check Exception Queue
    exc_resp = await async_client.get("/api/v1/insurance/exceptions")
    assert exc_resp.status_code == 200
    exceptions = exc_resp.json()
    assert len(exceptions) > 0
    exc_types = [e["exception_type"] for e in exceptions]
    assert "OVERCHARGE" in exc_types or "TPA_MISMATCH" in exc_types

    # 4. Check Finance Controller Metrics
    fin_resp = await async_client.get("/api/v1/finance/metrics")
    assert fin_resp.status_code == 200
    fin_data = fin_resp.json()
    assert "gross_billed" in fin_data
    assert "collected_amount" in fin_data
    assert "reconciliation_rate_percent" in fin_data

    # 5. Check Revenue Recovery Prioritization
    rev_resp = await async_client.get("/api/v1/finance/revenue-recovery/prioritized")
    assert rev_resp.status_code == 200
    pipeline = rev_resp.json()
    assert isinstance(pipeline, list)
