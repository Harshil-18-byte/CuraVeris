"""Test Suite for Unified Master Ensemble & Fusion Engine."""

import os
import sys
import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from app.ml.unified_master_ensemble import UnifiedMasterAuditEnsemble


def test_unified_master_ensemble_output():
    """Verify that all 6 models combine together into one cohesive audit output."""
    ensemble = UnifiedMasterAuditEnsemble()

    test_bill = {
        "bill_id": "BILL_TEST_ENFORCED_01",
        "hospital_name": "Apollo Super Speciality Hospital",
        "admission_date": "2026-03-01",
        "tier": 1,
        "is_nabh": True,
        "line_items": [
            {
                "item_id": "ITEM_001",
                "raw_text": "DRUG ELUTING CORONARY STENT (DES)",
                "category": "implant",
                "unit_price": 65000.00,
                "quantity": 1.0,
                "gst_rate": 5.0,
                "bbox": [120, 50, 150, 900]
            },
            {
                "item_id": "ITEM_002",
                "raw_text": "INJ. MEROPENEM 1G IV",
                "category": "pharmacy",
                "unit_price": 1450.00,
                "quantity": 3.0,
                "gst_rate": 12.0,
                "bbox": [160, 50, 190, 900]
            },
            {
                "item_id": "ITEM_003",
                "raw_text": "ROUTINE ICU NURSING CHARGES",
                "category": "room_nursing",
                "unit_price": 4500.00,
                "quantity": 2.0,
                "gst_rate": 0.0,
                "bbox": [200, 50, 230, 900]
            }
        ]
    }

    result = ensemble.audit_bill_unified(test_bill)

    # 1. Verification of Unified Single Output
    assert result["bill_id"] == "BILL_TEST_ENFORCED_01"
    assert result["overall_status"] == "CLEAR_VIOLATION"
    assert len(result["models_participating"]) == 6

    # 2. Exact Financial Math
    assert result["total_billed"] == 78350.00  # (65000*1) + (1450*3) + (4500*2)
    # Overcharge: DES stent cap is 38260 -> overcharge = 26740; Meropenem cap is 950 -> overcharge = (1450-950)*3 = 1500
    assert result["total_overcharge_detected"] >= 28240.00
    assert result["total_fair_estimate"] <= result["total_billed"]

    # 3. Line Items Integration
    findings = result["findings"]
    assert len(findings) == 3

    stent_item = findings[0]
    assert stent_item["status"] == "CLEAR_VIOLATION"
    assert stent_item["severity"] == "CRITICAL"
    assert stent_item["badge_color"] == "#EF4444"
    assert stent_item["allowed_rate"] == 38260.00
    assert stent_item["bounding_box"] == [120, 50, 150, 900]
    assert "NPPA" in stent_item["plain_explanation"]
    assert stent_item["model_consensus_score"] > 0.0

    # 4. Spatial Heatmaps & Legal Dispute Notice
    assert "spatial_heatmaps" in result
    assert "STATUTORY LEGAL DISPUTE PETITION" in result["dispute_notice_markdown"]
