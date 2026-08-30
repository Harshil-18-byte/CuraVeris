import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Audit(Base):
    __tablename__ = "audits"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    audit_version = Column(String(20), default="1.0.0", nullable=False)
    statutory_ref_version = Column(String(20), default="1.0.0", nullable=False)
    ml_model_version = Column(String(50), default="xgb_mlp_ensemble_v1", nullable=False)

    total_overcharge_deterministic = Column(Numeric(14, 2), nullable=True, default=0.0)
    total_overcharge_ml_estimate = Column(Numeric(14, 2), nullable=True, default=0.0)
    total_billed = Column(Numeric(14, 2), nullable=True)

    risk_score = Column(Numeric(5, 4), nullable=True)
    risk_label = Column(String(20), nullable=True)
    uncertainty_lower = Column(Numeric(5, 4), nullable=True)
    uncertainty_upper = Column(Numeric(5, 4), nullable=True)
    shadow_bill_detected = Column(Boolean, default=False, nullable=False)

    finding_count = Column(Integer, default=0, nullable=False)
    finding_summary = Column(JSON, nullable=True)
    shap_values = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

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
    bill = relationship("Bill", back_populates="audit")
    findings = relationship("AuditFinding", back_populates="audit", cascade="all, delete-orphan", order_by="AuditFinding.overcharge_amount.desc()")


class AuditFinding(Base):
    __tablename__ = "audit_findings"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id", ondelete="CASCADE"), nullable=False, index=True)
    bill_line_item_id = Column(UUID(as_uuid=True), ForeignKey("bill_line_items.id", ondelete="SET NULL"), nullable=True, index=True)

    finding_type = Column(String(100), nullable=False)
    finding_source = Column(String(20), default="DETERMINISTIC", nullable=False)  # DETERMINISTIC | ML
    severity = Column(String(20), default="MEDIUM", nullable=False)  # LOW | MEDIUM | HIGH | CRITICAL

    item_description = Column(Text, nullable=True)
    billed_amount = Column(Numeric(14, 2), nullable=True)
    benchmark_amount = Column(Numeric(14, 2), nullable=True)
    overcharge_amount = Column(Numeric(14, 2), nullable=True, default=0.0)

    statutory_reference = Column(String(500), nullable=True)
    ml_confidence = Column(Numeric(5, 4), nullable=True)
    shap_explanation = Column(JSON, nullable=True)
    legal_basis = Column(Text, nullable=True)
    user_explanation = Column(Text, nullable=True)
    is_disputable = Column(Boolean, default=True, nullable=False)

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

    audit = relationship("Audit", back_populates="findings")
    line_item = relationship("BillLineItem")
