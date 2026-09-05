import uuid
from datetime import datetime
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


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    audit_id = Column(
        UUID(as_uuid=True),
        ForeignKey("audits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    document_type = Column(String(100), nullable=False, index=True)
    template_version = Column(String(50), default="1.0.0", nullable=False)
    file_key = Column(String(500), nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False)
    status = Column(String(50), default="READY", nullable=False)  # READY | DOWNLOADED | FAILED

    generated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )
    downloaded_at = Column(DateTime(timezone=True), nullable=True)

    doc_metadata = Column("metadata", JSON, nullable=True)

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

    bill = relationship("Bill", back_populates="legal_documents" if hasattr(Base, "_decl_class_registry") else None)
    audit = relationship("Audit")
    user = relationship("User")

    def __init__(self, **kwargs):
        if "metadata" in kwargs:
            kwargs["doc_metadata"] = kwargs.pop("metadata")
        super().__init__(**kwargs)
