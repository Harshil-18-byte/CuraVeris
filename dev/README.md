---
{
  "id": "file_3m23gozg",
  "filetype": "document",
  "filename": "README",
  "created_at": "2026-08-30T11:20:00.322Z",
  "updated_at": "2026-08-30T11:20:04.211Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# Developer Tooling & Local Sandbox Environment

This directory contains developer scripts, sandbox configs, and environment utilities for running CuraVeris in local developer workstations.

## Available Workflows
- `scripts/`: Python scripts for database migrations, rate table ingestion, and benchmark testing.
- `docker-compose.yml`: Multi-container local orchestration (FastAPI backend, Next.js web client, SQLite/PostgreSQL database, Redis cache).
