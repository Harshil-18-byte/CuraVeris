import json
import hmac
import hashlib
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Tuple
from uuid import UUID
from app.core.config import settings
from app.crypto.merkle import compute_leaf, compute_merkle_root


def _json_serial(obj: Any) -> Any:
    if isinstance(obj, (datetime,)):
        return obj.isoformat()
    if isinstance(obj, (Decimal, UUID)):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


def canonicalize(data: Any) -> str:
    """Produces deterministic RFC 8785 style canonical JSON string."""
    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        default=_json_serial,
    )


def build_evidence_payload(
    bill_data: Dict[str, Any],
    line_items: List[Dict[str, Any]],
    audit_summary: Dict[str, Any],
    findings: List[Dict[str, Any]],
    statutory_version: str = "1.0.0",
    ml_version: str = "xgb_mlp_ensemble_v1",
) -> Tuple[str, str, Dict[str, Any], List[str]]:
    """
    Constructs the 7 canonical leaves, computes Merkle root and HMAC-SHA256 signature.
    Returns: (merkle_root, hmac_signature, canonical_payload, leaf_hashes)
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    c_bill = canonicalize(bill_data)
    c_items = canonicalize(line_items)
    c_audit = canonicalize(audit_summary)
    c_findings = canonicalize(findings)
    c_stat = canonicalize({"statutory_version": statutory_version})
    c_ml = canonicalize({"ml_version": ml_version})
    c_ts = canonicalize({"timestamp": now_iso})

    leaves = [
        compute_leaf("BILL_METADATA", c_bill),
        compute_leaf("LINE_ITEMS", c_items),
        compute_leaf("AUDIT_SUMMARY", c_audit),
        compute_leaf("FINDINGS", c_findings),
        compute_leaf("STATUTORY_REF_VERSION", c_stat),
        compute_leaf("ML_MODEL_VERSION", c_ml),
        compute_leaf("TIMESTAMP", c_ts),
    ]

    merkle_root = compute_merkle_root(leaves)

    canonical_payload = {
        "bill_metadata": bill_data,
        "line_items": line_items,
        "audit_summary": audit_summary,
        "findings": findings,
        "statutory_version": statutory_version,
        "ml_version": ml_version,
        "timestamp": now_iso,
        "merkle_root": merkle_root,
    }

    full_canonical_str = canonicalize(canonical_payload)
    hmac_sig = hmac.new(
        settings.EVIDENCE_HMAC_SECRET.encode("utf-8"),
        full_canonical_str.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return merkle_root, hmac_sig, canonical_payload, leaves


def verify_evidence_payload(
    canonical_payload: Dict[str, Any],
    stored_merkle_root: str,
    stored_hmac_sig: str,
) -> Dict[str, bool]:
    """Verifies Merkle root consistency and HMAC signature validity."""
    leaves = [
        compute_leaf("BILL_METADATA", canonicalize(canonical_payload.get("bill_metadata", {}))),
        compute_leaf("LINE_ITEMS", canonicalize(canonical_payload.get("line_items", []))),
        compute_leaf("AUDIT_SUMMARY", canonicalize(canonical_payload.get("audit_summary", {}))),
        compute_leaf("FINDINGS", canonicalize(canonical_payload.get("findings", []))),
        compute_leaf("STATUTORY_REF_VERSION", canonicalize({"statutory_version": canonical_payload.get("statutory_version", "")})),
        compute_leaf("ML_MODEL_VERSION", canonicalize({"ml_version": canonical_payload.get("ml_version", "")})),
        compute_leaf("TIMESTAMP", canonicalize({"timestamp": canonical_payload.get("timestamp", "")})),
    ]

    recomputed_root = compute_merkle_root(leaves)
    integrity_valid = (recomputed_root == stored_merkle_root)

    full_canonical_str = canonicalize(canonical_payload)
    recomputed_hmac = hmac.new(
        settings.EVIDENCE_HMAC_SECRET.encode("utf-8"),
        full_canonical_str.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    hmac_valid = hmac.compare_digest(recomputed_hmac, stored_hmac_sig)

    return {
        "integrity_valid": integrity_valid,
        "hmac_valid": hmac_valid,
        "recomputed_root": recomputed_root,
    }
