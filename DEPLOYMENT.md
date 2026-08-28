---
{
  "id": "file_dlz46kr4",
  "filetype": "document",
  "filename": "DEPLOYMENT",
  "created_at": "2026-08-27T08:15:52.391Z",
  "updated_at": "2026-08-27T08:15:53.131Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# CuraVeris Deployment Guide

This document covers production deployment of the CuraVeris backend on Ubuntu 22.04 / Debian 12, Docker, and cloud platforms (AWS, GCP, Azure).

## Phase 1 local foundation

The repository now has independent client foundations in `clients/web`, `clients/android`, and `clients/ios`. The FastAPI backend remains the only authoritative service. Use `docker compose up --build` only after exporting `SECRET_KEY`, `ENCRYPTION_KEY`, and `POSTGRES_PASSWORD`; compose intentionally refuses empty values. Platform builds require their native toolchains: Node 20+ for web, Android Studio/SDK for Android, and macOS with Xcode/XcodeGen for iOS.

Before staging or production startup, run `cd backend && alembic upgrade head` against PostgreSQL. The application refuses a failed PostgreSQL connection or missing migration state in these environments rather than silently using SQLite.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Bare-Metal / VM Deployment](#bare-metal--vm-deployment)
- [PostgreSQL Setup](#postgresql-setup)
- [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
- [TLS / HTTPS](#tls--https)
- [Process Management (Systemd)](#process-management-systemd)
- [ML Model Initialization](#ml-model-initialization)
- [Health Checks and Monitoring](#health-checks-and-monitoring)
- [Secrets Rotation](#secrets-rotation)
- [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPUs | 4 vCPUs |
| RAM | 2 GB | 8 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| Python | 3.11 | 3.12 |
| PostgreSQL | 14 | 15 |
| OS | Ubuntu 22.04 | Ubuntu 22.04 LTS |

---

## Environment Configuration

Copy `.env.example` to `backend/.env` and replace **all** placeholder values before starting the server.

### Required variables for production

```bash
ENV=production
DEBUG=False

# Must be a 64-character cryptographically secure random string.
# Generate: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=<your-secret>

# Must be a valid 32-byte url-safe base64 Fernet key.
# Generate: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
ENCRYPTION_KEY=<your-fernet-key>

# PostgreSQL production connection
DATABASE_URL=postgresql+asyncpg://curaveris:password@db-host:5432/curaveris
SYNC_DATABASE_URL=postgresql://curaveris:password@db-host:5432/curaveris
```

> The application will **refuse to start** in `production` or `staging` mode if `SECRET_KEY` or `ENCRYPTION_KEY` are set to the development defaults. This is enforced in `validate_secrets()` at startup.

### Optional variables

```bash
# LLM narrative generation (at least one recommended)
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Razorpay live keys
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# ABDM / ABHA production gateway
ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=
ABDM_GATEWAY_URL=https://live.abdm.gov.in/gateway

# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

---

## Docker Deployment

### Dockerfile (backend)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train ML model at build time (or mount pre-trained weights at runtime)
RUN python -c "from app.ml.train_risk_model import train_and_evaluate; train_and_evaluate()" || true

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  api:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: curaveris
      POSTGRES_USER: curaveris
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U curaveris"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

```bash
# Start stack
docker compose up -d

# View logs
docker compose logs -f api

# Run database migrations / init
docker compose exec api python -c "
import asyncio
from app.db.database import init_db
from app.db.reference_data import init_reference_db
asyncio.run(init_db())
init_reference_db()
"

# Train production ML models & ChromaDB vector store
docker compose exec api python ml_training/train_all_models.py
```

---

## Bare-Metal / VM Deployment

```bash
# 1. Clone the repository
git clone https://github.com/Harshil-18-byte/CuraVeris.git
cd CuraVeris/backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install production dependencies
pip install --no-cache-dir -r requirements.txt

# 4. Set environment variables
cp .env.example .env
nano .env  # Fill in all required production values

# 5. Initialize database schema and seed statutory reference data
python -c "
import asyncio
from app.db.database import init_db
from app.db.reference_data import init_reference_db
asyncio.run(init_db())
init_reference_db()
"

# 6. Train ML models
python -c "from app.ml.train_risk_model import train_and_evaluate; train_and_evaluate(num_samples=3000)"
python -c "from app.ml.deep_risk_model import train_deep_model; train_deep_model()"
python -c "from app.ml.hybrid_ensemble import train_hybrid_ensemble; train_hybrid_ensemble()"

# 7. Test everything passes
pytest --tb=short -q

# 8. Start the production ASGI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level warning
```

---

## PostgreSQL Setup

```sql
-- Run as postgres superuser
CREATE DATABASE curaveris;
CREATE USER curaveris WITH ENCRYPTED PASSWORD 'strong-password-here';
GRANT ALL PRIVILEGES ON DATABASE curaveris TO curaveris;

-- Enable necessary extensions
\c curaveris
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.curaveris.ai;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.curaveris.ai;

    ssl_certificate     /etc/letsencrypt/live/api.curaveris.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.curaveris.ai/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Max upload size for bill PDFs
    client_max_body_size 25M;

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Streaming responses for LLM chat
        proxy_buffering    off;
        proxy_read_timeout 120s;
    }
}
```

---

## TLS / HTTPS

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install certificate
sudo certbot --nginx -d api.curaveris.ai

# Auto-renewal (already set up by certbot, but verify)
sudo systemctl enable certbot.timer
```

---

## Process Management (Systemd)

```ini
# /etc/systemd/system/curaveris.service
[Unit]
Description=CuraVeris MedBill AI Backend
After=network.target postgresql.service

[Service]
User=curaveris
WorkingDirectory=/opt/curaveris/backend
EnvironmentFile=/opt/curaveris/backend/.env
ExecStart=/opt/curaveris/backend/venv/bin/uvicorn app.main:app \
          --host 0.0.0.0 --port 8000 --workers 4 --log-level warning
Restart=on-failure
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable curaveris
sudo systemctl start curaveris
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  api:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: curaveris
      POSTGRES_USER: curaveris
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U curaveris"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

```bash
# Start stack
docker compose up -d

# View logs
docker compose logs -f api

# Run database migrations / init
docker compose exec api python -c "
import asyncio
from app.db.database import init_db
from app.db.reference_data import init_reference_db
asyncio.run(init_db())
init_reference_db()
"

# Train production ML models & ChromaDB vector store
docker compose exec api python ml_training/train_all_models.py
```

---

## Bare-Metal / VM Deployment

```bash
# 1. Clone the repository
git clone https://github.com/Harshil-18-byte/CuraVeris.git
cd CuraVeris/backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install production dependencies
pip install --no-cache-dir -r requirements.txt

# 4. Set environment variables
cp .env.example .env
nano .env  # Fill in all required production values

# 5. Initialize database schema and seed statutory reference data
python -c "
import asyncio
from app.db.database import init_db
from app.db.reference_data import init_reference_db
asyncio.run(init_db())
init_reference_db()
"

# 6. Train ML models
python -c "from app.ml.train_risk_model import train_and_evaluate; train_and_evaluate(num_samples=3000)"
python -c "from app.ml.deep_risk_model import train_deep_model; train_deep_model()"
python -c "from app.ml.hybrid_ensemble import train_hybrid_ensemble; train_hybrid_ensemble()"

# 7. Test everything passes
pytest --tb=short -q

# 8. Start the production ASGI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level warning
```

---

## PostgreSQL Setup

```sql
-- Run as postgres superuser
CREATE DATABASE curaveris;
CREATE USER curaveris WITH ENCRYPTED PASSWORD 'strong-password-here';
GRANT ALL PRIVILEGES ON DATABASE curaveris TO curaveris;

-- Enable necessary extensions
\c curaveris
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.curaveris.ai;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.curaveris.ai;

    ssl_certificate     /etc/letsencrypt/live/api.curaveris.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.curaveris.ai/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Max upload size for bill PDFs
    client_max_body_size 25M;

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Streaming responses for LLM chat
        proxy_buffering    off;
        proxy_read_timeout 120s;
    }
}
```

---

## TLS / HTTPS

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install certificate
sudo certbot --nginx -d api.curaveris.ai

# Auto-renewal (already set up by certbot, but verify)
sudo systemctl enable certbot.timer
```

---

## Process Management (Systemd)

```ini
# /etc/systemd/system/curaveris.service
[Unit]
Description=CuraVeris MedBill AI Backend
After=network.target postgresql.service

[Service]
User=curaveris
WorkingDirectory=/opt/curaveris/backend
EnvironmentFile=/opt/curaveris/backend/.env
ExecStart=/opt/curaveris/backend/venv/bin/uvicorn app.main:app \
          --host 0.0.0.0 --port 8000 --workers 4 --log-level warning
Restart=on-failure
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable curaveris
sudo systemctl start curaveris
sudo systemctl status curaveris
```

---

## ML Model Initialization

Large binary model weights and databases are tracked with **Git LFS** (`.gitattributes`). On a fresh deployment:

```bash
# Pull LFS model assets
git lfs install
git lfs pull

# Alternatively, retrain lightweight baseline models locally:
cd /opt/curaveris/backend
source venv/bin/activate

# Train primary GBM model (~30s on 4 vCPUs)
python -c "from app.ml.train_risk_model import train_and_evaluate; train_and_evaluate(num_samples=3000)"

# Train Deep MLP model
python -c "from app.ml.deep_risk_model import train_deep_model; train_deep_model()"

# Train Hybrid Stacking Ensemble
python -c "from app.ml.hybrid_ensemble import train_hybrid_ensemble; train_hybrid_ensemble()"
```

The server also auto-trains the primary model on first startup if weights are missing — but pulling via Git LFS or pre-training is strongly recommended for production to avoid a cold-start delay.

---

## Health Checks and Monitoring

The backend exposes three system diagnostic and orchestration endpoints:

```bash
# 1. Comprehensive Health Check
curl https://api.curaveris.ai/health
# Expected: {"status":"healthy","environment":"production","version":"1.2.0","database":true,"reference_db":true}

# 2. Kubernetes / Docker Liveness Probe
curl https://api.curaveris.ai/health/live
# Expected: {"status":"alive","timestamp":"2026-08-28T08:28:00.000Z"}

# 3. Traffic Readiness Probe
curl https://api.curaveris.ai/health/ready
# Expected: {"status":"ready","database":true,"reference_db":true}
```

### Recommended monitoring stack

- **Uptime**: Grafana Cloud or Uptime Robot — poll `/health` every 60s.
- **Kubernetes Probes**: Configure `livenessProbe` at `/health/live` and `readinessProbe` at `/health/ready`.
- **Logs**: Ship structured JSON logs to Loki, CloudWatch, or Datadog.
- **Metrics**: Use `prometheus-fastapi-instrumentator` for request rate, latency, and error rate.
- **Alerts**: PagerDuty or Opsgenie for `/health` returning non-200 for > 2 minutes.

---

## Secrets Rotation

### JWT Secret Key rotation

1. Generate a new key: `python -c "import secrets; print(secrets.token_hex(32))"`
2. Update `SECRET_KEY` in the production `.env` / secrets manager.
3. Restart the service: `sudo systemctl restart curaveris`
4. All existing JWT tokens are immediately invalidated — active users will need to log in again.

### Fernet Encryption Key rotation

Rotating `ENCRYPTION_KEY` requires re-encrypting all PII fields in the database. Contact the security team before rotating in production.

### Razorpay Key rotation

1. Rotate keys in the Razorpay dashboard.
2. Update `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in `.env`.
3. Restart the service.

---

## Rollback Procedure

```bash
# 1. Stop the service
sudo systemctl stop curaveris

# 2. Revert to previous commit
cd /opt/curaveris
git log --oneline -10   # Find last good commit
git checkout <commit-hash>

# 3. Reinstall dependencies if requirements changed
cd backend
source venv/bin/activate
pip install -r requirements.txt

# 4. Restart
sudo systemctl start curaveris
sudo systemctl status curaveris
```
