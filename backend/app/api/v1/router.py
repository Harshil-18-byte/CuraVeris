from fastapi import APIRouter
from app.api.bills import router as legacy_bills_router
from app.api.v1.bills import router as bills_v1_router
from app.api.auth import router as legacy_auth_router
from app.api.v1.auth import router as auth_v1_router
from app.api.v1.audits import router as audits_router
from app.api.v1.notifications import router as notif_router
from app.api.v1.payments import router as payments_router
from app.api.v1.legal_docs import router as legal_docs_router
from app.api.v1.users import router as users_router
from app.api.v1.admin import router as admin_router
from app.api.v1.frm import router as frm_router
from app.api.dev import router as dev_router
from app.api.abha import router as abha_router
from app.api.integrations import router as integrations_router
from app.api.chat import router as chat_router
from app.api.finance import router as finance_router
from app.api.insurance import router as insurance_router
from app.api.reports import router as reports_router
from app.api.razorpay import router as razorpay_router

api_router = APIRouter()

# Mount legacy/advanced bill routes first so specific endpoints (/semantic-search, /upload-async, /pmjay-audit, /implant-card, etc.) match before /{bill_id}
api_router.include_router(legacy_bills_router)
api_router.include_router(bills_v1_router)

# Mount auth routes (combining both v1 and legacy helper endpoints like /anonymize-me)
api_router.include_router(legacy_auth_router)
api_router.include_router(auth_v1_router)

# Mount domain and integration routers
api_router.include_router(audits_router)
api_router.include_router(frm_router)
api_router.include_router(notif_router)
api_router.include_router(payments_router)
api_router.include_router(legal_docs_router)
api_router.include_router(users_router)
api_router.include_router(admin_router)
api_router.include_router(dev_router)
api_router.include_router(abha_router)
api_router.include_router(integrations_router)
api_router.include_router(chat_router)
api_router.include_router(finance_router)
api_router.include_router(insurance_router)
api_router.include_router(reports_router)
api_router.include_router(razorpay_router)
