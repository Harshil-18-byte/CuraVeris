---
{
  "id": "file_ebk1q7l7",
  "filetype": "document",
  "filename": "README",
  "created_at": "2026-08-26T06:22:02.047Z",
  "updated_at": "2026-08-26T06:23:04.850Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---

# CuraVeris

Automated Medical Billing Audit and Patient Financial Advocacy Engine.

CuraVeris is an open-source clinical and financial audit platform designed for the Indian healthcare system. It ingests hospital invoices, insurance Third-Party Administrator (TPA) settlement letters, and payment gateway receipts to detect statutory pricing violations, unbundled consumables, unauthorized markups, and arbitrary administrative fees.

---

## 1. System Overview

Indian private healthcare relies on a fragmented three-party financial settlement process:

1. The **Hospital** submits an itemized charge sheet with procedure tariffs, medicine rates, and consumable charges.
2. The **TPA / Insurer** adjudicates the claim under private tariff agreements and policy clauses, approving partial reimbursement while disallowing line items.
3. The **Patient** is presented with the residual balance at the point of discharge, typically under urgent conditions and without tariff transparency.

```mermaid
graph TD
    H[Hospital] -->|Pre-auth Request| T[TPA / Insurer]
    T -->|Settlement Payment| H
    H -->|Hospital Bill| C[CuraVeris Engine]
    T -->|TPA Settlement| C
    P[Patient] -->|Payment Receipt| C
    C -->|Audit Breakdown & Risk Score| P
    P -->|Pays Residual Balance| H

```

![Claim Settlement Flow](docs/images/claim_settlement_flow.png)

CuraVeris programmatically reconciles these three sources against central government price schedules, statutory orders, and court precedents to eliminate unjustified out-of-pocket patient expenditures.

---

## 2. Core Architecture and Data Pipeline

The platform follows a modular ingestion, extraction, auditing, and document generation pipeline:

```mermaid
flowchart TD
    subgraph Inputs [Data Ingestion Layer]
        A1[Hospital Bill: PDF / Scan / Photo]
        A2[Payment Gateway API: Webhooks & Metadata]
        A3[Statutory Reference Databases: CGHS / NPPA / DPCO]
    end

    subgraph Processing [Feature Extraction & Processing Layer]
        B1[OCR Ingestion Engine: PyPDF / Tesseract / EasyOCR]
        B2[Payment Enrichment: Balance Gap & EMI Distress]
        B3[Semantic Retrieval: BM25 / Embedding Search]
    end

    subgraph Decision [Auditing & Ensemble Layer]
        C1[Deterministic Rule Engine: Statutory Violations]
        C2[Hybrid ML Stacking Ensemble: XGBoost + Deep MLP]
        C3[Monte Carlo Epistemic Uncertainty Estimation]
    end

    subgraph Outputs [Action & Export Layer]
        D1[Itemized Audit Breakdown & Overcharge Tally]
        D2[Composite Risk Score: 0 to 100 with SHAP Waterfall]
        D3[Forensic Dispute Letters & Ombudsman Petitions]
        D4[Cryptographic Merkle Audit Certificate: Sec 65B]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B3

    B1 --> C1
    B1 --> C2
    B2 --> C1
    B3 --> C1
    B3 --> C2

    C1 --> C3
    C2 --> C3

    C3 --> D1
    C3 --> D2
    C3 --> D3
    C3 --> D4

```

![Data Pipeline Architecture](docs/images/data_pipeline_architecture.png)

### 2.1 Ingestion and Optical Character Recognition

- Accepts PDF, PNG, and JPEG formats.
- Pre-ingestion validation executes file signature inspection (magic bytes) to prevent polyglot payload execution (`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`).
- Text extraction standardizes multi-column hospital line items: description, batch, quantity, billed unit rate, and total line amount.

### 2.2 Payment Gateway Reconciliation

- Connects directly to payment APIs (e.g., Razorpay orders and payments).
- Calculates the Patient Payment Gap:
  $$\text{Payment Gap} = \text{Gross Hospital Bill} - \text{TPA Approved Amount}$$
- Identifies credit/debit EMI arrangements as quantitative distress markers indicating household liquidity exhaustion.

### 2.3 Reference Tariff Cross-Referencing

- Embeds standardized government benchmark datasets into local indexing structures:
  - Central Government Health Scheme (CGHS) 2024 revised tariff master (1,900+ procedures across NABH and non-NABH tiers).
  - National Pharmaceutical Pricing Authority (NPPA) Gazette orders for ceiling prices on coronary stents and orthopedic knee implants.
  - Drugs (Prices Control) Order (DPCO) 2013 ceiling price schedules.
  - IRDAI non-payable items standardization schedule (199 excluded consumables).
  - WHO ICD-10-CM and SNOMED-CT clinical diagnostic ontologies.

---

## 3. Statutory and Legal Framework

CuraVeris automates legal and regulatory assertions grounded directly in Indian jurisprudence and statutory notifications:

```mermaid
graph TD
    DPCO[DPCO 2013<br/>Para 24 Drug MRP Ceilings] --> PR[Patient Rights & Protections]
    CEA[Clinical Establishments Act<br/>Mandatory Daily Itemized Billing] --> PR
    NPPA[NPPA Price Orders<br/>Stent & Knee Implant Caps] --> PR
    CPA[Consumer Protection Act 2019<br/>Sec 2 47 Unfair Trade Practices] --> PR
    IRDAI[IRDAI Health Regulations<br/>Consumable Bundling & TPA Rules] --> PR
    MHA[Mental Healthcare Act 2017<br/>Sec 21 4 Parity Mandate] --> PR
    BNS[Bharatiya Nyaya Sanhita 2023<br/>Sec 127 Wrongful Confinement] --> PR
    NHA[Ayushman Bharat PM-JAY<br/>HBP 2.2 Zero Cash Policy] --> PR

```

![Statutory Patient Rights](docs/images/statutory_patient_rights.png)

### 3.1 Primary Statutory Citations Implemented in Code

- **NPPA Implants & Stents**: S.O. 1335(E) and S.O. 2668(E). Drug-Eluting Stents (DES) capped at ₹38,260 + GST; bare-metal stents capped at ₹10,509 + GST; primary knee implants capped at ₹63,800 + GST.
- **DPCO 2013 & Essential Commodities Act 1955**: Paragraph 24 prohibits charging more than the government-mandated Maximum Retail Price (MRP) for scheduled formulations. Violations are punishable under Section 7 of the ECA 1955.
- **GST Exemption on Healthcare**: Ministry of Finance Notification No. 12/2017-Central Tax (Rate), Entry 74 explicitly exempts healthcare services by clinical establishments and medical practitioners from GST.
- **Mental Healthcare Act 2017, Section 21(4)**: Mandates statutory parity between psychiatric and physical healthcare. Blanket exclusions or discriminatory caps on psychiatric treatments in insurance settlements are illegal.
- **Bombay High Court Precedent on Hospital Detentions**: *Association of Medical Consultants vs Union of India* (Criminal WP No. 2502/2000). The court held that no hospital has the legal right to detain a patient or withhold a body for non-payment of disputed medical bills. Detaining individuals constitutes wrongful confinement under Section 127 of the Bharatiya Nyaya Sanhita (BNS) 2023 (formerly Sections 340 and 342 of the IPC).
- **PM-JAY National Health Authority Guideline 3.2**: Strictly prohibits empanelled hospitals from demanding any out-of-pocket cash from Ayushman Bharat beneficiaries for covered packages. Violations trigger de-empanelment and a 5x financial penalty.

---

## 4. Five-Stage Patient Financial Lifecycle

Most healthcare finance tools only review claims after discharge. CuraVeris covers the entire inpatient and post-discharge lifecycle across five discrete phases:

```mermaid
flowchart LR
    S1[1. Pre-Admission<br/>Package Tariff & Network Verification] --> S2[2. During Stay<br/>Interim Bill & Daily Burn Monitoring]
    S2 --> S3[3. Discharge<br/>Audit Breakdown & Payment Reconciliation]
    S3 --> S4[4. Post-Discharge<br/>TPA Shortfall Claim & FRM Recovery]
    S4 --> S5[5. Legal Action<br/>Ombudsman & Anti-Detention Requisitions]

```

![Patient Journey Stages](docs/images/patient_journey_stages.png)

1. **Pre-Admission**: Evaluates hospital NABH accreditation tier, resolves ICD-10 clinical diagnosis, checks standard Average Length of Stay (ALOS), and establishes CGHS benchmark ceilings.
2. **During Stay (Real-Time Admission Monitor)**: Tracks daily accumulation of hospital charges against benchmark burn rates (`package_cost / ALOS`). Warns patients if daily expenditures deviate from clinical standards by more than 30%.
3. **Discharge**: Executes item-level audits against NPPA, DPCO, and IRDAI rules, correlates Razorpay payment receipts, and provides patient-facing plain-language explanations.
4. **Post-Discharge**: Identifies disallowed consumables and tariff divergence to draft insurance appeal documentation for IRDAI Bima Bharosa portals.
5. **Legal Action**: Issues Section 65B certified audit blocks, emergency anti-detention legal requisitions (citing Bombay High Court precedents), and formal complaints to State Health Agencies.

---

## 5. Machine Learning and Deep Neural Network Ensemble

The audit engine blends a gradient boosted decision tree classifier with a multi-layer perceptron neural network to classify non-linear financial ratios and sharp statutory boundaries.

```mermaid
graph LR
    subgraph InputFeatures [15 Input Dimensions]
        F1[rate_vs_cghs_ratio]
        F2[rate_vs_mrp_ratio]
        F3[qty_zscore]
        F4[days_in_hospital]
        F5[consumable_pct]
        F6[is_package_item]
        F7[has_icd_code]
        F8[amount_percentile]
        F9[description_similarity_max]
        F10[cat_procedure]
        F11[cat_pharmacy]
        F12[cat_investigation]
        F13[cat_consumable]
        F14[cat_room_nursing]
        F15[cat_tax_gst]
    end

    subgraph Ensemble [Hybrid Stacking Architecture]
        NN[Deep Neural Network<br/>Dense 128 -> 64 -> 32<br/>Adam Optimizer + L2 + Early Stopping]
        XGB[XGBoost Classifier<br/>MultiOutput Tree Estimator]
    end

    subgraph OutputProbabilities [Weighted Soft Voting]
        V[P_blended = 0.45 * P_NN + 0.55 * P_XGB]
        MC[Monte Carlo Stochastic Perturbation<br/>K=10 forward passes]
    end

    subgraph MultiLabels [7 Violation Classifications]
        L1[above_mrp]
        L2[nppa_ceiling_violation]
        L3[cghs_excess]
        L4[duplicate_charge]
        L5[room_rent_ratio_violation]
        L6[gst_on_exempt]
        L7[consumable_unbundled]
    end

    InputFeatures --> NN
    InputFeatures --> XGB
    NN --> V
    XGB --> V
    V --> MC
    MC --> MultiLabels

```

![Model Training Dashboard](docs/images/model_training_dashboard.png)

### 5.1 Architecture Details

- **Neural Network Architecture**: `backend/app/ml/deep_risk_network.py`
  $$\text{Input}(15) \longrightarrow \text{Dense}(128, \text{ReLU}) \longrightarrow \text{Dense}(64, \text{ReLU}) \longrightarrow \text{Dense}(32, \text{ReLU}) \longrightarrow \text{Output}(7, \text{Sigmoid})$$
  - Optimizer: Adam ($\eta = 0.003$ with adaptive step decay).
  - Regularization: $L_2$ weight penalty ($\alpha = 10^{-4}$), batch size 64, early stopping with 15-iteration patience on a 15% validation split.
- **Blending Ratio**:
  $$P_{\text{blended}} = 0.45 \cdot P_{\text{NN}} + 0.55 \cdot P_{\text{XGBoost}}$$
- **Holdout Test Metrics (Production Run, Dynamic Seed `364658`)**:
  - **Macro Precision**: 0.7875 (78.8% false-positive prevention rate)
  - **Macro Recall**: 0.4820
  - **Tree Model Macro F1**: 0.5881
  - **Deep Neural Net Macro F1**: 0.5540
  - **Hybrid Ensemble Macro F1**: 0.5836

### 5.2 Epistemic Uncertainty Estimation

Inference incorporates $K = 10$ stochastic perturbation passes to compute epistemic standard deviation ($\sigma$) across all predicted probabilities:
- `HIGH_CONFIDENCE_VIOLATION`: $\mu \ge 0.55, \sigma \le 0.04$
- `AMBIGUOUS_BORDERLINE_REVIEW`: $\mu \ge 0.40, \sigma > 0.06$ (dispatched for human clinical auditor verification)
- `CONFIDENT_COMPLIANT`: $\mu < 0.35, \sigma \le 0.04$

### 5.3 Deterministic Production Seed Logging

To ensure reproducibility in enterprise deployments, the training script dynamically logs cryptographically generated run seeds (`secrets.randbelow(1_000_000)`) directly to the model metadata artifact and `training_history.json`.

---

## 6. Cryptographic Merkle Audit Ledger

To ensure medical bill audit evidence is admissible in court proceedings under **Section 65B of the Indian Evidence Act** and Bharatiya Sakshya Adhiniyam Section 61, CuraVeris seals each completed audit in an immutable cryptographic block.

```mermaid
graph TD
    subgraph MerkleTree [Merkle Leaf Hashes]
        L1[Item 1 Hash<br/>SHA256 text|rate|qty|overcharge]
        L2[Item 2 Hash<br/>SHA256 text|rate|qty|overcharge]
        L3[Item 3 Hash<br/>SHA256 text|rate|qty|overcharge]
        L4[Item 4 Hash<br/>SHA256 text|rate|qty|overcharge]
        P1[Pair Hash 1+2]
        P2[Pair Hash 3+4]
        MR[Merkle Root Hash<br/>32-Byte SHA-256 Digest]
    end

    L1 --> P1
    L2 --> P1
    L3 --> P2
    L4 --> P2
    P1 --> MR
    P2 --> MR

    subgraph ChainedBlock [Audit Block n]
        B_PREV[Previous Block Hash]
        B_META[Index + Timestamp + Bill ID]
        B_FIN[Total Billed + Overcharge + Risk Score]
        B_MR[Merkle Root Hash]
        B_HASH[Calculated Block Hash]
        B_SIG[HMAC-SHA256 Origin Signature]
    end

    MR --> B_MR
    B_PREV --> B_HASH
    B_META --> B_HASH
    B_FIN --> B_HASH
    B_MR --> B_HASH
    B_HASH --> B_SIG

```

- **Leaf Hashes**: $\text{Leaf}_i = \text{SHA256}(\text{raw\_text} \mid \text{charged\_rate} \mid \text{quantity} \mid \text{overcharge\_amount})$
- **Block Hash Formula**:
  $$\text{Block}_n = \text{SHA256}(n \mid \text{Timestamp} \mid \text{BillID} \mid \text{TotalBilled} \mid \text{Overcharge} \mid \text{RiskScore} \mid \text{MerkleRoot} \mid \text{PrevHash})$$
- **Tamper Verification**: Any manual modification of a single item amount invalidates the Merkle Root and fails HMAC signature verification.

---

## 7. Comparative Technical Positioning

| Feature | US Tools (Counterforce / MedBillChecker) | Generic LLMs (ChatGPT / Claude Prompts) | Hospital ERPs (DocPulse / Lifemaan) | CuraVeris Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Target Jurisdiction** | United States (HIPAA / CPT) | Global (Unstructured) | Indian Hospital Networks | Indian Healthcare (Statutory) |
| **NPPA / DPCO Price Caps** | Unsupported | Unsupported | Not enforced | Supported (Automated check) |
| **CGHS Procedure Tariffs** | Unsupported | Unsupported | Not enforced | Supported (NABH / Non-NABH) |
| **Payment Gateway Gap Analysis** | Unsupported | Unsupported | Records payment only | Supported (EMI / Distress scoring) |
| **Inpatient Burn Rate Forecasting** | Unsupported | Unsupported | Unsupported | Supported (Daily monitoring) |
| **Model Verification** | Black-box commercial | Undeterministic | Rule engine only | Hybrid Ensemble (XGB + MLP) |
| **Evidentiary Standard** | Standard PDF report | Text transcript | Invoice reprint | Section 65B Merkle Ledger |
| **Anti-Detention Notice Generator** | Unsupported | Unsupported | Opposing interest | Supported (Bombay HC precedent) |

![Competitive Landscape](docs/images/competitive_landscape.png)

---

## 8. Directory Structure

```text
CuraVeris/
├── docs/
│   ├── ARCHITECTURE.md                  # Comprehensive architectural specification

│   ├── API_REFERENCE.md                 # REST API schemas, payloads, and examples

│   ├── STATUTORY_FRAMEWORK.md           # Legal citations, gazette notifications, and case law

│   └── images/                          # High-resolution architectural flow diagrams

├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py                  # JWT authentication and DPDP anonymization routes

│   │   │   ├── bills.py                 # Core bill upload, audit, heatmap, and ledger endpoints

│   │   │   ├── dev.py                   # Interactive architecture node inspector and dataset downloads

│   │   │   ├── payments.py              # Razorpay webhook and payment verification routes

│   │   │   └── reports.py               # Dispute letters and emergency detention notice generator

│   │   ├── core/
│   │   │   ├── config.py                # Environment configuration and validation

│   │   │   ├── database.py              # PostgreSQL async SQLAlchemy session engine

│   │   │   ├── logging.py               # Structured log formatting

│   │   │   ├── merkle_audit_ledger.py   # Cryptographic Merkle tree audit ledger

│   │   │   └── security.py              # AES-256 PII encryption, JWT, and password hashing

│   │   ├── db/
│   │   │   ├── disease_registry.py      # ICD-10 and PM-JAY package definitions

│   │   │   ├── hospital_registry.py     # Registry of hospitals and NABH accreditation tiers

│   │   │   ├── models.py                # SQLAlchemy ORM models (Bill, BillItem, User, AuditLog)

│   │   │   └── reference_data.py        # CGHS, NPPA, DPCO, and IRDAI lookup queries

│   │   ├── engine/
│   │   │   ├── admission_monitor.py     # Inpatient burn rate and bed-blocking audit

│   │   │   ├── extractor.py             # File signature validation and OCR pipeline

│   │   │   ├── financial_toxicity.py    # FRM financial toxicity calculations

│   │   │   ├── icd10_coding_engine.py   # Automated ICD-10 & SNOMED-CT clinical coding

│   │   │   ├── risk_engine.py           # Regulatory audit rules and composite scoring

│   │   │   ├── semantic_search.py       # In-memory TF-IDF and BM25 search over procedures

│   │   │   ├── shadow_bill_detector.py  # GST anomaly and duplicate invoice detector

│   │   │   └── shap_explainer.py        # Additive feature attribution waterfall

│   │   ├── ml/
│   │   │   ├── deep_risk_network.py     # Multi-layer perceptron neural network and ensemble

│   │   │   ├── fine_tuning_generator.py # 500-sample JSONL training dataset generator

│   │   │   ├── train_risk_model.py      # Model training script with dynamic seed logging

│   │   │   └── weights/                 # Serialized model artifacts (.joblib)

│   │   ├── services/
│   │   │   └── dispute_service.py       # Legal notice generator citing High Court case law

│   │   └── main.py                      # FastAPI application entrypoint and middleware

│   ├── reference_data/
│   │   └── medical_rates.db             # Pre-seeded SQLite database of statutory rates

│   ├── tests/                           # 34 automated unit and integration tests

│   ├── pytest.ini                       # Test configuration

│   └── requirements.txt                 # Backend Python package dependencies

├── .mcp.json                            # Model Context Protocol configuration

├── LICENSE                              # MIT License

└── README.md                            # Primary documentation entrypoint

```

---

## 9. Installation and Local Setup

### 9.1 Prerequisites

- Python 3.11 or higher
- PostgreSQL 14+ (or default fallback to local SQLite for rapid prototyping)
- Git

### 9.2 Clone Repository and Configure Virtual Environment

```bash
git clone https://github.com/Harshil-18-byte/CuraVeris.git
cd CuraVeris/backend

# Create virtual environment

python -m venv venv

# Activate virtual environment (Windows PowerShell)

.\venv\Scripts\Activate.ps1

# Activate virtual environment (Linux / macOS)

source venv/bin/activate

# Install required dependencies

pip install -r requirements.txt

```

### 9.3 Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
PROJECT_NAME="CuraVeris"
SECRET_KEY="curaveris_production_grade_secret_key_change_in_prod"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Connection (PostgreSQL)

DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/curaveris_db"

# Optional External API Credentials

RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="rzp_secret_placeholder"

```

### 9.4 Initialize Reference Database and Seed Rates

CuraVeris automatically initializes and indexes statutory rate tables upon application startup:

```bash
python -c "from app.db.reference_data import initialize_reference_database; initialize_reference_database()"

```

### 9.5 Retrain Machine Learning Models (Optional)

To train the neural network and XGBoost ensemble from scratch with a fresh production seed:

```bash
python app/ml/train_risk_model.py

```

### 9.6 Run the Application Server

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

```

The interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

---

## 10. Automated Testing

The backend includes 34 unit and integration tests covering security, reference database queries, machine learning inference, Merkle ledger hashing, and API routes.

Execute the test suite with verbose output:

```bash
pytest -v

```

Expected test run summary:

```text
tests/test_advanced_features.py::test_financial_toxicity_scoring PASSED
tests/test_advanced_features.py::test_interim_admission_burn_rate PASSED
tests/test_advanced_features.py::test_gst_shadow_bill_detection PASSED
tests/test_advanced_features.py::test_surgical_implant_card_generation PASSED
tests/test_advanced_features.py::test_fine_tuning_jsonl_dataset_schema PASSED
tests/test_advanced_features.py::test_geriatric_and_mental_health_rules PASSED
tests/test_advanced_hardening.py::test_file_magic_bytes_validation PASSED
tests/test_advanced_hardening.py::test_shap_standalone_waterfall_engine PASSED
tests/test_advanced_hardening.py::test_dpdp_user_anonymization_api PASSED
tests/test_advanced_hardening.py::test_emergency_anti_detention_notice_api PASSED
tests/test_advanced_hardening.py::test_pmjay_zero_cash_compliance_audit_api PASSED
tests/test_api.py::test_auth_and_bill_workflow PASSED
tests/test_deep_learning_and_ledger.py::test_deep_neural_network_fit_and_predict PASSED
tests/test_deep_learning_and_ledger.py::test_hybrid_ensemble_predictions_and_mc_uncertainty PASSED
tests/test_deep_learning_and_ledger.py::test_merkle_audit_ledger_sealing_and_tamper_detection PASSED
tests/test_deep_learning_and_ledger.py::test_icd10_and_snomed_clinical_resolution PASSED
tests/test_deep_learning_and_ledger.py::test_api_heatmap_certificate_and_icd10_endpoints PASSED
tests/test_enhancements.py::test_semantic_search_engine_standalone PASSED
tests/test_enhancements.py::test_api_semantic_search PASSED
tests/test_enhancements.py::test_api_async_bill_upload_and_status PASSED
tests/test_enhancements.py::test_abha_m1_sandbox_flow PASSED
tests/test_enhancements.py::test_whatsapp_webhook_integration PASSED
tests/test_reference_data.py::test_cghs_lookup PASSED
tests/test_reference_data.py::test_nppa_lookup PASSED
tests/test_reference_data.py::test_dpco_lookup PASSED
tests/test_reference_data.py::test_irdai_non_payable PASSED
tests/test_reference_data.py::test_disease_registry_resolution PASSED
tests/test_reference_data.py::test_hospital_registry_resolution PASSED
tests/test_risk_engine.py::test_stent_nppa_violation_audit PASSED
tests/test_risk_engine.py::test_dpco_medicine_violation_audit PASSED
tests/test_security.py::test_password_hashing PASSED
tests/test_security.py::test_jwt_token PASSED
tests/test_security.py::test_pii_encryption PASSED
tests/test_security.py::test_razorpay_hmac_verification PASSED

======================= 34 passed in 9.05s =======================

```

---

## 11. Core REST API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Registers new user account with hashed credentials. |
| `POST` | `/api/v1/auth/login` | Authenticates user and returns JWT bearer token. |
| `POST` | `/api/v1/auth/anonymize-me` | Executes DPDP Act 2023 Section 12 right to erasure. |
| `POST` | `/api/v1/bills/upload` | Synchronous ingestion and audit of medical bill. |
| `POST` | `/api/v1/bills/upload-async` | Asynchronous background ingestion with job status polling. |
| `GET` | `/api/v1/bills/{bill_id}` | Retrieves full audit breakdown, overcharge tally, and risk flags. |
| `GET` | `/api/v1/bills/{bill_id}/explainability` | Decomposes composite risk score into SHAP feature contributions. |
| `GET` | `/api/v1/bills/{bill_id}/heatmap` | Generates 2D forensic risk matrix across 5 statutory violation axes. |
| `GET` | `/api/v1/bills/{bill_id}/audit-certificate` | Emits Section 65B cryptographic Merkle block certificate. |
| `POST` | `/api/v1/bills/verify-ledger` | Cryptographically validates authenticity of submitted audit certificate. |
| `POST` | `/api/v1/bills/resolve-icd10` | Maps diagnostic text to ICD-10 / SNOMED ontologies and audits stay length. |
| `POST` | `/api/v1/bills/financial-toxicity` | Calculates FRM metrics (Income Shock, DSTI) and matches safety nets. |
| `POST` | `/api/v1/bills/interim-admission-check` | Tracks daily burn rate against clinical disease ALOS benchmarks. |
| `POST` | `/api/v1/bills/gst-shadow-check` | Detects unlawful GST charges and duplicate invoice discrepancies. |
| `POST` | `/api/v1/bills/pmjay-audit` | Audits bills against PM-JAY zero cash rules and auto-calculates 5x penalty. |
| `POST` | `/api/v1/reports/dispute-letter` | Generates formal legal dispute letters addressed to hospital administration. |
| `POST` | `/api/v1/reports/emergency-detention-notice` | Generates High Court patient release notice citing BNS Sec 127. |
| `GET` | `/api/v1/dev/node-details` | Returns structural metadata and live parameters for developer inspector. |

---

## 12. Security and Privacy Architecture

1. **Digital Personal Data Protection (DPDP) Act 2023 Compliance**:
   - Implements Section 12 right to erasure (`POST /api/v1/auth/anonymize-me`).
   - Automatically sanitizes PII while generating irreversible cryptographic pseudonyms (`DPDP_Anonymized_Patient_<SHA256_HASH>`).
2. **At-Rest and In-Transit Encryption**:
   - Sensitive patient fields (phone numbers, admission identifiers) are encrypted using AES-256-GCM.
   - Database passwords hashed using bcrypt (cost factor 12).
3. **Malware Defense**:
   - Ingestion enforces binary magic bytes validation to prevent polyglot file execution.
4. **Origin Authenticity**:
   - Razorpay webhook verification verifies HMAC-SHA256 signatures before triggering downstream status transitions.

---

## 13. License

This project is licensed under the terms of the [MIT License](LICENSE).
