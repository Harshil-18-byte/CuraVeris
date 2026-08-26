import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.engine.semantic_search import semantic_search_engine
from app.engine.abdm_gateway import validate_abha_number, generate_fhir_bundle


@pytest.mark.asyncio
async def test_semantic_search_engine_standalone():
    """Verify in-memory semantic vector search on colloquial clinical terms."""
    # Test 1: stomach camera test
    res1 = semantic_search_engine.search_procedure("stomach camera test", top_k=3)
    assert len(res1) > 0
    assert any("endoscopy" in r["name"].lower() for r in res1)

    # Test 2: heart spring stent
    res2 = semantic_search_engine.search_procedure("heart spring stent", top_k=3)
    assert len(res2) > 0
    assert any("stent" in r["name"].lower() for r in res2)

    # Test 3: knee cap replacement
    res3 = semantic_search_engine.search_procedure("knee cap replacement", top_k=3)
    assert len(res3) > 0
    assert any("knee" in r["name"].lower() for r in res3)

    # Test 4: daily sugar prick test
    res4 = semantic_search_engine.search_procedure("daily sugar prick test", top_k=3)
    assert len(res4) > 0
    assert any("sugar" in r["name"].lower() or "glucose" in r["name"].lower() for r in res4)


@pytest.mark.asyncio
async def test_api_semantic_search():
    """Verify POST /api/v1/bills/semantic-search endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/bills/semantic-search",
            json={"query": "heart bypass surgery", "top_k": 3}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_matches"] > 0
        assert any("bypass" in r["name"].lower() or "cabg" in r["name"].lower() for r in data["results"])


@pytest.mark.asyncio
async def test_api_async_bill_upload_and_status():
    """Verify asynchronous bill audit queue and polling status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Submit async upload job
        raw_bill = """
        APOLLO HOSPITALS INVOICE
        Patient: Ramesh Sharma
        Ward Bed Charges 4 days @ 6000 = 24000
        Coronary DES Stent 1 qty = 65000
        Metformin 500mg 10 tabs = 200
        Gloves and PPE Kit = 5000
        Total Billed = 94200
        """
        upload_resp = await client.post(
            "/api/v1/bills/upload-async",
            data={
                "raw_text": raw_bill,
                "hospital_name": "Apollo Hospitals",
                "patient_name": "Ramesh Sharma",
                "days_admitted": 4
            }
        )
        assert upload_resp.status_code == 200
        upload_data = upload_resp.json()
        assert "job_id" in upload_data
        job_id = upload_data["job_id"]

        # Poll status until complete (or up to 10 iterations)
        completed = False
        final_job = None
        for _ in range(15):
            await asyncio.sleep(0.15)
            status_resp = await client.get(f"/api/v1/bills/jobs/{job_id}")
            assert status_resp.status_code == 200
            final_job = status_resp.json()
            if final_job["status"] == "COMPLETED":
                completed = True
                break

        assert completed is True
        assert final_job["progress_percent"] == 100
        assert final_job["result"] is not None
        assert final_job["result"]["total_billed"] > 0
        assert final_job["result"]["total_overcharge"] > 0


@pytest.mark.asyncio
async def test_abha_m1_sandbox_flow():
    """Verify ABHA 14-digit validation, sandbox OTP, and FHIR Bundle generation."""
    assert validate_abha_number("12-3456-7890-1234") is True
    assert validate_abha_number("12345678901234") is True
    assert validate_abha_number("123") is False

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Init OTP
        init_resp = await client.post(
            "/api/v1/abha/init-otp",
            json={"abha_id": "91-2345-6789-0123"}
        )
        assert init_resp.status_code == 200
        init_data = init_resp.json()
        assert "txn_id" in init_data
        txn_id = init_data["txn_id"]

        # 2. Verify OTP
        verify_resp = await client.post(
            "/api/v1/abha/verify-otp",
            json={"txn_id": txn_id, "otp": "123456"}
        )
        assert verify_resp.status_code == 200
        assert verify_resp.json()["status"] == "VERIFIED"

        # 3. Link Record & Generate FHIR
        link_resp = await client.post(
            "/api/v1/abha/link-record",
            json={"bill_id": "test_bill_001", "abha_id": "91-2345-6789-0123"}
        )
        assert link_resp.status_code == 200
        link_data = link_resp.json()
        assert link_data["status"] == "LINKED"
        assert "fhir_bundle" in link_data
        bundle = link_data["fhir_bundle"]
        assert bundle["resourceType"] == "Bundle"
        assert bundle["type"] == "document"
        resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
        assert "Composition" in resource_types
        assert "Patient" in resource_types
        assert "DiagnosticReport" in resource_types


@pytest.mark.asyncio
async def test_whatsapp_webhook_integration():
    """Verify WhatsApp Meta challenge verification and inbound message bill audit."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Meta Webhook Handshake Verification
        verify_resp = await client.get(
            "/api/v1/integrations/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "curaveris_whatsapp_verify_token_2026",
                "hub.challenge": "11559988"
            }
        )
        assert verify_resp.status_code == 200
        assert verify_resp.text == "11559988"

        # 2. Inbound WhatsApp Message Audit
        msg_payload = {
            "entry": [{
                "changes": [{
                    "value": {
                        "messages": [{
                            "from": "919876543210",
                            "type": "text",
                            "text": {
                                "body": "Apollo Hospitals\nBed charge: 5000\nStent: 65000\nGloves: 2000"
                            }
                        }]
                    }
                }]
            }]
        }
        msg_resp = await client.post(
            "/api/v1/integrations/whatsapp/webhook",
            json=msg_payload
        )
        assert msg_resp.status_code == 200
        data = msg_resp.json()
        assert data["status"] == "processed"
        assert "CuraVeris Patient Protection Audit" in data["whatsapp_formatted_reply"]
        assert "Total Billed" in data["whatsapp_formatted_reply"]
        assert "Next Action" in data["whatsapp_formatted_reply"]
