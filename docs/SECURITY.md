---
{
  "id": "file_uvl3xdv1",
  "filetype": "document",
  "filename": "SECURITY",
  "created_at": "2026-08-26T06:43:27.575Z",
  "updated_at": "2026-08-26T06:43:38.176Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# CuraVeris Security Controls

This document specifies the security architecture, threat model, encryption controls, access controls, and compliance posture of the CuraVeris platform.

---

## Table of Contents

- [Threat Model](#1-threat-model)
- [Authentication and Authorization](#2-authentication-and-authorization)
- [Data Encryption](#3-data-encryption)
- [Input Validation and File Safety](#4-input-validation-and-file-safety)
- [Payment Security](#5-payment-security)
- [Privacy Compliance](#6-privacy-compliance-dpdp-act-2023)
- [Dependency and Supply Chain](#7-dependency-and-supply-chain-security)
- [Control Summary](#8-control-summary)

---

## 1. Threat Model

The platform handles personally identifiable information (patient names, phone numbers, financial data), medical bill documents, and payment receipts. The primary threat surface areas are:

| Threat | Vector | Control |
| :--- | :--- | :--- |
| Unauthorized data access | Unauthenticated API requests | JWT bearer token required on all protected routes |
| Credential theft | Database breach | bcrypt hashed passwords, never stored in plaintext |
| PII exposure in breach | Database dump | AES-256-GCM field encryption on sensitive columns |
| Malicious file upload | Polyglot payload execution | Binary magic bytes validation before OCR |
| Payment spoofing | Fabricated payment confirmation | HMAC-SHA256 webhook signature verification |
| Token replay | Stolen JWT | Short expiry (24h); no persistent server-side sessions |
| Identity non-repudiation | Disputed audit records | Cryptographic Merkle chain with HMAC-SHA256 origin signature |
| Personal data retention | DPDP Act obligations | Right to erasure endpoint with irreversible pseudonymization |

---

## 2. Authentication and Authorization

### 2.1 JSON Web Tokens

All protected API routes require a valid JWT bearer token in the `Authorization` header.

```text
Authorization: Bearer <token>
```

**Token properties**:

| Property | Value |
| :--- | :--- |
| Algorithm | HMAC-SHA256 (HS256) |
| Signing key | `SECRET_KEY` environment variable |
| Expiry | 1,440 minutes (24 hours) |
| Claims | `sub` (user ID), `exp` (expiry timestamp) |
| Server-side state | None. Token is self-contained and stateless. |

**Token revocation**: There is no token blacklist. For immediate revocation before expiry, rotate the `SECRET_KEY`. All existing tokens will become invalid immediately.

### 2.2 Password Storage

Passwords are hashed at registration using bcrypt with a work factor of 12. The hash includes the salt as a prefix in the stored value. Plaintext passwords are never logged, cached, or stored anywhere in the application layer or persistence tier.

**Bcrypt cost factor 12 performance** (approximate on reference hardware):

| Cost Factor | Time per Hash |
| :--- | :--- |
| 10 | \~100ms |
| 12 | \~400ms |
| 14 | \~1,600ms |

Cost factor 12 provides sufficient resistance to offline dictionary attacks while remaining practical for login latency.

### 2.3 Role Model

The current schema supports a single `user` role. Administrative endpoints (e.g., the dev inspector at `GET /api/v1/dev/node-details`) are separated by router. Production deployments should gate the dev router behind network-level access controls or remove it entirely.

---

## 3. Data Encryption

### 3.1 At-Rest Field Encryption

Patient phone numbers and admission identifiers are encrypted at the application layer using AES-256 in Galois/Counter Mode (GCM) before being written to PostgreSQL.

**Encryption scheme**:

```text
plaintext  -->  AES-256-GCM(key, nonce)  -->  nonce:ciphertext (hex-encoded)
```

- **Key**: 256-bit key derived from `SECRET_KEY`.
- **Nonce**: 96-bit nonce, randomly generated per write operation using `os.urandom(12)`.
- **Authentication tag**: 128-bit GCM tag appended by the cipher. Provides integrity verification on decrypt.
- **Storage format**: `<hex_nonce>:<hex_ciphertext>` stored in the `phone_encrypted` column.

Decryption failure (caused by ciphertext tampering or key mismatch) raises an authentication error and the operation is rejected without returning any partial data.

### 3.2 In-Transit Encryption

All production traffic must be served over TLS 1.2 or higher. The application does not enforce TLS directly — this is the responsibility of the reverse proxy (Nginx or Caddy) placed in front of Uvicorn. Running without TLS in production is not supported.

### 3.3 Database-Level Encryption

PostgreSQL itself does not apply additional column-level encryption. The AES-256-GCM application-layer encryption described above is the sole encryption control for sensitive fields. Full disk encryption on the database host is an infrastructure responsibility outside this codebase.

---

## 4. Input Validation and File Safety

### 4.1 Binary Magic Bytes Validation

Before any OCR extraction begins, the ingestion endpoint validates the binary signature (magic bytes) of the uploaded file against the declared content type:

| Declared Type | Magic Bytes | Hex |
| :--- | :--- | :--- |
| `application/pdf` | `%PDF-` | `25 50 44 46 2D` |
| `image/png` | `\x89PNG` | `89 50 4E 47 0D 0A 1A 0A` |
| `image/jpeg` | `\xFF\xD8\xFF` | `FF D8 FF` |

A file claiming to be a PDF but carrying PNG magic bytes is rejected with HTTP 400 before any processing occurs. This prevents polyglot payload attacks where a file is simultaneously valid in two formats.

### 4.2 File Size Limits

Maximum file size is configurable via the `MAX_UPLOAD_SIZE_MB` environment variable. The default is 20 MB. Files exceeding this limit are rejected at the multipart boundary before the body is read into memory.

### 4.3 SQL Injection Prevention

All database queries are executed through SQLAlchemy's parameterized query builder. String interpolation into SQL is not used anywhere in the codebase. The ORM constructs parameterized `SELECT`, `INSERT`, and `UPDATE` statements exclusively.

### 4.4 Request Body Validation

FastAPI's Pydantic schema validation rejects requests with missing required fields, incorrect types, or out-of-range values before the handler function is invoked. Validation errors return HTTP 422 with structured error details.

---

## 5. Payment Security

### 5.1 Razorpay Webhook Signature Verification

Payment status transitions are triggered only by Razorpay webhook events. Every incoming webhook is verified using HMAC-SHA256 before any order status is updated.

**Verification process**:

```text
received_signature = X-Razorpay-Signature header
expected_signature = HMAC-SHA256(RAZORPAY_KEY_SECRET, raw_request_body)

if received_signature != expected_signature:
    reject with HTTP 400 (signature mismatch)
```

This prevents client-side spoofing where an attacker crafts a fake payment confirmation request without access to the Razorpay key secret.

### 5.2 No Client-Side Payment Status

The application never accepts payment status from the client request body. All payment confirmation is driven by server-to-server webhook events from Razorpay exclusively.

---

## 6. Privacy Compliance (DPDP Act 2023)

### 6.1 Right to Erasure

The Digital Personal Data Protection Act 2023, Section 12 grants data principals the right to withdraw consent and request erasure of personal data.

**Endpoint**: `POST /api/v1/auth/anonymize-me`

**Effect**:

1. `users.email` → `DPDP_Anonymized_<SHA256(original_email)>@anonymized.curaveris`
2. `users.full_name` → `DPDP Anonymized Patient`
3. `users.phone_encrypted` → empty encrypted token
4. `users.is_active` → `false`
5. `audit_logs` record inserted with `action_type = ANONYMIZED`

**Irreversibility**: The SHA-256 hash of the original email is a one-way function. The original email cannot be recovered from the pseudonym. Bill and audit log records are retained because they contain no personal data after anonymization.

### 6.2 Data Minimization

- Phone numbers are the only PII field collected beyond email and name.
- No biometric, location, or government identification data is collected.
- Raw OCR text from bills is stored for audit reproducibility but is not indexed or searchable outside the specific bill record.

---

## 7. Dependency and Supply Chain Security

### 7.1 Pinned Dependencies

All production dependencies in `requirements.txt` are pinned to specific versions. Unpinned ranges are not used.

### 7.2 Recommended Audit Process

```bash
# Check for known vulnerabilities in installed packages
pip install pip-audit
pip-audit -r requirements.txt
```

Run `pip-audit` in CI on every pull request targeting the main branch.

### 7.3 Secrets Management

- Secrets are loaded from environment variables at startup. They are never hardcoded in source files.
- `.env` is listed in `.gitignore` and must never be committed to version control.
- Production deployments should use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) rather than a filesystem `.env` file.

---

## 8. Control Summary

| Control | Implementation | Location |
| :--- | :--- | :--- |
| Authentication | HMAC-SHA256 JWT, 24h expiry | `backend/app/core/security.py` |
| Password hashing | bcrypt, cost factor 12 | `backend/app/core/security.py` |
| PII encryption | AES-256-GCM, per-field | `backend/app/core/security.py` |
| File upload safety | Magic bytes validation | `backend/app/engine/extractor.py` |
| SQL injection | SQLAlchemy parameterized ORM | All `backend/app/db/` modules |
| Request validation | Pydantic schemas | All `backend/app/api/` routers |
| Payment integrity | Razorpay HMAC-SHA256 webhook | `backend/app/api/razorpay.py` |
| Audit chain integrity | SHA-256 Merkle + HMAC ledger | `backend/app/core/merkle_audit_ledger.py` |
| Right to erasure | DPDP Act 2023 anonymization | `backend/app/api/auth.py` |
