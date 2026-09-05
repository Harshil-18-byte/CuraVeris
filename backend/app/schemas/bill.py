from typing import Optional, List, Any, Dict
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class BillLineItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    item_sequence: int
    raw_description: str
    normalized_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    total_price: Optional[Decimal] = None
    gst_rate_applied: Optional[Decimal] = None
    extraction_confidence: Optional[Decimal] = None
    page_number: Optional[int] = None
    bounding_box: Optional[Dict[str, Any]] = None


class BillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    reference_number: Optional[str] = None
    hospital_name: Optional[str] = None
    patient_name: Optional[str] = None
    admission_date: Optional[date] = None
    discharge_date: Optional[date] = None
    total_billed_amount: Optional[Decimal] = None
    bill_type: Optional[str] = None
    insurance_type: Optional[str] = None
    processing_status: str
    processing_job_id: Optional[str] = None
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    retry_count: int = 0
    file_name_original: str
    file_size_bytes: int
    file_mime_type: str
    file_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    line_items: Optional[List[BillLineItemResponse]] = None


class BillSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    hospital_name: Optional[str] = None
    patient_name: Optional[str] = None
    admission_date: Optional[date] = None
    discharge_date: Optional[date] = None
    total_billed_amount: Optional[Decimal] = None
    total_overcharge: Optional[Decimal] = None
    processing_status: str
    file_name_original: str
    created_at: datetime


class BillStatusResponse(BaseModel):
    bill_id: UUID
    processing_status: str
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    retry_count: int = 0
    stuck_warning: Optional[str] = None


class BillUploadResponse(BaseModel):
    bill_id: UUID
    status: str = "QUEUED"
    message: str = "Processing started"
