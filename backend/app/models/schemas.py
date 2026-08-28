"""
Pydantic v2 Canonical Schemas for CuraVeris Backend API.

Includes strict input validation, decimal-safe financial schemas,
multi-tenant user profiles, claims, reconciliations, exceptions, and dispute management.
"""
from typing import List, Optional, Dict, Any, Union
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime


# ---------------------------------------------------------------------------
# 0. System, Health & Diagnostic Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall health status: 'healthy' or 'degraded'")
    environment: str = Field(..., description="Active runtime environment")
    version: str = Field(..., description="Application semantic version")
    database: bool = Field(..., description="Database connectivity status")
    reference_db: bool = Field(..., description="Statutory reference SQLite database presence")
    database_error: Optional[str] = Field(None, description="Optional error message if database check failed")


class LivenessResponse(BaseModel):
    status: str = Field("alive", description="Process liveness indicator")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the probe")


class ReadinessResponse(BaseModel):
    status: str = Field(..., description="Readiness status: 'ready' or 'not_ready'")
    database: bool = Field(..., description="Database connection readiness")
    reference_db: bool = Field(..., description="Reference rate database readiness")


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Standardized error code string (e.g., VALIDATION_ERROR, UNAUTHORIZED)")
    message: str = Field(..., description="Human-readable explanation of the error")
    details: Optional[Any] = Field(None, description="Optional granular field or context error details")


class ErrorResponse(BaseModel):
    error: ErrorDetail = Field(..., description="Structured error payload")
    request_id: Optional[str] = Field(None, description="Correlated client request trace identifier")


# ---------------------------------------------------------------------------
# 1. Tenancy & Auth Schemas
# ---------------------------------------------------------------------------

class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2)
    org_type: str = Field(..., pattern="^(hospital|tpa|insurer|platform)$")
    slug: str = Field(..., min_length=2)
    settings_json: Optional[Dict[str, Any]] = None


class OrganizationResponse(BaseModel):
    id: str
    name: str
    org_type: str
    slug: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    role: Optional[str] = "PATIENT"
    org_id: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    org_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class DeviceRegistrationRequest(BaseModel):
    installation_id: str = Field(..., min_length=8, max_length=255)
    platform: str = Field(..., pattern="^(WEB|ANDROID|IOS)$")
    display_name: Optional[str] = Field(default=None, max_length=100)
    app_version: Optional[str] = Field(default=None, max_length=64)


class DeviceResponse(BaseModel):
    id: str
    installation_id: str
    platform: str
    display_name: Optional[str] = None
    app_version: Optional[str] = None
    is_active: bool
    last_seen_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class PushTokenRequest(BaseModel):
    provider: str = Field(..., pattern="^(FCM|APNS|WEB_PUSH)$")
    token: str = Field(..., min_length=16, max_length=8192)
    permission: str = Field(..., pattern="^(GRANTED|DENIED)$")


class PushTokenRequest(BaseModel):
    provider: str = Field(..., pattern="^(FCM|APNS|WEB_PUSH)$")
    token: str = Field(..., min_length=16, max_length=8192)
    permission: str = Field(..., pattern="^(GRANTED|DENIED)$")


# ---------------------------------------------------------------------------
# 2. Bill & Line Item Schemas
# ---------------------------------------------------------------------------

class BillItemSchema(BaseModel):
    id: Optional[str] = None
    raw_text: str
    normalized_name: str
    category: str
    quantity: Decimal = Decimal("1.00")
    unit: str = "units"
    charged_rate: Decimal = Decimal("0.00")
    charged_amount: Decimal = Decimal("0.00")
    mrp: Optional[Decimal] = None
    cghs_rate: Optional[Decimal] = None
    nppa_ceiling: Optional[Decimal] = None
    is_flagged: bool = False
    risk_flags: List[str] = []
    overcharge_amount: Decimal = Decimal("0.00")
    legal_citation: Optional[str] = None
    patient_explanation: Optional[str] = None
    action_recommended: Optional[str] = None
    confidence_score: Decimal = Decimal("1.00")

    class Config:
        from_attributes = True


class RiskFlagSummary(BaseModel):
    flag_type: str
    severity: str  # critical, high, medium, low
    count: int
    total_impact: Decimal
    description: str
    law_cited: str


class BillAnalysisResponse(BaseModel):
    bill_id: str
    invoice_id: Optional[str] = None
    hospital_name: str
    city: Optional[str] = None
    tier: int = 1
    patient_name: Optional[str] = None
    diagnosis: Optional[str] = None
    total_billed: Decimal
    total_fair_estimate: Decimal
    total_overcharge: Decimal
    risk_score: Decimal  # 0 to 100
    risk_level: str    # Low, Moderate, High, Critical
    plain_summary: str
    risk_flags: List[RiskFlagSummary] = []
    line_items: List[BillItemSchema] = []
    razorpay_gap: Optional[Dict[str, Any]] = None
    recommended_actions: List[Dict[str, str]] = []
    status: str = "completed"
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True


class BillUploadResponse(BaseModel):
    bill_id: str
    status: str
    message: str


# ---------------------------------------------------------------------------
# 3. Insurance Claims & TPA Adjudication Schemas
# ---------------------------------------------------------------------------

class ClaimLineCreate(BaseModel):
    invoice_line_item_id: str
    claimed_amount: Decimal
    approved_amount: Decimal
    deduction_amount: Decimal
    deduction_reason: Optional[str] = None
    is_admissible: bool = True


class ClaimCreateRequest(BaseModel):
    invoice_id: str
    patient_id: str
    hospital_id: str
    insurance_provider_id: str
    tpa_id: Optional[str] = None
    claim_number: str
    claimed_amount: Decimal
    lines: Optional[List[ClaimLineCreate]] = None


class ClaimResponse(BaseModel):
    id: str
    claim_number: str
    invoice_id: str
    patient_id: str
    hospital_id: str
    insurance_provider_id: str
    tpa_id: Optional[str] = None
    claimed_amount: Decimal
    eligible_amount: Decimal
    approved_amount: Decimal
    deduction_amount: Decimal
    co_pay_amount: Decimal
    status: str
    status_reason: Optional[str] = None
    submitted_at: datetime
    adjudicated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TPAApprovalRequest(BaseModel):
    claim_id: str
    tpa_reference_no: str
    tpa_approved_amount: Decimal
    tpa_deductions: Decimal
    remarks: Optional[str] = None


class ReconciliationRequest(BaseModel):
    invoice_id: Optional[str] = None
    bill_id: Optional[str] = None
    total_billed: Optional[Decimal] = None
    insurance_approved: Decimal = Decimal("0.00")
    tpa_deductions: Decimal = Decimal("0.00")
    razorpay_paid: Decimal = Decimal("0.00")
    settled_amount: Optional[Decimal] = None
    tpa_name: Optional[str] = "TPA / Insurer"

    @model_validator(mode="before")
    @classmethod
    def resolve_ids(cls, data: Any) -> Any:
        if isinstance(data, dict):
            inv = data.get("invoice_id") or data.get("bill_id")
            if inv:
                data["invoice_id"] = str(inv)
                data["bill_id"] = str(inv)
        return data


class ReconciliationResponse(BaseModel):
    reconciliation_id: Optional[str] = None
    invoice_id: str
    gross_billed: Decimal
    statutory_overcharge: Decimal
    fair_bill_total: Decimal
    insurance_approved: Decimal
    tpa_deductions: Decimal
    effective_insurer_share: Decimal
    legitimate_patient_share: Decimal
    patient_paid: Decimal
    patient_unjust_gap: Decimal
    outstanding_patient_balance: Decimal
    settled_amount: Decimal
    status: str  # BALANCED, EXCEPTION, PENDING_SETTLEMENT, REFUND_DUE
    reconciliation_notes: str
    refund_link_recommended: bool
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True


class ReconciliationExceptionResponse(BaseModel):
    id: str
    reconciliation_id: str
    exception_type: str
    severity: str
    amount: Decimal
    cause: str
    suggested_action: Optional[str] = None
    status: str
    assigned_to: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# 5. Payments & Razorpay Schemas
# ---------------------------------------------------------------------------

class CreatePaymentOrderRequest(BaseModel):
    invoice_id: str
    amount: Decimal
    currency: str = "INR"
    notes: Optional[Dict[str, str]] = None


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: Decimal
    amount_paise: int
    currency: str
    key_id: str
    invoice_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    invoice_id: str


class PaymentResponse(BaseModel):
    id: str
    invoice_id: str
    payment_id: str
    amount: Decimal
    currency: str
    method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DisputeLetterRequest(BaseModel):
    bill_id: str
    target_authority: Optional[str] = "hospital_grievance"
    forum_type: Optional[str] = None
    patient_name: Optional[str] = None
    patient_address: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_email: Optional[str] = None
    hospital_name: Optional[str] = None
    tone: Optional[str] = "formal_legal"

    @model_validator(mode="before")
    @classmethod
    def resolve_target(cls, data: Any) -> Any:
        if isinstance(data, dict):
            auth = data.get("target_authority") or data.get("forum_type") or "hospital_grievance"
            data["target_authority"] = auth
            data["forum_type"] = auth
        return data


class DisputeLetterResponse(BaseModel):
    letter_id: str
    bill_id: str
    target_authority: str
    title: Optional[str] = None
    letter_title: Optional[str] = None
    body: Optional[str] = None
    letter_body: Optional[str] = None
    statutory_citations: List[str] = []
    total_disputed_amount: Decimal = Decimal("0.00")
    docx_download_url: Optional[str] = None
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def sync_title_body(cls, data: Any) -> Any:
        if isinstance(data, dict):
            t = data.get("title") or data.get("letter_title") or ""
            b = data.get("body") or data.get("letter_body") or ""
            data["title"] = t
            data["letter_title"] = t
            data["body"] = b
            data["letter_body"] = b
        return data


# ---------------------------------------------------------------------------
# 7. Chat & Assistant Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    bill_id: Optional[str] = None
    invoice_id: Optional[str] = None
    message: str
    role_context: Optional[str] = "PATIENT"  # PATIENT, HOSPITAL_FINANCE, TPA_REVIEWER


class ChatResponse(BaseModel):
    reply: str
    bill_id: Optional[str] = None
    sources_cited: List[str] = []
    tool_calls_executed: List[Dict[str, Any]] = []
    structured_findings: Optional[Dict[str, Any]] = None
