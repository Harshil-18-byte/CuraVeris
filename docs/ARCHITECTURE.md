---
{
  "id": "file_16xv44iy",
  "filetype": "document",
  "filename": "ARCHITECTURE",
  "created_at": "2026-08-26T06:23:17.188Z",
  "updated_at": "2026-08-26T06:23:22.770Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---

# CuraVeris Technical Architecture Specification

This document details the systems design, data pipelines, database models, machine learning ensemble, and cryptographic protocols of the CuraVeris platform.

---

## 1. System Architecture and Component Hierarchy

CuraVeris is designed as an asynchronous, layered service architecture.

```mermaid
graph TD
    Client[Client Interface / API Consumer] --> Gateway[Reverse Proxy / Uvicorn Server]

    subgraph API_Layer [FastAPI Routing & Middleware]
        Gateway --> AuthMiddleware[JWT Auth & DPDP Compliance Engine]
        Gateway --> BillRouter[Bills & Ingestion Router]
        Gateway --> ReportRouter[Dispute & Detention Notice Router]
        Gateway --> PaymentRouter[Payment Webhook & Reconciliation Router]
        Gateway --> DevRouter[Architecture Inspector & Tooling Router]
    end

    subgraph Service_Engine [Execution & Audit Engines]
        BillRouter --> Extractor[OCR Ingestion & Magic Byte Validator]
        BillRouter --> RiskEngine[Deterministic Statutory Rule Engine]
        BillRouter --> EnsembleEngine[Hybrid ML Ensemble: XGBoost + Deep MLP]
        BillRouter --> Explainer[SHAP Local Feature Explainer]
        BillRouter --> MerkleEngine[Cryptographic Merkle Audit Ledger]
        BillRouter --> ClinicalEngine[ICD-10 & SNOMED Clinical Resolver]
        ReportRouter --> LegalEngine[High Court Anti-Detention Notice Generator]
        PaymentRouter --> PaymentEnricher[Payment Gap & EMI Distress Enricher]
    end

    subgraph Storage_Layer [Persistence & Reference Stores]
        RiskEngine --> SQLiteRef[(Reference Tariffs DB: CGHS / NPPA / DPCO)]
        EnsembleEngine --> ModelWeights[(Serialized Model Weights: .joblib)]
        BillRouter --> PostgresDB[(Relational DB: PostgreSQL / SQLite)]
    end

```

---

## 2. Database Schema and Entity-Relationship Architecture

The relational persistence tier tracks user identity, bill audit lifecycle states, and individual line items with foreign key constraints.

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

- **`users`**: Manages credentials and contact numbers. Contact numbers are stored encrypted using AES-256-GCM. Anonymization under DPDP Act 2023 replaces personal details with pseudonymous hashes.
- **`bills`**: Root entity for an audit session. Stores gross financial totals, composite risk scores, and patient demographic indicators.
- **`bill_items`**: Atomic line items extracted from the bill. Retains comparisons against statutory rate schedules, specific violation flags, and granular overcharge sums.
- **`audit_logs`**: System audit trail capturing changes, status transitions, and forensic report generations.

---

## 3. Optical Character Recognition and Ingestion Pipeline

The ingestion pipeline converts untrusted user uploads into validated, normalized line item entities.

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
        Extractor->>Extractor: Normalize lines (regex regex tokenization)
        Extractor-->>Router: List[RawItemDict]
    end

    loop For Each Line Item
        Router->>DBRef: query_cghs_rate(item_name)
        Router->>DBRef: query_nppa_device(item_name)
        Router->>DBRef: query_dpco_drug(item_name)
        Router->>DBRef: is_irdai_non_payable(item_name)
        DBRef-->>Router: Reference Tariffs & Flags
    end

    Router->>Engine: audit_bill(metadata, items)
    Engine-->>Router: AuditedItems, Overcharge, RiskScore
    Router-->>User: Complete Audit Response (JSON)

```

---

## 4. Machine Learning Ensemble Architecture

The machine learning subsystem implements a hybrid stacking strategy, combining gradient-boosted decision trees with a multi-layer perceptron neural network.

```mermaid
flowchart TD
    RawFeatures[Raw Billed Item Features] --> Scaler[Feature Normalization & Preprocessing]
    
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

    FeatureEngineering --> XGB[XGBoost MultiOutput Classifier<br/>Depth 6, LR 0.08, Subsample 0.85]
    FeatureEngineering --> MLP[Deep Neural Network Classifier<br/>Dense 128 -> 64 -> 32, Adam, L2 Reg]

    XGB --> P_Tree[P_Tree Vector: 7 Probas]
    MLP --> P_NN[P_NN Vector: 7 Probas]

    P_Tree --> Blender[Soft Probability Stacking Formula<br/>P_Final = 0.45 * P_NN + 0.55 * P_Tree]
    P_NN --> Blender

    Blender --> MC[Monte Carlo Stochastic Perturbation<br/>10 Forward Inferences]
    MC --> MeanProb[Mean Probability Vector]
    MC --> StdDev[Epistemic Uncertainty StdDev]

    MeanProb --> DecisionThreshold[Decision Boundary >= 0.50]
    DecisionThreshold --> MultiLabelOutput[Predicted Violation Flags]

```

### 4.1 Feature Definitions

1. **`rate_vs_cghs_ratio`**: Ratio of billed rate to statutory CGHS benchmark rate.
2. **`rate_vs_mrp_ratio`**: Ratio of billed rate to statutory DPCO/MRP ceiling.
3. **`qty_zscore`**: Z-score of charged quantity relative to standard clinical item consumption.
4. **`days_in_hospital`**: Total length of stay in days.
5. **`consumable_pct`**: Ratio of consumable bill total to gross invoice amount.
6. **`is_package_item`**: Binary indicator whether the item is part of a bundled procedure package.
7. **`has_icd_code`**: Binary indicator whether a valid diagnostic code is attached.
8. **`amount_percentile`**: Percentile rank of charged line amount within the bill.
9. **`description_similarity_max`**: Maximum string similarity score to any other item in the bill.
10. **`cat_*`**: One-hot indicators across 6 primary clinical categories (`procedure`, `pharmacy`, `investigation`, `consumable`, `room_nursing`, `tax_gst`).

### 4.2 Mathematical Formulas

#### Soft Voting Equation:

$$P_j = 0.45 \cdot P_{\text{NN}, j} + 0.55 \cdot P_{\text{XGB}, j} \quad \forall j \in \{1 \dots 7\}$$

#### Monte Carlo Epistemic Uncertainty:

$$\mu_j = \frac{1}{K} \sum_{k=1}^{K} P_{j}^{(k)}, \quad \sigma_j = \sqrt{\frac{1}{K} \sum_{k=1}^{K} \left(P_{j}^{(k)} - \mu_j\right)^2}$$
Where $K = 10$ passes with stochastic input perturbation.

---

## 5. Cryptographic Merkle Audit Ledger Specification

The forensic audit ledger guarantees evidence integrity for legal admissibility under Section 65B of the Indian Evidence Act.

```mermaid
graph TD
    subgraph Merkle_Tree_Construction [Recursive Pairwise Merkle Hashing]
        I1["Item 1: DES Stent (₹65,000)"] --> L1["Leaf Hash 1 = SHA256(I1)"]
        I2["Item 2: ICU Stay (₹18,000)"] --> L2["Leaf Hash 2 = SHA256(I2)"]
        I3["Item 3: Gloves (₹3,500)"] --> L3["Leaf Hash 3 = SHA256(I3)"]
        I4["Item 4: Meropenem (₹4,200)"] --> L4["Leaf Hash 4 = SHA256(I4)"]

        L1 --> N12["Pair Hash 1+2 = SHA256(L1 + L2)"]
        L2 --> N12
        L3 --> N34["Pair Hash 3+4 = SHA256(L3 + L4)"]
        L4 --> N34

        N12 --> Root["Merkle Root = SHA256(N12 + N34)"]
        N34 --> Root
    end

    subgraph Ledger_Block_Sealing [Chained Forensic Block Structure]
        Prev["Previous Block Hash (Block n-1)"]
        Payload["Payload: Index | Timestamp | BillID | Billed | Overcharge | RiskScore | MerkleRoot | PrevHash"]
        BlockHash["Block Hash = SHA256(Payload)"]
        HMAC["Digital Signature = HMAC_SHA256(SecretKey, BlockHash)"]

        Root --> Payload
        Prev --> Payload
        Payload --> BlockHash
        BlockHash --> HMAC
    end

```

### 5.1 Algorithmic Guarantees

- **Tamper Evident**: Modifying an item amount from ₹3,500 to ₹1,500 alters Leaf Hash 3, propagating to Pair Hash 3+4, which invalidates the Merkle Root and causes `verify_integrity()` to fail.
- **Authenticity Guaranteed**: Origin signature is computed via HMAC-SHA256 using the platform's root key.

---

## 6. Asynchronous Background Task State Machine

Large bills with high-resolution scans are handled through asynchronous task queues using FastAPI's `BackgroundTasks`.

```mermaid
stateDiagram-v2
    [*] --> PENDING : POST /api/v1/bills/upload-async
    PENDING --> PROCESSING : Worker picks up task
    PROCESSING --> COMPLETED : Ingestion, OCR & Rule audit succeed
    PROCESSING --> FAILED : OCR failure or corrupt PDF

    COMPLETED --> [*] : Polling GET returns full audit data
    FAILED --> [*] : Polling GET returns error description

```

---

## 7. Security and Encryption Controls

1. **At-Rest Field Encryption**: Phone numbers and sensitive patient identifiers use AES-256 in Galois/Counter Mode (GCM), ensuring both confidentiality and integrity authentication.
2. **Access Control**: Stateless JSON Web Tokens (JWT) signed via HMAC-SHA256. Expire after 1,440 minutes (24 hours).
3. **Data Protection (DPDP Act 2023)**:
   - Calling `POST /api/v1/auth/anonymize-me` permanently sanitizes user personal identifying information and swaps primary records with one-way cryptographic hashes.
