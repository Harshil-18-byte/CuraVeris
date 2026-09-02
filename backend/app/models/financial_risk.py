import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
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


class FinancialRiskAssessment(Base):
    __tablename__ = "financial_risk_assessments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Inputs (collected from user or extracted from bill)
    monthly_income = Column(Numeric(14, 2), nullable=True)
    monthly_expenses = Column(Numeric(14, 2), nullable=True)
    verified_savings = Column(Numeric(14, 2), nullable=True)
    insurance_coverage_claimed = Column(Numeric(14, 2), nullable=True)
    insurance_type = Column(String(50), nullable=True)
    tpa_name = Column(String(255), nullable=True)
    already_paid = Column(Numeric(14, 2), default=0.0, nullable=False)

    # EL Components
    ead = Column(Numeric(14, 2), nullable=True)
    pd = Column(Numeric(7, 6), nullable=True)
    lgd = Column(Numeric(7, 6), nullable=True)
    recovery_rate = Column(Numeric(7, 6), nullable=True)
    expected_loss = Column(Numeric(14, 2), nullable=True)

    # Recovery Components
    p_insurance_pays = Column(Numeric(7, 6), nullable=True)
    p_dispute_succeeds = Column(Numeric(7, 6), nullable=True)
    p_hospital_waives = Column(Numeric(7, 6), nullable=True)
    expected_insurance_amount = Column(Numeric(14, 2), nullable=True)

    # Liquidity Risk
    immediate_obligation = Column(Numeric(14, 2), nullable=True)
    available_liquid_resources = Column(Numeric(14, 2), nullable=True)
    liquidity_gap = Column(Numeric(14, 2), nullable=True)
    lcr = Column(Numeric(7, 4), nullable=True)
    lcr_category = Column(String(20), nullable=True)
    dsti_ratio = Column(Numeric(7, 4), nullable=True)
    time_to_insolvency_months = Column(Integer, nullable=True)

    # VaR / CVaR (Monte Carlo 10,000 samples)
    mc_sample_count = Column(Integer, default=10000, nullable=False)
    el_mean = Column(Numeric(14, 2), nullable=True)
    el_std = Column(Numeric(14, 2), nullable=True)
    var_90 = Column(Numeric(14, 2), nullable=True)
    var_95 = Column(Numeric(14, 2), nullable=True)
    cvar_95 = Column(Numeric(14, 2), nullable=True)
    el_distribution_summary = Column(JSON, nullable=True)

    # Stress Test Results
    stress_scenarios = Column(JSON, nullable=True)
    worst_case_el = Column(Numeric(14, 2), nullable=True)
    worst_case_lcr = Column(Numeric(7, 4), nullable=True)

    # Model Risk
    prediction_confidence = Column(Numeric(5, 4), nullable=True)
    data_quality_score = Column(Numeric(5, 4), nullable=True)
    ood_ratio = Column(Numeric(5, 4), nullable=True)
    model_risk_level = Column(String(20), nullable=True)
    requires_human_review = Column(Boolean, default=False, nullable=False)
    human_review_reasons = Column(JSON, nullable=True)

    # Recommendations & Classification
    financial_recommendations = Column(JSON, nullable=True)
    hardship_category = Column(String(20), nullable=True)

    # Metadata
    frm_engine_version = Column(String(20), default="1.0.0", nullable=False)
    computed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    bill = relationship("Bill", back_populates="frm_assessment")
    audit = relationship("Audit", back_populates="frm_assessment", foreign_keys=[audit_id])
    scenario_results = relationship("StressScenarioResult", back_populates="assessment", cascade="all, delete-orphan")


class StressScenarioResult(Base):
    __tablename__ = "stress_scenario_results"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("financial_risk_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_name = Column(String(100), nullable=False)
    scenario_code = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    assumption_changes = Column(JSON, nullable=True)
    resulting_ead = Column(Numeric(14, 2), nullable=True)
    resulting_pd = Column(Numeric(7, 6), nullable=True)
    resulting_lgd = Column(Numeric(7, 6), nullable=True)
    resulting_el = Column(Numeric(14, 2), nullable=True)
    delta_el = Column(Numeric(14, 2), nullable=True)
    resulting_lcr = Column(Numeric(7, 4), nullable=True)
    delta_lcr = Column(Numeric(7, 4), nullable=True)
    resulting_time_to_insolvency = Column(Integer, nullable=True)
    stress_severity = Column(String(20), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    assessment = relationship("FinancialRiskAssessment", back_populates="scenario_results")


class ModelDriftLog(Base):
    __tablename__ = "model_drift_log"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bills.id", ondelete="SET NULL"), nullable=True, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("financial_risk_assessments.id", ondelete="SET NULL"), nullable=True, index=True)
    prediction_date = Column(DateTime(timezone=True), nullable=False)
    predicted_risk_score = Column(Numeric(5, 4), nullable=True)
    actual_outcome = Column(String(50), nullable=True)
    actual_recovery_amount = Column(Numeric(14, 2), nullable=True)
    actual_outcome_recorded_at = Column(DateTime(timezone=True), nullable=True)
    rolling_30d_avg_score = Column(Numeric(5, 4), nullable=True)
    training_baseline_score = Column(Numeric(5, 4), default=0.45, nullable=True)
    drift_detected = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
