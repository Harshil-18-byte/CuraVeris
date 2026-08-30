from typing import Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CreateOrderRequest(BaseModel):
    bill_id: Optional[UUID] = None
    amount: Decimal
    currency: str = "INR"


class PaymentVerificationRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    bill_id: Optional[UUID] = None
    order_id: str
    payment_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    gateway: str
    created_at: datetime
