from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.core.database import get_db
from app.core.redis import get_value, set_with_ttl, delete_key
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=dict)
async def list_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    filter_type: Optional[str] = Query("all"),  # all | unread
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves paginated notifications and total unread count."""
    query = select(Notification).where(Notification.user_id == current_user.id)
    count_query = select(func.count(Notification.id)).where(Notification.user_id == current_user.id)

    if filter_type == "unread":
        query = query.where(Notification.is_read.is_(False))
        count_query = count_query.where(Notification.is_read.is_(False))

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Notification.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    notifications = (await db.execute(query)).scalars().all()

    # Unread total calculation
    unread_stmt = select(func.count(Notification.id)).where(
        and_(Notification.user_id == current_user.id, Notification.is_read.is_(False))
    )
    unread_count = (await db.execute(unread_stmt)).scalar() or 0

    return {
        "items": [NotificationResponse.model_validate(n) for n in notifications],
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "per_page": per_page,
    }


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetches cached unread notifications count from Redis with DB fallback."""
    cache_key = f"notif_count:{current_user.id}"
    cached_val = await get_value(cache_key)

    if cached_val is not None:
        try:
            return UnreadCountResponse(count=int(cached_val))
        except Exception:
            pass

    stmt = select(func.count(Notification.id)).where(
        and_(Notification.user_id == current_user.id, Notification.is_read.is_(False))
    )
    count = (await db.execute(stmt)).scalar() or 0
    await set_with_ttl(cache_key, str(count), 60)

    return UnreadCountResponse(count=count)


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Marks a single notification as read."""
    stmt = select(Notification).where(
        and_(Notification.id == notification_id, Notification.user_id == current_user.id)
    )
    notif = (await db.execute(stmt)).scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    notif.read_at = datetime.now(timezone.utc)
    await delete_key(f"notif_count:{current_user.id}")
    await db.commit()
    return {"message": "Notification marked as read"}


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Marks all unread notifications as read."""
    stmt = select(Notification).where(
        and_(Notification.user_id == current_user.id, Notification.is_read.is_(False))
    )
    unreads = (await db.execute(stmt)).scalars().all()
    now_utc = datetime.now(timezone.utc)

    for n in unreads:
        n.is_read = True
        n.read_at = now_utc

    await delete_key(f"notif_count:{current_user.id}")
    await db.commit()
    return {"message": "All notifications marked as read", "count": len(unreads)}
