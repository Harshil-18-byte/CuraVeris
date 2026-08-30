import uuid
from sqlalchemy import (
    Column,
    String,
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


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    priority = Column(String(20), default="NORMAL", nullable=False)  # LOW | NORMAL | HIGH | URGENT

    entity_type = Column(String(50), nullable=True)  # BILL | AUDIT | DISPUTE
    entity_id = Column(UUID(as_uuid=True), nullable=True)

    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    push_dispatched = Column(Boolean, default=False, nullable=False)
    push_dispatched_at = Column(DateTime(timezone=True), nullable=True)
    push_delivery_status = Column(String(50), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    meta_payload = Column("metadata", JSON, nullable=True)
    idempotency_key = Column(String(255), unique=True, nullable=True, index=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="notifications")
