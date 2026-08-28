# CuraVeris Current-State Assessment

**Assessed:** 2026-08-28  
**Scope:** Repository architecture, backend services, multi-platform client foundations (Web, Android, iOS), and statutory engines.

| Component | Location | Purpose | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FastAPI Backend & Lifecycle** | `backend/app/main.py` | FastAPI application composition, lifespan context manager, security headers, request correlation IDs, `/health`, `/health/live`, `/health/ready` | FastAPI, SQLAlchemy, SlowAPI | Present & Verified |
| **API Versioning & Schemas** | `backend/app/api/`, `backend/app/models/schemas.py` | Versioned REST routes (`/api/v1`), Pydantic v2 validation, response schemas, and OpenAPI contracts (`/openapi.json`) | Pydantic v2, FastAPI | Present & Verified |
| **Database & Migrations** | `backend/app/db/database.py`, `backend/migrations/` | Async SQLAlchemy 2.0 connection pool, fallback engine, scoped `get_db` dependency, and Alembic versioning | SQLAlchemy, Alembic, asyncpg, aiosqlite | Present & Verified |
| **Authentication & RBAC** | `backend/app/core/security.py`, `backend/app/api/auth.py` | Stateless JWT access/refresh token rotation, bcrypt password hashing, brute-force lockout, Fernet PII encryption, and `require_roles` RBAC | Jose, Passlib, Cryptography | Present & Verified |
| **Deterministic Audit Engine** | `backend/app/engine/risk_engine.py`, `backend/app/db/reference_data.py` | NPPA price ceilings, DPCO drug MRPs, CGHS procedure benchmarks, and IRDAI excluded consumables | SQLite reference data (`medical_rates.db`) | Present & Verified |
| **Hybrid ML Ensemble** | `backend/app/ml/deep_risk_network.py`, `backend/app/ml/weights/` | XGBoost multi-output classifier + PyTorch 3-layer MLP neural network, Monte Carlo uncertainty bounds, and SHAP attribution | Joblib, PyTorch, XGBoost, scikit-learn | Present & Verified |
| **Evidence & Cryptographic Ledger** | `backend/app/core/merkle_audit_ledger.py` | Section 65B tamper-evident certificates, SHA-256 pairwise Merkle root hashing, and HMAC-SHA256 origin signatures | Cryptography, hashlib | Present & Verified |
| **Razorpay Payment Reconciliation** | `backend/app/api/razorpay.py`, `backend/app/services/` | Server-side order creation in paise, webhook HMAC signature verification, co-pay shortfall reconciliation | Razorpay SDK, hashlib, hmac | Present & Verified |
| **Web Client Foundation (Phase 5)** | `clients/web/` | Next.js App Router, TypeScript, TanStack Query v5, API client with `X-Request-ID`, JWT session store, WebSocket client, ErrorBoundary, and responsive glassmorphism UI | Next.js 14, React 18, TanStack Query, TypeScript | Present & Active |
| **Android Client Foundation (Phase 6)** | `clients/android/` | Native Android client with Kotlin, Jetpack Compose, AndroidX `EncryptedSharedPreferences`, OkHttp networking, WebSocket manager, push notifications, and deep linking | Jetpack Compose, OkHttp, Kotlin Coroutines | Present & Active |
| **iOS Client Foundation (Phase 7)** | `clients/ios/` | Native iOS client with Swift, SwiftUI, Keychain Services secure storage, async/await `URLSession` API engine, `NWPathMonitor`, `URLSessionWebSocketTask`, and APNs | SwiftUI, Foundation, Network, Security | Present & Active |
| **Automated Test Suites** | `backend/tests/` | Unit, integration, foundation, financial invariant, security, and end-to-end API test suites | pytest, pytest-asyncio, httpx | Present & Verified |

---

## Architectural Conclusions

- **Multi-Platform Foundations**: Web (Next.js + TanStack Query), Android (Kotlin + Jetpack Compose), and iOS (Swift + SwiftUI) are now cleanly structured in `clients/` and integrated with backend API contracts.
- **Contract Integrity**: All clients communicate with the canonical `/api/v1` specification defined in `backend/app/main.py` and exported dynamically at `/openapi.json`.
- **Statutory Truth**: Medical liability calculations remain strictly deterministic (NPPA, DPCO, CGHS, IRDAI) while ML risk models provide advisory signals and uncertainty bounds.
