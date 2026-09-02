"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-30 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
        op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone_number", sa.String(20), nullable=True),
        sa.Column("phone_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), server_default="patient", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_login_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("dpdp_consent_given", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("dpdp_consent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("phone_number"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_phone_number", "users", ["phone_number"])

    # 2. user_sessions table
    op.create_table(
        "user_sessions",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("refresh_token_hash", sa.String(255), nullable=False),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("ip_address", sa.String(50), nullable=True),
        sa.Column("is_revoked", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_sessions_user_id", "user_sessions", ["user_id"])

    # 3. bills table
    op.create_table(
        "bills",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("reference_number", sa.String(100), nullable=True),
        sa.Column("hospital_name", sa.String(500), nullable=True),
        sa.Column("patient_name", sa.String(255), nullable=True),
        sa.Column("admission_date", sa.Date(), nullable=True),
        sa.Column("discharge_date", sa.Date(), nullable=True),
        sa.Column("total_billed_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("bill_type", sa.String(50), nullable=True),
        sa.Column("insurance_type", sa.String(50), nullable=True),
        sa.Column("processing_status", sa.String(50), server_default="QUEUED", nullable=False),
        sa.Column("processing_job_id", sa.String(255), nullable=True),
        sa.Column("processing_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("processing_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("file_key", sa.String(1000), nullable=False),
        sa.Column("file_name_original", sa.String(500), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("file_mime_type", sa.String(100), nullable=False),
        sa.Column("file_hash_sha256", sa.String(64), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_bills_user_id", "bills", ["user_id"])
    op.create_index("ix_bills_processing_status", "bills", ["processing_status"])
    op.create_index("ix_bills_file_hash_sha256", "bills", ["file_hash_sha256"])

    # 4. bill_line_items table
    op.create_table(
        "bill_line_items",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("bill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("item_sequence", sa.Integer(), server_default="1", nullable=False),
        sa.Column("raw_description", sa.Text(), nullable=False),
        sa.Column("normalized_name", sa.String(500), nullable=True),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("quantity", sa.Numeric(10, 3), server_default="1.0", nullable=True),
        sa.Column("unit_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("total_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("gst_rate_applied", sa.Numeric(5, 2), server_default="0.0", nullable=True),
        sa.Column("extraction_confidence", sa.Numeric(5, 4), server_default="1.0", nullable=True),
        sa.Column("page_number", sa.Integer(), server_default="1", nullable=True),
        sa.Column("bounding_box", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["bill_id"], ["bills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_bill_line_items_bill_id", "bill_line_items", ["bill_id"])

    # 5. audits table
    op.create_table(
        "audits",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("bill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("audit_version", sa.String(20), server_default="1.0.0", nullable=False),
        sa.Column("statutory_ref_version", sa.String(20), server_default="1.0.0", nullable=False),
        sa.Column("ml_model_version", sa.String(50), server_default="xgb_mlp_ensemble_v1", nullable=False),
        sa.Column("total_overcharge_deterministic", sa.Numeric(14, 2), server_default="0.0", nullable=True),
        sa.Column("total_overcharge_ml_estimate", sa.Numeric(14, 2), server_default="0.0", nullable=True),
        sa.Column("total_billed", sa.Numeric(14, 2), nullable=True),
        sa.Column("risk_score", sa.Numeric(5, 4), nullable=True),
        sa.Column("risk_label", sa.String(20), nullable=True),
        sa.Column("uncertainty_lower", sa.Numeric(5, 4), nullable=True),
        sa.Column("uncertainty_upper", sa.Numeric(5, 4), nullable=True),
        sa.Column("shadow_bill_detected", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("finding_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("finding_summary", sa.JSON(), nullable=True),
        sa.Column("shap_values", sa.JSON(), nullable=True),
        sa.Column("recommendations", sa.JSON(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["bill_id"], ["bills.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("bill_id"),
    )
    op.create_index("ix_audits_bill_id", "audits", ["bill_id"])
    op.create_index("ix_audits_user_id", "audits", ["user_id"])

    # 6. audit_findings table
    op.create_table(
        "audit_findings",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("audit_id", UUID(as_uuid=True), nullable=False),
        sa.Column("bill_line_item_id", UUID(as_uuid=True), nullable=True),
        sa.Column("finding_type", sa.String(100), nullable=False),
        sa.Column("finding_source", sa.String(20), server_default="DETERMINISTIC", nullable=False),
        sa.Column("severity", sa.String(20), server_default="MEDIUM", nullable=False),
        sa.Column("item_description", sa.Text(), nullable=True),
        sa.Column("billed_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("benchmark_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("overcharge_amount", sa.Numeric(14, 2), server_default="0.0", nullable=True),
        sa.Column("statutory_reference", sa.String(500), nullable=True),
        sa.Column("ml_confidence", sa.Numeric(5, 4), nullable=True),
        sa.Column("shap_explanation", sa.JSON(), nullable=True),
        sa.Column("legal_basis", sa.Text(), nullable=True),
        sa.Column("user_explanation", sa.Text(), nullable=True),
        sa.Column("is_disputable", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["bill_line_item_id"], ["bill_line_items.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_findings_audit_id", "audit_findings", ["audit_id"])
    op.create_index("ix_audit_findings_bill_line_item_id", "audit_findings", ["bill_line_item_id"])

    # 7. notifications table
    op.create_table(
        "notifications",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(20), server_default="NORMAL", nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=True),
        sa.Column("entity_id", UUID(as_uuid=True), nullable=True),
        sa.Column("is_read", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("push_dispatched", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("push_dispatched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("push_delivery_status", sa.String(50), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("idempotency_key", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_notifications_user_id_is_read", "notifications", ["user_id", "is_read"])
    op.create_index("ix_notifications_user_id_created_at", "notifications", ["user_id", "created_at"])

    # 8. evidence_records table
    op.create_table(
        "evidence_records",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("bill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("audit_id", UUID(as_uuid=True), nullable=False),
        sa.Column("merkle_root", sa.String(64), nullable=False),
        sa.Column("hmac_signature", sa.String(128), nullable=False),
        sa.Column("canonical_payload", sa.JSON(), nullable=False),
        sa.Column("leaf_hashes", sa.JSON(), nullable=False),
        sa.Column("certificate_url", sa.String(1000), nullable=True),
        sa.Column("issued_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["bill_id"], ["bills.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("bill_id"),
        sa.UniqueConstraint("audit_id"),
    )

    # 9. payments table
    op.create_table(
        "payments",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("bill_id", UUID(as_uuid=True), nullable=True),
        sa.Column("order_id", sa.String(255), nullable=False),
        sa.Column("payment_id", sa.String(255), nullable=True),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(10), server_default="INR", nullable=False),
        sa.Column("status", sa.String(50), server_default="PENDING", nullable=False),
        sa.Column("gateway", sa.String(50), server_default="RAZORPAY", nullable=False),
        sa.Column("signature", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["bill_id"], ["bills.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("order_id"),
        sa.UniqueConstraint("payment_id"),
    )


def downgrade() -> None:
    op.drop_table("payments")
    op.drop_table("evidence_records")
    op.drop_table("notifications")
    op.drop_table("audit_findings")
    op.drop_table("audits")
    op.drop_table("bill_line_items")
    op.drop_table("bills")
    op.drop_table("user_sessions")
    op.drop_table("users")
