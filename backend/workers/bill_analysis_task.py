"""Celery Background Worker: End-to-End Medical Bill Forensic Analysis Pipeline."""

import os
import json
from celery import Celery

from app.core.config import settings
from app.core.logging import logger
from app.ml.ocr_pipeline import OCRPipeline
from app.ml.extractor import BillDataExtractor
from app.ml.rag_retriever import retrieve_context
from app.ml.risk_classifier import RiskClassifier
from app.ml.claude_agent import ClaudeBillingAgent

celery_app = Celery(
    "medbill_worker",
    broker=getattr(settings, "CELERY_BROKER_URL", "redis://localhost:6379/1"),
    backend=getattr(settings, "CELERY_RESULT_BACKEND", "redis://localhost:6379/2")
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)


@celery_app.task(name="tasks.analyze_bill", bind=True)
def analyze_bill_task(self, bill_id: str, file_path: str, mime_type: str):
    """Executes OCR -> Extraction -> RAG Retrieval -> ML Classification -> Claude AI Analysis."""
    logger.info(f"[*] Starting Celery analysis task for Bill ID: {bill_id}")
    self.update_state(state="PROCESSING", meta={"progress": 15, "stage": "OCR_EXTRACTION"})

    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return {"status": "FAILED", "error": "File not found"}

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. Multi-modal OCR
    ocr = OCRPipeline()
    blocks = ocr.process_document(file_bytes, mime_type)
    self.update_state(state="PROCESSING", meta={"progress": 35, "stage": "ENTITY_EXTRACTION"})

    # 2. Line Item Extraction & Normalization
    extractor = BillDataExtractor()
    metadata, items = extractor.extract_bill_data(blocks)
    self.update_state(state="PROCESSING", meta={"progress": 55, "stage": "STATUTORY_RAG"})

    # 3. Statutory RAG Benchmark Retrieval
    rag_context = retrieve_context(items, similarity_threshold=0.72)
    self.update_state(state="PROCESSING", meta={"progress": 75, "stage": "RISK_CLASSIFICATION"})

    # 4. Multi-Label ML Risk Classifier
    classifier = RiskClassifier()
    all_flags = []
    all_amounts = [it.total_amount for it in items]
    all_qtys = [it.quantity for it in items]

    for item, item_ctx in zip(items, rag_context.item_contexts):
        best = item_ctx.best_match
        cghs = best.rate_nabh if best else None
        nppa = best.ceiling_price if best else None
        dpco = best.mrp if best else None
        item_flags = classifier.analyze_item(item, cghs, nppa, dpco, all_amounts, all_qtys)
        all_flags.extend(item_flags)

    risk_score = classifier.calculate_bill_risk_score(metadata.total_amount, all_flags)
    self.update_state(state="PROCESSING", meta={"progress": 90, "stage": "CLAUDE_SYNTHESIS"})

    # 5. Claude Forensic Legal Synthesis
    claude = ClaudeBillingAgent()
    analysis = claude.analyze_bill(
        hospital_name=metadata.hospital_name,
        total_amount=metadata.total_amount,
        items=items,
        flags=all_flags,
    )

    logger.info(f"[✓] Bill {bill_id} analysis complete. Risk score: {risk_score}/100, Overcharge: ₹{analysis.potential_savings}")
    return {
        "status": "COMPLETED",
        "bill_id": bill_id,
        "hospital_name": metadata.hospital_name,
        "total_amount": metadata.total_amount,
        "risk_score": risk_score,
        "potential_savings": analysis.potential_savings,
        "violations_count": len(all_flags),
        "plain_summary": analysis.plain_summary,
        "actions": analysis.actions,
    }
