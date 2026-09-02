"""003_phase3_schema

Revision ID: 003_phase3_schema
Revises: 002_frm_layer
Create Date: 2026-09-02 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "003_phase3_schema"
down_revision: Union[str, None] = "002_frm_layer"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. organizations
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("org_type", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), unique=True, nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("settings_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 2. devices
    op.create_table(
        "devices",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("installation_id", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=True),
        sa.Column("app_version", sa.String(), nullable=True),
        sa.Column("push_provider", sa.String(), nullable=True),
        sa.Column("encrypted_push_token", sa.Text(), nullable=True),
        sa.Column("push_permission", sa.String(), server_default="UNKNOWN", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "installation_id", name="uq_devices_user_installation"),
        sa.CheckConstraint("platform IN ('WEB', 'ANDROID', 'IOS')", name="ck_devices_platform"),
    )

    # 3. invoices
    op.create_table(
        "invoices",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=True),
        sa.Column("encounter_id", sa.String(), nullable=True),
        sa.Column("patient_id", sa.String(), nullable=True),
        sa.Column("hospital_id", sa.String(), nullable=True),
        sa.Column("invoice_number", sa.String(), nullable=False),
        sa.Column("invoice_date", sa.String(), nullable=True),
        sa.Column("gross_amount", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("discount_amount", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("tax_amount", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("net_amount", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("fair_estimate_amount", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("total_overcharge", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("risk_score", sa.Numeric(5, 2), server_default="0.00", nullable=True),
        sa.Column("status", sa.String(), server_default="ISSUED", nullable=False),
        sa.Column("plain_summary", sa.Text(), nullable=True),
        sa.Column("risk_flags_summary", sa.JSON(), nullable=True),
        sa.Column("raw_document_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 4. documents
    op.create_table(
        "documents",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=True),
        sa.Column("invoice_id", sa.String(), sa.ForeignKey("invoices.id"), nullable=True),
        sa.Column("uploaded_by_user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("storage_key", sa.String(), nullable=False),
        sa.Column("original_filename", sa.String(), nullable=False),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("byte_size", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False),
        sa.Column("status", sa.String(), server_default="UPLOADED", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("byte_size >= 0", name="ck_documents_byte_size_nonnegative"),
    )

    # 5. document_fields
    op.create_table(
        "document_fields",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("document_id", sa.String(), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("field_name", sa.String(), nullable=False),
        sa.Column("extracted_value", sa.JSON(), nullable=False),
        sa.Column("normalized_value", sa.JSON(), nullable=True),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("bounding_box", sa.JSON(), nullable=True),
        sa.Column("confidence", sa.Numeric(4, 3), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("document_id", "field_name", "page_number", name="uq_document_fields_location"),
        sa.CheckConstraint("confidence IS NULL OR (confidence >= 0 AND confidence <= 1)", name="ck_document_fields_confidence"),
        sa.CheckConstraint("page_number IS NULL OR page_number > 0", name="ck_document_fields_page"),
    )

    # 6. model_versions
    op.create_table(
        "model_versions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("model_name", sa.String(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("feature_schema_version", sa.String(), nullable=False),
        sa.Column("artifact_sha256", sa.String(64), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("model_name", "version", name="uq_model_versions_name_version"),
    )

    # 7. financial_assessments
    op.create_table(
        "financial_assessments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("invoice_id", sa.String(), sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("model_version_id", sa.String(), sa.ForeignKey("model_versions.id"), nullable=True),
        sa.Column("calculation_version", sa.String(), nullable=False),
        sa.Column("currency", sa.String(3), server_default="INR", nullable=False),
        sa.Column("invoice_total", sa.Numeric(12, 2), nullable=False),
        sa.Column("insurance_contribution", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("tpa_adjustment", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("net_paid", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("verified_patient_responsibility", sa.Numeric(12, 2), nullable=False),
        sa.Column("outstanding_balance", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("overpayment", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("unexplained_variance", sa.Numeric(12, 2), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("input_hash", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("invoice_total >= 0", name="ck_financial_assessments_invoice_total"),
        sa.CheckConstraint("verified_patient_responsibility >= 0", name="ck_financial_assessments_liability"),
        sa.CheckConstraint("net_paid >= 0", name="ck_financial_assessments_net_paid"),
    )


def downgrade() -> None:
    op.drop_table("financial_assessments")
    op.drop_table("model_versions")
    op.drop_table("document_fields")
    op.drop_table("documents")
    op.drop_table("invoices")
    op.drop_table("devices")
    op.drop_table("organizations")
