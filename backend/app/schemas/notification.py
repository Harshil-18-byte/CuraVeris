from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    event_type: str
    title: str
    body: str
    priority: str
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class UnreadCountResponse(BaseModel):
    count: int
