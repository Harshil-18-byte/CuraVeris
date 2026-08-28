import pytest

from app.engine.evidence_engine import EvidenceEngine, EvidenceReference


def test_verified_liability_evidence_is_source_backed():
    references = [
        EvidenceReference("invoice_total", "218400", "hospital_bill.pdf", page=7, confidence=0.98),
        EvidenceReference("insurance_contribution", "140000", "insurance.pdf", page=3, confidence=0.99),
        EvidenceReference("tpa_adjustment", "5000", "tpa.pdf", page=2, confidence=0.97),
    ]
    EvidenceEngine.validate_critical_fields(references)
    chain = EvidenceEngine.verified_responsibility(*references)

    assert chain.result_name == "verified_patient_responsibility"
    assert len(chain.references) == 3
    assert chain.references[0].page == 7


def test_evidence_rejects_missing_source_or_invalid_confidence():
    with pytest.raises(ValueError):
        EvidenceEngine.validate_critical_fields([EvidenceReference("total", 1, "")])
    with pytest.raises(ValueError):
        EvidenceEngine.validate_critical_fields([EvidenceReference("total", 1, "bill.pdf", confidence=1.1)])
