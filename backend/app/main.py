"""PayFlow AI — Enterprise-grade FastAPI application entry point."""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import engine
from app.models.models import Base
from app.api import auth, invoices, ai, payments, dashboard, admin, reports, notifications
from app.services.seed_data import ensure_admin_and_demo_users

logging.basicConfig(level=logging.INFO)

# Create all tables on startup
Base.metadata.create_all(bind=engine)
os.makedirs("uploads", exist_ok=True)
os.makedirs("reports", exist_ok=True)

# Ensure seeded Admin & Demo accounts exist
try:
    ensure_admin_and_demo_users()
except Exception as e:
    logging.warning("User seeding notice: %s", e)

app = FastAPI(
    title="PayFlow AI Enterprise API",
    description=(
        "Enterprise-grade AI-powered invoice intelligence, Indian GST tax analytics, "
        "and PayPal payment automation platform."
    ),
    version="4.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & RBAC"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices & OCR"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI & Risk Engine"])
app.include_router(payments.router, prefix="/api/payments", tags=["PayPal Payments"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Business Intelligence"])
app.include_router(reports.router, prefix="/api/reports", tags=["PDF Reports"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration & Audit"])


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "PayFlow AI Enterprise",
        "version": "4.2.0",
        "status": "running",
        "docs": "/api/docs",
        "ocr_engine": "PaddleOCR-VL 1.6 / PyMuPDF Hybrid",
        "demo_mode": settings.DEMO_MODE,
        "ai_configured": bool(settings.GEMINI_API_KEY),
        "paypal_configured": bool(settings.PAYPAL_CLIENT_ID),
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "version": "4.2.0"}
