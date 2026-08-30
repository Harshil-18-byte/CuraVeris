import pytest
from app.ml.pipelines.mobile_inference_pipeline import MobileInferencePipeline

APPROVED_RISK_CATEGORIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

def test_unified_inference_taxonomy_compliance():
    """Verify that model inference output strictly adheres to the approved regulatory taxonomy."""
    pipeline = MobileInferencePipeline()
    sample_text = """
    Max Super Speciality Hospital, Saket, Delhi
    Patient: Rajesh Sharma | Bill No: INV-2026-001
    1. Coronary Drug Eluting Stent: 115000.00
    2. ICU Bed Charges (3 Days): 66000.00
    3. Paracetamol Infusion 100ml: 4800.00
    4. PPE Kit & Sanitization Overhead: 18000.00
    Total Billed: 203800.00
    """
    
    result = pipeline.audit_mobile_bill(
        raw_text=sample_text,
        patient_name="Rajesh Sharma",
        hospital_city="Delhi"
    )

    # 1. Verify risk category taxonomy
    assert result.risk_category in APPROVED_RISK_CATEGORIES, (
        f"Invalid risk category '{result.risk_category}'. Must be in {APPROVED_RISK_CATEGORIES}"
    )

    # 2. Verify all audit cards have approved taxonomy structures
    assert len(result.audit_cards) > 0
    for card in result.audit_cards:
        assert "item_name" in card
        assert "charged_amount" in card
        assert "statutory_citation" in card
        assert card["statutory_citation"] is not None and len(card["statutory_citation"]) > 0

    # 3. Verify dispute notice structure
    assert result.dispute_notice is not None
    assert "Section 2(47) of the Consumer Protection Act, 2019" in result.dispute_notice["formal_notice_text"]
