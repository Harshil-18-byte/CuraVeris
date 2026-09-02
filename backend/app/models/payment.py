import uuid
from sqlalchemy import (
    Column,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="SET NULL"), nullable=True, index=True)
    tenant_id = Column(String(100), nullable=True, index=True)
    invoice_id = Column(String(100), nullable=True, index=True)
    patient_id = Column(String(100), nullable=True, index=True)

    order_id = Column(String(255), nullable=True, index=True)
    payment_id = Column(String(255), unique=True, nullable=True, index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    method = Column(String(50), default="UPI", nullable=True)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING | PAID | FAILED | REFUNDED
    gateway = Column(String(50), default="RAZORPAY", nullable=False)
    gateway_fee = Column(Numeric(14, 2), default=0.0, nullable=True)
    gateway_tax = Column(Numeric(14, 2), default=0.0, nullable=True)
    signature = Column(String(255), nullable=True)

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

    user = relationship("User")
    bill = relationship("Bill")
