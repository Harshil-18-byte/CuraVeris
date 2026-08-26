from app.engine.risk_engine import risk_engine


def test_stent_nppa_violation_audit():
    metadata = {
        "hospital_name": "Apollo Hospitals",
        "days_admitted": 3,
        "is_nabh": True
    }
    items = [
        {
            "raw_text": "Coronary Stent (DES)",
            "normalized_name": "Coronary Stent Drug Eluting (DES)",
            "category": "procedure",
            "quantity": 1,
            "charged_rate": 65000.00,  # NPPA cap is 38,260
            "charged_amount": 65000.00
        },
        {
            "raw_text": "ECG 12 Lead",
            "normalized_name": "Electrocardiogram ECG",
            "category": "diagnostic",
            "quantity": 1,
            "charged_rate": 200.0,
            "charged_amount": 200.0
        },
        {
            "raw_text": "ECG 12 Lead Repeated",
            "normalized_name": "Electrocardiogram ECG",
            "category": "diagnostic",
            "quantity": 1,
            "charged_rate": 200.0,
            "charged_amount": 200.0
        }
    ]

    result = risk_engine.audit_bill(metadata, items)
    assert result["total_billed"] == 65400.00
    assert result["total_overcharge"] > 26000.00  # Stent overcharge ~26,740 + duplicate ECG 200
    assert result["risk_score"] > 50  # High or Critical risk
    
    # Check flags
    flag_types = [f["flag_type"] for f in result["flags_summary"]]
    assert "nppa_ceiling_violation" in flag_types
    assert "duplicate_charge" in flag_types


def test_dpco_medicine_violation_audit():
    metadata = {
        "hospital_name": "Max Healthcare",
        "days_admitted": 2,
        "is_nabh": True
    }
    items = [
        {
            "raw_text": "Inj. Pantoprazole 40mg",
            "normalized_name": "Pantoprazole 40mg Injection",
            "category": "pharmacy",
            "quantity": 3,
            "charged_rate": 180.00,  # DPCO cap is ~54.20
            "charged_amount": 540.00
        },
        {
            "raw_text": "GST on Hospital Room",
            "normalized_name": "GST 18%",
            "category": "tax_gst",
            "quantity": 1,
            "charged_rate": 1800.00,
            "charged_amount": 1800.00
        }
    ]

    result = risk_engine.audit_bill(metadata, items)
    assert result["total_overcharge"] > 2000.00
    flag_types = [f["flag_type"] for f in result["flags_summary"]]
    assert "above_mrp" in flag_types
    assert "gst_on_exempt" in flag_types
