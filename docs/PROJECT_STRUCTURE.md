# CuraVeris project structure

```text
CuraVeris/
├── backend/                 # FastAPI API, domain services, database, migrations, tests
│   ├── app/                  # Runtime application modules
│   ├── migrations/           # Alembic schema migrations
│   ├── tests/                # Backend unit and integration tests
│   └── workers/              # Background-worker entry points
├── clients/
│   ├── web/                  # Next.js App Router web client
│   ├── android/              # Kotlin / Jetpack Compose client
│   └── ios/                  # SwiftUI client
├── contracts/                # OpenAPI contract strategy and generated-client policy
├── docs/                     # Architecture, operations, phase, and security documentation
├── data/                     # Explicitly labelled demo/non-production data
├── config/                   # Source-controlled non-secret configuration
└── scripts/                  # Data and maintenance scripts
```

Existing root-level `app/`, `src/`, `models/`, and `reference_data/` directories are retained as legacy or data/training assets. Do not move or delete them without a separately verified migration plan.

The active web entry point is `clients/web/src/app`. Legacy Vite files are retained but excluded from the Next.js type-check path.
