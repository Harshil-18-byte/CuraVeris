# CuraVeris Technical Architecture Specification

This document details the systems design, data pipelines, database schema, machine learning ensemble, and cryptographic protocols of the CuraVeris platform.

---

## Table of Contents

- [System Architecture](#1-system-architecture-and-component-hierarchy)
- [Database Schema](#2-database-schema-and-entity-relationship-architecture)
- [Ingestion Pipeline](#3-optical-character-recognition-and-ingestion-pipeline)
- [Machine Learning Ensemble](#4-machine-learning-ensemble-architecture)
- [Cryptographic Merkle Ledger](#5-cryptographic-merkle-audit-ledger-specification)
- [Async Task State Machine](#6-asynchronous-background-task-state-machine)
- [Security Controls](#7-security-and-encryption-controls)

---

## 1. System Architecture and Component Hierarchy

CuraVeris is structured as an asynchronous layered service architecture with strict separation between ingestion, auditing, persistence, and document generation responsibilities.

```mermaid
graph TD
  Client[Client / API Consumer] --> Gateway[Uvicorn ASGI Server]

  subgraph API_Layer [FastAPI Routing and Middleware]
    Gateway --> AuthMiddleware[JWT Auth and DPDP Compliance Engine]
    Gateway --> BillRouter[Bills and Ingestion Router]
    Gateway --> ReportRouter[Dispute and Detention Notice Router]
    Gateway --> PaymentRouter[Payment Webhook and Reconciliation Router]
    Gateway --> DevRouter[Architecture Inspector and Tooling Router]
  end

  subgraph Service_Engine [Execution and Audit Engines]
    BillRouter --> Extractor[OCR Ingestion and Magic Byte Validator]
    BillRouter --> RiskEngine[Deterministic Statutory Rule Engine]
    BillRouter --> EnsembleEngine[Hybrid ML Ensemble: XGBoost + Deep MLP]
    BillRouter --> Explainer[SHAP Local Feature Explainer]
    BillRouter --> MerkleEngine[Cryptographic Merkle Audit Ledger]
    BillRouter --> ClinicalEngine[ICD-10 and SNOMED Clinical Resolver]
    ReportRouter --> LegalEngine[High Court Anti-Detention Notice Generator]
    PaymentRouter --> PaymentEnricher[Payment Gap and EMI Distress Enricher]
  end

  subgraph Storage_Layer [Persistence and Reference Stores]
    RiskEngine --> SQLiteRef[(Reference Tariffs: CGHS / NPPA / DPCO)]
    EnsembleEngine --> ModelWeights[(Serialized Model Weights: .joblib)]
    BillRouter --> PostgresDB[(PostgreSQL: Bills, Items, Users, Audit Logs)]
  end
```

---

## 2. Database Schema and Entity-Relationship Architecture

The relational persistence tier uses PostgreSQL for all transactional data. The SQLite reference store is read-only and seeded at startup from statutory gazette data.

```mermaid
erDiagram
  USERS ||--o{ BILLS : owns
  BILLS ||--|{ BILL_ITEMS : contains
  BILLS ||--o{ AUDIT_LOGS : records

  USERS {
    string id PK
    string email UK
    string hashed_password
    string full_name
    string phone_encrypted
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  BILLS {
    string id PK
    string user_id FK
    string hospital_name
    string city
    integer tier
    string patient_diagnosis
    integer patient_age
    integer days_admitted
    float total_billed
    float total_fair_estimate
    float total_overcharge
    float risk_score
    string risk_level
    string raw_ocr_text
    string status
    datetime created_at
  }

  BILL_ITEMS {
    string id PK
    string bill_id FK
    string raw_text
    string normalized_name
    string category
    integer quantity
    float charged_rate
    float charged_amount
    float mrp
    float cghs_rate
    float nppa_ceiling
    boolean is_flagged
    json risk_flags
    float overcharge_amount
    string legal_citation
    string patient_explanation
    string action_recommended
  }

  AUDIT_LOGS {
    string id PK
    string bill_id FK
    string action_type
    json details
    datetime timestamp
  }
```

### 2.1 Table Definitions

- **`users`**: Manages credentials and contact numbers. Phone numbers are stored encrypted using AES-256-GCM. DPDP Act 2023 anonymization replaces personal identifying information with one-way cryptographic hashes.
- **`bills`**: Root entity for an audit session. Stores gross financial totals, composite risk scores, and patient demographic indicators.
- **`bill_items`**: Atomic line items extracted from the bill. Retains statutory rate comparisons, specific violation flags, and granular overcharge sums.
- **`audit_logs`**: System audit trail capturing status transitions, forensic report generations, and operator actions.

---

## 3. Optical Character Recognition and Ingestion Pipeline

The ingestion pipeline converts untrusted user uploads into validated, normalized line item entities before any audit computation begins.

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Router as bills.py
  participant Extractor as extractor.py
  participant DBRef as reference_data.py
  participant Engine as risk_engine.py

  User->>Router: POST /api/v1/bills/upload (multipart/form-data)
  Router->>Extractor: validate_file_magic_bytes(file_bytes)

  alt Invalid Magic Bytes
    Extractor-->>Router: HTTP 400 (Invalid binary signature)
    Router-->>User: Rejection Response
  else Valid Binary Signature
    Extractor->>Extractor: Extract raw text (PyPDF / Tesseract)
    Extractor->>Extractor: Normalize lines (regex tokenization)
    Extractor-->>Router: List[RawItemDict]
  end

  loop For Each Line Item
    Router->>DBRef: query_cghs_rate(item_name)
    Router->>DBRef: query_nppa_device(item_name)
    Router->>DBRef: query_dpco_drug(item_name)
    Router->>DBRef: is_irdai_non_payable(item_name)
    DBRef-->>Router: Reference Tariffs and Flags
  end

  Router->>Engine: audit_bill(metadata, items)
  Engine-->>Router: AuditedItems, Overcharge, RiskScore
  Router-->>User: Complete Audit Response (JSON)
```

### 3.1 File Validation Controls

Pre-ingestion validation inspects binary magic bytes to prevent polyglot payload execution:

- PDF files: magic bytes `%PDF-` (`0x25 0x50 0x44 0x46 0x2D`)
- PNG files: magic bytes `\x89PNG` (`0x89 0x50 0x4E 0x47`)
- JPEG files: magic bytes `\xFF\xD8\xFF`

Files that do not match their declared content type are rejected before any OCR processing occurs.

---

## 4. Machine Learning Ensemble Architecture

The ML subsystem implements a hybrid stacking strategy, combining gradient-boosted decision trees with a multi-layer perceptron neural network across 7 violation labels simultaneously.

```mermaid
flowchart TD
  RawFeatures[Raw Billed Item Features] --> Scaler[Feature Normalization and Preprocessing]

  subgraph FeatureEngineering [15-Dimensional Feature Matrix]
    Scaler --> F1[rate_vs_cghs_ratio: Continuous]
    Scaler --> F2[rate_vs_mrp_ratio: Continuous]
    Scaler --> F3[qty_zscore: Continuous]
    Scaler --> F4[days_in_hospital: Integer]
    Scaler --> F5[consumable_pct: Percentage]
    Scaler --> F6[is_package_item: Binary]
    Scaler --> F7[has_icd_code: Binary]
    Scaler --> F8[amount_percentile: Continuous]
    Scaler --> F9[description_similarity_max: Continuous]
    Scaler --> F10[6 One-Hot Category Indicators]
  end

  FeatureEngineering --> XGB[XGBoost MultiOutput Classifier: Depth 6, LR 0.08, Subsample 0.85]
  FeatureEngineering --> MLP[Deep Neural Network: Dense 128 to 64 to 32, Adam, L2 Regularization]

  XGB --> P_Tree[P_Tree Vector: 7 Probabilities]
  MLP --> P_NN[P_NN Vector: 7 Probabilities]

  P_Tree --> Blender[Soft Probability Stacking: P = 0.45 * P_NN + 0.55 * P_Tree]
  P_NN --> Blender

  Blender --> MC[Monte Carlo Stochastic Perturbation: K=10 Forward Passes]
  MC --> MeanProb[Mean Probability Vector]
  MC --> StdDev[Epistemic Uncertainty Standard Deviation]

  MeanProb --> DecisionThreshold[Decision Boundary >= 0.50]
  DecisionThreshold --> MultiLabelOutput[Predicted Violation Flags]
```

### 4.1 Feature Definitions

| Index | Feature | Type | Description |
| :--- | :--- | :--- | :--- |
| 1 | `rate_vs_cghs_ratio` | Continuous | Billed rate divided by CGHS statutory benchmark rate |
| 2 | `rate_vs_mrp_ratio` | Continuous | Billed rate divided by DPCO MRP ceiling |
| 3 | `qty_zscore` | Continuous | Z-score of charged quantity vs. clinical norm |
| 4 | `days_in_hospital` | Integer | Total inpatient length of stay |
| 5 | `consumable_pct` | Percentage | Consumable subtotal as a fraction of gross bill |
| 6 | `is_package_item` | Binary | Item is part of a bundled procedure package |
| 7 | `has_icd_code` | Binary | Valid ICD-10 diagnostic code is attached |
| 8 | `amount_percentile` | Continuous | Percentile rank of line amount within the bill |
| 9 | `description_similarity_max` | Continuous | Maximum string similarity to any other line item |
| 10-15 | `cat_*` | Binary (one-hot) | `procedure`, `pharmacy`, `investigation`, `consumable`, `room_nursing`, `tax_gst` |

### 4.2 Mathematical Specification

**Soft voting**:

$$P_j = 0.45 \cdot P_{\text{NN}, j} + 0.55 \cdot P_{\text{XGB}, j} \quad \forall\, j \in \{1 \dots 7\}$$

**Monte Carlo uncertainty**:

$$\mu_j = \frac{1}{K} \sum_{k=1}^{K} P_{j}^{(k)}, \qquad \sigma_j = \sqrt{\frac{1}{K} \sum_{k=1}^{K} \left(P_{j}^{(k)} - \mu_j\right)^2}, \qquad K = 10$$

**Confidence thresholds**:

| Classification | Condition |
| :--- | :--- |
| `HIGH_CONFIDENCE_VIOLATION` | $\mu \ge 0.55$, $\sigma \le 0.04$ |
| `AMBIGUOUS_BORDERLINE_REVIEW` | $\mu \ge 0.40$, $\sigma > 0.06$ |
| `CONFIDENT_COMPLIANT` | $\mu < 0.35$, $\sigma \le 0.04$ |

### 4.3 Modular Production ML Pipelines (`app/ml/pipelines/`)

The platform structures ML and audit processing into 7 modular, decoupled pipelines for sub-100ms mobile client inference:

1. **`DocumentParsingPipeline`**:
   - LayoutLMv3 multimodal token classification on bounding boxes normalized to $[0, 1000]$.
   - Extracts 15 NER billing entities (`HOSPITAL_NAME`, `BILL_DATE`, `ITEM_NAME`, `QTY`, `UNIT_PRICE`, `TOTAL_AMOUNT`, `GST_AMOUNT`, etc.).
2. **`StatutoryRAGPipeline`**:
   - ChromaDB BioBERT semantic vector store (768 dimensions) querying statutory tables: `cghs_collection`, `nppa_collection`, `dpco_collection`.
   - Threshold-gated retrieval (cosine similarity $> 0.72$) for exact schedule matching.
3. **`XGBoostRiskPipeline`**:
   - Multi-label gradient boosted trees on 10 canonical features.
   - SMOTE minority oversampling and calibrated decision thresholds (`optimal_thresholds.json`).
4. **`DeepEnsembleRiskPipeline`**:
   - 3-layer deep MLP combined with XGBoost via soft stacking.
   - 15-pass Monte Carlo Dropout epistemic uncertainty scoring ($\sigma$).
5. **`InsuranceReconciliationPipeline`**:
   - Analyzes TPA claim settlement deductions against IRDAI 2016/2019 Master Circular schedules.
   - Categorizes non-payable items into mandatory exclusions vs recoverable medical charges.
6. **`LegalDisputePipeline`**:
   - Compiles statutory violation findings into legally binding dispute letters citing the Consumer Protection Act 2019, DPCO 2013, and Essential Commodities Act 1955.
7. **`MobileInferencePipeline`**:
   - Unified mobile gateway returning compact, high-speed JSON payloads with UI color badges (`#10B981`, `#F59E0B`, `#EF4444`), risk scores (0–100), and downloadable legal notices.

---

### 4.4 Memory-Efficient Single-Pass Parallel Model Training (`backend/ml_training/train_all_models.py`)

For multi-model training under tight memory limits (< 8GB RAM peak), the parallel trainer executes a single-pass streaming architecture:

- **`StreamingBillLoader`**: Iterates through `merged_dataset.jsonl` in 64-bill chunks with explicit garbage collection and 32-bit CRC hash splitting (70% train, 15% val, 15% test).
- **`FeatureExtractor`**: Pre-loads lightweight SQLite lookup dictionaries (~8MB RAM) and processes each bill once for all 3 models simultaneously.
- **`XGBoostTrainer` (Model A)**: Memory-maps feature arrays to disk (`tmp/X_train.mmap`, `tmp/y_train.mmap`), applies SMOTE per label, and fits multi-label classifiers without RAM exhaustion.
- **`LayoutLMTrainer` (Model B)**: Background worker thread with bounded task queue (`queue.Queue(maxsize=100)`), gradient checkpointing, and early stopping.
- **`ChromaIndexer` (Model C)**: Buffers text in 32-item batches, embeds with BioBERT, and writes directly to persistent ChromaDB vector storage.

---

## 5. Cryptographic Merkle Audit Ledger Specification

The forensic audit ledger guarantees evidence integrity for legal admissibility under Section 65B of the Indian Evidence Act and Bharatiya Sakshya Adhiniyam Section 61.

```mermaid
graph TD
  subgraph Merkle_Tree [Recursive Pairwise SHA-256 Hashing]
    I1[Item 1: DES Stent charged at 65000] --> L1[Leaf Hash 1 = SHA256 of I1]
    I2[Item 2: ICU Stay charged at 18000] --> L2[Leaf Hash 2 = SHA256 of I2]
    I3[Item 3: Gloves charged at 3500] --> L3[Leaf Hash 3 = SHA256 of I3]
    I4[Item 4: Meropenem charged at 4200] --> L4[Leaf Hash 4 = SHA256 of I4]

    L1 --> N12[Pair Hash 1+2 = SHA256 of L1 and L2]
    L2 --> N12
    L3 --> N34[Pair Hash 3+4 = SHA256 of L3 and L4]
    L4 --> N34

    N12 --> Root[Merkle Root = SHA256 of N12 and N34]
    N34 --> Root
  end

  subgraph Ledger_Block [Chained Forensic Block Structure]
    Prev[Previous Block Hash n-1]
    Payload[Payload: Index, Timestamp, BillID, Billed, Overcharge, RiskScore, MerkleRoot, PrevHash]
    BlockHash[Block Hash = SHA256 of Payload]
    HMAC[Digital Signature = HMAC-SHA256 with SecretKey over BlockHash]

    Root --> Payload
    Prev --> Payload
    Payload --> BlockHash
    BlockHash --> HMAC
  end
```

### 5.1 Hash Formulas

**Leaf hash**:

$$\text{Leaf}_i = \text{SHA-256}(\text{RawText} \parallel \text{ChargedRate} \parallel \text{Quantity} \parallel \text{OverchargeAmount})$$

**Block hash**:

$$\text{Block}_n = \text{SHA-256}(n \parallel \text{Timestamp} \parallel \text{BillID} \parallel \text{TotalBilled} \parallel \text{Overcharge} \parallel \text{RiskScore} \parallel \text{MerkleRoot} \parallel \text{PrevHash})$$

**Origin signature**:

$$\text{Signature} = \text{HMAC-SHA256}(k_{\text{secret}},\; \text{Block}_n)$$

### 5.2 Tamper Detection

Modifying any item amount — for example, reducing a glove charge from ₹3,500 to ₹1,500 — alters Leaf Hash 3, which cascades to Pair Hash 3+4, invalidating the Merkle Root. The `verify_integrity()` function will reject the certificate with a hash mismatch error. HMAC verification will also independently fail if the block hash was manually reconstructed.

---

## 6. Asynchronous Background Task State Machine

Large bills with high-resolution scans are handled through FastAPI's `BackgroundTasks` queue to prevent request timeout on the synchronous ingestion path.

```mermaid
stateDiagram-v2
  [*] --> PENDING : POST /api/v1/bills/upload-async
  PENDING --> PROCESSING : Worker picks up task
  PROCESSING --> COMPLETED : OCR and rule audit succeed
  PROCESSING --> FAILED : OCR failure or corrupt PDF

  COMPLETED --> [*] : Polling GET returns full audit data
  FAILED --> [*] : Polling GET returns error description
```

State transitions are persisted to the `bills.status` column in PostgreSQL and the full transition history is appended to `audit_logs`.

---

## 7. Security and Encryption Controls

1. **At-rest field encryption**: Patient phone numbers and sensitive identifiers use AES-256 in Galois/Counter Mode (GCM), providing both confidentiality and integrity authentication.
2. **Access control**: Stateless JSON Web Tokens signed via HMAC-SHA256. Expire after 1,440 minutes (24 hours). No server-side session state is maintained.
3. **Password storage**: bcrypt with cost factor 12. Salted at write time, verified at login. Plaintext is never persisted.
4. **File ingestion defense**: Binary magic bytes validation rejects polyglot payloads before any OCR execution.
5. **Webhook integrity**: Razorpay HMAC-SHA256 signature verification is mandatory before any payment status transition.
6. **DPDP Act 2023, Section 12**: Right to erasure implemented at `POST /api/v1/auth/anonymize-me`. Replaces personal details with `DPDP_Anonymized_Patient_<SHA256_HASH>` pseudonyms.

See [`SECURITY.md`](./SECURITY.md) for the complete threat model and control mapping.
