# Security Policy

## Engineering foundation controls

The backend assigns or validates an `X-Request-ID` for every request and returns it to clients. Structured logs include only this correlation value and standard metadata; request bodies, credentials, and sensitive financial or medical values are not added automatically. Public errors use a stable code/message/request-ID shape and do not expose stack traces.

Production and staging startup reject development secret defaults and Razorpay placeholder credentials. `.env.example` contains no usable credentials. Docker Compose requires runtime secrets from the environment.

## Supported Versions

| Version         | Supported |
| --------------- | --------- |
| 1.2.x (current) | Yes       |
| < 1.2           | No        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To disclose a vulnerability confidentially, email:

```text
security@curaveris.ai
```

### What to include

- **Component** affected (e.g., authentication, PII encryption, payment webhook)
- **Reproduction steps** — minimal, verifiable example
- **Impact assessment** — what an attacker could achieve
- **Suggested remediation** if known

### Our commitments

| SLA                    | Target                 |
| ---------------------- | ---------------------- |
| Acknowledgement        | Within 48 hours        |
| Severity assessment    | Within 5 business days |
| Critical fix timeline  | Within 7 business days |
| High fix timeline      | Within 30 business days|

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

This policy covers the CuraVeris backend (`backend/` directory), web frontend (`web/` and `clients/web/`), and its deployed production endpoints at `curaveris.onrender.com` and `api.curaveris.ai`. Database credentials (such as Neon PostgreSQL and Upstash Redis connection strings) must be stored strictly in environment variables and never exposed to client-side code or committed into version control. Third-party integrations (Razorpay, ABDM, Resend, WhatsApp Cloud API) should be reported directly to those vendors.

## Security Architecture Summary

See [docs/SECURITY.md](docs/SECURITY.md) for a detailed breakdown of the cryptographic controls, authentication hardening, DPDP compliance controls, and regulatory framework implemented in CuraVeris.

## Defense-in-Depth Hardening Controls

1. **Multi-Layer File Upload Defense**:
   - Magic byte header inspection (`%PDF`, `\x89PNG`, `\xff\xd8\xff`, `RIFF`).
   - File size strict enforcement ($\le 25\text{MB}$).
   - Path traversal and shell injection sanitization (`os.path.basename` normalized with backslash stripping and null-byte elimination).

2. **Tamper-Evident Ledger Integrity**:
   - Deterministic SHA-256 leaf and block hashing.
   - HMAC-SHA256 origin validation under Section 65B of the Indian Evidence Act.

3. **HTTP & Web Security**:
   - Strict Transport Security (HSTS `max-age=31536000; includeSubDomains`).
   - Restrictive Content Security Policy (CSP baseline) & `X-Frame-Options: DENY`.
   - Token-bucket Rate Limiting via SlowAPI.

4. **Live Security Telemetry**:
   - Security health endpoint: `GET /api/v1/dev/security-status`
