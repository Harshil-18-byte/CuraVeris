import subprocess
import os
import sys

def run_git(args):
    result = subprocess.run(["git"] + args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def is_ignored_path(p):
    ignored = [".next", "node_modules", ".gradle", "venv", "__pycache__", ".git", ".env.local"]
    parts = p.replace("\\", "/").split("/")
    for ign in ignored:
        if ign in parts:
            return True
    return False

CUSTOM_MESSAGES = {
    ".gitignore": "Update repository ignore rules to exclude local build and cache artifacts",
    ".github/workflows/neon_workflow.yml": "Add automated Neon database branching workflow for pull requests",
    ".github/workflows/security_gate.yml": "Add automated security merge gate and secret leak prevention workflow",
    ".github/workflows/test.yml": "Configure GitHub Actions backend test suite execution",
    "CONTRIBUTING.md": "Add Neon database pull request branching and migration contribution guidelines",
    "DEPLOYMENT.md": "Add Render deployment guide, Celery worker specs, and Neon database integration",
    "README.md": "Update documentation with 3-terminal run guide, Celery workers, and cloud service configuration",
    "SECURITY.md": "Update security policy scope to include Render cloud endpoint and database credential rules",
    "TESTING.md": "Add integration test instructions for Neon PostgreSQL and Celery async workers",
    "docs/API_REFERENCE.md": "Add production cloud base URL to API reference",
    "docs/ARCHITECTURE.md": "Add distributed infrastructure and cloud native topology architecture section",
    "docs/CHANGELOG.md": "Document release 1.6.0 with Render deployment, Neon branching, and Celery workers",
    "docs/DATA_MODEL.md": "Add relational schema mapping for PostgreSQL initial migration tables",
    "docs/ENGINEERING_AUDIT.md": "Update engineering audit with current platform capabilities and verification",
    "docs/MANUAL_TRAINING_GUIDE.md": "Update model training guide with 2026 unified production certification status",
    "docs/PRODUCTION_TRAINING_GUIDE.md": "Update production training guide with certified model runner instructions",
    "backend/pyproject.toml": "Configure hatchling package targets for backend installation",
    "backend/render.yaml": "Add Render blueprint configuration for web and background services",
    "backend/Dockerfile": "Add production container definition with system dependencies and OCR engines",
    "backend/alembic.ini": "Configure Alembic database migration environment",
    "backend/alembic/env.py": "Add async connection runner and URL sanitizer for database migrations",
    "backend/alembic/script.py.mako": "Add Alembic migration script template",
    "backend/alembic/versions/001_initial_schema.py": "Create initial PostgreSQL schema migration with extensions and core tables",
    "backend/.env.example": "Update backend environment template with Neon, Redis, and Resend settings",
    "backend/app/core/config.py": "Add configuration settings for Neon database, Upstash Redis, and Resend",
    "backend/app/core/database.py": "Implement async SQLAlchemy session manager with SSL URL sanitization",
    "backend/app/core/redis.py": "Implement async Redis connection pool and caching client",
    "backend/app/core/storage.py": "Implement unified file storage service supporting local and S3/R2 backends",
    "backend/app/core/security.py": "Implement cryptographic token management, password hashing, and PII encryption",
    "backend/app/core/errors.py": "Standardize application error handlers and structured exception responses",
    "backend/app/core/logging.py": "Configure structured JSON logging with request correlation tracing",
    "backend/app/workers/celery_app.py": "Configure Celery application with multi-queue routing and Upstash Redis broker",
    "backend/app/workers/tasks.py": "Implement asynchronous background tasks for bill processing and email notifications",
    "backend/app/services/audit_service.py": "Implement comprehensive medical bill audit engine with deterministic statutory rules",
    "backend/app/services/auth_service.py": "Implement user authentication, registration, and role-based access control service",
    "backend/app/services/bill_service.py": "Implement medical bill management and audit persistence service",
    "backend/app/services/notification_service.py": "Implement email dispatch service using Resend transactional API",
    "backend/app/services/storage_service.py": "Implement document storage and retrieval wrapper",
    "backend/app/models/user.py": "Define SQLAlchemy User and role models",
    "backend/app/models/bill.py": "Define SQLAlchemy Bill and BillItem models with statutory pricing columns",
    "backend/app/models/audit.py": "Define SQLAlchemy AuditLog model for forensic action tracking",
    "backend/app/models/evidence.py": "Define SQLAlchemy FinancialAssessment and Evidence linkage models",
    "backend/app/models/notification.py": "Define SQLAlchemy Notification history model",
    "backend/app/models/payment.py": "Define SQLAlchemy Payment and transaction tracking models",
    "backend/app/models/schemas.py": "Define Pydantic request and response validation schemas",
    "backend/app/main.py": "Configure FastAPI application lifespan, CORS, middleware, and route mounting",
    "backend/docs/ML_AND_BACKEND_HANDBOOK.md": "Add documentation for production multi-model training runner",
    "backend/ml_training/models/deep_mlp_real.pt": "Save trained Deep MLP neural network model weights",
    "backend/ml_training/models/xgboost_real.ubj": "Save trained multi-label XGBoost violation classifier model weights",
    "backend/ml_training/models/xgboost_real_metrics.json": "Save XGBoost model evaluation metrics and calibration parameters",
    "backend/reference_data/medical_rates.db": "Update SQLite reference database with CGHS, NPPA, and DPCO statutory ceilings",
    "backend/tests/conftest.py": "Configure pytest async fixtures and test database sessions",
    "backend/tests/test_audit_engine.py": "Add automated test suite for deterministic statutory audit engine",
    "backend/tests/test_crypto.py": "Add unit tests for cryptographic hashing and ledger sealing",
    "backend/tests/test_curation_leak_prevention.py": "Add test suite to prevent internal curation leakage",
    "backend/tests/test_taxonomy_compliance.py": "Add test suite validating compliance with official statutory rate schedules",
    "backend/tests/test_auth_devices.py": "Update authentication and device registration test suite",
    "backend/tests/test_migrations.py": "Update database schema migration validation tests",
    "backend/tests/test_mobile_pipeline.py": "Update modular mobile inference pipeline test suite",
    "scripts/ci_security_gate.py": "Add automated script for scanning secret leaks and internal identifier exposure",
    "neon.ts": "Add TypeScript client utility for Neon database connection branching",
    "package.json": "Configure root npm scripts and workspace dependencies",
    "package-lock.json": "Update root package lockfile",
}

def get_human_message(filepath):
    p = filepath.replace("\\", "/")
    if p in CUSTOM_MESSAGES:
        return CUSTOM_MESSAGES[p]
        
    parts = p.split("/")
    filename = parts[-1]

    if "models/" in p and p.endswith(".py"):
        model_name = filename.replace(".py", "").replace("_", " ").title()
        return f"Define {model_name} database model and schema mappings"
    elif "services/" in p and p.endswith(".py"):
        service_name = filename.replace(".py", "").replace("_", " ").title()
        return f"Implement {service_name} business logic and operations"
    elif "api/" in p and p.endswith(".py"):
        router_name = filename.replace(".py", "").replace("_", " ").title()
        return f"Add REST API routes and endpoints for {router_name}"
    elif "tests/" in p and p.endswith(".py"):
        test_name = filename.replace(".py", "").replace("_", " ").title()
        return f"Add automated tests for {test_name}"
    elif "ml_training/models/" in p:
        return f"Update trained machine learning model artifact for {filename}"
    elif "ml_training/data/" in p:
        return f"Update normalized training dataset for {filename}"
    elif "components/" in p:
        comp_name = filename.replace(".tsx", "").replace(".ts", "").replace("_", " ")
        return f"Implement {comp_name} UI component for web frontend"
    elif "app/" in p and (p.endswith(".tsx") or p.endswith(".ts")):
        page_name = "/".join(parts[parts.index("app")+1:])
        return f"Implement {page_name} route and page view"
    elif "lib/" in p:
        lib_name = filename.replace(".ts", "").replace(".tsx", "").replace("_", " ")
        return f"Add utility library functions for {lib_name}"
    elif "hooks/" in p:
        hook_name = filename.replace(".ts", "").replace(".tsx", "")
        return f"Add custom React hook {hook_name}"
    elif "store/" in p:
        store_name = filename.replace(".ts", "").replace(".tsx", "")
        return f"Implement {store_name} state store"
    elif "types/" in p:
        type_name = filename.replace(".ts", "").replace(".d.ts", "")
        return f"Define TypeScript types and interfaces for {type_name}"
    elif p.endswith(".md"):
        return f"Update documentation in {filename}"
    elif p.endswith(".json"):
        return f"Update configuration settings in {filename}"
    elif p.endswith(".css"):
        return f"Update stylesheet styles in {filename}"
    else:
        return f"Update {filename} with latest improvements"

def main():
    code, out, err = run_git(["status", "--porcelain"])
    if code != 0:
        print("Error getting status:", err)
        sys.exit(1)
        
    lines = [l for l in out.splitlines() if l.strip()]
    print(f"Found {len(lines)} file status entries to process.")
    
    for line in lines:
        status = line[:2]
        filepath = line[3:].strip()
        
        if filepath.startswith('"') and filepath.endswith('"'):
            filepath = filepath[1:-1]
            
        if is_ignored_path(filepath):
            continue
            
        if not os.path.exists(filepath) and not status.strip().startswith('D') and not 'D' in status:
            continue
                
        if os.path.isdir(filepath):
            for root, dirs, files in os.walk(filepath):
                dirs[:] = [d for d in dirs if not is_ignored_path(os.path.join(root, d))]
                for f in files:
                    subpath = os.path.join(root, f).replace("\\", "/")
                    if is_ignored_path(subpath):
                        continue
                    msg = get_human_message(subpath)
                    run_git(["add", subpath])
                    c_code, c_out, c_err = run_git(["commit", "-m", msg])
                    if c_code == 0:
                        print(f"[COMMITTED] {subpath} -> {msg}")
                    else:
                        print(f"[SKIP/FAIL] {subpath}: {c_err}")
            continue

        msg = get_human_message(filepath)
        if 'D' in status:
            run_git(["rm", filepath])
        else:
            run_git(["add", filepath])
            
        c_code, c_out, c_err = run_git(["commit", "-m", msg])
        if c_code == 0:
            print(f"[COMMITTED] {filepath} -> {msg}")
        else:
            print(f"[SKIP/FAIL] {filepath}: {c_err}")

if __name__ == "__main__":
    main()
