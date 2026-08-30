from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ShapFeatureExplanation(BaseModel):
    feature_label: str
    shap_value: float
    direction: str  # INCREASES_RISK | DECREASES_RISK
    explanation: str


class AuditFindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    audit_id: UUID
    bill_line_item_id: Optional[UUID] = None
    finding_type: str
    finding_source: str
    severity: str
    item_description: Optional[str] = None
    billed_amount: Optional[Decimal] = None
    benchmark_amount: Optional[Decimal] = None
    overcharge_amount: Optional[Decimal] = None
    statutory_reference: Optional[str] = None
    ml_confidence: Optional[Decimal] = None
    shap_explanation: Optional[Dict[str, Any]] = None
    legal_basis: Optional[str] = None
    user_explanation: Optional[str] = None
    is_disputable: bool = True
    created_at: datetime


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    bill_id: UUID
    user_id: UUID
    audit_version: str
    statutory_ref_version: str
    ml_model_version: str
    total_overcharge_deterministic: Optional[Decimal] = None
    total_overcharge_ml_estimate: Optional[Decimal] = None
    total_billed: Optional[Decimal] = None
    risk_score: Optional[Decimal] = None
    risk_label: Optional[str] = None
    uncertainty_lower: Optional[Decimal] = None
    uncertainty_upper: Optional[Decimal] = None
    shadow_bill_detected: bool = False
    finding_count: int = 0
    finding_summary: Optional[Dict[str, int]] = None
    shap_values: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    completed_at: Optional[datetime] = None
    findings: Optional[List[AuditFindingResponse]] = None
    ml_disclaimer: str = "AI risk assessment is predictive, not a confirmed legal finding."
