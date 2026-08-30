from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2)
    phone_number: Optional[str] = None


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user profile."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "phone_verified": current_user.phone_verified,
        "email_verified": current_user.email_verified,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "dpdp_consent_given": current_user.dpdp_consent_given,
        "created_at": current_user.created_at,
    }


@router.patch("/me")
async def update_me(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates user profile information."""
    if req.full_name:
        current_user.full_name = req.full_name.strip()
    if req.phone_number:
        current_user.phone_number = req.phone_number.strip()

    await db.commit()
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }
