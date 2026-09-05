import asyncio
import io
import json
import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from celery import chain
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.core.database import get_db, AsyncSessionLocal
from app.core.security import compute_sha256, verify_access_token
from app.core.storage import storage_adapter, validate_file_magic_bytes
from app.core.redis import get_redis, set_with_ttl, get_value
from app.models.user import User
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit
from app.schemas.bill import (
    BillResponse,
    BillSummaryResponse,
    BillStatusResponse,
    BillUploadResponse,
)
from app.api.v1.auth import get_current_user
from app.services.notification_service import create_notification
from app.workers.ocr_task import process_bill_ocr
from app.workers.audit_task import run_statutory_audit
from app.workers.ml_task import run_ml_analysis
from app.workers.evidence_task import generate_evidence

router = APIRouter(prefix="/bills", tags=["Bills"])


@router.post("/upload", response_model=BillUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_bill(
    file: UploadFile = File(...),
    hospital_name: Optional[str] = Form(None),
    estimated_amount: Optional[str] = Form(None),
    insurance_type: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Uploads a hospital bill document and triggers the async OCR and statutory audit pipeline."""
    # 1. Rate limiting check (10 uploads per hour)
    redis_client = await get_redis()
    rate_key = f"upload_rate:{current_user.id}"
    upload_count = await redis_client.incr(rate_key)
    if upload_count == 1:
        await redis_client.expire(rate_key, 3600)
    elif upload_count > 10:
        ttl = await redis_client.ttl(rate_key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Upload rate limit exceeded. Please retry after {ttl} seconds.",
            headers={"Retry-After": str(ttl)},
        )

    # 2. File size & magic bytes validation
    content = await file.read()
    file_size = len(content)
    if file_size > 50 * 1024 * 1024:  # 50 MB
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large. Maximum size is 50MB.")
    if file_size < 16:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="File is empty or corrupted.")

    if not validate_file_magic_bytes(content[:16]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unsupported file format. Authorized formats: PDF, PNG, JPEG, TIFF.",
        )

    # 3. SHA-256 duplicate detection
    file_sha256 = compute_sha256(content)
    dup_stmt = select(Bill).where(
        and_(
            Bill.user_id == current_user.id,
            Bill.file_hash_sha256 == file_sha256,
            Bill.deleted_at.is_(None),
        )
    )
    duplicate = (await db.execute(dup_stmt)).scalar_one_or_none()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "You have already uploaded this exact bill.",
                "existing_bill_id": str(duplicate.id),
            },
        )

    # 4. Generate keys & upload to Cloudflare R2 / S3
    bill_id = uuid.uuid4()
    sanitized_filename = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", file.filename or "bill.pdf")
    timestamp = int(datetime.now(timezone.utc).timestamp())
    storage_key = f"bills/{current_user.id}/{bill_id}/{timestamp}_{sanitized_filename}"

    file_io = io.BytesIO(content)
    mime = file.content_type or "application/pdf"
    await storage_adapter.upload_file(storage_key, file_io, content_type=mime)

    # 5. Persist Bill record
    est_dec = None
    if estimated_amount:
        try:
            est_dec = Decimal(estimated_amount.replace(",", "").replace("₹", "").strip())
        except Exception:
            pass

    bill = Bill(
        id=bill_id,
        user_id=current_user.id,
        hospital_name=hospital_name,
        total_billed_amount=est_dec,
        insurance_type=insurance_type,
        processing_status="QUEUED",
        file_key=storage_key,
        file_name_original=file.filename or "uploaded_bill",
        file_size_bytes=file_size,
        file_mime_type=mime,
        file_hash_sha256=file_sha256,
    )
    db.add(bill)
    await db.flush()

    # 6. Create in-app notification
    await create_notification(
        db=db,
        user_id=current_user.id,
        event_type="BILL_UPLOADED",
        entity_type="BILL",
        entity_id=bill_id,
    )
    await db.commit()

    # 7. Launch processing pipeline (Instant background async execution)
    async def _run_full_bill_pipeline_background(bill_id_str: str):
        try:
            from app.workers.ocr_task import _run_ocr_async
            from app.workers.audit_task import _run_audit_async
            from app.workers.ml_task import _run_ml_async
            from app.workers.evidence_task import _run_evidence_async

            logger.info(f"Starting async pipeline for bill {bill_id_str}")
            await _run_ocr_async(bill_id_str)
            logger.info(f"OCR completed for bill {bill_id_str}")
            await _run_audit_async(bill_id_str)
            logger.info(f"Statutory audit completed for bill {bill_id_str}")
            await _run_ml_async(bill_id_str)
            logger.info(f"ML risk analysis completed for bill {bill_id_str}")
            await _run_evidence_async(bill_id_str)
            logger.info(f"Cryptographic evidence completed for bill {bill_id_str}")
        except Exception as e:
            logger.error(f"Background bill pipeline error for {bill_id_str}: {e}", exc_info=True)

    try:
        asyncio.create_task(_run_full_bill_pipeline_background(str(bill_id)))
    except Exception as e:
        logger.error(f"Failed to create background task for bill {bill_id}: {e}")

    return BillUploadResponse(bill_id=bill_id, status="PROCESSING", message="Processing started")


@router.get("", response_model=dict)
async def list_bills(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists bills for the current authenticated user."""
    query = select(Bill).where(and_(Bill.user_id == current_user.id, Bill.deleted_at.is_(None)))
    count_query = select(func.count(Bill.id)).where(and_(Bill.user_id == current_user.id, Bill.deleted_at.is_(None)))

    if status and status.upper() != "ALL":
        query = query.where(Bill.processing_status == status.upper())
        count_query = count_query.where(Bill.processing_status == status.upper())

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Bill.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    bills = (await db.execute(query)).scalars().all()

    # Fetch audit overcharge amounts
    bill_summaries = []
    for b in bills:
        audit_stmt = select(Audit).where(Audit.bill_id == b.id)
        audit = (await db.execute(audit_stmt)).scalar_one_or_none()
        bill_summaries.append({
            "id": b.id,
            "hospital_name": b.hospital_name,
            "patient_name": b.patient_name,
            "admission_date": b.admission_date,
            "discharge_date": b.discharge_date,
            "total_billed_amount": b.total_billed_amount,
            "total_overcharge": audit.total_overcharge_deterministic if audit else Decimal("0.0"),
            "processing_status": b.processing_status,
            "file_name_original": b.file_name_original,
            "created_at": b.created_at,
        })

    return {
        "items": bill_summaries,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves full bill details including presigned URL and line items."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Load line items
    items_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_id).order_by(BillLineItem.item_sequence)
    line_items = (await db.execute(items_stmt)).scalars().all()

    # Presigned URL (15 mins)
    presigned_url = await storage_adapter.generate_presigned_url(bill.file_key, expires_seconds=900)

    bill_resp = BillResponse.model_validate(bill)
    bill_resp.file_url = presigned_url
    bill_resp.line_items = line_items
    return bill_resp


@router.get("/{bill_id}/status", response_model=BillStatusResponse)
async def get_bill_status(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lightweight polling endpoint for live processing status."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return BillStatusResponse(
        bill_id=bill.id,
        processing_status=bill.processing_status,
        processing_started_at=bill.processing_started_at,
        processing_completed_at=bill.processing_completed_at,
        failure_reason=bill.failure_reason,
        retry_count=bill.retry_count,
    )


@router.post("/benchmark-check")
async def check_benchmark_item(payload: dict):
    """Quick lookup of an item against CGHS, NPPA, and DPCO."""
    from app.db.reference_data import query_cghs_rate, query_nppa_device, query_dpco_drug, is_irdai_non_payable
    item_name = payload.get("item_name", "")
    cghs = query_cghs_rate(item_name)
    nppa = query_nppa_device(item_name)
    dpco = query_dpco_drug(item_name)
    irdai = is_irdai_non_payable(item_name)

    return {
        "item_name": item_name,
        "cghs_benchmark": cghs,
        "nppa_device_ceiling": nppa,
        "dpco_drug_ceiling": dpco,
        "irdai_non_payable_status": irdai,
    }


@router.get("/recent")
async def get_recent_bills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns recent bills for the authenticated user."""
    stmt = (
        select(Bill)
        .where(and_(Bill.user_id == current_user.id, Bill.deleted_at.is_(None)))
        .order_by(Bill.created_at.desc())
        .limit(5)
    )
    result = await db.execute(stmt)
    bills = result.scalars().all()
    return [
        {
            "id": str(b.id),
            "hospital_name": b.hospital_name,
            "total_amount": float(b.total_amount) if b.total_amount else 0.0,
            "status": b.processing_status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        }
        for b in bills
    ]


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft deletes a bill record (retains storage copy for legal audit trail)."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    bill.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return None



@router.websocket("/ws/{bill_id}/status")
async def bill_status_ws(websocket: WebSocket, bill_id: str, token: str = Query(...)):
    """Live WebSocket stream for real-time bill status updates."""
    # Authenticate token
    try:
        payload = verify_access_token(token)
        user_id_str = payload.get("sub")
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()

    # Query initial status
    try:
        bill_uuid = UUID(bill_id)
        async with AsyncSessionLocal() as db:
            stmt = select(Bill).where(Bill.id == bill_uuid)
            bill = (await db.execute(stmt)).scalar_one_or_none()
            if not bill or (str(bill.user_id) != user_id_str):
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            await websocket.send_json({
                "bill_id": bill_id,
                "status": bill.processing_status,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            if bill.processing_status in ["COMPLETED", "FAILED"]:
                await websocket.close()
                return
    except Exception:
        await websocket.close()
        return

    # Subscribe to Redis pubsub channel
    redis_client = await get_redis()
    pubsub = redis_client.pubsub()
    channel_name = f"bill_status:{bill_id}"
    await pubsub.subscribe(channel_name)

    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message["type"] == "message":
                data = message["data"]
                if isinstance(data, str):
                    await websocket.send_text(data)
                elif isinstance(data, (dict, list)):
                    await websocket.send_json(data)
            await asyncio.sleep(0.5)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        await pubsub.unsubscribe(channel_name)
        await pubsub.close()
