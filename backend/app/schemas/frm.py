from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class FRMInputRequest(BaseModel):
    monthly_income: Decimal = Field(..., gt=0, description="Monthly take-home income in INR")
    monthly_expenses: Decimal = Field(..., gt=0, description="Monthly living expenses in INR")
    verified_savings: Decimal = Field(default=Decimal("0.0"), ge=0, description="Liquid savings available in INR")
    insurance_coverage_claimed: Decimal = Field(default=Decimal("0.0"), ge=0, description="Claimed insurance amount in INR")
    already_paid: Decimal = Field(default=Decimal("0.0"), ge=0, description="Amount already paid to hospital in INR")


class StressScenarioResponse(BaseModel):
    scenario_code: str
    scenario_name: str
    description: Optional[str] = None
    assumption_changes: Optional[Dict[str, Any]] = None
    resulting_ead: Optional[Decimal] = None
    resulting_pd: Optional[Decimal] = None
    resulting_lgd: Optional[Decimal] = None
    resulting_el: Optional[Decimal] = None
    delta_el: Optional[Decimal] = None
    resulting_lcr: Optional[Decimal] = None
    delta_lcr: Optional[Decimal] = None
    resulting_time_to_insolvency: Optional[int] = None
    stress_severity: Optional[str] = None


class HistogramBin(BaseModel):
    bin_start: float
    bin_end: float
    count: int
    frequency: float


class DistributionSummary(BaseModel):
    percentiles: Dict[str, float]
    histogram: List[HistogramBin]
    mean: float
    median: float
    std: float
    min: float
    max: float


class LossDistributionResponse(BaseModel):
    mc_sample_count: int
    el_mean: Optional[Decimal] = None
    el_std: Optional[Decimal] = None
    var_90: Optional[Decimal] = None
    var_95: Optional[Decimal] = None
    cvar_95: Optional[Decimal] = None
    el_distribution_summary: Optional[DistributionSummary] = None
    plain_english_var95: Optional[str] = None
    plain_english_cvar95: Optional[str] = None
    disclaimer: str


class ModelRiskResponse(BaseModel):
    prediction_confidence: Optional[Decimal] = None
    data_quality_score: Optional[Decimal] = None
    ood_ratio: Optional[Decimal] = None
    ood_features: Optional[List[str]] = None
    model_risk_level: Optional[str] = None
    requires_human_review: bool = False
    human_review_reasons: Optional[List[str]] = None
    confidence_interpretation: Optional[str] = None
    disclaimer: str


class FinancialRiskAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    bill_id: UUID
    audit_id: UUID
    user_id: UUID

    # Inputs
    monthly_income: Optional[Decimal] = None
    monthly_expenses: Optional[Decimal] = None
    verified_savings: Optional[Decimal] = None
    insurance_coverage_claimed: Optional[Decimal] = None
    insurance_type: Optional[str] = None
    tpa_name: Optional[str] = None
    already_paid: Decimal = Decimal("0.0")

    # EL Components
    ead: Optional[Decimal] = None
    pd: Optional[Decimal] = None
    lgd: Optional[Decimal] = None
    recovery_rate: Optional[Decimal] = None
    expected_loss: Optional[Decimal] = None

    # Recovery Components
    p_insurance_pays: Optional[Decimal] = None
    p_dispute_succeeds: Optional[Decimal] = None
    p_hospital_waives: Optional[Decimal] = None
    expected_insurance_amount: Optional[Decimal] = None

    # Liquidity Risk
    immediate_obligation: Optional[Decimal] = None
    available_liquid_resources: Optional[Decimal] = None
    liquidity_gap: Optional[Decimal] = None
    lcr: Optional[Decimal] = None
    lcr_category: Optional[str] = None
    dsti_ratio: Optional[Decimal] = None
    time_to_insolvency_months: Optional[int] = None

    # VaR / CVaR
    mc_sample_count: int = 10000
    el_mean: Optional[Decimal] = None
    el_std: Optional[Decimal] = None
    var_90: Optional[Decimal] = None
    var_95: Optional[Decimal] = None
    cvar_95: Optional[Decimal] = None
    el_distribution_summary: Optional[Dict[str, Any]] = None

    # Stress Test Results
    stress_scenarios: Optional[List[Dict[str, Any]]] = None
    worst_case_el: Optional[Decimal] = None
    worst_case_lcr: Optional[Decimal] = None

    # Model Risk
    prediction_confidence: Optional[Decimal] = None
    data_quality_score: Optional[Decimal] = None
    ood_ratio: Optional[Decimal] = None
    model_risk_level: Optional[str] = None
    requires_human_review: bool = False
    human_review_reasons: Optional[List[str]] = None

    # Recommendations & Classification
    financial_recommendations: Optional[List[Dict[str, Any]]] = None
    hardship_category: Optional[str] = None

    # Metadata
    frm_engine_version: str = "1.0.0"
    computed_at: datetime
    created_at: datetime
    updated_at: datetime

    # Disclaimers
    disclaimer_el: str = "Expected Loss is a quantitative estimate based on AI-predicted recovery probability and historical settlement rates. It is not a guaranteed outcome. Actual financial results depend on insurer, legal, and hospital decisions outside CuraVeris's control."
    disclaimer_var: str = "VaR and CVaR are statistical measures of tail risk computed via Monte Carlo simulation. They represent probabilistic loss thresholds, not predictions of a specific outcome. Methodology follows standard quantitative risk management practice adapted for healthcare billing."
    disclaimer_model_risk: str = "Model Risk Assessment follows principles adapted from regulatory Model Risk Management frameworks. It quantifies uncertainty in CuraVeris's own AI predictions and does not constitute a credit or insurance assessment."
    disclaimer_stress: str = "Stress scenarios are hypothetical adverse conditions, not predictions. They are designed to reveal vulnerability, not to forecast specific events."
    disclaimer_legal: str = "All FRM outputs are analytical tools to support patient decision-making. They do not constitute financial advice, legal advice, or insurance guidance. Consult qualified professionals for formal financial, legal, or insurance decisions."


class FRMAsyncResponse(BaseModel):
    assessment_id: Optional[UUID] = None
    status: str
    message: str
