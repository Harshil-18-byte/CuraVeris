---
{
  "id": "file_vchiyqor",
  "filetype": "document",
  "filename": "SECURITY",
  "created_at": "2026-08-26T07:22:43.881Z",
  "updated_at": "2026-08-26T07:22:58.015Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.2.x (current) | Yes |
| < 1.2 | No |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To disclose a vulnerability confidentially, email:

```
security@curaveris.ai
```

### What to include

- **Component** affected (e.g., authentication, PII encryption, payment webhook)
- **Reproduction steps** — minimal, verifiable example
- **Impact assessment** — what an attacker could achieve
- **Suggested remediation** if known

### Our commitments

| SLA | Target |
|---|---|
| Acknowledgement | Within 48 hours |
| Severity assessment | Within 5 business days |
| Critical fix timeline | Within 7 business days |
| High fix timeline | Within 30 business days |

### What qualifies as a security issue

- Authentication or authorization bypass
- PII / PHI data exposure (DPDP 2023 scope)
- JWT signing key exposure or manipulation
- Fernet encryption key exposure
- SQL injection or ORM injection
- HMAC signature bypass (Razorpay or WhatsApp webhooks)
- SSRF, XXE, or RCE vulnerabilities
- Denial-of-service bypassing the SlowAPI rate limiter
- Merkle audit ledger tamper-evidence bypass

### Scope

This policy covers the CuraVeris backend (`backend/` directory) and its deployed production endpoint at `api.curaveris.ai`. Third-party integrations (Razorpay, ABDM, WhatsApp Cloud API) should be reported directly to those vendors.

## Security Architecture Summary

See [docs/SECURITY.md](docs/SECURITY.md) for a detailed breakdown of the cryptographic controls, authentication hardening, DPDP compliance controls, and regulatory framework implemented in CuraVeris.
