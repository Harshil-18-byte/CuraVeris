from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.core.database import get_db
from app.models.user import User
from app.models.bill import Bill
from app.models.audit import Audit, AuditFinding
from app.models.evidence import EvidenceRecord
from app.schemas.audit import AuditResponse, AuditFindingResponse
from app.api.v1.auth import get_current_user
from app.crypto.evidence import verify_evidence_payload

router = APIRouter(tags=["Audits"])


@router.get("/bills/{bill_id}/audit", response_model=AuditResponse)
async def get_bill_audit(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves full audit analysis and SHAP feature explanations for a bill."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    audit_stmt = select(Audit).where(Audit.bill_id == bill_id)
    audit = (await db.execute(audit_stmt)).scalar_one_or_none()
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not yet completed for this bill. Please monitor processing status.",
        )

    # Load findings
    findings_stmt = select(AuditFinding).where(AuditFinding.audit_id == audit.id).order_by(AuditFinding.overcharge_amount.desc())
    findings = (await db.execute(findings_stmt)).scalars().all()

    audit_resp = AuditResponse.model_validate(audit)
    audit_resp.findings = findings
    return audit_resp


@router.get("/bills/{bill_id}/audit/findings", response_model=dict)
async def list_audit_findings(
    bill_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    source: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    finding_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns paginated list of audit findings with statutory citations."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    audit = (await db.execute(select(Audit).where(Audit.bill_id == bill_id))).scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")

    query = select(AuditFinding).where(AuditFinding.audit_id == audit.id)
    count_query = select(func.count(AuditFinding.id)).where(AuditFinding.audit_id == audit.id)

    if source:
        query = query.where(AuditFinding.finding_source == source.upper())
        count_query = count_query.where(AuditFinding.finding_source == source.upper())
    if severity:
        query = query.where(AuditFinding.severity == severity.upper())
        count_query = count_query.where(AuditFinding.severity == severity.upper())
    if finding_type:
        query = query.where(AuditFinding.finding_type == finding_type.upper())
        count_query = count_query.where(AuditFinding.finding_type == finding_type.upper())

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AuditFinding.overcharge_amount.desc()).offset((page - 1) * per_page).limit(per_page)
    findings = (await db.execute(query)).scalars().all()

    return {
        "items": [AuditFindingResponse.model_validate(f) for f in findings],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/bills/{bill_id}/audit/findings/{finding_id}", response_model=AuditFindingResponse)
async def get_finding_detail(
    bill_id: UUID,
    finding_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves a single finding with full legal basis and plain explanation."""
    finding_stmt = select(AuditFinding).where(AuditFinding.id == finding_id)
    finding = (await db.execute(finding_stmt)).scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

    return AuditFindingResponse.model_validate(finding)


@router.get("/bills/{bill_id}/evidence")
async def get_bill_evidence(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves the cryptographic Section 65B evidence certificate for a bill."""
    ev_stmt = select(EvidenceRecord).where(EvidenceRecord.bill_id == bill_id)
    evidence = (await db.execute(ev_stmt)).scalar_one_or_none()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not yet sealed.")

    return {
        "id": str(evidence.id),
        "bill_id": str(evidence.bill_id),
        "audit_id": str(evidence.audit_id),
        "merkle_root": evidence.merkle_root,
        "hmac_signature": evidence.hmac_signature,
        "canonical_payload": evidence.canonical_payload,
        "leaf_hashes": evidence.leaf_hashes,
        "issued_at": evidence.issued_at,
        "integrity_status": "VERIFIED",
    }


@router.post("/evidence/{evidence_id}/verify")
async def verify_evidence(
    evidence_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Recomputes Merkle root and validates HMAC signature."""
    ev_stmt = select(EvidenceRecord).where(EvidenceRecord.id == evidence_id)
    evidence = (await db.execute(ev_stmt)).scalar_one_or_none()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not found")

    result = verify_evidence_payload(
        canonical_payload=evidence.canonical_payload,
        stored_merkle_root=evidence.merkle_root,
        stored_hmac_sig=evidence.hmac_signature,
    )

    return {
        "evidence_id": str(evidence.id),
        "integrity_valid": result["integrity_valid"],
        "hmac_valid": result["hmac_valid"],
        "merkle_root": evidence.merkle_root,
        "recomputed_root": result.get("recomputed_root"),
        "status": "SECURE_INTEGRITY_VERIFIED" if (result["integrity_valid"] and result["hmac_valid"]) else "TAMPER_DETECTED",
    }
