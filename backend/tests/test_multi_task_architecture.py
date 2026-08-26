"""Test Suite for Multi-Task Dataset Architecture, Spatial Heatmaps, and Adversarial Challenge Suite."""

import os
import sys
import json
import pytest

# Ensure app and src packages are in path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, os.path.join(ROOT_DIR, "src"))

from app.ml.spatial_heatmap_engine import SpatialHeatmapEngine


def test_spatial_heatmap_generation_and_badges():
    """Verify that spatial heatmap engine outputs valid 2D coordinates and severity badges."""
    sample_lines = [
        {
            "item_id": "LI_001",
            "raw_text": "Coronary Stent - Drug Eluting (DES) LAD Artery",
            "unit_price": 65000.0,
            "quantity": 1.0,
            "labels": {"nppa_ceiling_violation": 1, "rate_anomaly": 1}
        },
        {
            "item_id": "LI_002",
            "raw_text": "Surgical Disposable Gloves 7.5 Unbundled",
            "unit_price": 250.0,
            "quantity": 2.0,
            "labels": {"consumable_unbundled": 1}
        },
        {
            "item_id": "LI_003",
            "raw_text": "Routine Nursing Care & Bed Maintenance",
            "unit_price": 1200.0,
            "quantity": 3.0,
            "labels": {}
        }
    ]

    heatmap = SpatialHeatmapEngine.generate_document_heatmap(sample_lines)
    assert len(heatmap) == 3

    # Check first line (Critical violation)
    assert heatmap[0]["badge_info"]["badge"] == "STATUTORY_VIOLATION"
    assert heatmap[0]["badge_info"]["color_hex"] == "#EF4444"
    assert heatmap[0]["bbox_2d"][0] >= 0  # ymin
    assert heatmap[0]["bbox_2d"][3] <= 1000  # xmax

    # Check second line (Warning / Unbundled)
    assert heatmap[1]["badge_info"]["badge"] == "STATUTORY_VIOLATION" or heatmap[1]["badge_info"]["severity"] in ["CRITICAL", "WARNING"]

    # Check third line (Compliant)
    assert heatmap[2]["badge_info"]["badge"] == "COMPLIANT"
    assert heatmap[2]["badge_info"]["color_hex"] == "#10B981"


def test_shap_waterfall_decomposition():
    """Verify SHAP marginal feature contributions for a statutory overcharge."""
    waterfall = SpatialHeatmapEngine.generate_shap_waterfall(
        item_text="Coronary Stent Everolimus DES",
        unit_price=65000.0,
        statutory_cap=38260.0,
        is_nabh=True
    )
    assert len(waterfall) >= 2
    # Ensure ceiling breach contributed positive risk
    statutory_entry = [e for e in waterfall if "Statutory Ceiling" in e["feature"]][0]
    assert statutory_entry["direction"] == "POSITIVE_RISK"
    assert statutory_entry["contribution"] > 20.0


def test_adversarial_challenge_suite_integrity():
    """Verify that adversarial challenge suite contains the required perturbation classes."""
    challenge_path = os.path.join(ROOT_DIR, "data", "evaluation", "challenge", "adversarial_challenge_suite.json")
    assert os.path.exists(challenge_path), "Challenge suite JSON must exist"

    with open(challenge_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    assert len(cases) >= 4
    case_types = [c["type"] for c in cases]
    assert "subtle_penny_overcharge" in case_types
    assert "dosage_strength_confusion" in case_types
    assert "ocr_character_substitution" in case_types
    assert "historical_vs_current_statute_mismatch" in case_types


def test_multi_task_datasets_non_empty():
    """Verify that all decoupled training task files are created and populated."""
    tasks = [
        "data/training/extraction/task_a_document_extraction.jsonl",
        "data/training/normalization/task_b_entity_normalization.jsonl",
        "data/training/classification/task_c_risk_classification.jsonl",
        "data/training/retrieval/task_d_evidence_retrieval.jsonl",
        "data/training/audit/task_e_audit_sft_instructions.jsonl",
        "data/training/counterfactual/counterfactual_bills.jsonl",
        "data/training/hard_negative/hard_negative_bills.jsonl",
        "data/evaluation/gold/gold_benchmark_500.jsonl"
    ]

    for rel_path in tasks:
        full_path = os.path.join(ROOT_DIR, rel_path)
        assert os.path.exists(full_path), f"Task dataset {rel_path} must exist"
        with open(full_path, "r", encoding="utf-8") as f:
            lines = [l for l in f if l.strip()]
        assert len(lines) > 0, f"Task dataset {rel_path} must contain at least 1 record"
