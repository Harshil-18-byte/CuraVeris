"""Unit & Integration Tests for All 7 Production ML Pipelines & Mobile Inference Gateway."""

import pytest
import numpy as np
from app.ml.pipelines.document_pipeline import DocumentParsingPipeline
from app.ml.pipelines.statutory_rag_pipeline import StatutoryRAGPipeline
from app.ml.pipelines.xgboost_risk_pipeline import XGBoostRiskPipeline
from app.ml.pipelines.deep_ensemble_pipeline import DeepEnsembleRiskPipeline
from app.ml.pipelines.insurance_reconciliation_pipeline import InsuranceReconciliationPipeline
from app.ml.pipelines.legal_dispute_pipeline import LegalDisputePipeline
from app.ml.pipelines.mobile_inference_pipeline import MobileInferencePipeline, mobile_pipeline


def test_document_parsing_pipeline():
    pipeline = DocumentParsingPipeline()
    sample_text = """
    APOLLO HOSPITALS INVOICE
    Dr. A. Sharma   Date: 12/08/2026
    Coronary Stent DES Qty: 2 Rate: 65000.00 Total: 130000.00
    Paracetamol 650mg Qty: 10 Rate: 50.00 Total: 500.00
    ICU Bed Charges Qty: 3 Rate: 12000.00 Total: 36000.00
    """
    items = pipeline.parse_text_or_ocr(sample_text)
    assert len(items) >= 2
    assert any("stent" in it.item_name.lower() for it in items)
    assert any(it.category == "pharmacy" for it in items)


def test_statutory_rag_pipeline():
    pipeline = StatutoryRAGPipeline()
    sample_items = [
        {"item_name": "Drug Eluting Stent", "category": "procedure", "unit_price": 65000.0, "quantity": 1, "total_amount": 65000.0},
        {"item_name": "Paracetamol 650mg tablet", "category": "pharmacy", "unit_price": 10.0, "quantity": 10, "total_amount": 100.0},
    ]
    retrieval = pipeline.retrieve_context(sample_items)
    assert retrieval.total_items == 2
    assert len(retrieval.item_contexts) == 2


def test_xgboost_risk_pipeline():
    pipeline = XGBoostRiskPipeline()
    assert len(pipeline.label_names) == 6
    assert len(pipeline.feature_names) == 10

    # Test feature vector extraction
    features = pipeline.extract_feature_vector(
        item_price=65000.0,
        quantity=2.0,
        category="procedure",
        total_amount=130000.0,
        cghs_benchmark=25000.0,
        mrp_benchmark=30080.0,
        all_amounts=[130000.0, 500.0],
        all_quantities=[2.0, 10.0]
    )
    assert features.shape == (10,)
    assert features[0] > 1.0  # Rate vs CGHS ratio should be elevated


def test_deep_ensemble_pipeline():
    pipeline = DeepEnsembleRiskPipeline()
    dummy_X = np.random.randn(5, 10).astype(np.float32)
    res = pipeline.predict_with_confidence(dummy_X)
    assert "probabilities" in res
    assert "predictions" in res
    assert res["probabilities"].shape == (5, 6)


def test_insurance_reconciliation_pipeline():
    pipeline = InsuranceReconciliationPipeline()
    line_items = [
        {"item_name": "Surgical Gloves", "unit_price": 450.0, "category": "consumable"},
        {"item_name": "Emergency ICU Monitoring", "unit_price": 5000.0, "category": "procedure"},
    ]
    rec = pipeline.reconcile_claim(
        total_claimed=50000.0,
        total_approved=42000.0,
        line_items=line_items,
        tpa_name="MediAssist TPA"
    )
    assert rec.settlement_gap_inr == 8000.0
    assert rec.deductions_count == 2
    assert len(rec.audited_deductions) == 2


def test_legal_dispute_pipeline():
    pipeline = LegalDisputePipeline()
    overcharges = [
        {"item_name": "Drug Eluting Stent", "overcharge_amount": 35000.0, "description": "Exceeds NPPA ceiling cap"}
    ]
    notice = pipeline.generate_dispute_notice(
        hospital_name="Fortis Hospital",
        patient_name="Rahul Sharma",
        bill_id="BILL_10029",
        total_billed=185000.0,
        overcharge_items=overcharges
    )
    assert notice.total_disputed_amount_inr == 35000.0
    assert "Consumer Protection Act, 2019" in notice.formal_notice_text
    assert "Fortis Hospital" in notice.formal_notice_text


def test_unified_mobile_inference_pipeline_latency_and_payload():
    pipeline = MobileInferencePipeline()
    raw_bill = """
    MAX HEALTHCARE INVOICE
    Patient: Amit Kumar
    Coronary Stent DES Qty: 1 Rate: 75000.00 Total: 75000.00
    ICU Bed Charges Qty: 2 Rate: 15000.00 Total: 30000.00
    Syringe and Consumables Qty: 1 Rate: 4500.00 Total: 4500.00
    """
    res = pipeline.audit_mobile_bill(
        raw_text=raw_bill,
        hospital_name="Max Healthcare",
        patient_name="Amit Kumar",
        hospital_city="Delhi",
        total_claimed_insurance=109500.0,
        total_approved_insurance=85000.0
    )

    # Verify mobile payload requirements
    assert res.audit_id.startswith("AUDIT_")
    assert res.total_billed_inr > 0
    assert res.risk_category in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert len(res.audit_cards) >= 2
    assert res.dispute_notice is not None
    assert res.inference_time_ms < 3000.0  # Fast sub-3-second response for mobile app



