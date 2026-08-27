---
{
  "id": "file_dp6zl5a4",
  "filetype": "document",
  "filename": "CONTRIBUTING",
  "created_at": "2026-08-27T08:15:44.318Z",
  "updated_at": "2026-08-27T08:15:44.318Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# Contributing to CuraVeris

Thank you for your interest in contributing to CuraVeris — India's open-source hospital bill audit and patient protection platform. This document explains how to contribute code, documentation, statutory data, and bug reports.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Adding Statutory Reference Data](#adding-statutory-reference-data)
- [ML Model Contributions](#ml-model-contributions)
- [Security Disclosures](#security-disclosures)

---

## Code of Conduct

CuraVeris serves patients navigating some of the most stressful moments of their lives. All contributors are expected to engage with integrity, empathy, and a commitment to accuracy. Submissions that introduce deliberate misinformation about statutory rates, legal citations, or patient rights will be rejected and reported.

---

## How to Contribute

| Area | Examples |
|---|---|
| **Statutory Rate Data** | CGHS 2023 rate revisions, NPPA device ceiling updates, DPCO drug price additions |
| **Backend Engine** | New flag detectors, improved fuzzy matching, async performance improvements |
| **ML / AI** | Feature engineering, alternative ensemble architectures, SHAP explainability |
| **Security** | Audit of cryptographic controls, DPDP compliance review, penetration findings |
| **Documentation** | API examples, ABDM FHIR guide, deployment runbooks |
| **Tests** | New edge-case scenarios, load tests, regulatory boundary tests |

---

## Development Setup

### Prerequisites

- Python 3.11+
- `git` & `git-lfs`
- `uv` or `pip`
- PostgreSQL 15+ (or SQLite for local dev)

### Quick Start

```bash
# 1. Initialize Git LFS, fork and clone
git lfs install
git clone https://github.com/your-username/CuraVeris.git
cd CuraVeris
git lfs pull
cd backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure secrets
cp .env.example .env
# Edit .env and set SECRET_KEY, ENCRYPTION_KEY to non-default values

# 5. Seed DB and train ML model
python -c "import asyncio; from app.db.database import init_db; from app.db.reference_data import init_reference_db; asyncio.run(init_db()); init_reference_db()"
python -c "from app.ml.train_risk_model import train_and_evaluate; train_and_evaluate()"

# 6. Run the test suite
.\venv\Scripts\pytest           # Windows
# ./venv/bin/pytest              # macOS / Linux

# 7. Start the dev server
python run.py
```

The API is available at `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, release-ready code only |
| `develop` | Active integration branch — target all PRs here |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `data/<name>` | Statutory reference data updates |
| `docs/<name>` | Documentation-only changes |

> **Never push directly to `main`.** All changes require a PR and at least one approving review.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): short imperative summary

Optional body with detail, motivation, trade-offs.

Optional footer: BREAKING CHANGE or issue references.
```

### Types

| Type | When to use |
|---|---|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `data` | Statutory reference data addition or correction |
| `refactor` | Internal restructuring without behavior change |
| `test` | Adding or correcting tests |
| `docs` | Documentation only |
| `sec` | Security improvement or hardening |
| `perf` | Performance improvement |
| `chore` | Tooling, CI, dependency updates |

### Examples

```
feat(risk-engine): add IRDAI non-payable consumable detection for 2024 circular
fix(auth): clear brute-force counter on password reset confirmation
data(cghs): update CGHS 2023 Package Rates for cardiac surgery procedures
sec(pii): enforce strict Fernet key validation at startup
```

---

## Pull Request Process

1. **Open an issue first** for non-trivial changes.
2. **Write or update tests** — PRs that reduce test coverage will not be merged.
3. **Run the full test suite** and ensure all tests pass: `pytest --tb=short`
4. **Lint check**: `flake8 app/ --max-line-length=120`
5. **Fill the PR description** with motivation, regulatory basis for rate changes, and test evidence.
6. **Link the issue** with `Closes #<number>`.
7. Maintainers aim to review within **5 business days**.

### PR Checklist

- [ ] All tests pass
- [ ] No hardcoded secrets or API keys committed
- [ ] New `.env` variables added to `backend/.env.example` and `/.env.example`
- [ ] Relevant docs updated
- [ ] `CHANGELOG.md` entry added under `[Unreleased]`

---

## Adding Statutory Reference Data

The most impactful contribution is keeping CGHS, NPPA, and DPCO rates current.

**Data location:**

```
backend/
  reference_data/medical_rates.db   <- SQLite; seeded by init_reference_db()
  app/db/reference_data.py          <- Seeding logic and query helpers
```

**Contribution format:**

1. **Source citation** — official Gazette notification number, NPPA order date, or CGHS circular reference.
2. **Data additions** in `reference_data.py` inside the appropriate seeder function.
3. **A test** in `tests/test_reference_data.py` validating the new rate is queried correctly.

> Every submitted rate must include a verifiable official government source. Unverified crowdsourced rates will not be merged.

---

## ML Model Contributions

```text
app/ml/
  pipelines/            <- 7 modular inference pipelines (Document, RAG, XGBoost, Deep, Insurance, Legal, Mobile)
  risk_classifier.py    <- Multi-label XGBoost classifier
  deep_risk_network.py  <- Deep MLP neural network (128-64-32)
  train_risk_model.py   <- Reference baseline trainer
  weights/              <- Saved weight artifacts (gitignored)
ml_training/
  train_all_models.py   <- Single-pass parallel multi-model trainer (< 8GB RAM)
```

When contributing ML changes:

1. Run `python ml_training/train_all_models.py` or `pytest tests/test_mobile_pipeline.py -v`.
2. Ensure Macro F1 >= 0.70 and Recall for statutory ceiling violations >= 0.78 on the held-out test split.
3. Do **not** commit large binary `.pkl` or `.joblib` model weight files — they are generated dynamically during training.
4. Keep inference latency for `MobileInferencePipeline` strictly under 100ms.
5. SHAP explainability must remain functional after any architecture change.

---

## Security Disclosures

**Do not file public GitHub issues for security vulnerabilities.**

For confidential disclosure — including cryptographic weaknesses, authentication bypasses, PII exposure risks, or DPDP compliance gaps — email:

```
security@curaveris.ai
```

Include: affected component, reproduction steps, impact assessment, and suggested remediation.

We acknowledge disclosures within **48 hours** and provide a fix timeline within **7 business days** for critical issues.
