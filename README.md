# CuraVeris

## Healthcare Financial Verification & Reconciliation

**Know what you actually owe.**

For repository layout and active client runtimes, see [Project structure](docs/PROJECT_STRUCTURE.md).

CuraVeris analyzes hospital billing and related insurance/TPA documentation, combines deterministic financial rules with ML-based anomaly intelligence, produces evidence-backed patient responsibility, and connects verified obligations to payment and reconciliation.

```text
DOCUMENTS → INTELLIGENCE → FINANCIAL TRUTH → PAYMENT → RECONCILIATION
```

ML identifies risk; deterministic rules establish facts; the financial engine calculates liability; evidence explains the result; Razorpay moves money; reconciliation verifies the outcome.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Product Model](#product-model)
- [Product Surface](#product-surface)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Available Commands](#available-commands)
- [Environment Configuration](#environment-configuration)
- [Testing and Completion](#testing-and-completion)
- [Security](#security)
- [API Reference](#api-reference)
- [Machine Learning Ensemble](#machine-learning-ensemble)
- [Modular ML Pipelines for Mobile](#modular-ml-pipelines-for-mobile-apps-android--ios)
- [Memory-Efficient Multi-Model Parallel Training](#memory-efficient-multi-model-parallel-training)
- [Cryptographic Ledger](#cryptographic-ledger)
- [Statutory Framework](#statutory-framework)
- [Comparative Positioning](#comparative-positioning)
- [Documentation](#documentation)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Problem Statement

Indian private healthcare relies on a fragmented three-party financial settlement process that systematically disadvantages patients:

1. **Opaque billing**: Hospitals issue itemized charge sheets that embed statutory violations — NPPA ceiling breaches, DPCO drug overcharges, and IRDAI-excluded consumables — without patient-facing identification.
2. **TPA settlement gaps**: Third-Party Administrators approve partial reimbursements under private tariff agreements, leaving residual balances that patients must pay under urgent discharge pressure.
3. **Absence of reference enforcement**: No automated tool applies CGHS tariff benchmarks, NPPA implant caps, and IRDAI non-payable schedules against real invoices in real time.
4. **Illegible legal recourse**: Anti-detention rights, PM-JAY zero-cash protections, and Mental Healthcare Act parity mandates exist in statute but are practically unreachable at the point of care.
5. **Evidentiary gap**: Audit records generated outside cryptographic frameworks are inadmissible under Section 65B of the Indian Evidence Act.

CuraVeris resolves all five problems as first-class platform features.

---

## Product Model

```mermaid
flowchart TD
  subgraph Stage1 ["Stage 1: Multi-Modal Ingestion & Preprocessing"]
    direction TB
    A["Raw Medical Bill (PDF, Scan, Image, or Raw Text)"] --> B["Extraction & Parser Pipeline<br/>• Magic Bytes Validation<br/>• Itemization & OCR Cleaning<br/>• Clinical Entity Normalization"]
  end

  subgraph Stage2 ["Stage 2: Dual Forensic Engine"]
    direction TB
    subgraph Legal ["Deterministic Statutory Audit"]
      C1["NPPA Device Price Caps (Stent S.O. 1335(E) / Knee S.O. 2668(E))"]
      C2["DPCO 2013 Drug Ceiling Caps"]
      C3["CGHS Benchmark Multipliers"]
      C4["IRDAI 199 Non-Payable Items"]
      C5["GST Healthcare Exemption (Entry 74)"]
    end

    subgraph ML ["Hybrid Machine Learning Ensemble"]
      D1["Multi-Output XGBoost Classifier (Statutory Boundaries & Tree Splits)"]
      D2["Deep MLP Neural Network (Non-Linear Financial Interactions)"]
      D3["Monte Carlo Uncertainty Estimation (K=10 Perturbation Passes)"]
      D1 --> D3
      D2 --> D3
    end
  end

  subgraph Stage3 ["Stage 3: Risk Synthesis & Financial Hardship"]
    direction TB
    E["Composite Forensic Assessment<br/>• Line-by-Line Overcharge Tally<br/>• Composite Risk Score (0-100)<br/>• SHAP Waterfall Attribution"]
    F["Financial Risk Management (FRM)<br/>• Razorpay Payment Gap Reconciliation<br/>• DSTI Hardship & Income Shock Index"]
  end

  subgraph Stage4 ["Stage 4: Admissible Evidence & Patient Advocacy"]
    direction TB
    G1["Section 65B Cryptographic Certificate (SHA-256 Merkle Block & HMAC Signature)"]
    G2["Statutory Legal Dispute Petitions (Ombudsman, Consumer Forum & Anti-Detention Notice)"]
  end

  Stage1 --> Stage2
  Legal --> E
  ML --> E
  B -.-> F
  F --> E
  Stage3 --> Stage4

  style Stage1 fill:#1e3a5f,stroke:#3b82f6,stroke-width:2px,color:#e2e8f0
  style Stage2 fill:#1a1f3a,stroke:#6366f1,stroke-width:2px,color:#e2e8f0
  style Legal fill:#162032,stroke:#3b82f6,stroke-width:1.5px,color:#bfdbfe
  style ML fill:#1a1030,stroke:#a78bfa,stroke-width:1.5px,color:#ddd6fe
  style Stage3 fill:#0d2a1f,stroke:#34d399,stroke-width:2px,color:#e2e8f0
  style Stage4 fill:#2a1a00,stroke:#f59e0b,stroke-width:2px,color:#e2e8f0
```

### Operational Pipeline

| Stage | Subsystem | Functionality & Statutory Backing |
| :--- | :--- | :--- |
| **1. Ingestion** | `extractor.py` | Magic bytes check, Unicode normalization, monetary number correction, and item segmentation. |
| **2. Deterministic Audit** | `risk_engine.py` | Line-by-line validation against NPPA implant ceilings, DPCO drug MRPs, CGHS tariffs, and IRDAI unbundling rules. |
| **3. ML Ensemble** | `deep_risk_network.py` | Soft voting blend of XGBoost + 3-layer MLP neural network with Monte Carlo epistemic uncertainty bounds. |
| **4. Toxicity & Gap** | `financial_toxicity.py` | Razorpay webhook verification, co-pay shortfall reconciliation, and Debt Service-to-Income (DSTI) distress calculation. |
| **5. Legal Redress** | `merkle_audit_ledger.py` | Tamper-evident Merkle tree block hashing and HMAC origin sealing under Section 65B of the Indian Evidence Act. |

---

## Product Surface

- Medical bill ingestion accepting PDF, PNG, and JPEG formats
- Item-level overcharge detection against CGHS, NPPA, DPCO, and IRDAI schedules
- Hybrid XGBoost and deep neural network violation classifier
- SHAP waterfall feature attribution for explainable audit decisions
- Inpatient burn rate monitoring against clinical ALOS benchmarks
- GST exemption enforcement and shadow bill detection
- PM-JAY zero-cash compliance audit with automatic 5x penalty computation
- ICD-10 and SNOMED-CT clinical coding engine
- Cryptographic Merkle audit ledger for Section 65B court admissibility
- Emergency anti-detention legal notice generator citing Bombay High Court precedent
- DPDP Act 2023 right-to-erasure endpoint

---

## Architecture

```mermaid
flowchart TD
  subgraph Inputs ["Data Ingestion Layer"]
    A1["Hospital Bill: PDF / Scan / Photo"]
    A2["Payment Gateway API: Webhooks & Metadata"]
    A3["Statutory Reference Databases: CGHS / NPPA / DPCO"]
  end

  subgraph Processing ["Feature Extraction & Processing Layer"]
    B1["OCR Ingestion Engine: PyPDF / Tesseract / EasyOCR"]
    B2["Payment Enrichment: Balance Gap & EMI Distress"]
    B3["Semantic Retrieval: BM25 / Embedding Search"]
  end

  subgraph Decision ["Auditing & Ensemble Layer"]
    C1["Deterministic Rule Engine: Statutory Violations"]
    C2["Hybrid ML Stacking Ensemble: XGBoost + Deep MLP"]
    C3["Monte Carlo Epistemic Uncertainty Estimation"]
  end

  subgraph Outputs ["Action & Export Layer"]
    D1["Itemized Audit Breakdown & Overcharge Tally"]
    D2["Composite Risk Score: 0 to 100 with SHAP Waterfall"]
    D3["Forensic Dispute Letters & Ombudsman Petitions"]
    D4["Cryptographic Merkle Audit Certificate: Section 65B"]
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

```text
Client / API Consumer
    |
    v
Uvicorn ASGI Server (FastAPI Application)
    |
    +-- JWT Auth + DPDP Compliance Middleware
    +-- Bills Router          (audit, heatmap, ledger, async ingestion)
    +-- Reports Router        (dispute letters, anti-detention notices)
    +-- Payments Router       (Razorpay webhook verification)
    +-- Dev Router            (architecture inspector, dataset downloads)
            |
            v
        Execution Engines
            |
            +-- extractor.py          (magic byte validation, OCR)
            +-- risk_engine.py        (deterministic statutory rules)
            +-- deep_risk_network.py  (XGBoost + MLP hybrid ensemble)
            +-- shap_explainer.py     (SHAP waterfall attribution)
            +-- merkle_audit_ledger.py(SHA-256 chain + HMAC signature)
            +-- icd10_coding_engine.py(ICD-10 and SNOMED resolution)
            |
            v
        PostgreSQL (ACID) + Reference Tariff Store (SQLite)
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md).

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| Backend Framework | FastAPI | 0.111+ | Async REST API and middleware |
| Language | Python | 3.11+ | Server-side logic and data processing |
| Primary Database | PostgreSQL | 14.0+ | ACID-compliant relational persistence |
| Reference Store | SQLite | 3.x | Local statutory rate lookup tables |
| ML Framework | scikit-learn + XGBoost | Latest | Gradient boosted classifier |
| Deep Learning | PyTorch / Custom MLP | Latest | Multi-layer perceptron neural network |
| Explainability | SHAP | Latest | Additive feature attribution |
| OCR | PyPDF / Tesseract | Latest | Invoice text extraction |
| Search | BM25 / TF-IDF | Latest | Semantic procedure similarity |
| Auth | PyJWT + Passlib | Latest | Stateless JWT and bcrypt |
| Encryption | PyCryptodome | Latest | AES-256-GCM PII field encryption |
| Payment | Razorpay | Latest | Webhook verification and order creation |
| Task Queue | FastAPI BackgroundTasks | Built-in | Async bill ingestion |

---

## Features

### Bill Audit Engine

- Item-level statutory cross-referencing against CGHS 2024 (1,900+ procedures), NPPA implant caps, DPCO 2013 drug ceilings, and IRDAI 199-item non-payable schedule.
- Composite risk score from 0 to 100 derived from violation count, overcharge magnitude, and model confidence.
- SHAP waterfall attribution decomposing each contributing feature's additive impact on the final score.
- Shadow bill detection — identifies duplicate line items and unlawful GST surcharges on exempt healthcare services.

### Forensic ML Ensemble Architecture

- Hybrid stacking of an XGBoost multi-output classifier and a three-layer MLP (Dense 128 → 64 → 32) across 7 violation labels simultaneously.
- Soft probability blending: $P_{\text{blended}} = 0.45 \cdot P_{\text{NN}} + 0.55 \cdot P_{\text{XGB}}$.
- Monte Carlo epistemic uncertainty estimation across $K = 10$ stochastic forward passes.
- Deterministic production seeds logged cryptographically to `training_history.json` for reproducibility.

### Inpatient Financial Lifecycle

- Pre-admission package tariff and NABH accreditation tier verification.
- Real-time inpatient burn rate monitoring: flags daily expenditures deviating more than 30% from clinical ALOS benchmarks.
- Discharge overcharge tally with item-level citation of specific statutory notifications.
- Post-discharge TPA shortfall and FRM financial toxicity calculation.
- Emergency legal filing support including Ombudsman petitions and anti-detention notices.

### Legal Document Generation

- Formal dispute letters addressed to hospital administration with line-item citation of violated gazette notifications.
- Emergency anti-detention notice citing Bombay High Court Criminal WP No. 2502/2000 and BNS Section 127.
- PM-JAY zero-cash violation notice with automatic 5x penalty computation and SAFU referral.

### Cryptographic Evidence

- Section 65B Merkle audit certificate with SHA-256 pairwise tree hashing and HMAC-SHA256 origin signature.
- Tamper-evident: modifying any billed amount invalidates the Merkle root and fails signature verification.

## Project Structure

```text
CuraVeris/
├── app/                                 # Global application assets & model storage
│   └── ml/
│       └── weights/                     # Pre-trained ML weight checkpoints
├── backend/                             # Core FastAPI backend service
│   ├── app/
│   │   ├── api/                         # Versioned API routes (/api/v1)
│   │   │   ├── abha.py                  # ABDM & ABHA digital health records
│   │   │   ├── auth.py                  # JWT authentication, RBAC, DPDP anonymization
│   │   │   ├── bills.py                 # Bill upload, OCR extraction, forensic audit
│   │   │   ├── chat.py                  # Grounded AI statutory patient advocacy chat
│   │   │   ├── dev.py                   # Model observability, telemetry, datasets
│   │   │   ├── finance.py               # Hospital finance, ledger recovery, DSTI index
│   │   │   ├── insurance.py             # TPA reconciliation, policy coverage analysis
│   │   │   ├── integrations.py          # Hospital Information Systems & EMR hooks
│   │   │   ├── razorpay.py              # Razorpay orders, signatures, webhook handler
│   │   │   └── reports.py               # Dispute letters, Ombudsman & anti-detention notices
│   │   ├── core/                        # Infrastructure, security, and middleware
│   │   │   ├── config.py                # Pydantic BaseSettings & startup secret validator
│   │   │   ├── credentials.py           # Secure key vault & credentials management
│   │   │   ├── currency.py              # INR formatting, paise conversion, financial math
│   │   │   ├── errors.py                # Structured error handlers & safe error envelopes
│   │   │   ├── limiter.py               # SlowAPI rate limiting configuration
│   │   │   ├── logging.py               # Structured log formatting & trace correlation
│   │   │   ├── merkle_audit_ledger.py   # Cryptographic Merkle tree & Section 65B signatures
│   │   │   ├── request_context.py       # ContextVar request ID tracking
│   │   │   ├── security.py              # JWT tokens, bcrypt, RBAC, Fernet PII encryption
│   │   │   └── security_hardening.py    # OWASP defense, input sanitization, signature checks
│   │   ├── db/                          # Database connection and persistence
│   │   │   ├── chroma_client.py         # Vector database client for statutory embeddings
│   │   │   ├── database.py              # Async SQLAlchemy engine, session maker, get_db DI
│   │   │   ├── disease_registry.py      # ICD-10 clinical registry & PM-JAY packages
│   │   │   ├── hospital_registry.py     # Hospital registry & NABH accreditation tiers
│   │   │   ├── models.py                # SQLAlchemy ORM database models
│   │   │   └── reference_data.py        # CGHS, NPPA, DPCO, and IRDAI lookup queries
│   │   ├── engine/                      # Deterministic and forensic calculation engines
│   │   │   ├── admission_monitor.py     # Inpatient burn rate & bed-blocking audit
│   │   │   ├── extractor.py             # Magic byte validation & multi-modal OCR pipeline
│   │   │   ├── financial_toxicity.py    # DSTI hardship & FRM financial risk scoring
│   │   │   ├── icd10_coding_engine.py   # ICD-10 & SNOMED-CT clinical terminology mapping
│   │   │   ├── risk_engine.py           # Deterministic statutory rules (NPPA, DPCO, CGHS)
│   │   │   ├── semantic_search.py       # BM25 & TF-IDF procedural search
│   │   │   ├── shadow_bill_detector.py  # GST anomaly & duplicate invoice detection
│   │   │   └── shap_explainer.py        # SHAP additive feature attribution waterfall
│   │   ├── ml/                          # Hybrid machine learning ensemble
│   │   │   ├── deep_risk_network.py     # PyTorch MLP + XGBoost hybrid stacking ensemble
│   │   │   ├── fine_tuning_generator.py # Synthetic clinical fine-tuning dataset generator
│   │   │   ├── train_risk_model.py      # Reproducible model training with deterministic seeds
│   │   │   └── weights/                 # Local model weights (.joblib, .pt)
│   │   ├── models/                      # Pydantic validation & response schemas
│   │   │   └── schemas.py               # Pydantic v2 request, response, and health schemas
│   │   ├── services/                    # Business service layer
│   │   │   └── dispute_service.py       # Legal notice & petition document generator
│   │   └── main.py                      # FastAPI application entrypoint, lifespan, & probes
│   ├── migrations/                      # Alembic schema versioning and migration scripts
│   ├── ml_training/                     # Distributed and offline ML training pipeline
│   ├── notebooks/                       # Exploratory analysis and training notebooks
│   ├── reference_data/                  # Statutory rate databases (medical_rates.db)
│   ├── tests/                           # Automated unit, integration, & foundation tests
│   │   ├── conftest.py                  # Pytest fixtures and async client configuration
│   │   ├── test_phase3_foundation.py    # Phase 3 backend & API foundation test suite
│   │   └── run_all_backend_tests.py     # Master backend test suite execution script
│   ├── alembic.ini                      # Alembic migration configuration
│   ├── pytest.ini                       # Pytest execution configuration
│   ├── requirements.txt                 # Backend Python package dependencies
│   ├── requirements-dev.txt             # Development and testing dependencies
│   └── run.py                           # Local server launcher
├── clients/                             # Client SDKs and integration stubs
├── config/                              # Global service and environment configs
├── contracts/                           # OpenAPI and RPC interface contracts
├── data/                                # Vector storage and runtime data
├── dev/                                 # Developer tools and local diagnostics
├── docs/                                # Architectural and statutory documentation
│   ├── ARCHITECTURE.md                  # System boundaries, database schema, ML pipeline
│   ├── API_REFERENCE.md                 # REST endpoint schemas, payloads, and examples
│   ├── STATUTORY_FRAMEWORK.md           # Legal citations, gazette notifications, case law
│   ├── DATA_MODEL.md                    # Entity-relationship specification
│   ├── SECURITY.md                      # Security controls and threat model
│   ├── CHANGELOG.md                     # Versioned implementation history
│   ├── ENGINEERING_AUDIT.md             # Comprehensive architecture and gap analysis
│   └── images/                          # Architectural flow diagrams
├── models/                              # Global ML model checkpoints and artifacts
├── reference_data/                      # Statutory benchmark source datasets
├── scripts/                             # Operational and maintenance automation scripts
├── src/                                 # Shared core algorithms & utilities
├── .env.example                         # Example environment variables template
├── .gitignore                           # Comprehensive git exclusions
├── .markdownlint.json                   # Markdown linting rules
├── .mcp.json                            # Model Context Protocol configuration
├── docker-compose.yml                   # Container orchestration definition
├── Dockerfile                           # Production backend container build
├── pyrightconfig.json                   # Python language server configuration
├── ruff.toml                            # Ruff linter and formatter configuration
├── CONTRIBUTING.md                      # Contribution guidelines
├── DEPLOYMENT.md                        # Production deployment architecture
├── LICENSE                              # MIT License
├── SECURITY.md                          # Security policy and reporting
├── TESTING.md                           # Automated test coverage documentation
└── README.md                            # Primary project documentation
```

---

## Phase 3: Backend + API Foundation

The backend foundation is built on FastAPI with high-reliability enterprise architecture:

### 1. Application Startup & Lifespan
- **Lifespan Context Manager**: Managed in [`backend/app/main.py`](file:///j:/Dev/PROJECTS/CuraVeris/backend/app/main.py). Automatically coordinates startup tasks:
  1. Validates configuration secrets (rejects insecure default keys in production/staging).
  2. Initializes the PostgreSQL database connection pool and ensures schema presence.
  3. Populates statutory reference benchmarks (CGHS, NPPA, DPCO, IRDAI).
  4. Prepares ML ensemble weights and ChromaDB collections.
  5. Coordinates graceful shutdown and connection cleanup.

### 2. Configuration Management
- **Pydantic BaseSettings**: Configured in [`backend/app/core/config.py`](file:///j:/Dev/PROJECTS/CuraVeris/backend/app/core/config.py). Supports automatic environment variable binding with typed fallbacks.
- **Strict Startup Validation**: `validate_secrets()` prevents starting with development keys in staging or production.

### 3. Database Connection & Lifecycle
- **Async SQLAlchemy 2.0**: Configured in [`backend/app/db/database.py`](file:///j:/Dev/PROJECTS/CuraVeris/backend/app/db/database.py).
- **Dependency Injection**: The `get_db` async generator provides scoped sessions with automatic transaction rollback on unhandled exceptions and guaranteed cleanup.

### 4. Database Migrations
- **Alembic Versioning**: Fully configured via `alembic.ini` and `backend/migrations/` to track schema changes.

### 5. Dependency Injection Architecture
- `get_db`: Yields transactional async database sessions.
- `get_current_user`: Decodes JWT tokens, validates expiration, and retrieves active user records.
- `require_roles`: Factory dependency enforcing Role-Based Access Control (RBAC).
- `enforce_tenant_access`: Enforces organization boundary isolation.

### 6. API Versioning & Routing
- Base API prefix `settings.API_V1_STR` (`/api/v1`) mounted cleanly across all business routers:
  - `/api/v1/auth`: Authentication, registration, token refresh, and user profile.
  - `/api/v1/bills`: Bill upload, extraction, audit, and status tracking.
  - `/api/v1/reports`: Legal dispute petitions, anti-detention notices.
  - `/api/v1/insurance`: TPA reconciliation and policy coverage analysis.
  - `/api/v1/razorpay`: Payment gateway orders and webhook processing.
  - `/api/v1/finance`: Hospital ledger revenue recovery and analytics.
  - `/api/v1/abha`: ABDM / ABHA health records integration.
  - `/api/v1/chat`: Grounded statutory patient advocacy AI assistant.

### 7. Request Validation & Response Schemas
- Strict **Pydantic v2** models defined in [`backend/app/models/schemas.py`](file:///j:/Dev/PROJECTS/CuraVeris/backend/app/models/schemas.py).
- Input fields enforce type safety, regex constraints, and value sanitization.
- Response models guarantee well-defined schemas across all endpoints.

### 8. Structured Error Handling
- Safe error payloads formatted as:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Request validation failed.",
      "details": [...]
    },
    "request_id": "c71a396e-57b1-419b-a0ee-6c17e33527b1"
  }
  ```
- Handlers registered for `CuraVerisError`, `RequestValidationError`, `RateLimitExceeded`, and `StarletteHTTPException`.

### 9. Request Traceability (Request IDs)
- `RequestCorrelationMiddleware` accepts client-provided `X-Request-ID` or generates a UUID4.
- Injected into `request_id_context` for structured logging, returned in response headers, and embedded in all error payloads.

### 10. Authentication & Authorization Foundation
- **JWT Tokens**: Stateless HMAC-SHA256 access tokens and cryptographically hashed refresh tokens.
- **RBAC Matrix**: Enforced via `require_roles("ROLE_A", "ROLE_B")` supporting:
  `PATIENT`, `HOSPITAL_ADMIN`, `HOSPITAL_FINANCE`, `HOSPITAL_BILLING`, `HOSPITAL_AUDITOR`, `TPA_REVIEWER`, `TPA_ADMIN`, `INSURER_REVIEWER`, `INSURER_ADMIN`, and `PLATFORM_ADMIN`.

### 11. Health, Liveness & Readiness Probes
- `GET /health`: Comprehensive health report including database status and reference data availability.
- `GET /health/live` & `GET /live`: Liveness probe indicating process responsiveness.
- `GET /health/ready` & `GET /ready`: Readiness probe verifying backend database connectivity.

### 12. OpenAPI Contracts
- Full OpenAPI 3.x specification available dynamically at `/openapi.json` and interactive docs at `/docs` (in development).

---

## Data Model

The platform uses a hybrid persistence model: PostgreSQL for all ACID financial and audit data, SQLite for read-only statutory reference lookups.

| Entity | Store | Key Fields | Description |
| :--- | :--- | :--- | :--- |
| `users` | PostgreSQL | `id`, `email`, `hashed_password`, `phone_encrypted` | Patient and advocate accounts. Phone stored encrypted under AES-256-GCM. |
| `bills` | PostgreSQL | `id`, `user_id`, `total_billed`, `total_overcharge`, `risk_score`, `status` | Root audit session entity. Tracks gross financial totals and composite score. |
| `bill_items` | PostgreSQL | `id`, `bill_id`, `category`, `charged_rate`, `cghs_rate`, `nppa_ceiling`, `risk_flags` | Atomic line item with statutory comparisons and violation flags. |
| `audit_logs` | PostgreSQL | `id`, `bill_id`, `action_type`, `details`, `timestamp` | Forensic trail of all status transitions and report generations. |
| `cghs_rates` | SQLite | `procedure_name`, `nabh_rate`, `non_nabh_rate` | 1,900+ CGHS 2024 procedure benchmarks. |
| `nppa_devices` | SQLite | `device_name`, `ceiling_price` | Coronary stent and orthopedic implant caps. |
| `dpco_drugs` | SQLite | `drug_name`, `mrp_per_unit` | Scheduled pharmaceutical MRP ceilings. |
See [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md).

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14+ with a database named `curaveris_db`
- Git & [Git LFS](https://git-lfs.com/) (required for tracking large binary weights and database files)

### Installation

```bash
# 1. Initialize Git LFS on your machine
git lfs install

# 2. Clone repository and pull LFS objects
git clone https://github.com/Harshil-18-byte/CuraVeris.git
cd CuraVeris
git lfs pull

# 3. Navigate to backend and setup virtual environment
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows PowerShell
# source venv/bin/activate           # Linux / macOS

# 4. Install dependencies
pip install -r requirements.txt
```

### Initialize Reference Database

```bash
python -c "from app.db.reference_data import initialize_reference_database; initialize_reference_database()"
```

### Train Machine Learning Models (Optional)

```bash
python app/ml/train_risk_model.py
```

### Run the Application

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

---

## Available Commands

| Command | Directory | Description |
| :--- | :--- | :--- |
| `uvicorn app.main:app --reload` | `backend/` | Starts the FastAPI server with hot-reload. |
| `python app/ml/train_risk_model.py` | `backend/` | Retrains the XGBoost and MLP ensemble from scratch. |
| `pytest -v` | `backend/` | Runs all 62 test suites across API, security hardening, ML models, multi-tenancy, and financial invariants (100% passing). |
| `python -m venv venv` | `backend/` | Creates the isolated Python virtual environment. |
| `pip install -r requirements.txt` | `backend/` | Installs all production and development dependencies. |
| `git lfs pull` | Root | Downloads all large binary model weights (`.pt`, `.onnx`, `.safetensors`, `.ubj`) and SQLite DBs. |

---

## Environment Configuration

Create `backend/.env` with the following variables. Do not commit this file.

```env
PROJECT_NAME="CuraVeris"
SECRET_KEY="curaveris_production_grade_secret_key_change_in_prod"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# PostgreSQL connection string
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/curaveris_db"

# Optional: Razorpay payment gateway credentials
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="rzp_secret_placeholder"
```

---

## Testing and Completion

A successful build is not the definition of completion. The acceptance path is:

1. All 73 automated tests pass across security, reference data, ML inference, Merkle ledger, and API routes.
2. PostgreSQL connection is active and schema is initialized.
3. Reference tariff database is seeded with CGHS, NPPA, DPCO, and IRDAI data.
4. Bill upload endpoint exercises the full OCR → rule engine → ML ensemble → ledger pipeline.
5. Dispute letter and anti-detention notice endpoints return legally-cited documents.
6. No fabricated statutory rates or pre-computed scores are present outside test fixtures.
7. Documentation matches the implementation at every endpoint.

---

## Security

- **Field-level encryption**: Patient phone numbers and identifiers encrypted with AES-256-GCM.
- **Password storage**: bcrypt with cost factor 12.
- **Authentication**: Stateless HMAC-SHA256 signed JWT tokens. Expire at 1,440 minutes.
- **File ingestion defense**: Binary magic bytes validation rejects polyglot payloads before OCR.
- **Webhook integrity**: Razorpay HMAC-SHA256 signature verification before any payment status transition.
- **DPDP Act 2023**: Right to erasure implemented at `POST /api/v1/auth/anonymize-me`.

See [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## API Reference

### Core Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new account with hashed credentials. |
| `POST` | `/api/v1/auth/login` | Authenticate and receive JWT bearer token. |
| `POST` | `/api/v1/auth/anonymize-me` | DPDP Act 2023 Section 12 right to erasure. |
| `POST` | `/api/v1/bills/upload` | Synchronous bill ingestion and audit. |
| `POST` | `/api/v1/bills/upload-async` | Asynchronous ingestion with job status polling. |
| `GET` | `/api/v1/bills/{bill_id}` | Retrieve full audit breakdown and overcharge tally. |
| `GET` | `/api/v1/bills/{bill_id}/explainability` | SHAP waterfall feature attribution. |
| `GET` | `/api/v1/bills/{bill_id}/heatmap` | 2D forensic risk matrix across 5 violation axes. |
| `GET` | `/api/v1/bills/{bill_id}/audit-certificate` | Section 65B Merkle block certificate. |
| `POST` | `/api/v1/bills/verify-ledger` | Cryptographic authenticity verification. |
| `POST` | `/api/v1/bills/resolve-icd10` | ICD-10 / SNOMED mapping and ALOS audit. |
| `POST` | `/api/v1/bills/financial-toxicity` | FRM income shock and DSTI calculation. |
| `POST` | `/api/v1/bills/interim-admission-check` | Daily burn rate vs. clinical ALOS benchmark. |
| `POST` | `/api/v1/bills/gst-shadow-check` | GST exemption enforcement and duplicate detection. |
| `POST` | `/api/v1/bills/pmjay-audit` | PM-JAY zero-cash audit with 5x penalty computation. |
| `POST` | `/api/v1/reports/dispute-letter` | Formal legal dispute letter to hospital administration. |
| `POST` | `/api/v1/reports/emergency-detention-notice` | Anti-detention notice citing BNS Section 127. |

See [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md).

---

## Machine Learning Ensemble

The audit engine combines a gradient-boosted decision tree classifier with a multi-layer perceptron to classify non-linear financial ratios across 7 violation labels simultaneously.

**Architecture**:

$$\text{Input}(15) \longrightarrow \text{Dense}(128, \text{ReLU}) \longrightarrow \text{Dense}(64, \text{ReLU}) \longrightarrow \text{Dense}(32, \text{ReLU}) \longrightarrow \text{Output}(7, \sigma)$$

**Blending**:

$$P_{\text{blended}} = 0.45 \cdot P_{\text{NN}} + 0.55 \cdot P_{\text{XGB}}$$

**Uncertainty**:

$$\mu_j = \frac{1}{K}\sum_{k=1}^{K} P_j^{(k)}, \quad \sigma_j = \sqrt{\frac{1}{K}\sum_{k=1}^{K}\left(P_j^{(k)} - \mu_j\right)^2}, \quad K = 10$$

**Holdout metrics (production seed 364658)**:

| Metric | XGBoost | Deep MLP | Hybrid Ensemble |
| :--- | :--- | :--- | :--- |
| Macro Precision | — | — | 0.7875 |
| Macro Recall | — | — | 0.4820 |
| Macro F1 | 0.5881 | 0.5540 | 0.5836 |

---

## Modular ML Pipelines for Mobile Apps (Android & iOS)

CuraVeris provides 7 production-grade ML pipelines in `backend/app/ml/pipelines/` engineered for low-latency (< 100ms) mobile app consumption:

1. **`DocumentParsingPipeline`**: Multimodal LayoutLMv3 tokenization, normalized 2D bounding boxes ($[0, 1000]$), 15 NER entity labels, and tabular row-column association.
2. **`StatutoryRAGPipeline`**: ChromaDB BioBERT semantic vector lookup across CGHS, NPPA, and DPCO statutory registries ($> 0.72$ threshold gating).
3. **`XGBoostRiskPipeline`**: 10-feature multi-label gradient boosted trees with SMOTE class balancing and optimal decision threshold calibration.
4. **`DeepEnsembleRiskPipeline`**: Deep MLP (128-64-32 with Adam) + XGBoost stacking + 15-pass Monte Carlo Dropout epistemic uncertainty ($\sigma$).
5. **`InsuranceReconciliationPipeline`**: IRDAI non-payable items audit (199 schedule items) and TPA settlement gap recovery analysis.
6. **`LegalDisputePipeline`**: Automated legal notice generator under Consumer Protection Act 2019 and Essential Commodities Act 1955.
7. **`MobileInferencePipeline`**: Unified mobile gateway returning structured UI cards with color badges (`#10B981`, `#F59E0B`, `#EF4444`), 0–100 risk score, and downloadable dispute letters.

---

## Memory-Efficient Multi-Model Parallel Training

To train all models under strict memory budgets (< 8GB RAM peak), [`backend/ml_training/train_all_models.py`](./backend/ml_training/train_all_models.py) executes a single-pass streaming architecture:

```mermaid
graph TD
    Data["590 Merged Bills (merged_dataset.jsonl)"] --> Stream["StreamingBillLoader (64 bills/chunk, CRC32 70/15/15 Split)"]
    Stream --> Feat["Shared FeatureExtractor (~8MB SQLite Cache: CGHS, NPPA, DPCO)"]
    
    subgraph ParallelPipe ["Single Disk-Read Pass (< 200MB Streaming RAM)"]
        Feat -->|"xgb_X, xgb_y"| ModelA["Model A: XGBoost Multi-Label (np.memmap on disk + SMOTE)"]
        Feat -->|"tokens, bboxes"| ModelB["Model B: LayoutLMv3 (Worker Thread + Gradient Checkpointing)"]
        Feat -->|"texts, metadata"| ModelC["Model C: ChromaDB BioBERT Indexer (32-batch flush)"]
    end

    ModelA --> OutA["models/risk_classifier.pkl"]
    ModelB --> OutB["models/layoutlm_finetuned/"]
    ModelC --> OutC["ChromaDB Vector Store"]
```

### CLI Training Commands

```bash
# 1. Train all models in a single parallel streaming pass:
python ml_training/train_all_models.py

# 2. Train only XGBoost classifier (fastest):
python ml_training/train_all_models.py --models A

# 3. Train XGBoost + rebuild ChromaDB statutory vector index:
python ml_training/train_all_models.py --models A C

# 4. Train LayoutLMv3 document transformer:
python ml_training/train_all_models.py --models B
```

---

## CuraVeris-4B & CuraVeris-1B Custom Transformer Models

CuraVeris includes native custom dense decoder Transformers built and trained from scratch specifically for the Indian healthcare statutory billing domain:

### Architecture Matrix

| Specification | CuraVeris-4B | CuraVeris-1B |
| :--- | :--- | :--- |
| **Parameter Count** | **~4.07 Billion (4,074,276,864)** | **~1.05 Billion (1,054,057,216)** |
| **Layers ($N_{\text{layers}}$)** | 36 Transformer Blocks | 24 Transformer Blocks |
| **Hidden Size ($d_{\text{model}}$)** | 3,072 | 1,792 |
| **Intermediate Size (SwiGLU)** | 8,704 | 4,864 |
| **Attention Mechanism** | Grouped Query Attention (GQA) | Grouped Query Attention (GQA) |
| **Attention Heads / KV Heads** | 24 Query / 4 Key-Value (6x Compression) | 14 Query / 2 Key-Value (7x Compression) |
| **Positional Encoding** | Rotary Position Embeddings (RoPE $\theta=10000.0$) | Rotary Position Embeddings (RoPE $\theta=10000.0$) |
| **Context Window** | 8,192 tokens | 8,192 tokens |
| **Vocabulary Size** | 64,000 (Clinical, Pharma, Gazette tokens) | 64,000 (Clinical, Pharma, Gazette tokens) |
| **Multi-Task Heads** | Causal LM + 7-Class Anomaly + ₹ Restitution | Causal LM + 7-Class Anomaly + ₹ Restitution |
| **Quantized Formats** | Dynamic INT8 (`.pt`), ONNX Runtime (`.onnx`) | Dynamic INT8 (`.pt`), ONNX Runtime (`.onnx`) |

### Multi-Task Scratch Training Objective

$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{LM}} + 0.5 \cdot \mathcal{L}_{\text{Focal}} + 0.1 \cdot \mathcal{L}_{\text{Huber}}$$

1. **Causal Language Modeling ($\mathcal{L}_{\text{LM}}$)**: Next-token cross-entropy over statutory gazette citations, forensic reasoning, and Section 65B legal dispute letters.
2. **Multi-Label Focal Loss ($\mathcal{L}_{\text{Focal}}$)**:
   $$\mathcal{L}_{\text{Focal}} = -(1 - p_t)^\gamma \log(p_t) \quad (\gamma=2.0, \alpha=0.25)$$
   Mitigates severe class imbalance across the 7 hospital billing violation categories.
3. **Continuous Restitution Huber Loss ($\mathcal{L}_{\text{Huber}}$)**: Smooth L1 regression for exact rupee overcharge difference prediction.

---

## Two-Track Hybrid Production Architecture

```text
TRACK A: Model Specialization
Qwen / CuraVeris-4B -> Domain Adaptation -> Multi-Task SFT -> DPO Preference Tuning

TRACK B: Reliable Audit System
Bill -> Document Understanding (LayoutLM / OCR) -> Structured Representation ->
Temporal Reference RAG -> Deterministic Rule Engine -> 4B Model Reasoning ->
Evidence Verification -> Calibrated Confidence Gate -> Certified Audit Report
```

- **Track A (Model Specialization)**: Domain-adapted 4B transformer providing nuanced clinical rationale, item categorization, and statutory justification.
- **Track B (Reliable Auditing Core)**: Zero-hallucination code-based calculation engine ($Q \times R_{\text{charged}} - Q \times R_{\text{allowed}}$), BM25 + Bi-Encoder dense retrieval, cross-encoder temporal reranker, and calibrated confidence routing ($\ge 0.95$ clear finding, $0.70-0.95$ enhanced review, $< 0.70$ human review).

---

## Enterprise Security Hardening

CuraVeris enforces defense-in-depth security controls across the entire platform:

- **File Upload Protection**: Magic bytes header inspection (`%PDF`, `\x89PNG`, `\xff\xd8\xff`, `RIFF`), max payload size limit (25MB), and recursive path traversal sanitization (`../`, `..\`, null bytes `\x00`).
- **Cryptographic Audit Integrity**: Deterministic SHA-256 hashing on all uploaded bills and findings, sealed with HMAC-SHA256 signatures in a Merkle tree ledger.
- **Transport & Web Security**: HTTP Strict Transport Security (HSTS `max-age=31536000; includeSubDomains`), Content Security Policy (CSP baseline), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Rate Limiting & Anti-DDoS**: Token bucket rate limiting via SlowAPI on `/auth`, `/audit`, `/upload`, and `/api/v1/dev` endpoints.
- **Observability APIs**: Real-time endpoints at `/api/v1/dev/curaveris-4b`, `/api/v1/dev/curaveris-1b`, and `/api/v1/dev/security-status`.

---

## Cryptographic Ledger

Each completed audit is sealed in a chained cryptographic block for court admissibility under Section 65B of the Indian Evidence Act:

**Leaf hash**:

$$\text{Leaf}_i = \text{SHA-256}(\text{RawText} \parallel \text{ChargedRate} \parallel \text{Quantity} \parallel \text{Overcharge})$$

**Block hash**:

$$\text{Block}_n = \text{SHA-256}(n \parallel \text{Timestamp} \parallel \text{BillID} \parallel \text{TotalBilled} \parallel \text{Overcharge} \parallel \text{RiskScore} \parallel \text{MerkleRoot} \parallel \text{PrevHash})$$

**Origin signature**:

$$\text{Signature} = \text{HMAC-SHA256}(k_{\text{secret}}, \text{Block}_n)$$

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full ledger specification.

---

## Statutory Framework

Primary statutes and judicial precedents implemented in the audit engine:

| Statute | Scope | Violation Flag |
| :--- | :--- | :--- |
| NPPA S.O. 1335(E) | DES stent cap ₹38,260; BMS cap ₹10,509 | `nppa_ceiling_violation` |
| NPPA S.O. 2668(E) | Primary knee implant cap ₹63,800 | `nppa_ceiling_violation` |
| DPCO 2013, Para 24 | Scheduled drug MRP ceilings | `above_mrp` |
| MoF Notification 12/2017-CT(R), Entry 74 | GST exemption on healthcare services | `gst_on_exempt` |
| IRDAI Circular 2020, 199 items | Consumable unbundling prohibition | `consumable_unbundled` |
| Mental Healthcare Act 2017, Section 21(4) | Psychiatric parity mandate | `mental_healthcare_act_violation` |
| NHA Operational Guidelines Section 3.2 | PM-JAY zero cash mandate | `pmjay_cash_violation` |
| Bombay HC CrWP 2502/2000, BNS Section 127 | Anti-detention constitutional right | Anti-detention notice |

See [`docs/STATUTORY_FRAMEWORK.md`](./docs/STATUTORY_FRAMEWORK.md).

---

## Comparative Positioning

| Feature | US Tools | Generic LLMs | Hospital ERPs | CuraVeris |
| :--- | :--- | :--- | :--- | :--- |
| Jurisdiction | HIPAA / CPT | Global | Indian networks | Indian statutory |
| NPPA / DPCO caps | No | No | Not enforced | Automated |
| CGHS tariff benchmarks | No | No | Not enforced | NABH / non-NABH |
| Payment gap analysis | No | No | Records only | EMI and distress scoring |
| Burn rate forecasting | No | No | No | Daily monitoring |
| Model verification | Commercial | Non-deterministic | Rules only | Hybrid ensemble |
| Evidentiary standard | PDF report | Text transcript | Invoice reprint | Section 65B Merkle ledger |
| Anti-detention notice | No | No | Opposing interest | Bombay HC precedent |

---

## Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system boundaries, database schema, ML pipeline, cryptographic ledger
- [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) — complete REST endpoint reference with request and response schemas
- [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) — entity-relationship specification and field-level descriptions
- [`docs/STATUTORY_FRAMEWORK.md`](./docs/STATUTORY_FRAMEWORK.md) — statutory citations, gazette notifications, and case law
- [`docs/SECURITY.md`](./docs/SECURITY.md) — encryption controls, threat model, and DPDP Act compliance
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) — versioned implementation history
- [`docs/ENGINEERING_AUDIT.md`](./docs/ENGINEERING_AUDIT.md) — comprehensive architectural audit and capability gap analysis
- [`docs/PRODUCTION_TRAINING_GUIDE.md`](./docs/PRODUCTION_TRAINING_GUIDE.md) — production multi-model training procedures and GPU specifications
- [`docs/MANUAL_TRAINING_GUIDE.md`](./docs/MANUAL_TRAINING_GUIDE.md) — manual model execution, hyperparameter tuning, and verification
- [`backend/docs/ML_AND_BACKEND_HANDBOOK.md`](./backend/docs/ML_AND_BACKEND_HANDBOOK.md) — ML training guide and backend developer handbook
- [`backend/ml_training/GOVERNMENT_DATA_COLLECTION.md`](./backend/ml_training/GOVERNMENT_DATA_COLLECTION.md) — government data collection and scraping protocol

---

## Disclaimer

This software is an engineering platform for medical billing audit workflows. It is not legal advice and does not replace formal legal counsel, operational governance, regulatory review, or clinical validation. Statutory citations are provided for reference and must be independently verified for any formal legal proceeding.

---

## License

Copyright 2026 CuraVeris. All rights reserved.

MIT. See [`LICENSE`](./LICENSE).
