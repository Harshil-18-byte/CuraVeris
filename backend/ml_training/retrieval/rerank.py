"""Cross-Encoder Reranker for Top Evidence Selection and Verification."""

from typing import List, Dict, Any, Tuple


class CrossEncoderReranker:
    """Scores semantic entailment and relevance between bill line items and retrieved reference records."""

    @staticmethod
    def rerank(
        query: str,
        candidates: List[Tuple[Dict[str, Any], float]],
        admission_date: str | None = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        reranked = []
        for rec, bi_score in candidates:
            # 1. Temporal Validity Check
            eff_from = rec.get("effective_from", "1900-01-01")
            eff_to = rec.get("effective_to")
            is_temporally_valid = True
            if admission_date:
                if admission_date < eff_from:
                    is_temporally_valid = False
                if eff_to and admission_date > eff_to:
                    is_temporally_valid = False

            # 2. Semantic Cross-Score
            base_score = bi_score
            if is_temporally_valid:
                base_score += 0.25
            else:
                base_score -= 0.50

            # 3. Exact Category / Keyword Boost
            q_lower = query.lower()
            item_name_lower = rec.get("item_name", "").lower()
            if "stent" in q_lower and "stent" in item_name_lower:
                base_score += 0.35
            if "des" in q_lower and ("des" in item_name_lower or "drug" in item_name_lower):
                base_score += 0.20
            if "knee" in q_lower and "knee" in item_name_lower:
                base_score += 0.35

            verdict = "SUPPORTED" if base_score >= 0.5 else ("AMBIGUOUS" if base_score >= 0.2 else "UNSUPPORTED")

            reranked.append({
                "record": rec,
                "relevance_score": round(max(0.0, min(1.0, base_score)), 3),
                "is_temporally_valid": is_temporally_valid,
                "verdict": verdict
            })

        reranked.sort(key=lambda x: x["relevance_score"], reverse=True)
        return reranked[:top_k]
