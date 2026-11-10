"""PayPal payment router — create order, server capture, transaction history."""

import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Invoice, Transaction, User
from app.schemas.schemas import CreateOrderRequest, CaptureOrderRequest
from app.core.deps import get_current_user
from app.core.config import settings
import app.services.paypal_service as paypal

router = APIRouter()
logger = logging.getLogger(__name__)


def _tx_to_dict(tx: Transaction) -> dict:
    d = {
        "id": tx.id,
        "user_id": tx.user_id,
        "invoice_id": tx.invoice_id,
        "paypal_order_id": tx.paypal_order_id,
        "paypal_capture_id": tx.paypal_capture_id,
        "amount": tx.amount,
        "currency": tx.currency,
        "status": tx.status,
        "created_at": tx.created_at.isoformat() if tx.created_at else None,
        "captured_at": tx.captured_at.isoformat() if tx.captured_at else None,
    }
    if tx.invoice:
        d["invoice_number"] = tx.invoice.invoice_number
        d["vendor_name"] = tx.invoice.vendor_name
        d["description"] = tx.invoice.description
    return d


@router.post("/create-order")
async def create_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Validate invoice, create PayPal Sandbox order, record pending transaction."""
    inv = db.query(Invoice).filter(
        Invoice.id == payload.invoice_id,
        Invoice.user_id == current_user.id,
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    # Idempotency check: prevent duplicate payment on paid invoices
    if inv.status == "paid":
        raise HTTPException(status_code=400, detail="This invoice has already been paid.")

    # Check if PayPal Sandbox credentials are configured
    if not paypal.is_paypal_configured():
        return {
            "order_id": None,
            "configured": False,
            "demo": True,
            "invoice_number": inv.invoice_number,
            "vendor_name": inv.vendor_name,
            "amount": inv.amount,
            "currency": inv.currency,
            "message": (
                "PayPal Sandbox credentials are required to initiate real sandbox checkouts. "
                "Configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env."
            ),
        }

    # Check for existing pending transaction
    existing_tx = db.query(Transaction).filter(
        Transaction.invoice_id == inv.id,
        Transaction.status == "pending",
    ).first()
    if existing_tx and existing_tx.paypal_order_id:
        return {
            "order_id": existing_tx.paypal_order_id,
            "transaction_id": existing_tx.id,
            "amount": existing_tx.amount,
            "currency": existing_tx.currency,
            "configured": True,
            "demo": False,
            "paypal_client_id": settings.PAYPAL_CLIENT_ID,
            "invoice_number": inv.invoice_number,
            "vendor_name": inv.vendor_name,
            "message": "Resumed existing pending order.",
        }

    # Create PayPal order via official REST API
    try:
        order_result = await paypal.create_order(
            amount=inv.amount,
            currency=inv.currency,
            invoice_id=inv.id,
            invoice_number=inv.invoice_number,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    # Record pending transaction
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        invoice_id=inv.id,
        paypal_order_id=order_result["order_id"],
        amount=inv.amount,
        currency=inv.currency,
        status="pending",
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return {
        "order_id": order_result["order_id"],
        "transaction_id": tx.id,
        "amount": inv.amount,
        "currency": inv.currency,
        "configured": True,
        "demo": False,
        "paypal_client_id": settings.PAYPAL_CLIENT_ID,
        "invoice_number": inv.invoice_number,
        "vendor_name": inv.vendor_name,
    }


@router.post("/capture-order")
async def capture_order(
    payload: CaptureOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Capture PayPal order, verify server-side, mark invoice paid.
    Never marks invoices Paid in unconfigured or simulated demo mode.
    """
    if not paypal.is_paypal_configured():
        raise HTTPException(
            status_code=400,
            detail="PayPal Sandbox credentials are required to capture payments. Simulated demo checkout cannot mark invoices as Paid.",
        )

    # Find the transaction
    tx = db.query(Transaction).filter(
        Transaction.paypal_order_id == payload.order_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction record not found for this order ID.")

    if tx.status == "completed":
        raise HTTPException(status_code=400, detail="This transaction has already been captured and completed.")

    inv = db.query(Invoice).filter(Invoice.id == tx.invoice_id).first()
    if not inv or inv.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice has already been marked as paid.")

    # Server-side capture call to PayPal REST API
    try:
        capture_result = await paypal.capture_order(payload.order_id)
    except RuntimeError as exc:
        tx.status = "failed"
        db.commit()
        raise HTTPException(status_code=502, detail=str(exc))

    # Verify status
    if capture_result["status"] not in ("COMPLETED",):
        tx.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"PayPal returned capture status '{capture_result['status']}'. Payment not completed.",
        )

    # Cryptographic verification: amount and currency match
    if abs(capture_result["amount"] - inv.amount) > 0.01:
        tx.status = "failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Captured amount does not match invoice obligation.")

    if capture_result["currency"].upper() != inv.currency.upper():
        tx.status = "failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Currency mismatch in PayPal capture.")

    # Mark transaction completed with real PayPal capture ID
    tx.status = "completed"
    tx.paypal_capture_id = capture_result["capture_id"]
    tx.captured_at = datetime.now(timezone.utc)

    # Update invoice status to paid ONLY after successful server-side capture
    inv.status = "paid"

    db.commit()
    db.refresh(tx)

    return {
        "success": True,
        "transaction_id": tx.id,
        "capture_id": capture_result["capture_id"],
        "paypal_order_id": payload.order_id,
        "invoice_id": inv.id,
        "invoice_number": inv.invoice_number,
        "vendor_name": inv.vendor_name,
        "amount": inv.amount,
        "currency": inv.currency,
        "captured_at": tx.captured_at.isoformat(),
        "payer_email": capture_result.get("payer_email", ""),
    }


@router.get("")
def list_payments(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all transactions for current user."""
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"total": len(txs), "items": [_tx_to_dict(t) for t in txs]}


@router.get("/{transaction_id}")
def get_payment(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return _tx_to_dict(tx)
