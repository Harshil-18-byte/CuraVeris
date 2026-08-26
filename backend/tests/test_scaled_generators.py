"""Tests for Scaled Generators, Temporal Gazette, Counterfactuals & Decoupled Task Datasets."""

import pytest
import os
import json
from app.db.temporal_gazette_store import (
    init_temporal_gazette_db,
    query_temporal_nppa_ceiling,
    query_temporal_dpco_ceiling,
    get_temporal_db_connection
)
from ml_training.generators.clinical_scenario_generator import ClinicalScenarioGenerator
from ml_training.generators.counterfactual_generator import CounterfactualGenerator
from ml_training.generators.hard_negative_generator import HardNegativeGenerator
from ml_training.generators.dataset_partitioner import MultiTaskDatasetPartitioner


def test_temporal_gazette_store_queries():
    """Verify temporal NPPA and DPCO rate queries across different dates."""
    init_temporal_gazette_db()
    
    # 2026 Service Date -> 2023 WPI Adjusted Cap (₹38,260)
    res_2026 = query_temporal_nppa_ceiling("Drug Eluting Stent (DES)", "2026-04-01")
    assert res_2026 is not None
    assert res_2026["ceiling_price"] == 38260.00
    assert "S.O. 1335(E)" in res_2026["gazette_so"]

    # 2021 Historical Date -> 2020 Cap (₹30,080)
    res_2021 = query_temporal_nppa_ceiling("Drug Eluting Stent (DES)", "2021-06-15")
    assert res_2021 is not None
    assert res_2021["ceiling_price"] == 30080.00
    assert "S.O. 1234(E)" in res_2021["gazette_so"]

    # Knee Implant
    knee_res = query_temporal_nppa_ceiling("Primary TKR Knee Implant System (Cruciate Retaining)", "2026-01-10")
    assert knee_res is not None
    assert knee_res["ceiling_price"] == 63800.00

    # DPCO Drug
    panto_res = query_temporal_dpco_ceiling("Inj. Pantoprazole 40mg IV", "2026-03-01")
    assert panto_res is not None
    assert panto_res["ceiling_price"] == 54.20
    assert panto_res["is_nlem"] is True


def test_clinical_scenario_generator_pathways():
    """Verify Layer 2 clinical scenario generator produces valid, compliant bills."""
    gen = ClinicalScenarioGenerator(random_seed=123)
    bill = gen.generate_bill(1)

    assert "CLIN_SCEN_00001" == bill["bill_id"]
    assert bill["days_admitted"] > 0
    assert bill["total_billed"] > 0
    assert len(bill["line_items"]) >= 5

    # Check arithmetic consistency
    calculated_sum = round(sum(i["total_amount"] for i in bill["line_items"]), 2)
    assert abs(bill["total_billed"] - calculated_sum) < 0.01

    # Verify baseline is 100% compliant (zero violation labels)
    for item in bill["line_items"]:
        assert all(v == 0 for v in item["labels"].values())


def test_counterfactual_generator_perturbations():
    """Verify Layer 3 counterfactual generator injects exact single-variable anomalies."""
    scen_gen = ClinicalScenarioGenerator(random_seed=42)
    clean_bill = scen_gen.generate_bill(5)
    
    cf_gen = CounterfactualGenerator(random_seed=42)
    variants = cf_gen.generate_counterfactuals(clean_bill)
    assert len(variants) >= 4

    types_found = {v["counterfactual_type"] for v in variants}
    assert "price_surge" in types_found
    assert "duplicate_line" in types_found
    assert "consumable_unbundling" in types_found
    assert "unlawful_gst" in types_found

    # Verify price surge variant has the exact rate_anomaly flag
    price_var = next(v for v in variants if v["counterfactual_type"] == "price_surge")
    flagged_items = [i for i in price_var["line_items"] if i["labels"]["rate_anomaly"] == 1]
    assert len(flagged_items) >= 1


def test_hard_negative_generator_compliance():
    """Verify Layer 4 hard negatives generate complex, high-magnitude but 100% compliant bills."""
    hn_gen = HardNegativeGenerator(random_seed=42)

    # 1. Twin Stents
    b_twin = hn_gen.generate_hard_negative("twin_stents", 1)
    assert b_twin["is_hard_negative"] is True
    stent_items = [i for i in b_twin["line_items"] if "DES" in i["raw_text"]]
    assert len(stent_items) == 2
    # Both stents billed at exact NPPA cap
    for s in stent_items:
        assert s["unit_price"] == 38260.00
        assert all(v == 0 for v in s["labels"].values())

    # 2. Prolonged ICU
    b_icu = hn_gen.generate_hard_negative("prolonged_icu", 2)
    assert b_icu["days_admitted"] >= 14
    assert b_icu["total_billed"] >= 200000.00
    for item in b_icu["line_items"]:
        assert all(v == 0 for v in item["labels"].values())


def test_dataset_partitioner_multi_task_export():
    """Verify multi-task partitioner generates and exports datasets for all 6 decoupled tasks."""
    partitioner = MultiTaskDatasetPartitioner(random_seed=42)
    master_corpus = partitioner.generate_scaled_master_corpus(
        num_scenarios=20,
        include_counterfactuals=True,
        include_hard_negatives=True
    )
    assert len(master_corpus) >= 50

    counts = partitioner.export_decoupled_tasks(master_corpus)
    assert counts["task_a_document_parsing.jsonl"] > 100
    assert counts["task_b_clinical_entity_normalization.jsonl"] > 100
    assert counts["task_c_statutory_rule_retrieval.jsonl"] > 100
    assert counts["task_d_tabular_anomaly_classification.jsonl"] > 100
    assert counts["task_e_deterministic_math_audit.jsonl"] > 100
    assert counts["task_f_legal_advocacy_sft.jsonl"] >= len(master_corpus)
