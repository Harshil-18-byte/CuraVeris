import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.engine.extractor import validate_file_magic_bytes
from app.engine.shap_explainer import explain_bill_risk_attribution


def test_file_magic_bytes_validation():
    """Verify anti-malware magic bytes inspection on PDF, PNG, JPEG."""
    # Authentic PDF
    pdf_bytes = b"%PDF-1.4\n%test content\n"
    assert validate_file_magic_bytes(pdf_bytes, "hospital_bill.pdf") is True

    # Fake PDF (e.g. executable renamed to .pdf)
    fake_pdf = b"MZ\x90\x00\x03\x00\x00\x00"
    assert validate_file_magic_bytes(fake_pdf, "malicious.pdf") is False

    # Authentic PNG
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    assert validate_file_magic_bytes(png_bytes, "scan.png") is True

    # Fake PNG
    fake_png = b"NotAPngImage"
    assert validate_file_magic_bytes(fake_png, "fake.png") is False

    # Authentic JPEG
    jpg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    assert validate_file_magic_bytes(jpg_bytes, "receipt.jpg") is True


def test_shap_standalone_waterfall_engine():
    """Verify deterministic SHAP local feature attribution waterfall computation."""
    audit_data = {
        "total_billed": 200000.0,
        "total_overcharge": 75000.0,
        "risk_score": 82.0,
        "flags_summary": [
            {"flag": "cghs_excess", "reason": "Procedures marked up over benchmark"},
            {"flag": "nppa_ceiling_violation", "reason": "DES Stent billed above ₹38,260 cap"},
            {"flag": "consumable_unbundled", "reason": "Gloves and PPE unbundled"}
        ]
    }
    metadata = {
        "diagnosis": "Coronary Artery Disease",
        "is_nabh": True,
        "city": "Mumbai"
    }

    shap_result = explain_bill_risk_attribution(audit_data, metadata)

    assert "baseline_risk" in shap_result
    assert shap_result["baseline_risk"] == 15.0
    assert "waterfall_attribution" in shap_result
    assert len(shap_result["waterfall_attribution"]) >= 4

    features = [a["feature"] for a in shap_result["waterfall_attribution"]]
    assert "cghs_excess_markup" in features
    assert "nppa_device_breach" in features
    assert "icd_clinical_justification" in features

    # Check risk increasers vs decreasers
    for a in shap_result["waterfall_attribution"]:
        if a["feature"] == "icd_clinical_justification":
            assert a["direction"] == "RISK_DECREASER"
            assert a["contribution_points"] < 0
        elif a["feature"] == "nppa_device_breach":
            assert a["direction"] == "RISK_INCREASER"
            assert a["contribution_points"] > 0

    assert 0 <= shap_result["explained_risk_score"] <= 100


@pytest.mark.asyncio
async def test_dpdp_user_anonymization_api():
    """Verify Digital Personal Data Protection Act 2023 Section 12 Right to Erasure endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register a test patient
        reg_payload = {
            "email": "dpdp_test_patient@example.com",
            "password": "Password123!",
            "full_name": "Ramesh Kumar Sharma",
            "phone": "+91-9988776655",
            "role": "patient"
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code in [201, 400]

        # Login to get fresh token
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "dpdp_test_patient@example.com", "password": "Password123!"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Invoke DPDP Anonymization
        anon_res = await client.post("/api/v1/auth/anonymize-me", headers=headers)
        assert anon_res.status_code == 200
        anon_data = anon_res.json()

        assert anon_data["status"] == "ANONYMIZED"
        assert "DPDP_Anonymized_Patient_" in anon_data["pseudonym"]
        assert "Digital Personal Data Protection Act 2023" in anon_data["statutory_compliance"]


@pytest.mark.asyncio
async def test_emergency_anti_detention_notice_api():
    """Verify emergency High Court cease-and-desist requisition against hospital patient detention."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "hospital_name": "Fortis Escorts Heart Institute",
            "patient_name": "Smt. Shanti Devi",
            "attendant_name": "Vikas Sharma (Son)",
            "attendant_phone": "+91-9876543210",
            "disputed_amount": 145000.0,
            "city": "New Delhi"
        }
        res = await client.post(
            "/api/v1/reports/emergency-detention-notice",
            params=payload
        )
        assert res.status_code == 200
        notice = res.json()

        assert "DETENTION_NOTICE_" in notice["notice_id"]
        assert "Bombay High Court: Association of Medical Consultants" in notice["statutory_citations"][0]
        assert "Bharatiya Nyaya Sanhita 2023 Sec 127" in notice["statutory_citations"][1]
        assert "Article 21 of the Constitution of India" in notice["statutory_citations"][2]
        assert "Police Control Room (Dial 112)" in notice["emergency_escalations"]
        assert "145,000.00" in notice["notice_body"]


@pytest.mark.asyncio
async def test_pmjay_zero_cash_compliance_audit_api():
    """Verify Ayushman Bharat PM-JAY Zero Out-of-Pocket statutory audit and SHA complaint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Case 1: Violation - Cash demanded from Ayushman patient
        payload_violation = {
            "package_name": "Total Knee Replacement (TKR)",
            "hospital_name": "City Care Super Specialty Hospital",
            "cash_demanded_inr": 35000.0,
            "total_billed_inr": 185000.0,
            "patient_pmjay_id": "PMJAY-DEL-98765432"
        }
        res = await client.post("/api/v1/bills/pmjay-audit", json=payload_violation)
        assert res.status_code == 200
        audit = res.json()

        assert audit["is_empanelment_violation"] is True
        assert audit["cash_demanded_inr"] == 35000.0
        assert audit["recommended_penalty_inr"] == 175000.0  # 5x penalty
        assert "National Health Authority (NHA) Guidelines Sec 3.2" in audit["sha_complaint_body"]
        assert "PM-JAY Operational Guidelines 3.2" in audit["nha_statutory_rule"]

        # Case 2: Compliant - Zero cash demanded
        payload_compliant = {
            "package_name": "Coronary Artery Bypass Graft (CABG)",
            "hospital_name": "Narayana Hrudayalaya",
            "cash_demanded_inr": 0.0,
            "total_billed_inr": 120000.0,
            "patient_pmjay_id": "PMJAY-KA-11223344"
        }
        res_comp = await client.post("/api/v1/bills/pmjay-audit", json=payload_compliant)
        assert res_comp.status_code == 200
        audit_comp = res_comp.json()
        assert audit_comp["is_empanelment_violation"] is False
        assert audit_comp["recommended_penalty_inr"] == 0.0
