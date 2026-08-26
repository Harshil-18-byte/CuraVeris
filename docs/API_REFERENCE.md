---
{
  "id": "file_wn13jweu",
  "filetype": "document",
  "filename": "API_REFERENCE",
  "created_at": "2026-08-26T06:23:16.856Z",
  "updated_at": "2026-08-26T06:23:25.519Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---

# CuraVeris REST API Reference

All requests must be made to:

```text
http://127.0.0.1:8000/api/v1

```

Unless stated otherwise, requests with JSON payloads must supply the header `Content-Type: application/json`. Protected endpoints require a valid JWT token supplied in the header:

```text
Authorization: Bearer <access_token>

```

---

## 1. Authentication and Privacy Endpoints

### 1.1 Register User Account

Creates a new patient or auditor user account.

- **Method**: `POST`
- **Path**: `/auth/register`
- **Request Body**:

```json
{
  "email": "auditor@curaveris.org",
  "password": "SecurePassword123",
  "full_name": "Dr. Ramesh Sharma",
  "phone": "+919876543210"
}

```

- **Response**: `200 OK`

```json
{
  "id": "usr_94e3a891f",
  "email": "auditor@curaveris.org",
  "full_name": "Dr. Ramesh Sharma",
  "is_active": true,
  "created_at": "2026-08-26T11:45:00Z"
}

```

---

### 1.2 User Login

Authenticates credentials and returns a Bearer access token.

- **Method**: `POST`
- **Path**: `/auth/login`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:

```text
username=auditor@curaveris.org&password=SecurePassword123

```

- **Response**: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

```

---

### 1.3 Digital Personal Data Protection (DPDP) Erasure

Executes statutory right to erasure under Section 12 of the DPDP Act 2023. Permanently sanitizes name, email, and phone from active tables and replaces them with an irreversible SHA-256 pseudonym.

- **Method**: `POST`
- **Path**: `/auth/anonymize-me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK`

```json
{
  "status": "success",
  "dpdp_reference": "Section 12, Digital Personal Data Protection Act, 2023",
  "pseudonym": "DPDP_Anonymized_Patient_c3ab8ff14a22",
  "anonymized_at": "2026-08-26T11:45:10Z"
}

```

---

## 2. Bill Auditing and Diagnostic Endpoints

### 2.1 Synchronous Bill Ingestion and Audit

Uploads a bill document (PDF or image) with admission metadata and runs full rule and ensemble audits.

- **Method**: `POST`
- **Path**: `/bills/upload`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (UploadFile): PDF, PNG, or JPEG file.
  - `hospital_name` (string): Name of the hospital establishment.
  - `city` (string): City where establishment is located.
  - `patient_age` (integer): Patient age in years.
  - `days_admitted` (integer): Duration of admission.
  - `diagnosis` (string): Clinical discharge impression.
- **Example cURL**:

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/bills/upload" \
  -F "file=@sample_invoice.pdf" \
  -F "hospital_name=Apollo Hospitals" \
  -F "city=New Delhi" \
  -F "patient_age=64" \
  -F "days_admitted=4" \
  -F "diagnosis=Acute STEMI"

```

- **Response**: `200 OK`

```json
{
  "bill_id": "bill_08e42f9a",
  "total_billed": 142500.00,
  "total_fair_estimate": 88200.00,
  "total_overcharge": 54300.00,
  "risk_score": 76.50,
  "risk_level": "High",
  "flags_summary": [
    {
      "flag_type": "nppa_ceiling_violation",
      "severity": "Critical",
      "count": 1,
      "total_impact": 26740.00,
      "description": "Charged medical implants above NPPA gazette price ceiling.",
      "law_cited": "NPPA Orders under DPCO 2013"
    }
  ],
  "items": [
    {
      "raw_text": "Coronary Stent - Drug Eluting (DES)",
      "normalized_name": "drug_eluting_stent",
      "category": "procedure",
      "quantity": 1,
      "charged_rate": 65000.00,
      "charged_amount": 65000.00,
      "nppa_ceiling": 38260.00,
      "is_flagged": true,
      "risk_flags": ["nppa_ceiling_violation"],
      "overcharge_amount": 26740.00,
      "legal_citation": "NPPA Gazette Notification S.O. 1335(E)",
      "action_recommended": "Demand credit note citing NPPA ceiling price order."
    }
  ]
}

```

---

### 2.2 SHAP Risk Explainability Waterfall

Decomposes the composite risk score into individual additive feature contributions for legal proceedings.

- **Method**: `GET`
- **Path**: `/bills/{bill_id}/explainability`
- **Response**: `200 OK`

```json
{
  "bill_id": "bill_08e42f9a",
  "base_rate": 15.00,
  "explained_risk_score": 76.50,
  "risk_level": "High",
  "waterfall": [
    { "feature": "Baseline Population Risk", "attribution": 15.00, "direction": "base" },
    { "feature": "NPPA Implant Ceiling Breach", "attribution": 22.00, "direction": "increase" },
    { "feature": "CGHS Benchmark Procedure Markup", "attribution": 28.50, "direction": "increase" },
    { "feature": "Unbundled Routine Consumables", "attribution": 12.00, "direction": "increase" },
    { "feature": "Documented Pathology (ICD-10 Alignment)", "attribution": -6.50, "direction": "decrease" },
    { "feature": "NABH Accreditation Tariff Allowance", "attribution": -4.00, "direction": "decrease" }
  ]
}

```

---

### 2.3 2D Fraud Risk Heatmap Matrix

Generates a multi-axis cross-sectional matrix evaluating line items against five statutory violation vectors.

- **Method**: `GET`
- **Path**: `/bills/{bill_id}/heatmap`
- **Response**: `200 OK`

```json
{
  "bill_id": "bill_08e42f9a",
  "axes": [
    "statutory_rate_breach",
    "consumable_unbundling",
    "duplicate_risk",
    "tax_discrepancy",
    "clinical_discordance"
  ],
  "heatmap_matrix": [
    {
      "line_item": "Coronary Stent - Drug Eluting (DES)",
      "category": "procedure",
      "charged_amount": 65000.00,
      "scores": {
        "statutory_rate_breach": 0.95,
        "consumable_unbundling": 0.05,
        "duplicate_risk": 0.02,
        "tax_discrepancy": 0.00,
        "clinical_discordance": 0.10
      },
      "composite_item_risk": 0.224,
      "risk_tier": "ELEVATED_RISK"
    }
  ],
  "total_items_analyzed": 6,
  "critical_items_count": 2
}

```

---

### 2.4 Cryptographic Merkle Audit Certificate Generator

Seals the completed audit into an immutable cryptographic block hash with digital signature.

- **Method**: `GET`
- **Path**: `/bills/{bill_id}/audit-certificate`
- **Response**: `200 OK`

```json
{
  "block_index": 14,
  "timestamp": "2026-08-26T11:46:00Z",
  "bill_id": "bill_08e42f9a",
  "total_billed": 142500.00,
  "total_overcharge": 54300.00,
  "risk_score": 76.50,
  "items_count": 18,
  "merkle_root": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "prev_hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  "block_hash": "7978416b8d9096aba21e90ef8cf87042a35606d2c4161a0b3f52e505298da056",
  "signature": "3c9909287ae88eef098a87679808af...",
  "legal_certification": "Section 65B Indian Evidence Act / BNS Sec 61 Electronic Record Admissibility"
}

```

---

### 2.5 Verify Cryptographic Ledger Certificate

Verifies whether a certificate was modified since the audit took place.

- **Method**: `POST`
- **Path**: `/bills/verify-ledger`
- **Request Body**: Paste the complete certificate object received from `/audit-certificate`.
- **Response**: `200 OK`

```json
{
  "is_valid": true,
  "verification_message": "Cryptographic audit integrity 100% verified. Document is authentic and unaltered.",
  "bill_id": "bill_08e42f9a",
  "block_index": 14,
  "verified_at": "2026-08-26T11:46:30Z"
}

```

---

### 2.6 Automated Clinical ICD-10 & ALOS Resolver

Translates clinical notes into standard WHO ICD-10 and SNOMED ontologies, auditing whether the hospital stay indicates potential bed-blocking.

- **Method**: `POST`
- **Path**: `/bills/resolve-icd10`
- **Request Body**:

```json
{
  "diagnostic_text": "Severe bilateral osteoarthritis knee for TKR",
  "days_in_hospital": 10
}

```

- **Response**: `200 OK`

```json
{
  "matched": true,
  "raw_query": "Severe bilateral osteoarthritis knee for TKR",
  "canonical_name": "Primary Osteoarthritis of Knee, Unilateral or Bilateral",
  "icd10_code": "M17.11",
  "snomed_concept_id": "239872002",
  "specialty": "Orthopedics / Joint Replacement",
  "standard_alos_days": 4,
  "max_admissible_icu_days": 0,
  "pmjay_package_code": "SO001A",
  "expected_implants": ["Primary Knee Implant System (Femoral & Tibial Components)"],
  "alos_compliance": "EXCESSIVE_STAY_FLAG",
  "alos_finding": "Patient admitted for 10 days vs typical ALOS benchmark of 4 days. Potential unwarranted bed-blocking / artificial bill inflation detected."
}

```

---

### 2.7 Ayushman Bharat PM-JAY Zero-Cash Audit

Cross-references hospital bills against PM-JAY HBP 2.2 rates, detects illegal cash demands, and calculates statutory penalties.

- **Method**: `POST`
- **Path**: `/bills/pmjay-audit`
- **Request Body**:

```json
{
  "package_name": "Primary Percutaneous Coronary Intervention (PCI)",
  "hospital_name": "Care Super Speciality Hospital",
  "cash_demanded_inr": 35000.00,
  "patient_pmjay_id": "PMJAY-DEL-984129"
}

```

- **Response**: `200 OK`

```json
{
  "is_empanelment_violation": true,
  "package_name": "Primary Percutaneous Coronary Intervention (PCI)",
  "hospital_name": "Care Super Speciality Hospital",
  "statutory_package_rate_inr": 55000.00,
  "cash_demanded_inr": 35000.00,
  "illegal_cash_excess_inr": 35000.00,
  "nha_statutory_rule": "PM-JAY Operational Guidelines 3.2 (Zero Out-of-Pocket Expense Mandate)",
  "recommended_penalty_inr": 175000.00,
  "sha_complaint_body": "FORMAL STATUTORY COMPLAINT TO STATE HEALTH AGENCY (SHA) & NHA:\nHospital 'Care Super Speciality Hospital' has illegally demanded and collected INR 35,000.00 in out-of-pocket cash from Ayushman Bharat beneficiary (PMJAY-DEL-984129)..."
}

```

---

## 3. Legal and Dispute Generation Endpoints

### 3.1 Emergency High Court Anti-Detention Requisition

Drafts an immediate legal notice compelling physical release of a detained patient within 30 minutes under Bombay High Court precedents and BNS Section 127.

- **Method**: `POST`
- **Path**: `/reports/emergency-detention-notice`
- **Request Body**:

```json
{
  "patient_name": "Suresh Patel",
  "hospital_name": "Metro Heart Institute",
  "hospital_address": "Ring Road, Surat, Gujarat",
  "police_station": "Umra Police Station",
  "city": "Surat",
  "disputed_amount_inr": 85000.00,
  "patient_bed_or_room": "ICU Bed 04"
}

```

- **Response**: `200 OK`

```json
{
  "notice_type": "EMERGENCY_WRIT_REQUISITION_ANTI_DETENTION",
  "case_law_cited": "Bombay High Court 'Association of Medical Consultants vs Union of India' (WP No. 2502/2000)",
  "criminal_section_cited": "Bharatiya Nyaya Sanhita 2023 Sec 127 / IPC Sec 340, 342 (Wrongful Confinement)",
  "constitutional_articles": "Article 21 (Right to Life and Personal Liberty)",
  "dispatch_targets": [
    "Medical Superintendent, Metro Heart Institute",
    "Station House Officer (SHO), Umra Police Station (Emergency Dial 112)",
    "District Magistrate & Chief Medical Officer, Surat"
  ],
  "notice_markdown": "EMERGENCY STATUTORY LEGAL NOTICE — DEMAND FOR IMMEDIATE PHYSICAL RELEASE..."
}

```
