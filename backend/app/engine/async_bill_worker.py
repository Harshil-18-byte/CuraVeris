import uuid
import asyncio
import time
from typing import Dict, Any, Optional
from app.engine.extractor import extract_text_from_pdf, parse_bill_text
from app.engine.risk_engine import risk_engine
from app.engine.ai_explainer import ai_explainer
from app.core.logging import logger

# In-memory thread-safe / async job repository
_ASYNC_JOBS: Dict[str, Dict[str, Any]] = {}


def create_job() -> str:
    """Creates a new tracked background audit job."""
    job_id = str(uuid.uuid4())
    _ASYNC_JOBS[job_id] = {
        "job_id": job_id,
        "status": "QUEUED",
        "progress_percent": 0,
        "current_stage": "Job queued for background processing",
        "created_at": time.time(),
        "updated_at": time.time(),
        "result": None,
        "error": None
    }
    return job_id


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves current job status and payload."""
    return _ASYNC_JOBS.get(job_id)


def update_job(
    job_id: str,
    status: str,
    progress_percent: int,
    current_stage: str,
    result: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
):
    """Updates progress state of a tracked job."""
    if job_id in _ASYNC_JOBS:
        _ASYNC_JOBS[job_id]["status"] = status
        _ASYNC_JOBS[job_id]["progress_percent"] = progress_percent
        _ASYNC_JOBS[job_id]["current_stage"] = current_stage
        _ASYNC_JOBS[job_id]["updated_at"] = time.time()
        if result:
            _ASYNC_JOBS[job_id]["result"] = result
        if error:
            _ASYNC_JOBS[job_id]["error"] = error


async def execute_background_bill_audit(
    job_id: str,
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    raw_text: Optional[str] = None,
    form_metadata: Optional[Dict[str, Any]] = None
):
    """
    Executes staged asynchronous bill extraction, statutory auditing, and AI narrative synthesis.
    Updates granular progress markers across each processing phase.
    """
    form_metadata = form_metadata or {}
    try:
        # Phase 1: Ingestion & Text Extraction (15%)
        update_job(job_id, "EXTRACTING_OCR", 15, "Ingesting bill payload and extracting digital text...")
        await asyncio.sleep(0.1)

        text_content = ""
        if file_bytes and filename and filename.lower().endswith(".pdf"):
            text_content = extract_text_from_pdf(file_bytes)
        elif file_bytes:
            try:
                text_content = file_bytes.decode("utf-8")
            except Exception:
                text_content = str(file_bytes)
        elif raw_text:
            text_content = raw_text

        if not text_content or len(text_content.strip()) < 10:
            raise ValueError("Insufficient legible text extracted from the document.")

        # Phase 2: Line Item Parsing & Token Extraction (40%)
        update_job(job_id, "PARSING_ITEMS", 40, "Parsing line items, quantities, and departmental charges...")
        await asyncio.sleep(0.1)

        parsed_metadata, parsed_items = parse_bill_text(text_content)
        for key, val in form_metadata.items():
            if val:
                parsed_metadata[key] = val

        if not parsed_items:
            raise ValueError("No itemized medical line items or monetary amounts could be parsed.")

        # Phase 3: Statutory Benchmarking & Regulatory Auditing (65%)
        update_job(job_id, "AUDITING_RATES", 65, "Cross-referencing line items against CGHS, NPPA, and DPCO rate ceilings...")
        await asyncio.sleep(0.1)

        audit = risk_engine.audit_bill(parsed_metadata, parsed_items)

        # Phase 4: Risk Model Scoring & AI Explanations (85%)
        update_job(job_id, "SCORING_RISK", 85, "Evaluating multi-label risk factors and generating patient advisory...")
        await asyncio.sleep(0.1)

        summary = ai_explainer.generate_plain_summary(audit, parsed_metadata)

        # Phase 5: Finalization & Storage (100%)
        final_payload = {
            "bill_id": f"async_{job_id[:8]}",
            "hospital_name": parsed_metadata.get("hospital_name", "Hospital"),
            "city": parsed_metadata.get("city", "City"),
            "patient_name": parsed_metadata.get("patient_name", "Patient"),
            "diagnosis": parsed_metadata.get("diagnosis", "Clinical Treatment"),
            "days_admitted": parsed_metadata.get("days_admitted", 1),
            "total_billed": audit["total_billed"],
            "total_fair_estimate": audit["total_fair_estimate"],
            "total_overcharge": audit["total_overcharge"],
            "risk_score": audit["risk_score"],
            "plain_summary": summary,
            "risk_flags_summary": audit["flags_summary"],
            "items": audit["items"]
        }

        update_job(job_id, "COMPLETED", 100, "Audit completed successfully. Full report ready.", result=final_payload)
        logger.info(f"Background audit job {job_id} completed successfully.")

    except Exception as exc:
        logger.error(f"Background audit job {job_id} failed: {exc}", exc_info=True)
        update_job(job_id, "FAILED", 100, f"Audit failed: {str(exc)}", error=str(exc))
