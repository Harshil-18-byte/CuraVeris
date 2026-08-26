# CuraVeris Changelog

All notable changes to this project are documented in this file.

Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`.

- `MAJOR`: Incompatible API or database schema changes.
- `MINOR`: New features added in a backward-compatible manner.
- `PATCH`: Bug fixes, documentation improvements, dependency updates.

---

## [1.2.0] — 2026-08-26

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
- **Comprehensive `.gitignore`**: Expanded to cover Python bytecode, virtual environments, ML weights, databases, IDE files, OS artifacts, Node modules, Docker overrides, and secrets.

### Documentation

- Added `README.md` with full system overview, mermaid architecture diagrams, math formulas, statutory reference table, and comparative positioning.
- Added `docs/ARCHITECTURE.md` with system hierarchy, database ERD, ingestion sequence diagram, ML pipeline flowchart, Merkle ledger spec, and async state machine.
- Added `docs/API_REFERENCE.md` with complete endpoint reference.
- Added `docs/STATUTORY_FRAMEWORK.md` with gazette citations, case law, and BNS references.
- Added `docs/DATA_MODEL.md` with entity definitions, field encryption model, and DPDP anonymization behavior.
- Added `docs/SECURITY.md` with threat model, control mapping, and compliance posture.
- Added `backend/docs/ML_AND_BACKEND_HANDBOOK.md` with ML training guide and backend handbook.

---

## [1.1.0] — 2026-08-26

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

## [1.0.0] — 2026-08-26

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
