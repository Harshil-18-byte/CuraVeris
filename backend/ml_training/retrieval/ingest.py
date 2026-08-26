"""Government Reference Document Ingestion and Temporal Store for RAG."""

import os
import sys
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))


class ReferenceIngestor:
    """Ingests statutory pricing notices (NPPA, DPCO, CGHS) into structured temporal records."""

    def __init__(self, output_path: Optional[str] = None):
        self.output_path = output_path or os.path.join(
            BASE_DIR, "ml_training", "data", "normalized", "reference_records", "statutory_records.json"
        )
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)

    def ingest_records(self, raw_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        structured_list = []
        for r in raw_records:
            raw_text = r.get("item_name", "") + " " + str(r.get("allowed_ceiling_inr", ""))
            sha = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()

            record = {
                "record_id": f"REF_{sha[:12].upper()}",
                "document_id": r.get("gazette_so", "GOVT_NOTICE"),
                "source": r.get("source", "NPPA"),
                "domain": r.get("domain", "medical_devices"),
                "item_name": r.get("item_name"),
                "normalized_name": r.get("item_name", "").lower().replace(" ", "_"),
                "allowed_ceiling_inr": float(r.get("allowed_ceiling_inr", 0.0)),
                "gst_rate_pct": float(r.get("gst_rate_pct", 0.0)),
                "effective_from": r.get("effective_date", "2023-01-01"),
                "effective_to": r.get("effective_to", None),
                "citation": r.get("citation", ""),
                "sha256": sha,
                "retrieved_at": datetime.utcnow().isoformat()
            }
            structured_list.append(record)

        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(structured_list, f, indent=2)

        print(f"[✓] Ingested {len(structured_list)} structured reference records to {self.output_path}")
        return structured_list


if __name__ == "__main__":
    norm_path = os.path.join(BASE_DIR, "data", "processed", "normalized_statutory_records.json")
    if os.path.exists(norm_path):
        with open(norm_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        ingestor = ReferenceIngestor()
        ingestor.ingest_records(data)
