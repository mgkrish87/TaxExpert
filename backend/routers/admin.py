"""Admin API routes — view users, filings, and system stats.

These endpoints let you inspect the database contents.
Protected by a simple admin check (role == 'admin').
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.filing import Filing
from models.document import Document
from schemas.user import UserResponse
from schemas.filing import FilingResponse
from utils.security import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


async def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency that checks if the current user is an admin."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ─── Dashboard Stats ───
@router.get("/stats")
async def get_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get system-wide statistics."""
    user_count = await db.scalar(select(func.count(User.id)))
    filing_count = await db.scalar(select(func.count(Filing.id)))
    doc_count = await db.scalar(select(func.count(Document.id)))
    submitted = await db.scalar(
        select(func.count(Filing.id)).where(Filing.status.in_(["submitted", "filed"]))
    )
    return {
        "total_users": user_count,
        "total_filings": filing_count,
        "total_documents": doc_count,
        "submitted_filings": submitted,
    }


# ─── List All Users ───
@router.get("/users", response_model=list[UserResponse])
async def list_all_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all registered users."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


# ─── List All Filings ───
@router.get("/filings", response_model=list[FilingResponse])
async def list_all_filings(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all filings across all users."""
    result = await db.execute(select(Filing).order_by(Filing.created_at.desc()))
    return [FilingResponse.model_validate(f) for f in result.scalars().all()]


# ─── Promote User to Admin ───
@router.post("/promote/{user_id}")
async def promote_to_admin(
    user_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Promote a user to admin role."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "admin"
    db.add(user)
    await db.flush()
    return {"message": f"{user.full_name} promoted to admin"}
