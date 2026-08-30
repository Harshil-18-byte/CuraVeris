import pytest
from decimal import Decimal
from app.audit_engine.statutory.cghs import audit_cghs_item
from app.audit_engine.statutory.nppa import audit_nppa_item
from app.audit_engine.statutory.dpco import audit_dpco_item
from app.audit_engine.statutory.irdai import audit_irdai_item
from app.audit_engine.statutory.gst import audit_gst_item


def test_cghs_ecg_overcharge():
    # ECG benchmark is ₹150. If charged ₹600, it must flag CGHS_OVERCHARGE
    finding = audit_cghs_item("ECG Standard Lead", Decimal("600.00"), "diagnostic")
    assert finding is not None
    assert finding["finding_type"] == "CGHS_OVERCHARGE"
    assert finding["severity"] == "HIGH"
    assert finding["benchmark_amount"] == Decimal("150")
    assert finding["overcharge_amount"] == Decimal("450.00")


def test_nppa_stent_ceiling():
    # Drug Eluting Stent cap is ₹27,890. If charged ₹65,000, must flag NPPA_VIOLATION
    finding = audit_nppa_item("Drug Eluting Stent Coronary", Decimal("65000.00"), Decimal("1.0"))
    assert finding is not None
    assert finding["finding_type"] == "NPPA_VIOLATION"
    assert finding["severity"] == "HIGH"
    assert finding["benchmark_amount"] == Decimal("27890.00")


def test_dpco_medicine_cap():
    # Paracetamol 650mg ceiling is ₹1.95. If 10 tablets charged at ₹100, must flag DPCO_VIOLATION
    finding = audit_dpco_item("Paracetamol 650mg Tablet", Decimal("100.00"), Decimal("10.0"), "drug")
    assert finding is not None
    assert finding["finding_type"] == "DPCO_VIOLATION"


def test_irdai_unbundled_overhead():
    finding = audit_irdai_item("Hospital Administrative Charges", Decimal("1500.00"))
    assert finding is not None
    assert finding["finding_type"] == "IRDAI_NON_PAYABLE"
    assert finding["overcharge_amount"] == Decimal("1500.00")


def test_gst_healthcare_exemption():
    finding = audit_gst_item("Doctor Consultation Fee", Decimal("1180.00"), Decimal("18.0"), "consultation")
    assert finding is not None
    assert finding["finding_type"] == "GST_MISAPPLICATION"
    assert finding["severity"] == "HIGH"
