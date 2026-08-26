"""Pipeline 2: Statutory Semantic RAG Retrieval Pipeline.

Orchestrates semantic vector lookup and statutory price ceiling capping across:
- CGHS Tariffs (Procedures, Bed charges, Consultations)
- NPPA Gazette Orders (Coronary Stents, Knee Implants, Pacemakers, IOLs)
- DPCO NLEM Price Schedules (Essential Medicines & Formulations)
"""

import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

from app.db.chroma_client import get_chroma_client, init_chroma_collections
from app.core.logging import logger


@dataclass
class MatchedRate:
    collection_name: str
    matched_name: str
    similarity_score: float
    rate_non_nabh: Optional[float] = None
    rate_nabh: Optional[float] = None
    ceiling_price: Optional[float] = None
    mrp: Optional[float] = None
    category: Optional[str] = None
    statutory_reference: Optional[str] = None


@dataclass
class ItemMatchedContext:
    item_id: str
    item_name: str
    category: str
    charged_rate: float
    charged_amount: float
    quantity: float
    top_matches: List[MatchedRate] = field(default_factory=list)
    best_match: Optional[MatchedRate] = None
    applicable_benchmark: Optional[float] = None
    is_overcharged: bool = False
    overcharge_amount: float = 0.0
    statutory_citation: Optional[str] = None


@dataclass
class RetrievedContext:
    total_items: int
    matched_items_count: int
    total_potential_overcharge: float
    item_contexts: List[ItemMatchedContext]


class StatutoryRAGPipeline:
    """Production Statutory Semantic RAG Retriever for Mobile & Web Billing Audits."""

    def __init__(self, similarity_threshold: float = 0.72):
        self.similarity_threshold = similarity_threshold
        try:
            self.collections = init_chroma_collections()
        except Exception as exc:
            logger.warning(f"ChromaDB initialization deferred: {exc}")
            self.collections = {}

    def index_collections(self) -> Dict[str, int]:
        """Ensures all 3 vector collections are initialized and populated."""
        self.collections = init_chroma_collections()
        return {name: coll.count() for name, coll in self.collections.items()}

    def retrieve_context(
        self,
        bill_items: List[Any],
        similarity_threshold: Optional[float] = None
    ) -> RetrievedContext:
        """Query ChromaDB across CGHS, NPPA, and DPCO collections."""
        threshold = similarity_threshold if similarity_threshold is not None else self.similarity_threshold
        item_contexts: List[ItemMatchedContext] = []
        matched_count = 0
        total_overcharge = 0.0

        for it in bill_items:
            if isinstance(it, dict):
                item_id = str(it.get("id") or it.get("line_number") or "")
                item_name = str(it.get("normalized_name") or it.get("item_name") or it.get("raw_text") or "")
                category = str(it.get("category", "other"))
                charged_rate = float(it.get("charged_rate") or it.get("unit_price") or 0.0)
                quantity = float(it.get("quantity", 1.0))
                charged_amount = float(it.get("charged_amount") or it.get("total_amount") or (charged_rate * quantity))
            else:
                item_id = str(getattr(it, "id", None) or getattr(it, "line_number", None) or "")
                item_name = str(getattr(it, "normalized_name", None) or getattr(it, "raw_text", None) or getattr(it, "item_name", "") or "")
                category = str(getattr(it, "category", "other") or "")
                charged_rate = float(getattr(it, "charged_rate", None) or getattr(it, "unit_price", 0.0) or 0.0)
                quantity = float(getattr(it, "quantity", 1.0) or 1.0)
                charged_amount = float(getattr(it, "charged_amount", None) or getattr(it, "total_amount", 0.0) or (charged_rate * quantity))

            context = ItemMatchedContext(
                item_id=item_id,
                item_name=item_name,
                category=category,
                charged_rate=charged_rate,
                charged_amount=charged_amount,
                quantity=quantity,
            )

            all_candidate_matches: List[MatchedRate] = []

            # 1. Search NPPA Collection (Devices, Implants, Gazette Drugs)
            nppa_matches = self._query_collection("nppa_collection", item_name, top_k=3)
            all_candidate_matches.extend(nppa_matches)

            # 2. Search DPCO Collection (Medicines & Formulations)
            dpco_matches = self._query_collection("dpco_collection", item_name, top_k=3)
            all_candidate_matches.extend(dpco_matches)

            # 3. Search CGHS Collection (Procedures, Wards & Consultations)
            cghs_matches = self._query_collection("cghs_collection", f"{item_name} {category}".strip(), top_k=3)
            all_candidate_matches.extend(cghs_matches)

            # Filter by threshold and take top 3
            filtered = [m for m in all_candidate_matches if m.similarity_score >= threshold]
            filtered.sort(key=lambda x: x.similarity_score, reverse=True)
            top_3 = filtered[:3]
            context.top_matches = top_3

            if top_3:
                matched_count += 1
                best = top_3[0]
                context.best_match = best

                benchmark_val = None
                ref_law = None

                if best.ceiling_price is not None:
                    benchmark_val = best.ceiling_price
                    ref_law = "NPPA Gazette Price Cap Order under DPCO 2013"
                elif best.mrp is not None:
                    benchmark_val = best.mrp
                    ref_law = "DPCO 2013 & Essential Commodities Act 1955"
                elif best.rate_nabh is not None:
                    benchmark_val = best.rate_nabh
                    ref_law = "CGHS Benchmark Rate Schedule"

                context.applicable_benchmark = benchmark_val
                context.statutory_citation = ref_law

                if benchmark_val is not None and charged_rate > benchmark_val:
                    excess_per_unit = charged_rate - benchmark_val
                    overcharge = round(excess_per_unit * quantity, 2)
                    context.is_overcharged = True
                    context.overcharge_amount = overcharge
                    total_overcharge += overcharge

            item_contexts.append(context)

        return RetrievedContext(
            total_items=len(bill_items),
            matched_items_count=matched_count,
            total_potential_overcharge=round(total_overcharge, 2),
            item_contexts=item_contexts,
        )

    def _query_collection(self, coll_name: str, query_text: str, top_k: int = 3) -> List[MatchedRate]:
        matches: List[MatchedRate] = []
        if not self.collections or coll_name not in self.collections:
            return matches

        coll = self.collections[coll_name]
        try:
            results = coll.query(query_texts=[query_text], n_results=top_k)
            if not results or not results.get("documents"):
                return matches

            docs = results["documents"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
            distances = results["distances"][0] if results.get("distances") else [0.5] * len(docs)

            for doc, meta, dist in zip(docs, metadatas, distances):
                sim_score = max(0.0, min(1.0, 1.0 - float(dist)))
                m = MatchedRate(
                    collection_name=coll_name,
                    matched_name=doc,
                    similarity_score=round(sim_score, 4),
                    rate_non_nabh=meta.get("rate_non_nabh"),
                    rate_nabh=meta.get("rate_nabh"),
                    ceiling_price=meta.get("ceiling_price"),
                    mrp=meta.get("mrp"),
                    category=meta.get("category"),
                )
                matches.append(m)
        except Exception as exc:
            logger.debug(f"Query error on {coll_name}: {exc}")

        return matches
