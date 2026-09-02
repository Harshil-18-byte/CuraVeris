import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    BigInteger,
    Numeric,
    Text,
    Date,
    DateTime,
    ForeignKey,
    JSON,
    text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    reference_number = Column(String(100), nullable=True)
    hospital_name = Column(String(500), nullable=True)
    city = Column(String(255), nullable=True)
    tier = Column(Integer, default=1, nullable=True)
    is_nabh = Column(Boolean, default=True, nullable=True)
    patient_name = Column(String(255), nullable=True)
    patient_name_enc = Column(String(255), nullable=True)
    diagnosis = Column(String(500), nullable=True)
    admission_date = Column(Date, nullable=True)
    discharge_date = Column(Date, nullable=True)
    days_admitted = Column(Integer, default=1, nullable=True)
    total_billed_amount = Column(Numeric(14, 2), nullable=True)
    total_billed = Column(Numeric(14, 2), default=0.0, nullable=True)
    total_fair_estimate = Column(Numeric(14, 2), default=0.0, nullable=True)
    total_overcharge = Column(Numeric(14, 2), default=0.0, nullable=True)
    risk_score = Column(Numeric(5, 2), default=0.0, nullable=True)
    status = Column(String(50), default="pending", nullable=True)
    plain_summary = Column(Text, nullable=True)
    risk_flags_summary = Column(JSON, default=list, nullable=True)
    raw_ocr_text = Column(Text, nullable=True)
    bill_type = Column(String(50), nullable=True)
    insurance_type = Column(String(50), nullable=True)

    processing_status = Column(String(50), default="QUEUED", nullable=True, index=True)
    processing_job_id = Column(String(255), nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=True)

    file_key = Column(String(1000), nullable=True)
    file_name_original = Column(String(500), nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    file_mime_type = Column(String(100), nullable=True)
    file_hash_sha256 = Column(String(64), nullable=True, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

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

    # Relationships
    user = relationship("User", back_populates="bills")
    line_items = relationship("BillLineItem", back_populates="bill", cascade="all, delete-orphan", order_by="BillLineItem.item_sequence")
    audit = relationship("Audit", back_populates="bill", uselist=False, cascade="all, delete-orphan")
    evidence = relationship("EvidenceRecord", back_populates="bill", uselist=False, cascade="all, delete-orphan")
    frm_assessment = relationship("FinancialRiskAssessment", back_populates="bill", uselist=False, cascade="all, delete-orphan")


class BillLineItem(Base):
    __tablename__ = "bill_line_items"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"), nullable=False, index=True)
    item_sequence = Column(Integer, default=1, nullable=False)
    raw_description = Column(Text, nullable=False)
    normalized_name = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    quantity = Column(Numeric(10, 3), nullable=True, default=1.0)
    unit_price = Column(Numeric(14, 2), nullable=True)
    total_price = Column(Numeric(14, 2), nullable=True)
    gst_rate_applied = Column(Numeric(5, 2), nullable=True, default=0.0)
    extraction_confidence = Column(Numeric(5, 4), nullable=True, default=1.0)
    page_number = Column(Integer, nullable=True, default=1)
    bounding_box = Column(JSON, nullable=True)

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

    bill = relationship("Bill", back_populates="line_items")
