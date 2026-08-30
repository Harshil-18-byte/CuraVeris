from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.bills import router as bills_router
from app.api.v1.audits import router as audits_router
from app.api.v1.notifications import router as notif_router
from app.api.v1.payments import router as payments_router
from app.api.v1.legal_docs import router as legal_docs_router
from app.api.v1.users import router as users_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(bills_router)
api_router.include_router(audits_router)
api_router.include_router(notif_router)
api_router.include_router(payments_router)
api_router.include_router(legal_docs_router)
api_router.include_router(users_router)
api_router.include_router(admin_router)
