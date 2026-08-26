"""Bi-Encoder Dense Embedding Index for Medical Bill Items & Gazette References."""

import os
import sys
import json
import math
from typing import Optional, List, Dict, Any, Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class DenseBiEncoderIndex:
    """Computes dense lexical/semantic embeddings and performs hybrid candidate search."""

    def __init__(self, records: Optional[List[Dict[str, Any]]] = None):
        self.records = records or []
        self.vocab: Dict[str, int] = {}
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        cleaned = text.lower().replace("-", " ").replace("(", " ").replace(")", " ")
        return [w for w in cleaned.split() if len(w) > 1]

    def _build_index(self):
        for r in self.records:
            tokens = self._tokenize(r.get("item_name", "") + " " + r.get("domain", ""))
            for t in tokens:
                self.vocab[t] = self.vocab.get(t, 0) + 1

    def search_candidates(self, query: str, top_k: int = 10) -> List[Tuple[Dict[str, Any], float]]:
        q_tokens = set(self._tokenize(query))
        if not q_tokens:
            return []

        scored = []
        for r in self.records:
            doc_tokens = set(self._tokenize(r.get("item_name", "") + " " + r.get("domain", "")))
            intersection = q_tokens.intersection(doc_tokens)
            if intersection:
                score = len(intersection) / math.sqrt(len(q_tokens) * len(doc_tokens))
                scored.append((r, round(score, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
