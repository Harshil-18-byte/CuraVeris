import pytest
from app.crypto.merkle import compute_leaf, compute_merkle_root
from app.crypto.evidence import build_evidence_payload, verify_evidence_payload


def test_merkle_tree_calculation():
    leaves = [
        compute_leaf("L1", "data1"),
        compute_leaf("L2", "data2"),
        compute_leaf("L3", "data3"),
    ]
    root1 = compute_merkle_root(leaves)
    assert len(root1) == 64

    # Determinism check
    root2 = compute_merkle_root(leaves)
    assert root1 == root2


def test_evidence_signing_and_verification():
    bill_data = {"id": "bill_123", "hospital": "Apollo"}
    line_items = [{"desc": "ECG", "amount": 150}]
    audit_summary = {"overcharge": 0}
    findings = []

    root, sig, payload, leaves = build_evidence_payload(
        bill_data=bill_data,
        line_items=line_items,
        audit_summary=audit_summary,
        findings=findings,
    )

    assert len(root) == 64
    assert len(sig) == 64 or len(sig) == 128

    # Verify intact payload
    res = verify_evidence_payload(
        canonical_payload=payload,
        stored_merkle_root=root,
        stored_hmac_sig=sig,
    )
    assert res["integrity_valid"] is True
    assert res["hmac_valid"] is True

    # Tampered payload check
    tampered_payload = dict(payload)
    tampered_payload["audit_summary"] = {"overcharge": 99999}
    tampered_res = verify_evidence_payload(
        canonical_payload=tampered_payload,
        stored_merkle_root=root,
        stored_hmac_sig=sig,
    )
    assert tampered_res["integrity_valid"] is False
    assert tampered_res["hmac_valid"] is False
