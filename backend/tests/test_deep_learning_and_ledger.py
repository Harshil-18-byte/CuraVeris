import pytest
import numpy as np
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ml.deep_risk_network import DeepRiskNeuralNetwork, HybridRiskEnsemble
from app.core.merkle_audit_ledger import merkle_ledger, compute_merkle_root
from app.engine.icd10_coding_engine import resolve_clinical_icd10


def test_deep_neural_network_fit_and_predict():
    """Verify Deep Neural Network (MLP 128-64-32) training, activation, and shapes."""
    np.random.seed(42)
    X_dummy = np.random.uniform(0.5, 3.0, size=(100, 15)).astype(np.float32)
    Y_dummy = (np.random.uniform(0, 1, size=(100, 7)) > 0.65).astype(np.int32)

    nn = DeepRiskNeuralNetwork(random_state=42, max_iter=20)
    nn.fit(X_dummy, Y_dummy)

    probas = nn.predict_proba(X_dummy[:10])
    assert probas.shape == (10, 7)
    assert np.all((probas >= 0.0) & (probas <= 1.0))

    preds = nn.predict(X_dummy[:10], threshold=0.5)
    assert preds.shape == (10, 7)
    assert set(np.unique(preds)).issubset({0, 1})


def test_hybrid_ensemble_predictions_and_mc_uncertainty():
    """Verify Hybrid Stacking Ensemble blending and Monte Carlo uncertainty estimation."""
    np.random.seed(123)
    X_dummy = np.random.uniform(0.5, 2.5, size=(40, 15)).astype(np.float32)
    Y_dummy = (np.random.uniform(0, 1, size=(40, 7)) > 0.7).astype(np.int32)

    from sklearn.ensemble import RandomForestClassifier
    from sklearn.multioutput import MultiOutputClassifier

    tree_model = MultiOutputClassifier(RandomForestClassifier(n_estimators=10, random_state=123))
    tree_model.fit(X_dummy, Y_dummy)

    nn_model = DeepRiskNeuralNetwork(random_state=123, max_iter=20)
    nn_model.fit(X_dummy, Y_dummy)

    ensemble = HybridRiskEnsemble(tree_model=tree_model, nn_model=nn_model, nn_weight=0.45)
    blended_p = ensemble.predict_proba(X_dummy[:5])

    assert blended_p.shape == (5, 7)
    assert np.all((blended_p >= 0.0) & (blended_p <= 1.0))

    # Monte Carlo Dropout Uncertainty Estimation
    uncertainty_report = ensemble.estimate_uncertainty(X_dummy[:5], num_passes=8)
    assert "mean_probabilities" in uncertainty_report
    assert "uncertainty_std" in uncertainty_report
    assert len(uncertainty_report["per_sample_details"]) == 5

    # Check uncertainty fields for each violation flag
    sample0 = uncertainty_report["per_sample_details"][0]
    assert "nppa_ceiling_violation" in sample0
    assert "epistemic_uncertainty_std" in sample0["nppa_ceiling_violation"]
    assert "confidence_tier" in sample0["nppa_ceiling_violation"]


def test_merkle_audit_ledger_sealing_and_tamper_detection():
    """Verify cryptographic Merkle hash chaining, audit block sealing, and tamper detection."""
    items = [
        {"raw_text": "Coronary Stent - Drug Eluting (DES)", "charged_rate": 65000.0, "quantity": 1, "overcharge_amount": 26740.0},
        {"raw_text": "Sterile Gloves Box", "charged_rate": 3500.0, "quantity": 1, "overcharge_amount": 2800.0}
    ]

    # 1. Compute Merkle root
    root = compute_merkle_root(items)
    assert isinstance(root, str)
    assert len(root) == 64  # SHA-256 length

    # 2. Seal block
    cert = merkle_ledger.seal_audit_record(
        bill_id="TEST_BILL_FORENSIC_001",
        total_billed=68500.0,
        total_overcharge=29540.0,
        risk_score=84.2,
        items=items
    )

    assert cert["block_index"] > 0
    assert len(cert["block_hash"]) == 64
    assert len(cert["signature"]) == 64

    # 3. Verify valid certificate
    valid, msg = merkle_ledger.verify_integrity(cert)
    assert valid is True
    assert "100% verified" in msg

    # 4. Tamper with certificate and assert detection
    tampered_cert = dict(cert)
    tampered_cert["total_overcharge"] = 5000.0  # Fraudulent alteration!
    tampered_valid, tamper_msg = merkle_ledger.verify_integrity(tampered_cert)
    assert tampered_valid is False
    assert "tampered with" in tamper_msg


def test_icd10_and_snomed_clinical_resolution():
    """Verify automated ICD-10, SNOMED-CT, and ALOS length of stay benchmarking."""
    # Test 1: STEMI
    res1 = resolve_clinical_icd10("Acute anterior wall STEMI", days_in_hospital=2)
    assert res1["matched"] is True
    assert res1["icd10_code"] == "I21.09"
    assert res1["snomed_concept_id"] == "233829009"
    assert res1["alos_compliance"] == "OPTIMAL_STAY"

    # Test 2: Knee Osteoarthritis with excessive length of stay (Bed-blocking alert)
    res2 = resolve_clinical_icd10("Severe bilateral knee osteoarthritis for TKR", days_in_hospital=10)
    assert res2["matched"] is True
    assert res2["icd10_code"] == "M17.11"
    assert res2["alos_compliance"] == "EXCESSIVE_STAY_FLAG"
    assert "bed-blocking" in res2["alos_finding"].lower()


@pytest.mark.asyncio
async def test_api_heatmap_certificate_and_icd10_endpoints():
    """Verify REST endpoints for heatmap matrix, cryptographic certificates, and ICD-10."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. 2D Fraud Heatmap
        r_heatmap = await client.get("/api/v1/bills/demo_bill_123/heatmap")
        assert r_heatmap.status_code == 200
        hm_data = r_heatmap.json()
        assert "heatmap_matrix" in hm_data
        assert len(hm_data["heatmap_matrix"]) > 0
        assert "statutory_rate_breach" in hm_data["axes"]
        assert "composite_item_risk" in hm_data["heatmap_matrix"][0]

        # 2. Audit Certificate & Verification
        r_cert = await client.get("/api/v1/bills/demo_bill_123/audit-certificate")
        assert r_cert.status_code == 200
        cert = r_cert.json()
        assert "block_hash" in cert
        assert "merkle_root" in cert

        # Verify certificate
        r_verify = await client.post("/api/v1/bills/verify-ledger", json=cert)
        assert r_verify.status_code == 200
        assert r_verify.json()["is_valid"] is True

        # 3. ICD-10 Resolution
        r_icd = await client.post(
            "/api/v1/bills/resolve-icd10",
            json={"diagnostic_text": "Calculus of Gallbladder with Cholecystitis", "days_in_hospital": 2}
        )
        assert r_icd.status_code == 200
        icd_data = r_icd.json()
        assert icd_data["icd10_code"] == "K80.00"
        assert icd_data["specialty"] == "General & Laparoscopic Surgery"
