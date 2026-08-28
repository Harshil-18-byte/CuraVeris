# Phase 1 — Engineering foundation

## Scope

Establish runtime/tooling foundations only. No CuraVeris business workflow, model, statutory rule, OCR, payment, or financial behavior is introduced or changed.

## Plan

1. Preserve the FastAPI runtime and add a correlation-ID and structured-error boundary.
2. Validate unsafe configuration before non-development startup.
3. Establish web (React/Vite), Android (Kotlin/Jetpack Compose), and iOS (SwiftUI) client foundations with no business screens.
4. Adopt backend OpenAPI as the shared API-contract source of truth.
5. Add reproducible Docker, lint/format/type-check configuration, and CI checks.

## Acceptance criteria

- Backend source compiles; correlation/error unit tests pass when dependencies are installed.
- Web runtime type-checks and builds after `npm ci`.
- Android and iOS project files are valid foundations; platform builds require their native toolchains.
- CI runs backend tests, static checks, and web checks.
- No secrets are committed and production/staging reject development payment credentials.

