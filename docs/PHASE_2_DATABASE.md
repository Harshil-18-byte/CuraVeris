# Phase 2 — Database and data model

## Existing schema preserved

Existing SQLAlchemy tables already cover organizations/users, refresh-token sessions, patient/provider relationships, invoices/line items, claims, payments/refunds, reconciliation, findings, and cryptographic audit artifacts. These are retained unchanged.

## Additions

| Table | Purpose | Why now |
|---|---|---|
| `documents` | Metadata and ownership for an uploaded source document; no binary content | Current invoices only carry a raw URL and cannot link extraction provenance safely |
| `document_fields` | Critical extracted field value and source location/confidence | Supports the existing evidence contract without duplicating OCR logic |
| `model_versions` | Immutable model/schema identification | Makes existing risk inference reproducible without changing models |
| `financial_assessments` | Persisted deterministic financial-truth calculation snapshot | Persists the existing `FinancialTruthEngine` boundary |
| `financial_assessment_evidence` | Associates an assessment input with extracted evidence | Provides calculation provenance without over-normalizing every rule result |

`devices`, notification tables, and jobs are intentionally deferred: device identity, notification delivery, and persistent jobs are later phases and do not currently have a verified production workflow.

## Migration strategy

Alembic is the only production schema-change path. The initial migration is additive and calls the existing SQLAlchemy metadata, preserving deployments that already use `create_all`. Development/test retains `create_all` compatibility; staging/production startup requires an Alembic version table and never creates a schema implicitly.

## Transaction boundary

Each API request receives one SQLAlchemy session. Callers must commit a completed aggregate and its evidence references together; failed work rolls back through the request session. Migrations run in a single Alembic transaction where the database supports transactional DDL.

