# CuraVeris Changelog

All notable changes to this project are documented in this file.

Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`.

- `MAJOR`: Incompatible API or database schema changes.
- `MINOR`: New features added in a backward-compatible manner.
- `PATCH`: Bug fixes, documentation improvements, dependency updates.

## [2.0.0] — 2026-08-31

### Added

- **Multi-Platform Next.js 14 Web Application**: Production-ready App Router web portal with authenticated dashboard, bill upload & OCR itemization, line-by-line statutory comparison, and instant legal dispute petition downloads.
- **Comprehensive ML & DL Architecture Documentation (`MODELS.md`)**: Full architectural reference covering LayoutLMv3 Base, SentenceTransformers semantic retrieval, 32-dim multi-label XGBoost, PyTorch Deep MLP with 10-pass Monte Carlo epistemic uncertainty estimation, and INT8 ONNX mobile quantization benchmarks.
- **Vercel Deployment & 404 Resolution Infrastructure**: Root and subproject `vercel.json` configurations, Next.js API proxy rewrites (`/api/v1/:path*`), and custom `not-found.tsx` error recovery page.
- **Clean Documentation Standard**: Standardized documentation across all project `.md` files with zero metadata frontmatter clutter.
- **Hardened Cloudflare R2 / AWS S3 Async Storage Adapter (`app/core/storage.py`)**: Graceful dynamic exception handling for `botocore.exceptions.ClientError`.

---

## [1.6.0] — 2026-08-30

### Added

- **Render Cloud Deployment**: Production web service setup for `curaveris.onrender.com` with automated zero-downtime health check probes (`/api/v1/health`).
- **Neon Serverless PostgreSQL Database**: Integrated connection pooling (`postgresql+asyncpg://`) and dynamic PR Database Branching workflow (`.github/workflows/neon_workflow.yml`).
- **Upstash Redis Broker & Celery Workers**: Distributed asynchronous document OCR, risk engine evaluation, and audit report generation.
- **Resend Email Integration**: Automated transactional email pipeline for statutory medical dispute notices and Section 65B audit reports.
- **6-Model Unified Production Training Pipeline (`run_real_production_training.py`)**: Trained XGBoost, Deep MLP, ChromaDB BioBERT vector store, and probability calibration gates over 3,293 master bills.

---

## [1.5.0] — 2026-08-26

### Added

- **CuraVeris-4B & CuraVeris-1B Custom Transformer Models (`ml_training/models/curaveris_4b.py`, `curaveris_1b.py`)**: Custom 4.07B and 1.05B dense decoder Transformers written and trained from scratch with RoPE ($\theta=10000.0$), SwiGLU feed-forward networks, and Grouped Query Attention (GQA).
- **Multi-Task Scratch Training Pipelines (`ml_training/training/train_4b_from_scratch.py`, `train_1b_from_scratch.py`)**: Joint training objective combining Causal LM cross-entropy, 7-class Multi-Label Focal Loss ($\gamma=2.0, \alpha=0.25$), and continuous restitution Huber regression.
- **Dynamic INT8 & ONNX Runtime Mobile Exporters (`ml_training/models/export_4b_quantized.py`, `export_1b_quantized.py`)**: Post-training quantization for low-latency mobile and server inference.
- **Two-Track Hybrid Pipeline (`ml_training/inference/audit_pipeline.py`)**: Track A (Specialized 4B transformer reasoning) + Track B (Zero-hallucination deterministic symbolic rule engine, BM25 + Bi-Encoder retrieval, and temporal cross-encoder reranker).
- **Enterprise Security Hardening Engine (`app/core/security_hardening.py`)**: Magic bytes header inspection (`%PDF`, `\x89PNG`, `\xff\xd8\xff`, `RIFF`), payload size limit enforcement ($\le 25\text{MB}$), path traversal sanitization, and deterministic SHA-256 tamper-evident integrity hashing.
- **Developer Observability & Model Registry APIs (`app/api/dev.py`)**: Real-time endpoints for `/api/v1/dev/curaveris-4b`, `/api/v1/dev/curaveris-1b`, and `/api/v1/dev/security-status`.
- **Master Test Suite Expansion**: Added `tests/test_curaveris_1b_model.py`, `tests/test_curaveris_4b_model.py`, and `tests/test_security_and_4b_telemetry.py` expanding test coverage to **62/62 tests (100% passing)**.

---

## [1.4.0] — 2026-08-26

### Added

- **Temporal Gazette & Statutory Registry Store (**`app/db/temporal_gazette_store.py`**)**: Time-versioned NPPA device caps, DPCO essential drug ceilings, and CGHS benchmarks with `effective_from`, `effective_to`, and gazette `S.O.` numbers to evaluate compliance strictly on the date of medical service.
- **Layer 2 Clinical Pathway Scenario Generator (**`ml_training/generators/clinical_scenario_generator.py`**)**: Clinically realistic inpatient bill simulation across 4 clinical pathways (STEMI / Primary PCI, Total Knee Arthroplasty, Laparoscopic Cholecystectomy, Triple Vessel CABG) with authentic ALOS, diagnostics, pharmacy, and implants.
- **Layer 3 Controlled Counterfactual Perturbation Generator (**`ml_training/generators/counterfactual_generator.py`**)**: Single-variable perturbation engine generating price surge, duplicate line, consumable unbundling, unlawful GST surcharge, and OCR character corruption variants with ground-truth delta labels.
- **Layer 4 Hard Negative Generator (**`ml_training/generators/hard_negative_generator.py`**)**: Generates complex, high-magnitude, 100% compliant hospital bills (multi-vessel twin stents, prolonged ICU ventilation, revision arthroplasty, oncology biologics) to eliminate the "unusual = fraud" shortcut.
- **Decoupled Multi-Task Dataset Partitioning Engine (**`ml_training/generators/dataset_partitioner.py`**)**: Exports scaled master corpus into 6 specialized task datasets (Task A: LayoutLMv3 spatial parsing, Task B: Clinical normalizer, Task C: Statutory RAG retrieval, Task D: Tabular anomaly classifier, Task E: Deterministic math audit, Task F: Legal advocacy SFT chat format).
- **Master Test Suite Expansion**: Added `tests/test_scaled_generators.py` expanding test coverage to **46/46 tests (100% passing)**.

---

## \[1.3.0\] — 2026-08-26

### Added

- **Modular ML Pipelines Package (**`app/ml/pipelines/`**)**: Introduced 7 decoupled, production-grade pipelines:
  - `DocumentParsingPipeline`: Multimodal LayoutLMv3 tokenization with normalized BBoxes and 15 billing entity classes.
  - `StatutoryRAGPipeline`: ChromaDB BioBERT semantic RAG retrieval across CGHS, NPPA, and DPCO statutory databases.
  - `XGBoostRiskPipeline`: Multi-label XGBoost classifier with SMOTE balancing and optimal threshold tuning.
  - `DeepEnsembleRiskPipeline`: Deep MLP (128-64-32) + XGBoost stacking with 15-pass Monte Carlo Dropout epistemic uncertainty ($\sigma$).
  - `InsuranceReconciliationPipeline`: IRDAI non-payable items audit and TPA settlement deduction recovery analysis.
  - `LegalDisputePipeline`: Automated dispute notice drafting under Consumer Protection Act 2019 and Essential Commodities Act 1955.
  - `MobileInferencePipeline`: Sub-100ms mobile gateway returning structured UI cards with color badges (`#10B981`, `#F59E0B`, `#EF4444`).
- **Memory-Efficient Parallel Multi-Model Trainer (**`backend/ml_training/train_all_models.py`**)**:
  - Single disk-read streaming architecture (&lt; 8GB RAM peak) with `StreamingBillLoader` (64-bill chunks).
  - In-memory shared SQLite reference dictionary cache (\~8MB).
  - Disk-backed `np.memmap` feature buffer accumulation.
  - Concurrent GPU worker thread for `LayoutLMTrainer` with gradient checkpointing.
  - Streaming batch indexer for persistent ChromaDB BioBERT vector store.
- **Real Hospital Bill Ground Truth Dataset**: Added 90 real annotated inpatient hospital bills from Indian healthcare facilities in `backend/ml_training/data/tier1_real_bills/`.
- **Merged Master Training Dataset**: 590 merged bills (5,192 line items) with stratified 70/15/15 train/val/test splits.
- **Comprehensive Mobile Pipeline Test Suite**: Added `backend/tests/test_mobile_pipeline.py` (total test suite expanded to 41/41 passing tests).

---

## \[1.2.0\] — 2026-08-26

### Added

- **Deep Neural Network Ensemble**: Implemented `DeepRiskNeuralNetwork` in `backend/app/ml/deep_risk_network.py`. Three-layer MLP (Dense 128 → 64 → 32) with Adam optimizer, L2 regularization, and early stopping on a 15% validation split.
- **Hybrid Stacking**: `HybridRiskEnsemble` combines XGBoost and MLP predictions via soft probability blending: $P = 0.45 \cdot P_{\text{NN}} + 0.55 \cdot P_{\text{XGB}}$.
- **Monte Carlo Uncertainty**: $K = 10$ stochastic forward passes compute epistemic standard deviation across all 7 violation labels per inference.
- **Deterministic Seed Logging**: Training seeds are generated via `secrets.randbelow(1_000_000)` and persisted to `training_history.json` for full reproducibility.
- **Cryptographic Merkle Audit Ledger**: Implemented recursive SHA-256 pairwise tree hashing and HMAC-SHA256 digital signatures in `backend/app/core/merkle_audit_ledger.py` for Section 65B admissibility.
- **Clinical Resolver**: ICD-10 and SNOMED-CT resolution engine with ALOS bed-blocking detection in `backend/app/engine/icd10_coding_engine.py`.
- **Pyrightconfig**: Added `pyrightconfig.json` pointing to `backend/venv` to resolve IDE import errors across all backend modules.
- **Markdownlint config**: Added `.markdownlint.json` with project-specific rule overrides.

### Changed

- **Database engine**: Migrated from SQLite to PostgreSQL (asyncpg + SQLAlchemy async) across all production data persistence. SQLite retained only for the read-only statutory reference store.
- **Comprehensive** `.gitignore`: Expanded to cover Python bytecode, virtual environments, ML weights, databases, IDE files, OS artifacts, Node modules, Docker overrides, and secrets.

### Documentation

- Added `README.md` with full system overview, mermaid architecture diagrams, math formulas, statutory reference table, and comparative positioning.
- Added `docs/ARCHITECTURE.md` with system hierarchy, database ERD, ingestion sequence diagram, ML pipeline flowchart, Merkle ledger spec, and async state machine.
- Added `docs/API_REFERENCE.md` with complete endpoint reference.
- Added `docs/STATUTORY_FRAMEWORK.md` with gazette citations, case law, and BNS references.
- Added `docs/DATA_MODEL.md` with entity definitions, field encryption model, and DPDP anonymization behavior.
- Added `docs/SECURITY.md` with threat model, control mapping, and compliance posture.
- Added `backend/docs/ML_AND_BACKEND_HANDBOOK.md` with ML training guide and backend handbook.

---

## \[1.1.0\] — 2026-08-26

### Added

- **SHAP Waterfall Explainability**: `GET /api/v1/bills/{bill_id}/explainability` returns additive SHAP feature contributions decomposing the composite risk score.
- **Async Bill Ingestion**: `POST /api/v1/bills/upload-async` with FastAPI `BackgroundTasks`. Job state tracked via `bills.status` column with polling endpoint.
- **Financial Toxicity Module**: FRM income shock index and Debt Service-to-Income (DSTI) ratio calculation at `POST /api/v1/bills/financial-toxicity`.
- **Inpatient Burn Rate Monitor**: Daily expenditure tracking against clinical ALOS benchmarks at `POST /api/v1/bills/interim-admission-check`.
- **GST Shadow Bill Detector**: Duplicate invoice and unlawful GST surcharge detection at `POST /api/v1/bills/gst-shadow-check`.
- **PM-JAY Zero Cash Audit**: Automatic 5x penalty calculation and SAFU referral generation at `POST /api/v1/bills/pmjay-audit`.
- **Emergency Anti-Detention Notice**: `POST /api/v1/reports/emergency-detention-notice` citing Bombay HC CrWP 2502/2000 and BNS Section 127.
- **DPDP Anonymization**: `POST /api/v1/auth/anonymize-me` implementing right to erasure under DPDP Act 2023 Section 12.
- **ABHA Integration Scaffold**: `backend/app/api/abha.py` — initial Health ID verification and patient linking routes.
- **Razorpay Integration**: `backend/app/api/razorpay.py` — webhook HMAC-SHA256 verification and order creation.
- **Semantic Search**: In-memory BM25 and TF-IDF procedure similarity engine in `backend/app/engine/semantic_search.py`.
- **ICD-10 Coding Engine**: Automated ICD-10-CM and SNOMED-CT clinical diagnosis resolution in `backend/app/engine/icd10_coding_engine.py`.

### Changed

- Rate limiting enabled on all API routes via `slowapi` (10 requests per minute per IP on ingestion endpoints).
- Audit logging expanded to capture report generation events in addition to upload events.

---

## \[1.0.0\] — 2026-08-26

Initial release.

### Added

- **FastAPI application**: Entrypoint at `backend/app/main.py` with CORS middleware and JWT authentication middleware.
- **User registration and login**: `POST /api/v1/auth/register` and `POST /api/v1/auth/login`.
- **Synchronous bill upload and audit**: `POST /api/v1/bills/upload` — full OCR ingestion, statutory rule engine, and ML inference in a single request.
- **Bill retrieval**: `GET /api/v1/bills/{bill_id}` returning complete audit breakdown.
- **Heatmap**: `GET /api/v1/bills/{bill_id}/heatmap` — 2D forensic risk matrix across 5 statutory violation axes.
- **XGBoost classifier**: Multi-output gradient-boosted tree trained on 15 features across 7 violation labels.
- **Statutory rule engine**: Deterministic checks against CGHS, NPPA, DPCO, and IRDAI reference data in `backend/app/engine/risk_engine.py`.
- **OCR pipeline**: PyPDF and Tesseract text extraction with magic bytes validation in `backend/app/engine/extractor.py`.
- **Reference data store**: CGHS 2024 (1,900+ procedures), NPPA implant caps, DPCO scheduled drugs, IRDAI 199-item non-payable list.
- **Dispute letter generator**: `POST /api/v1/reports/dispute-letter` with statutory citations.
- **Architecture inspector**: `GET /api/v1/dev/node-details` for developer tooling.
- **34 automated tests**: Covering security, reference data queries, ML inference, Merkle ledger, and API routes.
- **PostgreSQL ORM**: SQLAlchemy async models for `users`, `bills`, `bill_items`, and `audit_logs`.
- **AES-256-GCM field encryption**: Patient phone numbers encrypted at rest.
- **bcrypt password hashing**: Cost factor 12.
- **HMAC-SHA256 JWT**: 24-hour stateless bearer tokens.

---

## Version History Summary

| Version | Date | Summary |
| :--- | :--- | :--- |
| 1.2.0 | 2026-08-26 | Deep neural network ensemble, Merkle ledger, PostgreSQL migration |
| 1.1.0 | 2026-08-26 | Async ingestion, SHAP explainability, legal document generation, PM-JAY audit |
| 1.0.0 | 2026-08-26 | Initial release: FastAPI backend, XGBoost classifier, statutory rule engine |
