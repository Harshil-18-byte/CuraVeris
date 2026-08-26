"""Track B: Reliable End-to-End Hospital Billing Audit Pipeline."""

import os
import sys
import json
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

from app.ml.spatial_heatmap_engine import SpatialHeatmapEngine
from ml_training.rules.engine import DeterministicRuleEngine
from ml_training.retrieval.embed import DenseBiEncoderIndex
from ml_training.retrieval.rerank import CrossEncoderReranker


class FullAuditPipeline:
    """Orchestrates document understanding, hybrid retrieval, rule calculation, and legal explanation."""

    def __init__(self, reference_records: Optional[List[Dict[str, Any]]] = None):
        self.records = reference_records or self._load_default_references()
        self.retriever = DenseBiEncoderIndex(self.records)

    def _load_default_references(self) -> List[Dict[str, Any]]:
        ref_path = os.path.join(BASE_DIR, "data", "processed", "normalized_statutory_records.json")
        if os.path.exists(ref_path):
            try:
                with open(ref_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return [
            {"item_name": "Drug Eluting Coronary Stent (DES)", "domain": "cardiac_stents", "allowed_ceiling_inr": 38260.0, "effective_from": "2023-03-25"},
            {"item_name": "Bare Metal Stent (BMS)", "domain": "cardiac_stents", "allowed_ceiling_inr": 10509.0, "effective_from": "2023-03-25"},
            {"item_name": "Primary Knee System (Posterior Stabilized)", "domain": "orthopedic_implants", "allowed_ceiling_inr": 71000.0, "effective_from": "2023-08-16"},
            {"item_name": "Inj. Meropenem 1g IV", "domain": "essential_medicines", "allowed_ceiling_inr": 950.0, "effective_from": "2023-03-31"},
        ]

    def audit_bill(self, bill_data: Dict[str, Any]) -> Dict[str, Any]:
        hosp_name = bill_data.get("hospital_name", "Hospital")
        is_nabh = bill_data.get("is_nabh", True)
        tier = bill_data.get("tier", 1)
        admission_date = bill_data.get("admission_date", "2026-01-01")
        line_items = bill_data.get("line_items", [])

        findings = []
        total_overcharge = 0.0

        for item in line_items:
            raw_text = item.get("raw_text", "")
            cat = item.get("category", "other")
            price = float(item.get("unit_price", item.get("charged_rate", 0.0)))
            qty = float(item.get("quantity", 1.0))
            gst = float(item.get("gst_rate", 0.0))

            # 1. Hybrid Retrieval & Rerank
            candidates = self.retriever.search_candidates(raw_text, top_k=5)
            reranked = CrossEncoderReranker.rerank(raw_text, candidates, admission_date=admission_date, top_k=1)
            
            statutory_cap = None
            evidence_rec = None
            if reranked and reranked[0]["verdict"] == "SUPPORTED":
                evidence_rec = reranked[0]["record"]
                statutory_cap = float(evidence_rec.get("allowed_ceiling_inr", price))

            # 2. Deterministic Calculation Engine
            audit_res = DeterministicRuleEngine.audit_line_item(
                item_text=raw_text,
                category=cat,
                unit_price=price,
                quantity=qty,
                gst_rate=gst,
                statutory_cap=statutory_cap,
                is_nabh=is_nabh,
                tier=tier
            )

            line_overcharge = audit_res["total_line_overcharge"]
            total_overcharge += line_overcharge

            # 3. Confidence & Routing
            confidence = 0.98 if statutory_cap else (0.85 if "unbundled" in raw_text.lower() else 0.92)
            status = "CLEAR_VIOLATION" if line_overcharge > 0.0 else "CLEAR_COMPLIANT"

            findings.append({
                "line_id": item.get("item_id", "LI_001"),
                "raw_text": raw_text,
                "category": cat,
                "status": status,
                "charged_rate": price,
                "quantity": qty,
                "charged_total": round(price * qty, 2),
                "allowed_rate": audit_res["pricing_audit"]["allowed_rate"],
                "allowed_total": audit_res["pricing_audit"]["allowed_total"],
                "overcharge": line_overcharge,
                "evidence": evidence_rec,
                "confidence": confidence,
                "applicable_rule": audit_res["pricing_audit"]["rule"]
            })

        # 4. Spatial Attention Heatmaps
        heatmap = SpatialHeatmapEngine.generate_document_heatmap(line_items)

        # 5. Master Status
        overall_status = "CLEAR_VIOLATION" if total_overcharge > 0.0 else "CLEAR_COMPLIANT"
        risk_level = "CRITICAL" if total_overcharge > 10000.0 else ("WARNING" if total_overcharge > 0.0 else "LOW")

        return {
            "bill_id": bill_data.get("bill_id", "BILL_001"),
            "hospital_name": hosp_name,
            "admission_date": admission_date,
            "overall_status": overall_status,
            "risk_level": risk_level,
            "total_billed": float(bill_data.get("total_billed", sum(f["charged_total"] for f in findings))),
            "total_overcharge_detected": round(total_overcharge, 2),
            "findings": findings,
            "spatial_heatmaps": heatmap,
            "recommended_action": "Generate Section 65B Legal Dispute Letter" if total_overcharge > 0.0 else "No Overcharges Detected"
        }
