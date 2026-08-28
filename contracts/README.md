# Shared API contracts

The FastAPI OpenAPI document at `GET /openapi.json` is the sole shared contract source for web, Android, and iOS clients. Client-specific generated code is not committed until Phase 3 API-contract work defines generation tooling and compatibility rules.

Clients must not duplicate server business rules or treat locally cached data as authoritative.
