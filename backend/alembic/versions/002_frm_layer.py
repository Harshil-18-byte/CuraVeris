"""002_frm_layer

Revision ID: 002_frm_layer
Revises: 001_initial_schema
Create Date: 2026-09-02 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "002_frm_layer"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. financial_risk_assessments table
    op.create_table(
        "financial_risk_assessments",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("bill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("audit_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),

        # Inputs
        sa.Column("monthly_income", sa.Numeric(14, 2), nullable=True),
        sa.Column("monthly_expenses", sa.Numeric(14, 2), nullable=True),
        sa.Column("verified_savings", sa.Numeric(14, 2), nullable=True),
        sa.Column("insurance_coverage_claimed", sa.Numeric(14, 2), nullable=True),
        sa.Column("insurance_type", sa.String(50), nullable=True),
        sa.Column("tpa_name", sa.String(255), nullable=True),
        sa.Column("already_paid", sa.Numeric(14, 2), server_default="0.0", nullable=False),

        # EL Components
        sa.Column("ead", sa.Numeric(14, 2), nullable=True),
        sa.Column("pd", sa.Numeric(7, 6), nullable=True),
        sa.Column("lgd", sa.Numeric(7, 6), nullable=True),
        sa.Column("recovery_rate", sa.Numeric(7, 6), nullable=True),
        sa.Column("expected_loss", sa.Numeric(14, 2), nullable=True),

        # Recovery Components
        sa.Column("p_insurance_pays", sa.Numeric(7, 6), nullable=True),
        sa.Column("p_dispute_succeeds", sa.Numeric(7, 6), nullable=True),
        sa.Column("p_hospital_waives", sa.Numeric(7, 6), nullable=True),
        sa.Column("expected_insurance_amount", sa.Numeric(14, 2), nullable=True),

        # Liquidity Risk
        sa.Column("immediate_obligation", sa.Numeric(14, 2), nullable=True),
        sa.Column("available_liquid_resources", sa.Numeric(14, 2), nullable=True),
        sa.Column("liquidity_gap", sa.Numeric(14, 2), nullable=True),
        sa.Column("lcr", sa.Numeric(7, 4), nullable=True),
        sa.Column("lcr_category", sa.String(20), nullable=True),
        sa.Column("dsti_ratio", sa.Numeric(7, 4), nullable=True),
        sa.Column("time_to_insolvency_months", sa.Integer(), nullable=True),

        # VaR / CVaR
        sa.Column("mc_sample_count", sa.Integer(), server_default="10000", nullable=False),
        sa.Column("el_mean", sa.Numeric(14, 2), nullable=True),
        sa.Column("el_std", sa.Numeric(14, 2), nullable=True),
        sa.Column("var_90", sa.Numeric(14, 2), nullable=True),
        sa.Column("var_95", sa.Numeric(14, 2), nullable=True),
        sa.Column("cvar_95", sa.Numeric(14, 2), nullable=True),
        sa.Column("el_distribution_summary", sa.JSON(), nullable=True),

        # Stress Test Results
        sa.Column("stress_scenarios", sa.JSON(), nullable=True),
        sa.Column("worst_case_el", sa.Numeric(14, 2), nullable=True),
        sa.Column("worst_case_lcr", sa.Numeric(7, 4), nullable=True),

        # Model Risk
        sa.Column("prediction_confidence", sa.Numeric(5, 4), nullable=True),
        sa.Column("data_quality_score", sa.Numeric(5, 4), nullable=True),
        sa.Column("ood_ratio", sa.Numeric(5, 4), nullable=True),
        sa.Column("model_risk_level", sa.String(20), nullable=True),
        sa.Column("requires_human_review", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("human_review_reasons", sa.JSON(), nullable=True),

        # Recommendations
        sa.Column("financial_recommendations", sa.JSON(), nullable=True),
        sa.Column("hardship_category", sa.String(20), nullable=True),

        # Metadata
        sa.Column("frm_engine_version", sa.String(20), server_default="1.0.0", nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        sa.ForeignKeyConstraint(["bill_id"], ["bills.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("bill_id"),
        sa.UniqueConstraint("audit_id"),
    )
    op.create_index("ix_frm_assessments_bill_id", "financial_risk_assessments", ["bill_id"])
    op.create_index("ix_frm_assessments_audit_id", "financial_risk_assessments", ["audit_id"])
    op.create_index("ix_frm_assessments_user_id", "financial_risk_assessments", ["user_id"])

    # 2. stress_scenario_results table
    op.create_table(
        "stress_scenario_results",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("assessment_id", UUID(as_uuid=True), nullable=False),
        sa.Column("scenario_name", sa.String(100), nullable=False),
        sa.Column("scenario_code", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("assumption_changes", sa.JSON(), nullable=True),
        sa.Column("resulting_ead", sa.Numeric(14, 2), nullable=True),
        sa.Column("resulting_pd", sa.Numeric(7, 6), nullable=True),
        sa.Column("resulting_lgd", sa.Numeric(7, 6), nullable=True),
        sa.Column("resulting_el", sa.Numeric(14, 2), nullable=True),
        sa.Column("delta_el", sa.Numeric(14, 2), nullable=True),
        sa.Column("resulting_lcr", sa.Numeric(7, 4), nullable=True),
        sa.Column("delta_lcr", sa.Numeric(7, 4), nullable=True),
        sa.Column("resulting_time_to_insolvency", sa.Integer(), nullable=True),
        sa.Column("stress_severity", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        sa.ForeignKeyConstraint(["assessment_id"], ["financial_risk_assessments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_stress_scenario_results_assessment_id", "stress_scenario_results", ["assessment_id"])

    # 3. model_drift_log table
    op.create_table(
        "model_drift_log",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("bill_id", UUID(as_uuid=True), nullable=True),
        sa.Column("assessment_id", UUID(as_uuid=True), nullable=True),
        sa.Column("prediction_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("predicted_risk_score", sa.Numeric(5, 4), nullable=True),
        sa.Column("actual_outcome", sa.String(50), nullable=True),
        sa.Column("actual_recovery_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("actual_outcome_recorded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rolling_30d_avg_score", sa.Numeric(5, 4), nullable=True),
        sa.Column("training_baseline_score", sa.Numeric(5, 4), server_default="0.45", nullable=True),
        sa.Column("drift_detected", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        sa.ForeignKeyConstraint(["bill_id"], ["bills.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["assessment_id"], ["financial_risk_assessments.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_model_drift_log_bill_id", "model_drift_log", ["bill_id"])
    op.create_index("ix_model_drift_log_assessment_id", "model_drift_log", ["assessment_id"])

    # 4. Add frm_assessment_id to audits table
    op.add_column(
        "audits",
        sa.Column("frm_assessment_id", UUID(as_uuid=True), nullable=True),
    )
    bind = op.get_bind()
    if bind.dialect.name != "sqlite":
        op.create_foreign_key(
            "fk_audits_frm_assessment_id",
            "audits",
            "financial_risk_assessments",
            ["frm_assessment_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "sqlite":
        op.drop_constraint("fk_audits_frm_assessment_id", "audits", type_="foreignkey")
    op.drop_column("audits", "frm_assessment_id")
    op.drop_table("model_drift_log")
    op.drop_table("stress_scenario_results")
    op.drop_table("financial_risk_assessments")
