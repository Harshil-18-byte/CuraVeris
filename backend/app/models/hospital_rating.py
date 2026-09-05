import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class HospitalRating(Base):
    __tablename__ = "hospital_ratings"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_name_normalized = Column(String(500), nullable=False, index=True)
    billing_transparency_score = Column(Integer, nullable=False)  # 1-5
    overcharge_detected = Column(Boolean, default=False)
    overcharge_amount = Column(Numeric(14, 2), default=0.0)
    audit_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    bill = relationship("Bill")
    user = relationship("User")
