import hashlib
from typing import List


def compute_leaf(label: str, data: str) -> str:
    """Computes SHA-256 leaf hash for a labeled payload segment."""
    payload = f"{label}:{data}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def compute_merkle_root(leaves: List[str]) -> str:
    """
    Computes a binary Merkle tree root hash from an ordered list of leaf hashes.
    Duplicates the last leaf if count is odd.
    """
    if not leaves:
        return hashlib.sha256(b"").hexdigest()

    current_level = list(leaves)

    while len(current_level) > 1:
        next_level: List[str] = []
        if len(current_level) % 2 == 1:
            current_level.append(current_level[-1])

        for i in range(0, len(current_level), 2):
            combined = f"{current_level[i]}{current_level[i+1]}".encode("utf-8")
            parent_hash = hashlib.sha256(combined).hexdigest()
            next_level.append(parent_hash)

        current_level = next_level

    return current_level[0]
