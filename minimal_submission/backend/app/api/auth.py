"""
Authentication & User Management Router for PayFlow AI.

Features:
- Email/password registration & login with bcrypt hashing
- Role assignment (admin / user)
- Password change & Profile management
- Activity logging
- Seeded demo & admin accounts
"""

import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import User, ActivityLog
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    PasswordChange, UserUpdate
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.services.seed_data import seed_demo_data, ADMIN_EMAIL, DEMO_EMAIL
from app.core.deps import get_current_user

router = APIRouter()


def _make_token(user: User, is_demo: bool = False) -> TokenResponse:
    token = create_access_token(
        {"sub": user.id, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        is_demo=is_demo,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role if payload.role in ("admin", "user") else "user",
        is_active=True,
        last_login=datetime.now(),
    )
    db.add(user)
    db.flush()

    # Log activity
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="register",
        details={"name": user.name, "email": user.email, "role": user.role}
    ))

    # Seed initial test scenario invoices for new user
    seed_demo_data(user.id, db)

    db.commit()
    db.refresh(user)
    return _make_token(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password and return a JWT."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account has been deactivated. Please contact your administrator.")

    user.last_login = datetime.now()

    # Log activity
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="login",
        details={"email": user.email, "role": user.role}
    ))
    db.commit()
    db.refresh(user)

    is_demo = user.email in (DEMO_EMAIL, ADMIN_EMAIL)
    return _make_token(user, is_demo=is_demo)


@router.post("/demo", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """Quick 1-click login into the Demo Executive account."""
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            name="Demo Executive",
            email=DEMO_EMAIL,
            password_hash=get_password_hash("demo1234"),
            role="user",
            is_demo=True,
            is_active=True,
            last_login=datetime.now(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    seed_demo_data(user.id, db)
    return _make_token(user, is_demo=True)


@router.post("/demo-admin", response_model=TokenResponse)
def demo_admin_login(db: Session = Depends(get_db)):
    """Quick 1-click login into the Administrator account."""
    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            name="System Administrator",
            email=ADMIN_EMAIL,
            password_hash=get_password_hash("admin1234"),
            role="admin",
            is_demo=False,
            is_active=True,
            last_login=datetime.now(),
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    seed_demo_data(admin.id, db)
    return _make_token(admin, is_demo=False)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get profile of authenticated user."""
    return current_user


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update profile details (name, email)."""
    if payload.name:
        current_user.name = payload.name
    if payload.email and payload.email != current_user.email:
        if db.query(User).filter(User.email == payload.email, User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Email already taken.")
        current_user.email = payload.email

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change account password."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect.")

    current_user.password_hash = get_password_hash(payload.new_password)
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action="password_change",
        details={"status": "success"}
    ))
    db.commit()
    return {"message": "Password changed successfully."}
