"""
Canonical Multi-Tenant Financial and Healthcare Data Model for CuraVeris.

All monetary amounts are stored using Numeric(12, 2) to guarantee exact decimal arithmetic.
All entities include UUID primary keys, tenant/organization scoping, timestamps, and auditability.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Numeric, Boolean, DateTime, ForeignKey, Text, JSON, Index, CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# 1. Tenancy & Access Management
# ---------------------------------------------------------------------------

class Organization(Base):
    """Represents a tenant entity: Hospital Group, TPA, Insurer, or Platform."""
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    org_type = Column(String, nullable=False, index=True)  # hospital, tpa, insurer, platform
    slug = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    settings_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    hospitals = relationship("Hospital", back_populates="organization")
    tpas = relationship("TPA", back_populates="organization")
    insurers = relationship("InsuranceProvider", back_populates="organization")


class User(Base):
    """User account with role-based access control and tenant context."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="PATIENT", index=True)  # PATIENT, HOSPITAL_ADMIN, HOSPITAL_FINANCE, HOSPITAL_BILLING, HOSPITAL_AUDITOR, TPA_REVIEWER, TPA_ADMIN, INSURER_REVIEWER, INSURER_ADMIN, PLATFORM_ADMIN
    encrypted_phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="users")
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="actor")
    bills = relationship("Bill", back_populates="owner", cascade="all, delete-orphan")


class RefreshToken(Base):
    """Stores active JWT refresh tokens for secure rotation and revocation."""
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    device_id = Column(String, ForeignKey("devices.id"), index=True, nullable=True)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="refresh_tokens")
    device = relationship("Device", back_populates="refresh_tokens")


class Device(Base):
    """A client installation, not a verified person, phone number, or SIM identity."""
    __tablename__ = "devices"
    __table_args__ = (
        UniqueConstraint("user_id", "installation_id", name="uq_devices_user_installation"),
        CheckConstraint("platform IN ('WEB', 'ANDROID', 'IOS')", name="ck_devices_platform"),
        Index("ix_devices_user_active", "user_id", "is_active"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    installation_id = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    app_version = Column(String, nullable=True)
    push_provider = Column(String, nullable=True)
    encrypted_push_token = Column(Text, nullable=True)
    push_permission = Column(String, nullable=False, default="UNKNOWN")
    is_active = Column(Boolean, nullable=False, default=True)
    last_seen_at = Column(DateTime, default=utc_now, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="devices")
    refresh_tokens = relationship("RefreshToken", back_populates="device")
    notification_deliveries = relationship("NotificationDelivery", back_populates="device")


class NotificationPreference(Base):
    """Per-user notification policy; provider credentials are never stored here."""
    __tablename__ = "notification_preferences"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    push_enabled = Column(Boolean, nullable=False, default=True)
    in_app_enabled = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


class Notification(Base):
    """Persistent domain notification. Payload intentionally excludes sensitive details."""
    __tablename__ = "notifications"
    __table_args__ = (UniqueConstraint("user_id", "event_id", name="uq_notifications_user_event"), Index("ix_notifications_user_read", "user_id", "read_at"))
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    event_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False, index=True)
    priority = Column(String, nullable=False, default="NORMAL")
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    deep_link = Column(String, nullable=True)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    deliveries = relationship("NotificationDelivery", back_populates="notification", cascade="all, delete-orphan")


class NotificationDelivery(Base):
    """Idempotent, provider-neutral delivery outcome for one device and notification."""
    __tablename__ = "notification_deliveries"
    __table_args__ = (UniqueConstraint("notification_id", "device_id", name="uq_notification_deliveries_target"), Index("ix_notification_deliveries_status", "status", "next_attempt_at"))
    id = Column(String, primary_key=True, default=generate_uuid)
    notification_id = Column(String, ForeignKey("notifications.id"), nullable=False, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False, index=True)
    provider = Column(String, nullable=False)
    status = Column(String, nullable=False, default="PENDING")
    attempt_count = Column(Integer, nullable=False, default=0)
    next_attempt_at = Column(DateTime, nullable=True)
    provider_message_id = Column(String, nullable=True)
    failure_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    notification = relationship("Notification", back_populates="deliveries")
    device = relationship("Device", back_populates="notification_deliveries")


# ---------------------------------------------------------------------------
# 2. Domain Stakeholders (Patient, Hospital, TPA, Insurer)
# ---------------------------------------------------------------------------

class Patient(Base):
    """Patient demographic and encrypted identity record."""
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=True, index=True)
    encrypted_name = Column(String, nullable=False)
    encrypted_phone = Column(String, nullable=True)
    encrypted_email = Column(String, nullable=True)
    encrypted_abha_id = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    address_enc = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="patient_profile")
    encounters = relationship("Encounter", back_populates="patient")
    invoices = relationship("Invoice", back_populates="patient")
    claims = relationship("Claim", back_populates="patient")
    payments = relationship("Payment", back_populates="patient")


class Hospital(Base):
    """Hospital facility profile with NABH accreditation and tariff configuration."""
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    hospital_name = Column(String, index=True, nullable=False)
    registration_no = Column(String, unique=True, nullable=True)
    tier = Column(Integer, default=1)  # 1 = Metro / Tier 1, 2 = Tier 2, 3 = Tier 3
    is_nabh = Column(Boolean, default=True)
    city = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="hospitals")
    encounters = relationship("Encounter", back_populates="hospital")
    invoices = relationship("Invoice", back_populates="hospital")


class InsuranceProvider(Base):
    """Health Insurance Company registered with IRDAI."""
    __tablename__ = "insurance_providers"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    company_name = Column(String, unique=True, index=True, nullable=False)
    irdai_registration_no = Column(String, unique=True, nullable=False)
    contact_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="insurers")
    claims = relationship("Claim", back_populates="insurance_provider")


class TPA(Base):
    """Third Party Administrator licensed by IRDAI."""
    __tablename__ = "tpas"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    tpa_name = Column(String, unique=True, index=True, nullable=False)
    irdai_license_no = Column(String, unique=True, nullable=False)
    contact_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="tpas")
    claims = relationship("Claim", back_populates="tpa")


# ---------------------------------------------------------------------------
# 3. Clinical Encounter & Medical Invoices
# ---------------------------------------------------------------------------

class Encounter(Base):
    """Clinical inpatient or outpatient admission episode."""
    __tablename__ = "encounters"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), index=True, nullable=False)
    hospital_id = Column(String, ForeignKey("hospitals.id"), index=True, nullable=False)
    admission_date = Column(String, nullable=True)
    discharge_date = Column(String, nullable=True)
    days_admitted = Column(Integer, default=1)
    primary_diagnosis = Column(String, nullable=True)
    icd10_code = Column(String, index=True, nullable=True)
    department = Column(String, nullable=True)
    treating_doctor = Column(String, nullable=True)
    status = Column(String, default="DISCHARGED")  # ADMITTED, DISCHARGED, CANCELLED
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="encounters")
    hospital = relationship("Hospital", back_populates="encounters")
    invoices = relationship("Invoice", back_populates="encounter")


class Invoice(Base):
    """Hospital Medical Bill / Invoice entity."""
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, index=True, nullable=True)  # Organization ID scoping
    encounter_id = Column(String, ForeignKey("encounters.id"), nullable=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True, index=True)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=True, index=True)
    
    invoice_number = Column(String, index=True, nullable=False)
    invoice_date = Column(String, nullable=True)
    
    # Financial fields in Decimal Numeric(12, 2)
    gross_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    net_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    fair_estimate_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_overcharge = Column(Numeric(12, 2), default=0.00, nullable=False)
    
    risk_score = Column(Numeric(5, 2), default=0.00)  # 0 to 100.00
    status = Column(String, default="ISSUED", index=True)  # DRAFT, ISSUED, AUDITED, PARTIALLY_PAID, PAID, DISPUTED, CANCELLED
    plain_summary = Column(Text, nullable=True)
    risk_flags_summary = Column(JSON, default=list)
    raw_document_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    encounter = relationship("Encounter", back_populates="invoices")
    patient = relationship("Patient", back_populates="invoices")
    hospital = relationship("Hospital", back_populates="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")
    reconciliation = relationship("Reconciliation", back_populates="invoice", uselist=False)
    disputes = relationship("Dispute", back_populates="invoice")
    audit_findings = relationship("AuditFinding", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLineItem(Base):
    """Line item on a hospital bill with statutory benchmarks and risk flags."""
    __tablename__ = "invoice_line_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), index=True, nullable=False)
    
    raw_text = Column(String, nullable=False)
    normalized_name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)  # pharmacy, procedure, room_nursing, consumable, diagnostic, tax
    
    quantity = Column(Numeric(10, 2), default=1.00, nullable=False)
    unit = Column(String, default="units")
    unit_price = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    
    # Benchmarks
    mrp = Column(Numeric(12, 2), nullable=True)
    cghs_rate = Column(Numeric(12, 2), nullable=True)
    nppa_ceiling = Column(Numeric(12, 2), nullable=True)
    
    # Audit outcome
    is_flagged = Column(Boolean, default=False, index=True)
    risk_flags = Column(JSON, default=list)
    overcharge_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    legal_citation = Column(String, nullable=True)
    patient_explanation = Column(Text, nullable=True)
    action_recommended = Column(Text, nullable=True)
    confidence_score = Column(Numeric(4, 2), default=1.00)

    invoice = relationship("Invoice", back_populates="line_items")
    claim_lines = relationship("ClaimLine", back_populates="invoice_line_item")
    audit_findings = relationship("AuditFinding", back_populates="line_item")


# ---------------------------------------------------------------------------
# 3A. Document, provenance, model, and financial-truth persistence
# ---------------------------------------------------------------------------

class Document(Base):
    """Private object-storage metadata for a source document; never stores content."""
    __tablename__ = "documents"
    __table_args__ = (
        UniqueConstraint("tenant_id", "storage_key", name="uq_documents_tenant_storage_key"),
        CheckConstraint("byte_size >= 0", name="ck_documents_byte_size_nonnegative"),
        Index("ix_documents_invoice_created", "invoice_id", "created_at"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("organizations.id"), nullable=True, index=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=True, index=True)
    uploaded_by_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    storage_key = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    byte_size = Column(Integer, nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    status = Column(String, nullable=False, default="UPLOADED", index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    fields = relationship("DocumentField", back_populates="document", cascade="all, delete-orphan")


class DocumentField(Base):
    """A normalized critical extraction with source coordinates and confidence."""
    __tablename__ = "document_fields"
    __table_args__ = (
        UniqueConstraint("document_id", "field_name", "page_number", name="uq_document_fields_location"),
        CheckConstraint("confidence IS NULL OR (confidence >= 0 AND confidence <= 1)", name="ck_document_fields_confidence"),
        CheckConstraint("page_number IS NULL OR page_number > 0", name="ck_document_fields_page"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    field_name = Column(String, nullable=False, index=True)
    extracted_value = Column(JSON, nullable=False)
    normalized_value = Column(JSON, nullable=True)
    page_number = Column(Integer, nullable=True)
    bounding_box = Column(JSON, nullable=True)
    confidence = Column(Numeric(4, 3), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    document = relationship("Document", back_populates="fields")


class ModelVersion(Base):
    """Immutable identifier for a deployed advisory model and its feature schema."""
    __tablename__ = "model_versions"
    __table_args__ = (UniqueConstraint("model_name", "version", name="uq_model_versions_name_version"),)

    id = Column(String, primary_key=True, default=generate_uuid)
    model_name = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    feature_schema_version = Column(String, nullable=False)
    artifact_sha256 = Column(String(64), nullable=True)
    is_active = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


class FinancialAssessment(Base):
    """Immutable deterministic financial-truth snapshot for an invoice."""
    __tablename__ = "financial_assessments"
    __table_args__ = (
        CheckConstraint("invoice_total >= 0", name="ck_financial_assessments_invoice_total"),
        CheckConstraint("verified_patient_responsibility >= 0", name="ck_financial_assessments_liability"),
        CheckConstraint("net_paid >= 0", name="ck_financial_assessments_net_paid"),
        Index("ix_financial_assessments_invoice_created", "invoice_id", "created_at"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False, index=True)
    model_version_id = Column(String, ForeignKey("model_versions.id"), nullable=True, index=True)
    calculation_version = Column(String, nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    invoice_total = Column(Numeric(12, 2), nullable=False)
    insurance_contribution = Column(Numeric(12, 2), nullable=False, default=0)
    tpa_adjustment = Column(Numeric(12, 2), nullable=False, default=0)
    net_paid = Column(Numeric(12, 2), nullable=False, default=0)
    verified_patient_responsibility = Column(Numeric(12, 2), nullable=False)
    outstanding_balance = Column(Numeric(12, 2), nullable=False, default=0)
    overpayment = Column(Numeric(12, 2), nullable=False, default=0)
    unexplained_variance = Column(Numeric(12, 2), nullable=True)
    status = Column(String, nullable=False, index=True)
    input_hash = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    evidence_references = relationship("FinancialAssessmentEvidence", back_populates="financial_assessment", cascade="all, delete-orphan")


class FinancialAssessmentEvidence(Base):
    """Links each financial assessment input to a concrete extracted source field."""
    __tablename__ = "financial_assessment_evidence"
    __table_args__ = (UniqueConstraint("financial_assessment_id", "document_field_id", name="uq_assessment_evidence_reference"),)

    id = Column(String, primary_key=True, default=generate_uuid)
    financial_assessment_id = Column(String, ForeignKey("financial_assessments.id"), nullable=False, index=True)
    document_field_id = Column(String, ForeignKey("document_fields.id"), nullable=False, index=True)
    input_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    financial_assessment = relationship("FinancialAssessment", back_populates="evidence_references")


# ---------------------------------------------------------------------------
# 4. Insurance Claims & TPA Adjudication
# ---------------------------------------------------------------------------

class Claim(Base):
    """Insurance claim submitted against an invoice."""
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, index=True, nullable=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), index=True, nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), index=True, nullable=False)
    hospital_id = Column(String, ForeignKey("hospitals.id"), index=True, nullable=False)
    insurance_provider_id = Column(String, ForeignKey("insurance_providers.id"), index=True, nullable=False)
    tpa_id = Column(String, ForeignKey("tpas.id"), index=True, nullable=True)
    
    claim_number = Column(String, unique=True, index=True, nullable=False)
    claimed_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    eligible_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    approved_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    deduction_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    co_pay_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    status = Column(String, default="SUBMITTED", index=True)  # SUBMITTED, IN_REVIEW, QUERIED, APPROVED, PARTIALLY_APPROVED, REJECTED, SETTLED
    status_reason = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=utc_now)
    adjudicated_at = Column(DateTime, nullable=True)

    invoice = relationship("Invoice", back_populates="claims")
    patient = relationship("Patient", back_populates="claims")
    insurance_provider = relationship("InsuranceProvider", back_populates="claims")
    tpa = relationship("TPA", back_populates="claims")
    claim_lines = relationship("ClaimLine", back_populates="claim", cascade="all, delete-orphan")
    insurance_approvals = relationship("InsuranceApproval", back_populates="claim")
    tpa_approvals = relationship("TPAApproval", back_populates="claim")


class ClaimLine(Base):
    """Line-by-line claim adjudication and deduction reasons."""
    __tablename__ = "claim_lines"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), index=True, nullable=False)
    invoice_line_item_id = Column(String, ForeignKey("invoice_line_items.id"), index=True, nullable=False)
    
    claimed_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    approved_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    deduction_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    deduction_reason = Column(String, nullable=True)
    is_admissible = Column(Boolean, default=True)

    claim = relationship("Claim", back_populates="claim_lines")
    invoice_line_item = relationship("InvoiceLineItem", back_populates="claim_lines")


class InsuranceApproval(Base):
    """Formal sanction from Insurer."""
    __tablename__ = "insurance_approvals"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), index=True, nullable=False)
    sanction_letter_no = Column(String, index=True, nullable=False)
    approved_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    co_pay_percentage = Column(Numeric(5, 2), default=0.00)
    room_rent_capping = Column(Numeric(12, 2), nullable=True)
    deduction_summary = Column(Text, nullable=True)
    approved_at = Column(DateTime, default=utc_now)

    claim = relationship("Claim", back_populates="insurance_approvals")


class TPAApproval(Base):
    """TPA verification and settlement authorization."""
    __tablename__ = "tpa_approvals"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), index=True, nullable=False)
    tpa_reference_no = Column(String, index=True, nullable=False)
    tpa_approved_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tpa_deductions = Column(Numeric(12, 2), default=0.00, nullable=False)
    remarks = Column(Text, nullable=True)
    approved_at = Column(DateTime, default=utc_now)

    claim = relationship("Claim", back_populates="tpa_approvals")


# ---------------------------------------------------------------------------
# 5. Payments, Gateway & Settlements
# ---------------------------------------------------------------------------

class Payment(Base):
    """Payment transaction record initiated by patient or insurer."""
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, index=True, nullable=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), index=True, nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), index=True, nullable=True)
    
    gateway = Column(String, default="RAZORPAY", nullable=False)
    order_id = Column(String, index=True, nullable=True)
    payment_id = Column(String, unique=True, index=True, nullable=False)
    
    amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    method = Column(String, default="UPI")  # UPI, CARD, NETBANKING
    status = Column(String, default="CAPTURED", index=True)  # CREATED, AUTHORIZED, CAPTURED, FAILED, REFUNDED
    gateway_fee = Column(Numeric(12, 2), default=0.00)
    gateway_tax = Column(Numeric(12, 2), default=0.00)
    created_at = Column(DateTime, default=utc_now)

    invoice = relationship("Invoice", back_populates="payments")
    patient = relationship("Patient", back_populates="payments")
    attempts = relationship("PaymentAttempt", back_populates="payment", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="payment", cascade="all, delete-orphan")


class PaymentAttempt(Base):
    """Record of individual gateway handshake / payment attempts."""
    __tablename__ = "payment_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    payment_id = Column(String, ForeignKey("payments.id"), index=True, nullable=False)
    gateway_response = Column(JSON, default=dict)
    error_code = Column(String, nullable=True)
    error_description = Column(Text, nullable=True)
    attempt_timestamp = Column(DateTime, default=utc_now)

    payment = relationship("Payment", back_populates="attempts")


class Refund(Base):
    """Refund issued to patient or insurer."""
    __tablename__ = "refunds"

    id = Column(String, primary_key=True, default=generate_uuid)
    payment_id = Column(String, ForeignKey("payments.id"), index=True, nullable=False)
    refund_gateway_id = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="PROCESSED", index=True)  # PENDING, PROCESSED, FAILED
    created_at = Column(DateTime, default=utc_now)

    payment = relationship("Payment", back_populates="refunds")


class Settlement(Base):
    """Bank settlement payout received from payment gateway."""
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, index=True, nullable=True)
    gateway_settlement_id = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    fees = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax = Column(Numeric(12, 2), default=0.00, nullable=False)
    utr_number = Column(String, index=True, nullable=True)
    settled_at = Column(DateTime, default=utc_now)


class WebhookEventRecord(Base):
    """Idempotency and audit log for received gateway webhooks."""
    __tablename__ = "webhook_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, index=True, nullable=False)
    source = Column(String, default="RAZORPAY", nullable=False)
    payload = Column(JSON, default=dict)
    processed = Column(Boolean, default=False, index=True)
    processed_at = Column(DateTime, nullable=True)
    error_log = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


# ---------------------------------------------------------------------------
# 6. Multi-Party Reconciliation & Exceptions
# ---------------------------------------------------------------------------

class Reconciliation(Base):
    """Four-way canonical reconciliation entity."""
    __tablename__ = "reconciliations"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, index=True, nullable=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), unique=True, index=True, nullable=False)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=True, index=True)
    
    gross_billed = Column(Numeric(12, 2), default=0.00, nullable=False)
    statutory_overcharge = Column(Numeric(12, 2), default=0.00, nullable=False)
    fair_bill_total = Column(Numeric(12, 2), default=0.00, nullable=False)
    
    insurance_approved = Column(Numeric(12, 2), default=0.00, nullable=False)
    tpa_deductions = Column(Numeric(12, 2), default=0.00, nullable=False)
    effective_insurer_share = Column(Numeric(12, 2), default=0.00, nullable=False)
    
    legitimate_patient_share = Column(Numeric(12, 2), default=0.00, nullable=False)
    patient_paid = Column(Numeric(12, 2), default=0.00, nullable=False)
    patient_unjust_gap = Column(Numeric(12, 2), default=0.00, nullable=False)
    outstanding_patient_balance = Column(Numeric(12, 2), default=0.00, nullable=False)
    
    settled_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    status = Column(String, default="BALANCED", index=True)  # BALANCED, EXCEPTION, PENDING_SETTLEMENT, REFUND_DUE
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    invoice = relationship("Invoice", back_populates="reconciliation")
    exceptions = relationship("ReconciliationException", back_populates="reconciliation", cascade="all, delete-orphan")


class ReconciliationException(Base):
    """Specific reconciliation mismatch or operational anomaly."""
    __tablename__ = "reconciliation_exceptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    reconciliation_id = Column(String, ForeignKey("reconciliations.id"), index=True, nullable=False)
    
    exception_type = Column(String, index=True, nullable=False)  # OVERCHARGE, TPA_MISMATCH, PAYMENT_GAP, DUPLICATE_PAYMENT, UNEXPLAINED_BALANCE, SETTLEMENT_DEFICIT
    severity = Column(String, default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    cause = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=True)
    status = Column(String, default="OPEN", index=True)  # OPEN, INVESTIGATING, RESOLVED, WAIVED
    assigned_to = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)

    reconciliation = relationship("Reconciliation", back_populates="exceptions")


# ---------------------------------------------------------------------------
# 7. Audit Findings, Disputes & Cryptographic Evidence
# ---------------------------------------------------------------------------

class AuditFinding(Base):
    """Detailed statutory violation or anomaly finding."""
    __tablename__ = "audit_findings"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), index=True, nullable=False)
    line_item_id = Column(String, ForeignKey("invoice_line_items.id"), index=True, nullable=True)
    
    rule_id = Column(String, index=True, nullable=False)
    finding_type = Column(String, index=True, nullable=False)
    billed_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    reference_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    difference_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    confidence = Column(Numeric(4, 2), default=1.00)
    evidence_text = Column(Text, nullable=True)
    statutory_reference = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    invoice = relationship("Invoice", back_populates="audit_findings")
    line_item = relationship("InvoiceLineItem", back_populates="audit_findings")


class Dispute(Base):
    """Legal dispute letter and petition generated for patient advocacy."""
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), index=True, nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), index=True, nullable=True)
    
    forum_type = Column(String, index=True, nullable=False)  # HOSPITAL_GRIEVANCE, INSURANCE_OMBUDSMAN, CONSUMER_COURT, NPPA
    target_authority = Column(String, nullable=False)
    title = Column(String, nullable=False)
    letter_body = Column(Text, nullable=False)
    statutory_citations = Column(JSON, default=list)
    disputed_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    status = Column(String, default="DRAFT", index=True)  # DRAFT, SUBMITTED, RESOLVED, REJECTED
    created_at = Column(DateTime, default=utc_now)

    invoice = relationship("Invoice", back_populates="disputes")
    evidence = relationship("EvidenceArtifact", back_populates="dispute", uselist=False)


class EvidenceArtifact(Base):
    """Cryptographic Section 65B tamper-evident certificate."""
    __tablename__ = "evidence_artifacts"

    id = Column(String, primary_key=True, default=generate_uuid)
    dispute_id = Column(String, ForeignKey("disputes.id"), unique=True, index=True, nullable=False)
    merkle_root = Column(String, nullable=False)
    block_hash = Column(String, nullable=False)
    hmac_signature = Column(String, nullable=False)
    certificate_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)

    dispute = relationship("Dispute", back_populates="evidence")


class MerkleAuditBlock(Base):
    """Persisted blockchain-style Merkle audit ledger block."""
    __tablename__ = "merkle_audit_blocks"

    id = Column(String, primary_key=True, default=generate_uuid)
    block_index = Column(Integer, unique=True, index=True, nullable=False)
    bill_id = Column(String, index=True, nullable=False)
    timestamp = Column(String, nullable=False)
    total_billed = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_overcharge = Column(Numeric(12, 2), default=0.00, nullable=False)
    risk_score = Column(Numeric(5, 2), default=0.00)
    merkle_root = Column(String, nullable=False)
    prev_hash = Column(String, nullable=False)
    block_hash = Column(String, unique=True, index=True, nullable=False)
    signature = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class AuditEvent(Base):
    """Immutable audit trail for all system access and financial mutations."""
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, index=True, nullable=True)
    actor_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    action = Column(String, index=True, nullable=False)  # e.g. INVOICE_CREATED, RECONCILIATION_RUN, PAYMENT_VERIFIED
    resource_type = Column(String, index=True, nullable=False)
    resource_id = Column(String, index=True, nullable=False)
    ip_address = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=utc_now, index=True)

    actor = relationship("User", back_populates="audit_events")


# ---------------------------------------------------------------------------
# 8. Legacy Compatibility Models (Bill, BillItem, PaymentReconciliation, DisputeLetter)
# ---------------------------------------------------------------------------

class Bill(Base):
    __tablename__ = "bills"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    hospital_name = Column(String, index=True, nullable=False)
    city = Column(String, nullable=True)
    tier = Column(Integer, default=1)
    is_nabh = Column(Boolean, default=True)
    patient_name_enc = Column(String, nullable=True)
    diagnosis = Column(String, nullable=True)
    admission_date = Column(String, nullable=True)
    discharge_date = Column(String, nullable=True)
    days_admitted = Column(Integer, default=1)
    total_billed = Column(Float, default=0.0)
    total_fair_estimate = Column(Float, default=0.0)
    total_overcharge = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    status = Column(String, default="pending")
    plain_summary = Column(Text, nullable=True)
    risk_flags_summary = Column(JSON, default=list)
    raw_ocr_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    owner = relationship("User", back_populates="bills")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan")
    reconciliation = relationship("PaymentReconciliation", back_populates="bill", uselist=False)
    disputes = relationship("DisputeLetter", back_populates="bill", cascade="all, delete-orphan")


class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("bills.id"), index=True, nullable=False)
    raw_text = Column(String, nullable=False)
    normalized_name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Float, default=1.0)
    charged_rate = Column(Float, default=0.0)
    charged_amount = Column(Float, default=0.0)
    mrp = Column(Float, nullable=True)
    cghs_rate = Column(Float, nullable=True)
    nppa_ceiling = Column(Float, nullable=True)
    is_flagged = Column(Boolean, default=False)
    risk_flags = Column(JSON, default=list)
    overcharge_amount = Column(Float, default=0.0)
    legal_citation = Column(String, nullable=True)
    patient_explanation = Column(Text, nullable=True)
    action_recommended = Column(Text, nullable=True)

    bill = relationship("Bill", back_populates="items")


class PaymentReconciliation(Base):
    __tablename__ = "payment_reconciliations"

    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("bills.id"), unique=True, index=True, nullable=False)
    total_billed = Column(Float, default=0.0)
    insurance_approved = Column(Float, default=0.0)
    tpa_deductions = Column(Float, default=0.0)
    razorpay_paid = Column(Float, default=0.0)
    patient_unjust_gap = Column(Float, default=0.0)
    razorpay_payment_id = Column(String, nullable=True)
    tpa_name = Column(String, nullable=True)
    reconciliation_notes = Column(Text, nullable=True)
    status = Column(String, default="reconciled")
    created_at = Column(DateTime, default=utc_now)

    bill = relationship("Bill", back_populates="reconciliation")


class DisputeLetter(Base):
    __tablename__ = "dispute_letters"

    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("bills.id"), index=True, nullable=False)
    forum_type = Column(String, nullable=False)
    target_authority = Column(String, nullable=False)
    letter_title = Column(String, nullable=False)
    letter_body = Column(Text, nullable=False)
    statutory_citations = Column(JSON, default=list)
    total_disputed_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)

    bill = relationship("Bill", back_populates="disputes")
