from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.storage import get_storage, StorageAdapter
from app.models.user import User
from app.models.bill import Bill
from app.models.legal_doc import LegalDocument
from app.services.legal_doc_service import generate_legal_document, DOCUMENT_TYPES

router = APIRouter(tags=["Legal Documents"])


class GenerateDocRequest(BaseModel):
    document_type: str
    patient_address: Optional[str] = None
    patient_city: Optional[str] = None
    hospital_address: Optional[str] = None
    relationship: Optional[str] = "family member"
    insurer_name: Optional[str] = None
    policy_number: Optional[str] = None
    claim_number: Optional[str] = None
    claim_rejected: Optional[bool] = False
    ombudsman_jurisdiction: Optional[str] = None
    cghs_card_number: Optional[str] = None
    cghs_office_city: Optional[str] = None
    office_name: Optional[str] = None
    employee_id: Optional[str] = None
    diagnosis: Optional[str] = None


@router.post("/bills/{bill_id}/legal-documents", status_code=201)
@router.post("/{bill_id}/legal-documents", status_code=201)
async def generate_document(
    bill_id: UUID,
    request: GenerateDocRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    storage: StorageAdapter = Depends(get_storage),
    current_user: User = Depends(get_current_user),
):
    bill_result = await db.execute(
        select(Bill).where(
            Bill.id == bill_id,
            Bill.user_id == current_user.id,
            Bill.deleted_at.is_(None),
        )
    )
    bill = bill_result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if bill.processing_status != "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Bill audit must be completed before generating documents",
        )

    if request.document_type not in DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document type. Valid types: {list(DOCUMENT_TYPES.keys())}",
        )

    extra_inputs = request.dict(exclude={"document_type"}, exclude_none=True)

    legal_doc = await generate_legal_document(
        bill_id=bill_id,
        doc_type=request.document_type,
        extra_inputs=extra_inputs,
        db=db,
        storage=storage,
        user=current_user,
    )

    return {
        "id": str(legal_doc.id),
        "bill_id": str(bill_id),
        "document_type": legal_doc.document_type,
        "display_name": DOCUMENT_TYPES[request.document_type]["display_name"],
        "status": legal_doc.status,
        "generated_at": legal_doc.generated_at.isoformat() if legal_doc.generated_at else None,
        "file_hash_sha256": legal_doc.file_hash_sha256,
    }


@router.get("/bills/{bill_id}/legal-documents")
@router.get("/{bill_id}/legal-documents")
async def list_documents(
    bill_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill_result = await db.execute(
        select(Bill).where(
            Bill.id == bill_id,
            Bill.user_id == current_user.id,
        )
    )
    if not bill_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Bill not found")

    docs_result = await db.execute(
        select(LegalDocument)
        .where(LegalDocument.bill_id == bill_id)
        .order_by(LegalDocument.generated_at.desc())
    )
    docs = docs_result.scalars().all()

    all_types = []
    for doc_type, info in DOCUMENT_TYPES.items():
        existing = next(
            (d for d in docs if d.document_type == doc_type), None
        )
        all_types.append({
            "document_type": doc_type,
            "display_name": info["display_name"],
            "status": existing.status if existing else "NOT_GENERATED",
            "document_id": str(existing.id) if existing else None,
            "generated_at": (
                existing.generated_at.isoformat()
                if existing and existing.generated_at
                else None
            ),
        })

    return {"documents": all_types}


@router.get("/legal-documents/{doc_id}/download")
async def download_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    storage: StorageAdapter = Depends(get_storage),
    current_user: User = Depends(get_current_user),
):
    doc_result = await db.execute(
        select(LegalDocument).where(
            LegalDocument.id == doc_id,
            LegalDocument.user_id == current_user.id,
        )
    )
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    presigned_url = await storage.generate_presigned_url(
        key=doc.file_key,
        expires_seconds=900,
    )

    await db.execute(
        update(LegalDocument)
        .where(LegalDocument.id == doc_id)
        .values(downloaded_at=datetime.utcnow(), status="DOWNLOADED")
    )
    await db.commit()

    return {"download_url": presigned_url, "expires_in_seconds": 900}
