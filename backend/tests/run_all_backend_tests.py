"""
Master Backend Test Runner for CuraVeris.

Executes all core test suites:
1. Financial Invariants & Decimal Precision
2. Multi-Tenancy, RBAC & Token Rotation
3. Multi-Party Reconciliation & Exception Engine
4. Razorpay Payments, Signatures & Idempotency
5. Deterministic Statutory Risk Engine & Rate Caps
6. End-to-End API Workflows
"""
import os
import sys
import time
import asyncio

# Set testing environment
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_curaveris.db"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///./test_curaveris.db"
os.environ["ENV"] = "testing"

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)


def log(msg):
    print(msg, flush=True)


async def run_suite():
    log("=" * 70)
    log("  CURAVERIS BACKEND PRODUCTION TEST SUITE")
    log("=" * 70)
    
    t_start = time.time()
    passed = 0
    failed = 0

    # 1. Initialize DB & Statutory References
    log("\n[1/5] Initializing Test Database & Statutory Reference Rates...")
    if os.path.exists("test_curaveris.db"):
        try:
            os.remove("test_curaveris.db")
        except Exception:
            pass
    try:
        from tests.test_financial_invariants import (
            test_decimal_conversion_and_paise_conversion,
            test_inr_formatting,
            test_reconciliation_invariant_synthetic_scenario,
            test_randomized_financial_invariants_1000_trials
        )
        test_decimal_conversion_and_paise_conversion()
        test_inr_formatting()
        test_reconciliation_invariant_synthetic_scenario()
        test_randomized_financial_invariants_1000_trials()
        log("  ✓ Decimal conversions & paise quantization: PASS")
        log("  ✓ Indian Number System INR formatting: PASS")
        log("  ✓ 4-Way Reconciliation balance conservation: PASS")
        log("  ✓ 1,000 Randomized Monte Carlo invariant trials: PASS")
        passed += 4
    except Exception as e:
        log(f"  ✗ Financial Invariants FAILED: {e}")
        failed += 1

    # 2. Risk Engine Statutory Checks
    log("\n[2/5] Running Statutory Rules Engine Tests (CGHS, NPPA, DPCO, GST)...")
    try:
        from tests.test_risk_engine import (
            test_stent_nppa_violation_audit,
            test_dpco_medicine_violation_audit
        )
        test_stent_nppa_violation_audit()
        test_dpco_medicine_violation_audit()
        log("  ✓ NPPA Cardiac Stent Price Cap violation audit: PASS")
        log("  ✓ DPCO NLEM Medicine Price Cap & GST Exemption audit: PASS")
        passed += 2
    except Exception as e:
        log(f"  ✗ Risk Engine Tests FAILED: {e}")
        failed += 1

    # 3. RBAC & Tenant Isolation Logic
    log("\n[3/5] Running Tenant Access Isolation Rules...")
    try:
        from tests.test_multi_tenancy_and_rbac import test_tenant_access_isolation_rules
        test_tenant_access_isolation_rules()
        log("  ✓ Cross-Tenant Access Isolation & Platform Admin bypass: PASS")
        passed += 1
    except Exception as e:
        log(f"  ✗ Tenant Isolation Logic FAILED: {e}")
        failed += 1

    # 4. Initialize DB & Reference Tables for API endpoints
    log("\n[4/5] Initializing Database & Loading FastAPI Application...")
    from app.db.database import init_db
    from app.db.reference_data import init_reference_db
    from app.main import app
    from httpx import AsyncClient, ASGITransport

    init_reference_db()
    await init_db(force=True)
    log("  ✓ Application & database initialized.")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 5. Full API End-to-End Suite
        log("\n[5/5] Running API Integration Endpoints (Auth, Payments, Reconciliation, Finance)...")
        try:
            from tests.test_multi_tenancy_and_rbac import (
                test_rbac_user_registration_and_login,
                test_refresh_token_rotation_and_revocation
            )
            await test_rbac_user_registration_and_login(client)
            await test_refresh_token_rotation_and_revocation(client)
            log("  ✓ Multi-Role User Registration & Login (HOSPITAL_FINANCE): PASS")
            log("  ✓ Refresh Token Rotation & Instant Replay Revocation: PASS")
            passed += 2
        except Exception as e:
            log(f"  ✗ Auth & RBAC API FAILED: {e}")
            failed += 1

        try:
            from tests.test_razorpay_gateway_and_webhooks import (
                test_razorpay_order_and_payment_flow,
                test_razorpay_webhook_signature_and_idempotency
            )
            await test_razorpay_order_and_payment_flow(client)
            await test_razorpay_webhook_signature_and_idempotency(client)
            log("  ✓ Server-side Razorpay Order Generation in Paise: PASS")
            log("  ✓ Payment Capture & Client HMAC Signature Verification: PASS")
            log("  ✓ Webhook HMAC Verification & Event Deduplication (Idempotency): PASS")
            passed += 3
        except Exception as e:
            log(f"  ✗ Razorpay Gateway Tests FAILED: {e}")
            failed += 1

        try:
            from tests.test_reconciliation_and_exceptions import (
                test_end_to_end_reconciliation_and_exceptions
            )
            await test_end_to_end_reconciliation_and_exceptions(client)
            log("  ✓ End-to-End Bill Ingestion -> Audit -> Reconciliation: PASS")
            log("  ✓ Automated Exception Queue Generation (OVERCHARGE/GAP): PASS")
            log("  ✓ Finance Controller KPI Aggregation: PASS")
            log("  ✓ Prioritized Revenue Recovery Pipeline: PASS")
            passed += 4
        except Exception as e:
            log(f"  ✗ Reconciliation & Finance Tests FAILED: {e}")
            failed += 1

        try:
            from tests.test_api import test_auth_and_bill_workflow
            await test_auth_and_bill_workflow(client)
            log("  ✓ Full Patient Journey (Upload -> Grounded Chat -> Reconcile -> Dispute Petition): PASS")
            passed += 1
        except Exception as e:
            log(f"  ✗ Full Patient Journey Workflow FAILED: {e}")
            failed += 1

    t_total = time.time() - t_start
    log("\n" + "=" * 70)
    log(f"  TEST RESULTS: {passed} PASSED, {failed} FAILED in {t_total:.2f}s")
    log("=" * 70)

    if failed > 0:
        sys.exit(1)
    else:
        log("\nALL BACKEND INTEGRATION & PROPERTY INVARIANT TESTS PASSED.")


if __name__ == "__main__":
    asyncio.run(run_suite())
