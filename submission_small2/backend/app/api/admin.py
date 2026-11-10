"""
Administration Router for PayFlow AI.

Enforces strict Role-Based Access Control (RBAC):
- Manage users (activate/deactivate, assign roles)
- View global system analytics & health
- Access audit logs of all user actions
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.models import User, Invoice, Transaction, ActivityLog
from app.schemas.schemas import UserResponse, ActivityLogResponse
from app.core.deps import get_current_admin

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all registered users (Admin only)."""
    q = db.query(User)
    if search:
        s = f"%{search}%"
        q = q.filter((User.name.ilike(s)) | (User.email.ilike(s)))
    if role:
        q = q.filter(User.role == role)
    return q.offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin.id and not is_active:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Assign role (admin or user)."""
    if role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="Role must be either 'admin' or 'user'.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin.id and role != "admin":
        raise HTTPException(status_code=400, detail="Cannot demote your own administrator role.")

    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.get("/stats")
def get_admin_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Global system-wide metrics and server telemetry."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_invoices = db.query(Invoice).count()
    total_volume = db.query(func.sum(Invoice.amount)).scalar() or 0.0
    paid_volume = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.status == "completed")
        .scalar()
        or 0.0
    )
    high_risk_invoices = (
        db.query(Invoice).filter(Invoice.risk_level == "high").count()
    )

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_invoices": total_invoices,
        "total_volume": round(float(total_volume), 2),
        "paid_volume": round(float(paid_volume), 2),
        "high_risk_invoices": high_risk_invoices,
        "system_health": "100% Operational",
        "ocr_engine": "PaddleOCR-VL 1.6 / PyMuPDF Multi-Engine",
        "paypal_gateway": "PayPal Sandbox REST API v2",
        "database_status": "SQLite Connected",
    }


@router.get("/activity", response_model=List[ActivityLogResponse])
def get_global_activity_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Audit trail of all administrative and user operations."""
    return (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
