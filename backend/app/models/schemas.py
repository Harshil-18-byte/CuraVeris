from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# ─── AUTH SCHEMAS ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: Optional[str] = "patient"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── BILL & AUDIT SCHEMAS ───────────────────────────────────────────────────

class BillItemSchema(BaseModel):
    id: Optional[str] = None
    raw_text: str
    normalized_name: str
    category: str
    quantity: float
    charged_rate: float
    charged_amount: float
    mrp: Optional[float] = None
    cghs_rate: Optional[float] = None
    nppa_ceiling: Optional[float] = None
    is_flagged: bool = False
    risk_flags: List[str] = []
    overcharge_amount: float = 0.0
    legal_citation: Optional[str] = None
    patient_explanation: Optional[str] = None
    action_recommended: Optional[str] = None

    class Config:
        from_attributes = True


class RiskFlagSummary(BaseModel):
    flag_type: str
    severity: str  # critical, high, medium, low
    count: int
    total_impact: float
    description: str
    law_cited: str


class BillAnalysisResponse(BaseModel):
    bill_id: str
    hospital_name: str
    city: Optional[str] = None
    tier: int = 1
    patient_name: Optional[str] = None
    diagnosis: Optional[str] = None
    total_billed: float
    total_fair_estimate: float
    total_overcharge: float
    risk_score: float  # 0 to 100
    risk_level: str    # Low, Moderate, High, Critical
    plain_summary: str
    risk_flags: List[RiskFlagSummary] = []
    line_items: List[BillItemSchema] = []
    razorpay_gap: Optional[Dict[str, Any]] = None
    recommended_actions: List[Dict[str, str]] = []
    status: str = "completed"
    created_at: datetime

    class Config:
        from_attributes = True


class BillUploadResponse(BaseModel):
    bill_id: str
    status: str
    message: str
    total_items_detected: int = 0


# ─── RECONCILIATION & RAZORPAY ──────────────────────────────────────────────

class ReconciliationRequest(BaseModel):
    bill_id: str
    total_billed: float
    insurance_approved: float
    tpa_name: Optional[str] = None
    razorpay_paid: float
    razorpay_payment_id: Optional[str] = None


class ReconciliationResponse(BaseModel):
    reconciliation_id: str
    bill_id: str
    total_billed: float
    insurance_approved: float
    tpa_deductions: float
    razorpay_paid: float
    patient_unjust_gap: float
    refundable_amount: float
    reconciliation_notes: str
    refund_link_recommended: bool = False
    created_at: datetime


class RazorpayWebhookEvent(BaseModel):
    event: str
    payload: Dict[str, Any]


# ─── DISPUTE PETITION SCHEMAS ────────────────────────────────────────────────

class DisputeLetterRequest(BaseModel):
    bill_id: str
    forum_type: str  # hospital_grievance | nppa | irdai | consumer_court
    patient_name: Optional[str] = "Patient / Aggrieved Complainant"
    patient_address: Optional[str] = None
    patient_phone: Optional[str] = None
    specific_item_ids: Optional[List[str]] = None


class DisputeLetterResponse(BaseModel):
    letter_id: str
    bill_id: str
    forum_type: str
    target_authority: str
    letter_title: str
    letter_body: str
    statutory_citations: List[str]
    total_disputed_amount: float
    created_at: datetime


# ─── CHAT SCHEMAS ────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # user | assistant | system
    content: str


class ChatRequest(BaseModel):
    bill_id: str
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    legal_citations: List[str] = []
    suggested_actions: List[str] = []
