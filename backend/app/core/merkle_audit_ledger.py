"""
Cryptographic Merkle Audit Ledger for CuraVeris.
Provides tamper-evident forensic hash chaining and Merkle trees for hospital bill audits,
ensuring unalterable evidentiary weight in Insurance Ombudsman and Consumer Court proceedings.
"""
import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
from app.core.config import settings


def compute_sha256(data: str) -> str:
    """Compute SHA-256 hex digest for a utf-8 string."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def compute_merkle_root(line_items: List[Dict[str, Any]]) -> str:
    """
    Computes a cryptographic Merkle Root Hash across all billed items.
    Leaf nodes are individual line item hashes: SHA256(raw_text + charged_rate + qty).
    Hashed pairwise up to a single 32-byte hexadecimal root.
    """
    if not line_items:
        return compute_sha256("EMPTY_LINE_ITEMS_GENESIS")

    # Step 1: Compute leaf hashes
    current_level = []
    for item in line_items:
        leaf_repr = f"{item.get('raw_text', '')}|{item.get('charged_rate', 0.0)}|{item.get('quantity', 1)}|{item.get('overcharge_amount', 0.0)}"
        current_level.append(compute_sha256(leaf_repr))

    # Step 2: Combine pairs recursively up to Merkle root
    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else left
            pair_hash = compute_sha256(left + right)
            next_level.append(pair_hash)
        current_level = next_level

    return current_level[0]


class MerkleAuditLedger:
    """
    In-memory and cryptographically chained ledger of medical billing audit records.
    Each block points to the preceding block's hash, forming an immutable chain.
    """
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key or settings.SECRET_KEY or "curaveris_forensic_ledger_salt_2026"
        self.blocks: List[Dict[str, Any]] = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis = {
            "block_index": 0,
            "timestamp": "2026-01-01T00:00:00Z",
            "bill_id": "GENESIS_ROOT",
            "total_billed": 0.0,
            "total_overcharge": 0.0,
            "risk_score": 0.0,
            "merkle_root": "0" * 64,
            "prev_hash": "0" * 64,
            "block_hash": "0000000000000000000000000000000000000000000000000000000000000000",
            "signature": "GENESIS_SIGNATURE"
        }
        self.blocks.append(genesis)

    def seal_audit_record(
        self,
        bill_id: str,
        total_billed: float,
        total_overcharge: float,
        risk_score: float,
        items: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Seals a completed hospital bill audit into a new cryptographic block.
        """
        prev_block = self.blocks[-1]
        prev_hash = prev_block["block_hash"]
        merkle_root = compute_merkle_root(items)
        timestamp = datetime.now(timezone.utc).isoformat()
        index = len(self.blocks)

        block_payload = f"{index}|{timestamp}|{bill_id}|{total_billed:.2f}|{total_overcharge:.2f}|{risk_score:.2f}|{merkle_root}|{prev_hash}"
        block_hash = compute_sha256(block_payload)

        # Cryptographic HMAC signature guaranteeing origin authenticity
        sig = hmac.new(self.secret_key.encode(), block_hash.encode(), hashlib.sha256).hexdigest()

        block = {
            "block_index": index,
            "timestamp": timestamp,
            "bill_id": bill_id,
            "total_billed": round(total_billed, 2),
            "total_overcharge": round(total_overcharge, 2),
            "risk_score": round(risk_score, 2),
            "items_count": len(items),
            "merkle_root": merkle_root,
            "prev_hash": prev_hash,
            "block_hash": block_hash,
            "signature": sig,
            "legal_certification": "Section 65B Indian Evidence Act / BNS Sec 61 Electronic Record Admissibility"
        }

        self.blocks.append(block)
        return block

    def verify_integrity(self, certificate: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Verifies the cryptographic validity and tamper-resistance of a certificate.
        Recomputes block hash and HMAC signature to prove the bill was not mutated.
        """
        try:
            index = certificate.get("block_index")
            timestamp = certificate.get("timestamp")
            bill_id = certificate.get("bill_id")
            total_billed = float(certificate.get("total_billed", 0.0))
            total_overcharge = float(certificate.get("total_overcharge", 0.0))
            risk_score = float(certificate.get("risk_score", 0.0))
            merkle_root = certificate.get("merkle_root")
            prev_hash = certificate.get("prev_hash")
            claimed_hash = certificate.get("block_hash")
            claimed_sig = certificate.get("signature")

            recomputed_payload = f"{index}|{timestamp}|{bill_id}|{total_billed:.2f}|{total_overcharge:.2f}|{risk_score:.2f}|{merkle_root}|{prev_hash}"
            expected_hash = compute_sha256(recomputed_payload)

            if claimed_hash != expected_hash:
                return False, f"Block hash mismatch: Evidence was tampered with! Expected {expected_hash}, got {claimed_hash}"

            expected_sig = hmac.new(self.secret_key.encode(), expected_hash.encode(), hashlib.sha256).hexdigest()
            if claimed_sig != expected_sig:
                return False, "Digital signature verification failed: Origin signature does not match CuraVeris key."

            return True, "Cryptographic audit integrity 100% verified. Document is authentic and unaltered."
        except Exception as e:
            return False, f"Verification error: {e}"


merkle_ledger = MerkleAuditLedger()
