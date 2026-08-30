# CuraVeris Testing Guide

This document describes the test architecture, how to run the test suite, how to write new tests, and the test coverage requirements for the CuraVeris platform.

---

## Table of Contents

- [Test Architecture](#test-architecture)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Writing New Tests](#writing-new-tests)
- [Fixtures and Conftest](#fixtures-and-conftest)
- [Coverage Requirements](#coverage-requirements)
- [CI Integration](#ci-integration)

---

## Test Architecture

All tests live under `backend/tests/`. The suite uses **pytest** with an in-memory **SQLite** database via `aiosqlite` so no PostgreSQL instance is required for local testing.

```text
backend/
  tests/
    conftest.py                           <- Shared fixtures (test client, DB, auth tokens)
    test_api.py                           <- Auth and bill CRUD integration tests
    test_risk_engine.py                   <- Deterministic statutory rule engine unit tests
    test_reference_data.py                <- CGHS/NPPA/DPCO rate lookup tests
    test_enhancements.py                  <- ABHA/FHIR, Razorpay, WhatsApp, financial toxicity tests
    test_advanced_features.py             <- ICD-10 coding, SHAP explainability, implant registry tests
    test_advanced_hardening.py            <- Security: rate limiting, JWT validation, brute-force lockout
    test_security.py                      <- PII encryption/decryption, Merkle audit ledger tests
    test_deep_learning_and_ledger.py      <- Deep MLP, hybrid ensemble, and Merkle chain tests
    test_mobile_pipeline.py               <- Modular ML pipelines (7 pipelines) & mobile latency tests
    test_multi_task_architecture.py       <- Spatial attention heatmaps, SHAP waterfall, challenge suite
    test_curaveris_1b_model.py            <- CuraVeris-1B parameter scaling, RoPE, GQA, multi-task loss
    test_curaveris_4b_model.py            <- CuraVeris-4B parameter scaling, 36 layers, Huber restitution
    test_security_and_4b_telemetry.py     <- Magic bytes validation, path traversal, 4B/1B observability
    test_curation_leak_prevention.py      <- Scans public DB reads to ensure internal curation fields are never leaked
    test_taxonomy_compliance.py           <- Compares ML outputs against approved regulatory taxonomy schedules
```

### Web Client & E2E Testing:
```text
clients/web/
  e2e/
    empty_results.spec.ts                 <- Playwright E2E tests for empty-result scenarios & telemetry assertions
```


---

## Running Tests

### Financial truth and evidence contracts

```bash
cd backend
pytest tests/test_financial_truth.py tests/test_evidence_engine.py -q
```

These tests cover decimal-safe liability calculation, unexplained variance, payment/refund handling, input invariants, and source-backed evidence validation.

### Engineering foundation

```bash
cd backend
pytest tests/test_foundation.py -q
ruff check app tests
ruff format --check app tests
```

The foundation tests verify request correlation propagation and safe, structured validation errors. Client-runtime validation is performed with `npm ci && npm run lint && npm run format:check && npm run build` in `clients/web`. Android and iOS builds require their native toolchains.

### Authentication and device identity

```bash
cd backend
pytest tests/test_auth_devices.py tests/test_multi_tenancy_and_rbac.py -q
```

These tests cover public-role escalation rejection, authenticated device registration/revocation, and the explicit unavailable state for unconfigured phone verification.

### Full suite

```bash
cd backend
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS / Linux

pytest --tb=short -q
```

Expected: **62+ tests, 0 failures (100% pass rate)**.

### Single file

```bash
pytest tests/test_risk_engine.py -v
```

### Single test

```bash
pytest tests/test_risk_engine.py::test_statutory_rate_flag_detection -v
```

### With coverage report

```bash
pip install pytest-cov
pytest --cov=app --cov-report=term-missing --cov-report=html:htmlcov
```

Open `htmlcov/index.html` to browse line-level coverage.

### Real PostgreSQL / Neon Integration Testing

To execute tests against a live PostgreSQL database (such as your Neon dev branch):

```bash
cd backend
# Set DATABASE_URL in environment or backend/.env
$env:DATABASE_URL="postgresql+asyncpg://neondb_owner:***@ep-***-pooler.c-4.us-east-2.aws.neon.tech/neondb?ssl=require"
pytest tests/ -v -m "not slow"
```

### Celery Async Worker & Queue Testing

```bash
cd backend
pytest tests/test_enhancements.py -k "worker or celery or async" -v
```

### Parallel execution (faster)

```bash
pip install pytest-xdist
pytest -n 4 --tb=short
```

---

## Test Suites

### `test_api.py` — Integration Tests

End-to-end tests against the FastAPI TestClient. Covers:

- `POST /api/v1/auth/register` — new user creation
- `POST /api/v1/auth/login` — JWT access + refresh token issuance
- `POST /api/v1/bills/upload-text` — bill ingestion and audit
- `GET /api/v1/bills/{id}` — bill retrieval with auth

### `test_risk_engine.py` — Statutory Rule Engine

Unit tests for the deterministic audit pipeline:

- CGHS rate flag detection (procedure overcharge &gt;20%)
- DPCO drug price ceiling violations
- NPPA device ceiling violations (stents, knee implants)
- IRDAI non-payable consumable detection
- Duplicate charge detection within 24h
- GST on healthcare services (exempt under Notification 12/2017)
- Composite risk score calculation and risk level assignment

### `test_reference_data.py` — Statutory Rate Lookups

- CGHS procedure rate queries by procedure name
- NPPA device price ceiling queries
- DPCO drug ceiling queries
- IRDAI non-payable list membership checks
- Database seeding idempotency

### `test_enhancements.py` — Extended Feature Tests

- ABHA 14-digit number validation (Luhn check)
- ABDM OTP issuance and verification flow
- HL7 FHIR R4 Bundle generation and structure validation
- Razorpay webhook HMAC-SHA256 signature verification
- WhatsApp webhook challenge verification
- Financial toxicity score calculation
- Async background bill processing worker

### `test_advanced_features.py` — Advanced Engine Tests

- ICD-10 medical coding engine — code lookup, description match
- SHAP local feature explainability output validation
- Implant registry price lookup (stents, valves, mesh)
- Semantic search vector index (bill item similarity matching)
- Shadow bill duplicate detection engine
- Admission monitoring and pre-auth checklist generation

### `test_advanced_hardening.py` — Security Hardening Tests

- Rate limiter enforcement (5/minute on login and register)
- JWT access token validation and expiry
- Refresh token type enforcement (must use `type: refresh`)
- Brute-force lockout after 5 failed login attempts
- DPDP-compliant account erasure endpoint
- Merkle audit ledger chain integrity

### `test_security.py` — Cryptographic Controls

- Fernet PII field encryption and decryption round-trip
- Invalid ciphertext decryption returns `None` (no crash)
- Merkle hash chain tamper detection

### `test_scaled_generators.py` — Scaled Generators & Decoupled Task Datasets

- Temporal Gazette rate queries with historical date filters (`app/db/temporal_gazette_store.py`)
- Clinical Pathway scenario generation across STEMI, TKR, Lap Chole, and CABG (`ClinicalScenarioGenerator`)
- Controlled single-variable counterfactual perturbations with delta ground-truth labels (`CounterfactualGenerator`)
- Hard negative generation for complex, 100% compliant ICU and twin-stent cases (`HardNegativeGenerator`)
- Decoupled multi-task dataset partitioning into Tasks A through F (`MultiTaskDatasetPartitioner`)

---

## Writing New Tests

### Template for a new unit test

```python
import pytest

def test_my_new_feature():
    """One-line docstring describing the expected behavior."""
    # Arrange
    input_data = {...}

    # Act
    result = my_function(input_data)

    # Assert
    assert result["expected_key"] == expected_value
```

### Template for a new API integration test

```python
def test_my_endpoint(client, auth_headers):
    """Test that endpoint returns correct HTTP status and payload."""
    response = client.post(
        "/api/v1/my/endpoint",
        json={"field": "value"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "expected_key" in data
```

### Rules for new tests

1. **One assertion group per test** — split into separate tests if testing different behaviors.
2. **Use fixtures** from `conftest.py` — never create your own DB session or TestClient.
3. **No real API calls** — mock or stub external services (Razorpay, ABDM, LLMs).
4. **Statutory tests must cite the regulation** in the docstring.
5. **Deterministic** — tests must not rely on random state or real clocks (freeze time if needed).

---

## Fixtures and Conftest

`conftest.py` provides:

| Fixture        | Scope    | Purpose                                                   |
| -------------- | -------- | --------------------------------------------------------- |
| `client`       | function | FastAPI `TestClient` with SQLite in-memory DB             |
| `auth_headers` | function | Pre-authenticated JWT `Authorization: Bearer ...` headers |
| `test_bill_id` | function | Creates a seeded test bill and returns its UUID           |

### Adding a new fixture

```python
# backend/tests/conftest.py
@pytest.fixture
def my_fixture():
    """Short description of what this fixture provides."""
    yield my_object
    # Optional teardown after yield
```

---

## Coverage Requirements

| Area                           | Minimum Coverage |
| ------------------------------ | ---------------- |
| `app/engine/risk_engine.py`    | 85%              |
| `app/core/security.py`         | 90%              |
| `app/api/*.py` (all routers)   | 80%              |
| `app/engine/extractor.py`      | 75%              |
| `app/ml/*.py`                  | 70%              |
| `app/ml/pipelines/*.py`        | 85%              |

PRs that drop any area below the minimum threshold will not be merged.

---

## CI Integration

The test suite runs automatically on every push and PR via GitHub Actions.

### `.github/workflows/test.yml` (template)

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-22.04

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        env:
          ENV: testing
          SECRET_KEY: ci-test-secret-key-not-for-production-use-only
          ENCRYPTION_KEY: Y3VyYXZlcmlzLWRldi1vbmx5LWtleS0zMmJ5dGVzLXBhZA==
        run: |
          cd backend
          pytest --tb=short -q
```
