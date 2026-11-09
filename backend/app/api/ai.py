"""AI analysis router."""

import uuid
import time
import logging
from collections import defaultdict
from datetime import date as _date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Invoice, AIAnalysis, User
from app.schemas.schemas import ChatRequest, PaymentPlanRequest
from app.core.deps import get_current_user
from app.services.ai_service import analyze_risk, generate_payment_plan, chat as ai_chat

router = APIRouter()
logger = logging.getLogger(__name__)

# Simple in-memory rate limiter (per user, per minute)
_rate_store: dict = defaultdict(list)
RATE_LIMIT = 20  # calls per minute


def _check_rate_limit(user_id: str):
    now = time.time()
    window = [t for t in _rate_store[user_id] if now - t < 60]
    _rate_store[user_id] = window
    if len(window) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="AI rate limit exceeded. Try again in a moment.")
    _rate_store[user_id].append(now)


def _invoice_to_dict(inv: Invoice) -> dict:
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "vendor_name": inv.vendor_name,
        "description": inv.description or "",
        "amount": inv.amount,
        "currency": inv.currency,
        "invoice_date": inv.invoice_date,
        "due_date": inv.due_date,
        "status": inv.status,
        "risk_score": inv.risk_score,
        "risk_level": inv.risk_level,
    }


@router.post("/analyze-invoice")
def analyze_invoice(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run AI analysis on an invoice and save results."""
    _check_rate_limit(current_user.id)
    invoice_id = payload.get("invoice_id")
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    # Gather similar invoices for duplicate detection
    similar = db.query(Invoice).filter(Invoice.user_id == current_user.id, Invoice.id != inv.id).all()
    similar_dicts = [_invoice_to_dict(s) for s in similar]

    result = analyze_risk(_invoice_to_dict(inv), similar_dicts)

    # Save AIAnalysis record
    analysis = AIAnalysis(
        id=str(uuid.uuid4()),
        invoice_id=inv.id,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        findings=result["findings"],
        recommendation=result["recommendation"],
        model_name=result["model_name"],
    )
    db.add(analysis)

    # Update invoice risk fields
    inv.risk_score = result["risk_score"]
    inv.risk_level = result["risk_level"]
    inv.ai_recommendation = result["recommendation"]

    db.commit()
    return {**result, "invoice_id": invoice_id}


@router.post("/risk-analysis")
def risk_analysis(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alias for analyze-invoice — returns risk assessment."""
    return analyze_invoice(payload, db, current_user)


@router.post("/payment-plan")
def payment_plan(
    payload: PaymentPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a payment priority plan given a budget."""
    _check_rate_limit(current_user.id)
    budget = payload.budget or 999_999.0

    if payload.invoice_ids:
        invoices = db.query(Invoice).filter(
            Invoice.id.in_(payload.invoice_ids),
            Invoice.user_id == current_user.id,
        ).all()
    else:
        invoices = db.query(Invoice).filter(
            Invoice.user_id == current_user.id,
            Invoice.status.in_(["pending", "approved", "overdue"]),
        ).all()

    invoice_dicts = [_invoice_to_dict(i) for i in invoices]
    plan = generate_payment_plan(invoice_dicts, budget)

    # Enrich plan with full invoice details
    inv_map = {i.id: i for i in invoices}
    enriched = []
    for item in plan:
        inv = inv_map.get(item.get("invoice_id"))
        if inv:
            enriched.append({
                **item,
                "invoice_number": inv.invoice_number,
                "vendor_name": inv.vendor_name,
                "amount": inv.amount,
                "currency": inv.currency,
                "due_date": inv.due_date,
                "risk_level": inv.risk_level,
            })

    return {
        "budget": budget,
        "total_outstanding": sum(i.amount for i in invoices),
        "plan": enriched,
    }


@router.post("/chat")
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI financial assistant — answers questions about the user's invoices."""
    _check_rate_limit(current_user.id)

    # Build context from actual DB data
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    total = len(invoices)
    # Exclude only truly settled invoices from the "pending" amount
    _settled = {"paid", "cancelled", "rejected"}
    pending_amount = sum(i.amount for i in invoices if i.status not in _settled)
    # An invoice is overdue if status == "overdue" OR its due_date is past and it is not settled
    _today = str(_date.today())
    overdue_count = sum(
        1 for i in invoices
        if i.status == "overdue"
        or (
            i.status not in _settled
            and i.due_date
            and str(i.due_date) < _today
        )
    )
    high_risk_count = sum(1 for i in invoices if i.risk_level == "high")

    recent_invoices = [
        {
            "invoice_number": i.invoice_number,
            "vendor": i.vendor_name,
            "amount": i.amount,
            "status": i.status,
            "due_date": i.due_date,
            "risk_level": i.risk_level,
        }
        for i in sorted(invoices, key=lambda x: x.created_at or "", reverse=True)[:5]
    ]

    context = {
        "total_invoices": total,
        "pending_amount": pending_amount,
        "overdue_count": overdue_count,
        "high_risk_count": high_risk_count,
        "recent_invoices": recent_invoices,
    }

    reply = ai_chat(payload.message, payload.history, context)
    return {"reply": reply, "context_used": True}
