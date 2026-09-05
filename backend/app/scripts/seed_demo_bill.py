import asyncio
import uuid
import os
import hashlib
import hmac
from datetime import datetime, date, timezone
from decimal import Decimal
from sqlalchemy import select
from uuid import UUID
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.models.evidence import EvidenceRecord
from app.crypto.merkle import compute_merkle_root, compute_leaf
from app.crypto.evidence import canonicalize

DEMO_BILL_ID = UUID("11111111-1111-1111-1111-111111111111")
DEMO_AUDIT_ID = UUID("22222222-2222-2222-2222-222222222222")
DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")

DEMO_LINE_ITEMS = [
    {
        "item_sequence": 1,
        "raw_description": "Drug Eluting Coronary Stent (DES)",
        "normalized_name": "Drug Eluting Stent",
        "category": "implant",
        "quantity": Decimal("1"),
        "unit_price": Decimal("42000.00"),
        "total_price": Decimal("42000.00"),
        "extraction_confidence": Decimal("0.92"),
    },
    {
        "item_sequence": 2,
        "raw_description": "Cardiac ICU Charges - 3 Days",
        "normalized_name": "ICU Room Charges",
        "category": "room",
        "quantity": Decimal("3"),
        "unit_price": Decimal("12000.00"),
        "total_price": Decimal("36000.00"),
        "extraction_confidence": Decimal("0.95"),
    },
    {
        "item_sequence": 3,
        "raw_description": "Atorvastatin 40mg Tablet x 30",
        "normalized_name": "Atorvastatin 40mg",
        "category": "drug",
        "quantity": Decimal("30"),
        "unit_price": Decimal("18.50"),
        "total_price": Decimal("555.00"),
        "gst_rate_applied": Decimal("12.00"),
        "extraction_confidence": Decimal("0.88"),
    },
    {
        "item_sequence": 4,
        "raw_description": "Echocardiography",
        "normalized_name": "Echocardiography",
        "category": "diagnostic",
        "quantity": Decimal("1"),
        "unit_price": Decimal("4200.00"),
        "total_price": Decimal("4200.00"),
        "extraction_confidence": Decimal("0.90"),
    },
    {
        "item_sequence": 5,
        "raw_description": "Hospital Registration Charges",
        "normalized_name": "Registration Charges",
        "category": "other",
        "quantity": Decimal("1"),
        "unit_price": Decimal("500.00"),
        "total_price": Decimal("500.00"),
        "extraction_confidence": Decimal("0.95"),
    },
    {
        "item_sequence": 6,
        "raw_description": "Coronary Angioplasty Procedure",
        "normalized_name": "Coronary Angioplasty",
        "category": "procedure",
        "quantity": Decimal("1"),
        "unit_price": Decimal("95000.00"),
        "total_price": Decimal("95000.00"),
        "extraction_confidence": Decimal("0.93"),
    },
    {
        "item_sequence": 7,
        "raw_description": "Attendant Charges - 3 Days",
        "normalized_name": "Attendant Charges",
        "category": "other",
        "quantity": Decimal("3"),
        "unit_price": Decimal("500.00"),
        "total_price": Decimal("1500.00"),
        "extraction_confidence": Decimal("0.87"),
    },
    {
        "item_sequence": 8,
        "raw_description": "Paracetamol 500mg Tablet x 20",
        "normalized_name": "Paracetamol 500mg",
        "category": "drug",
        "quantity": Decimal("20"),
        "unit_price": Decimal("4.20"),
        "total_price": Decimal("84.00"),
        "extraction_confidence": Decimal("0.91"),
    },
]

DEMO_FINDINGS = [
    {
        "finding_type": "NPPA_VIOLATION",
        "finding_source": "DETERMINISTIC",
        "severity": "HIGH",
        "item_description": "Drug Eluting Coronary Stent (DES)",
        "billed_amount": Decimal("42000.00"),
        "benchmark_amount": Decimal("27890.00"),
        "overcharge_amount": Decimal("14110.00"),
        "statutory_reference": "NPPA Price Cap Order dated 13.02.2017 — Drug Eluting Stent",
        "legal_basis": "The National Pharmaceutical Pricing Authority has fixed a ceiling price of ₹27,890 for Drug Eluting Stents. No hospital or supplier may charge above this price.",
        "user_explanation": "The hospital charged ₹42,000 for your heart stent. The government has capped the price of this stent at ₹27,890. You were overcharged by ₹14,110.",
        "is_disputable": True,
    },
    {
        "finding_type": "CGHS_OVERCHARGE",
        "finding_source": "DETERMINISTIC",
        "severity": "MEDIUM",
        "item_description": "Echocardiography",
        "billed_amount": Decimal("4200.00"),
        "benchmark_amount": Decimal("1800.00"),
        "overcharge_amount": Decimal("2400.00"),
        "statutory_reference": "CGHS Rate Schedule 2022 — Echocardiography, S.No. 147",
        "legal_basis": "The Central Government Health Scheme Rate Schedule 2022 specifies the approved rate for echocardiography as ₹1,800 in Tier 1 cities.",
        "user_explanation": "The hospital charged ₹4,200 for an echocardiogram. The government-approved rate is ₹1,800. You were overcharged by ₹2,400.",
        "is_disputable": True,
    },
    {
        "finding_type": "IRDAI_NON_PAYABLE",
        "finding_source": "DETERMINISTIC",
        "severity": "MEDIUM",
        "item_description": "Hospital Registration Charges",
        "billed_amount": Decimal("500.00"),
        "benchmark_amount": Decimal("0.00"),
        "overcharge_amount": Decimal("500.00"),
        "statutory_reference": "IRDAI Non-Payable Items List — Registration/Admission Charges",
        "legal_basis": "The Insurance Regulatory and Development Authority of India has listed registration and admission charges as non-payable items that cannot be billed to insured patients.",
        "user_explanation": "Registration charges of ₹500 cannot be charged to your insurance. This item is on the IRDAI list of items insurers are not allowed to bill for.",
        "is_disputable": True,
    },
    {
        "finding_type": "IRDAI_NON_PAYABLE",
        "finding_source": "DETERMINISTIC",
        "severity": "LOW",
        "item_description": "Attendant Charges - 3 Days",
        "billed_amount": Decimal("1500.00"),
        "benchmark_amount": Decimal("0.00"),
        "overcharge_amount": Decimal("1500.00"),
        "statutory_reference": "IRDAI Non-Payable Items List — Attendant / Visitor Charges",
        "legal_basis": "Attendant charges are explicitly listed as non-payable items under IRDAI guidelines and cannot be billed to insured patients.",
        "user_explanation": "Charges for your attendant (₹1,500) cannot be charged to insurance. This is on the IRDAI non-payable list.",
        "is_disputable": True,
    },
    {
        "finding_type": "GST_MISAPPLICATION",
        "finding_source": "DETERMINISTIC",
        "severity": "LOW",
        "item_description": "Atorvastatin 40mg Tablet x 30",
        "billed_amount": Decimal("66.60"),
        "benchmark_amount": Decimal("0.00"),
        "overcharge_amount": Decimal("66.60"),
        "statutory_reference": "GST Notification No. 12/2017-CT(R) — Healthcare Service Exemption",
        "legal_basis": "Medicines dispensed as part of inpatient treatment at a clinical establishment may qualify for GST exemption under Notification 12/2017-CT(R). GST applied to these medicines should be reviewed.",
        "user_explanation": "GST of ₹66.60 was charged on your medicines. Medicines dispensed during hospitalisation may be GST-exempt. This charge should be reviewed.",
        "is_disputable": True,
    },
]


async def seed_demo_bill():
    async with AsyncSessionLocal() as db:
        # Check if demo bill already exists
        existing = await db.execute(
            select(Bill).where(Bill.id == DEMO_BILL_ID)
        )
        if existing.scalar_one_or_none():
            print("Demo bill already exists. Skipping.")
            return

        # Create demo user if needed
        demo_user = await db.execute(
            select(User).where(User.id == DEMO_USER_ID)
        )
        if not demo_user.scalar_one_or_none():
            user = User(
                id=DEMO_USER_ID,
                email="demo@curaveris.in",
                phone_number="9999999999",
                phone_verified=True,
                email_verified=True,
                password_hash="$2b$12$demo_hash_not_real",
                full_name="Demo Patient",
                role="patient",
                is_active=True,
                dpdp_consent_given=True,
                dpdp_consent_at=datetime.now(timezone.utc),
            )
            db.add(user)

        # Create bill
        bill = Bill(
            id=DEMO_BILL_ID,
            user_id=DEMO_USER_ID,
            reference_number="DEMO-2024-001",
            hospital_name="Apollo Hospitals, Mumbai",
            patient_name="Rajesh Kumar",
            admission_date=date(2024, 1, 10),
            discharge_date=date(2024, 1, 13),
            total_billed_amount=Decimal("179839.60"),
            bill_type="inpatient",
            insurance_type="irdai",
            tpa_name="MD India TPA",
            policy_number="DEMO-POL-2024",
            processing_status="COMPLETED",
            file_key="demo/sample_bill.pdf",
            file_name_original="hospital_bill_demo.pdf",
            file_size_bytes=245000,
            file_mime_type="application/pdf",
            file_hash_sha256="demo" * 16,
            processing_completed_at=datetime.now(timezone.utc),
        )
        db.add(bill)
        await db.flush()

        # Create line items
        for item in DEMO_LINE_ITEMS:
            li = BillLineItem(
                bill_id=DEMO_BILL_ID,
                **item,
            )
            db.add(li)
        await db.flush()

        # Create audit
        total_overcharge = sum(f["overcharge_amount"] for f in DEMO_FINDINGS)
        audit = Audit(
            id=DEMO_AUDIT_ID,
            bill_id=DEMO_BILL_ID,
            user_id=DEMO_USER_ID,
            audit_version="1.0.0",
            statutory_ref_version="1.0.0",
            ml_model_version="rule_based_v1",
            total_overcharge_deterministic=total_overcharge,
            total_overcharge_ml_estimate=Decimal("21500.00"),
            total_billed=Decimal("179839.60"),
            risk_score=Decimal("0.74"),
            risk_label="HIGH",
            uncertainty_lower=Decimal("0.59"),
            uncertainty_upper=Decimal("0.87"),
            shadow_bill_detected=False,
            finding_count=len(DEMO_FINDINGS),
            finding_summary={
                "NPPA_VIOLATION": 1,
                "CGHS_OVERCHARGE": 1,
                "IRDAI_NON_PAYABLE": 2,
                "GST_MISAPPLICATION": 1,
            },
            shap_values=[
                {
                    "feature_label": "Confirmed overcharges found",
                    "shap_value": 0.28,
                    "direction": "INCREASES_RISK",
                    "explanation": "5 confirmed billing violations found against government rules.",
                },
                {
                    "feature_label": "Medical implant charges",
                    "shap_value": 0.18,
                    "direction": "INCREASES_RISK",
                    "explanation": "Implant charges are subject to government price caps and are frequently overcharged.",
                },
                {
                    "feature_label": "Insurance non-payable items",
                    "shap_value": 0.14,
                    "direction": "INCREASES_RISK",
                    "explanation": "Multiple items appear on the IRDAI non-payable list.",
                },
                {
                    "feature_label": "Total bill amount",
                    "shap_value": 0.09,
                    "direction": "INCREASES_RISK",
                    "explanation": "Higher bill amounts are associated with greater overcharging risk.",
                },
                {
                    "feature_label": "Procedure charges",
                    "shap_value": -0.05,
                    "direction": "DECREASES_RISK",
                    "explanation": "The main procedure charge appears within expected range.",
                },
            ],
            recommendations=[
                {
                    "priority": 1,
                    "action": "Raise a formal complaint with the hospital now",
                    "rationale": "You have been overcharged ₹18,576.60 in confirmed violations. The hospital must respond within 15 days.",
                },
                {
                    "priority": 2,
                    "action": "Send our dispute letter to your insurance company",
                    "rationale": "The IRDAI non-payable items (₹2,000) and registration charges should not appear on your insurance bill.",
                },
                {
                    "priority": 3,
                    "action": "File with the Insurance Ombudsman if unresolved in 30 days",
                    "rationale": "A free government service that handles insurance disputes. Our petition is ready to file.",
                },
            ],
            completed_at=datetime.now(timezone.utc),
        )
        db.add(audit)
        await db.flush()

        # Create findings
        for finding_data in DEMO_FINDINGS:
            finding = AuditFinding(
                audit_id=DEMO_AUDIT_ID,
                **finding_data,
            )
            db.add(finding)

        # Create evidence
        evidence_payload = {
            "bill_id": str(DEMO_BILL_ID),
            "audit_id": str(DEMO_AUDIT_ID),
            "total_billed": "179839.60",
            "total_overcharge": str(total_overcharge),
            "finding_count": len(DEMO_FINDINGS),
            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
        }
        canonical = canonicalize(evidence_payload)
        leaves = [
            compute_leaf("bill_metadata", canonical),
            compute_leaf("findings", canonicalize(DEMO_FINDINGS)),
            compute_leaf("timestamp", datetime.now(timezone.utc).isoformat()),
        ]
        merkle_root = compute_merkle_root(leaves)
        hmac_secret = os.getenv("EVIDENCE_HMAC_SECRET", "demo_secret_32_chars_minimum___")
        hmac_sig = hmac.new(
            hmac_secret.encode(),
            canonical.encode(),
            hashlib.sha256,
        ).hexdigest()

        evidence = EvidenceRecord(
            bill_id=DEMO_BILL_ID,
            audit_id=DEMO_AUDIT_ID,
            merkle_root=merkle_root,
            hmac_signature=hmac_sig,
            hmac_key_version=1,
            canonical_payload=evidence_payload,
            leaf_hashes=leaves,
            issued_at=datetime.now(timezone.utc),
        )
        db.add(evidence)

        await db.commit()
        print(f"Demo bill seeded successfully. Bill ID: {DEMO_BILL_ID}")


if __name__ == "__main__":
    asyncio.run(seed_demo_bill())
