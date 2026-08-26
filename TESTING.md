---
{
  "id": "file_z8icctra",
  "filetype": "document",
  "filename": "TESTING",
  "created_at": "2026-08-26T07:22:31.219Z",
  "updated_at": "2026-08-26T07:22:35.611Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
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

```
backend/
  tests/
    conftest.py                       <- Shared fixtures (test client, DB, auth tokens)
    test_api.py                       <- Auth and bill CRUD integration tests
    test_risk_engine.py               <- Deterministic statutory rule engine unit tests
    test_reference_data.py            <- CGHS/NPPA/DPCO rate lookup tests
    test_enhancements.py              <- ABHA/FHIR, Razorpay, WhatsApp, financial toxicity tests
    test_advanced_features.py         <- ICD-10 coding, SHAP explainability, implant registry tests
    test_advanced_hardening.py        <- Security: rate limiting, JWT validation, brute-force lockout
    test_security.py                  <- PII encryption/decryption, Merkle audit ledger tests
    test_deep_learning_and_ledger.py  <- Deep MLP, hybrid ensemble, and Merkle chain tests
```

---

## Running Tests

### Full suite

```bash
cd backend
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS / Linux

pytest --tb=short -q
```

Expected: **34+ tests, 0 failures**.

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

### `test_deep_learning_and_ledger.py` — ML and Cryptographic Tests

- Deep MLP model training convergence
- Hybrid stacking ensemble prediction output
- Monte Carlo dropout uncertainty estimation
- Merkle audit ledger append and verification
- Chain tamper detection and evidence of tampering

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

| Fixture | Scope | Purpose |
|---|---|---|
| `client` | function | FastAPI `TestClient` with SQLite in-memory DB |
| `auth_headers` | function | Pre-authenticated JWT `Authorization: Bearer ...` headers |
| `test_bill_id` | function | Creates a seeded test bill and returns its UUID |

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

| Area | Minimum Coverage |
|---|---|
| `app/engine/risk_engine.py` | 85% |
| `app/core/security.py` | 90% |
| `app/api/*.py` (all routers) | 80% |
| `app/engine/extractor.py` | 75% |
| `app/ml/*.py` | 70% |

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