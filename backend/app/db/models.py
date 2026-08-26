import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="patient")  # patient | hospital_admin | super_admin
    encrypted_phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bills = relationship("Bill", back_populates="owner", cascade="all, delete-orphan")


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
    status = Column(String, default="pending")  # pending, analyzing, completed, failed
    
    plain_summary = Column(Text, nullable=True)
    risk_flags_summary = Column(JSON, default=list)  # list of top flags
    raw_ocr_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    category = Column(String, nullable=False)  # pharmacy, procedure, room_nursing, consumable, diagnostic, tax
    
    quantity = Column(Float, default=1.0)
    charged_rate = Column(Float, default=0.0)
    charged_amount = Column(Float, default=0.0)
    
    # Benchmarks
    mrp = Column(Float, nullable=True)
    cghs_rate = Column(Float, nullable=True)
    nppa_ceiling = Column(Float, nullable=True)
    
    # Risk and findings
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
    
    # Gap calculation
    patient_unjust_gap = Column(Float, default=0.0)
    razorpay_payment_id = Column(String, nullable=True)
    tpa_name = Column(String, nullable=True)
    reconciliation_notes = Column(Text, nullable=True)
    status = Column(String, default="reconciled")  # reconciled, disputed, refunded
    created_at = Column(DateTime, default=datetime.utcnow)

    bill = relationship("Bill", back_populates="reconciliation")


class DisputeLetter(Base):
    __tablename__ = "dispute_letters"

    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("bills.id"), index=True, nullable=False)
    
    forum_type = Column(String, nullable=False)  # hospital_grievance, nppa, irdai, consumer_court
    target_authority = Column(String, nullable=False)
    letter_title = Column(String, nullable=False)
    letter_body = Column(Text, nullable=False)
    statutory_citations = Column(JSON, default=list)
    total_disputed_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    bill = relationship("Bill", back_populates="disputes")
