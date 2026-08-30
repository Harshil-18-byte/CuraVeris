import uuid
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    JSON,
    text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    merkle_root = Column(String(64), nullable=False)
    hmac_signature = Column(String(128), nullable=False)
    canonical_payload = Column(JSON, nullable=False)
    leaf_hashes = Column(JSON, nullable=False)
    certificate_url = Column(String(1000), nullable=True)

    issued_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    bill = relationship("Bill", back_populates="evidence")
    audit = relationship("Audit")
