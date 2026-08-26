"""
Comprehensive Unit Tests for Advanced Breakthrough Features:
1. Financial Toxicity (FRM) Engine
2. Real-Time Interim Admission Monitor
3. GST Shadow Billing Discrepancy Detector
4. Surgical Implant Registry & Patient Card Generator
5. LLM Fine-Tuning Dataset Schema (Approach 2)
6. Geriatric Surcharges & Mental Healthcare Act 2017 Parity
"""
import pytest
from app.engine.financial_toxicity import calculate_financial_toxicity, calculate_emi
from app.engine.admission_monitor import monitor_interim_admission_bill
from app.engine.shadow_bill_detector import check_gst_invoice_compliance
from app.engine.implant_registry import verify_surgical_implant_and_generate_card
from app.engine.risk_engine import risk_engine
from app.ml.fine_tuning_generator import generate_llm_training_example


def test_financial_toxicity_scoring():
    """Verify FRM calculation of income shock, DSTI, and safety net matching."""
    res = calculate_financial_toxicity(
        total_billed=200000.0,
        patient_payable=70000.0,
        annual_household_income=240000.0,
        liquid_savings=25000.0,
        insurance_approved=130000.0,
        payment_method="emi",
        has_prior_debt=True,
        state="Maharashtra"
    )
    assert res["financial_toxicity_score"] > 50.0
    assert "HIGH" in res["category"] or "CRITICAL" in res["category"]
    assert res["metrics"]["emi_distress_active"] is True
    assert res["metrics"]["estimated_24m_emi_inr"] > 0
    # Must unlock PM-JAY and CMRF
    scheme_names = [s["scheme_name"] for s in res["eligible_safety_nets"]]
    assert any("PM-JAY" in name for name in scheme_names)
    assert any("Relief" in name for name in scheme_names)


def test_interim_admission_burn_rate():
    """Verify CEA daily itemized burn monitoring and warning alerts."""
    res = monitor_interim_admission_bill(
        patient_name="Ramesh Gupta",
        hospital_name="Apollo Hospitals",
        admission_date="2026-08-20",
        current_date="2026-08-23",
        primary_diagnosis="Coronary Artery Disease (CAD)",
        room_category="private",
        current_interim_total=280000.0,
        advance_deposit_requested=100000.0
    )
    assert res["days_elapsed"] == 3
    assert res["burn_rate_ratio"] > 1.30
    assert res["is_burn_exceeded"] is True
    assert res["alert_status"] == "WARNING_HIGH_BURN"
    assert "Clinical Establishments Act" in res["whatsapp_sms_advisory"]


def test_gst_shadow_bill_detection():
    """Verify detection of dual-accounting and unlawful healthcare GST."""
    res = check_gst_invoice_compliance(
        gstin="27AABCA1234F1Z5",
        invoice_number="INV-9901",
        total_billed_patient=150000.0,
        declared_taxable_value=100000.0,
        gst_collected_from_patient=15000.0,
        room_daily_tariff=3500.0,
        is_icu=False
    )
    assert res["shadow_billing_detected"] is True
    assert res["discrepancy_inr"] == 50000.0
    assert "GST_SHADOW_BILL_DISCREPANCY" in res["flags"]
    assert "UNLAWFUL_HEALTHCARE_GST" in res["flags"]
    assert len(res["recommended_statutory_actions"]) > 0


def test_surgical_implant_card_generation():
    """Verify NPPA ceiling check and statutory Patient Implant Card generation."""
    res = verify_surgical_implant_and_generate_card(
        patient_name="Sunita Sharma",
        hospital_name="Fortis Healthcare",
        surgeon_name="Dr. K. S. Murthy",
        implant_name="Coronary Stent - Drug Eluting (DES)",
        billed_price_inr=65000.0,
        batch_or_lot_number="LOT-DES-990",
        serial_or_udi="UDI-DES-001"
    )
    assert res["is_overcharged"] is True
    assert res["nppa_ceiling_inr"] == 38260.0
    assert res["excess_billed_inr"] == 65000.0 - 38260.0
    assert "PATIENT IMPLANT CARD" in res["implant_card"]["title"]
    assert res["implant_card"]["device_specifications"]["mri_safety_status"] is not None


def test_fine_tuning_jsonl_dataset_schema():
    """Verify Approach 2 training pairs format matches OpenAI / Mistral standards."""
    ex = generate_llm_training_example(1)
    assert "messages" in ex
    assert len(ex["messages"]) == 3
    assert ex["messages"][0]["role"] == "system"
    assert ex["messages"][1]["role"] == "user"
    assert ex["messages"][2]["role"] == "assistant"
    # Ensure raw bill text contains Indian rupee and hospital markers
    assert "INVOICE / DISCHARGE BILL" in ex["messages"][1]["content"]
    assert "Rs." in ex["messages"][1]["content"]


def test_geriatric_and_mental_health_rules():
    """Verify Consumer Protection Act and Mental Healthcare Act rules in RiskAuditEngine."""
    metadata = {
        "patient_age": 72,
        "days_admitted": 3,
        "primary_diagnosis": "Bipolar Disorder Severe Depression (ICD-10 F31)",
        "is_nabh": True
    }
    items = [
        {
            "raw_text": "Elderly fall risk monitoring and confusion assessment charge",
            "normalized_name": "geriatric fall risk monitoring and elderly care",
            "category": "service",
            "quantity": 3,
            "charged_rate": 1800.0,
            "charged_amount": 5400.0
        },
        {
            "raw_text": "Non-payable deduction under psychiatric illness exclusion",
            "normalized_name": "psychiatric exclusion deduction",
            "category": "service",
            "quantity": 1,
            "charged_rate": 40000.0,
            "charged_amount": 40000.0
        }
    ]
    razorpay_gap = {"patient_unjust_gap": 25000.0, "is_emi": True}

    audit = risk_engine.audit_bill(metadata, items, razorpay_gap)
    flag_keys = [f["flag_type"] for f in audit["flags_summary"]]
    assert "geriatric_arbitrary_surcharge" in flag_keys
    assert "mental_healthcare_act_violation" in flag_keys
    assert "emi_payment_financial_stress" in flag_keys
    assert audit["risk_score"] >= 50.0
