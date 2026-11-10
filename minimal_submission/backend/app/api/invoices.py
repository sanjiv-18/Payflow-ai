"""
Invoice Management & OCR Review Router for PayFlow AI.

Features:
- Full CRUD for invoices with line items and GST breakdown
- Raw immutable OCR extraction storage
- Audit trail & Invoice Correction History (tracking field changes)
- Status management (Pending Review, Reviewed, Corrected, Approved, Rejected, Payment Pending, Paid)
- JSON export & Activity Logging
"""

import os
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import (
    Invoice, User, InvoiceLineItem, OCRExtractionResult,
    InvoiceCorrectionHistory, ActivityLog, Notification
)
from app.schemas.schemas import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    CorrectionHistoryResponse, OCRExtractionResponse
)
from app.core.deps import get_current_user
from app.services.invoice_service import process_invoice_document

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 45 * 1024 * 1024  # 45 MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"}


def _serialize_invoice(inv: Invoice) -> dict:
    return {
        "id": inv.id,
        "user_id": inv.user_id,
        "invoice_number": inv.invoice_number,
        "invoice_date": inv.invoice_date,
        "due_date": inv.due_date,
        "po_number": inv.po_number or "",
        "invoice_type": inv.invoice_type or "Tax Invoice",
        "payment_terms": inv.payment_terms or "Net 30",
        "currency": inv.currency,
        
        "vendor_name": inv.vendor_name,
        "vendor_address": inv.vendor_address or "",
        "vendor_gstin": inv.vendor_gstin or "",
        "vendor_pan": inv.vendor_pan or "",
        "vendor_email": inv.vendor_email or "",
        "vendor_phone": inv.vendor_phone or "",
        
        "buyer_name": inv.buyer_name or "",
        "buyer_address": inv.buyer_address or "",
        "buyer_gstin": inv.buyer_gstin or "",
        "buyer_contact": inv.buyer_contact or "",

        "subtotal": inv.subtotal or 0.0,
        "discount": inv.discount or 0.0,
        "cgst": inv.cgst or 0.0,
        "sgst": inv.sgst or 0.0,
        "igst": inv.igst or 0.0,
        "other_charges": inv.other_charges or 0.0,
        "total_tax": inv.total_tax or 0.0,
        "amount": inv.amount,
        "description": inv.description or "",

        "status": inv.status,
        "risk_score": inv.risk_score or 0.0,
        "risk_level": inv.risk_level or "low",
        "ai_recommendation": inv.ai_recommendation or "",
        "ocr_confidence": inv.ocr_confidence or 0.95,
        "ocr_engine": inv.ocr_engine or "PaddleOCR-VL 1.6 / PyMuPDF",
        "file_path": inv.file_path,
        "is_demo": inv.is_demo,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "updated_at": inv.updated_at.isoformat() if inv.updated_at else None,

        "line_items": [
            {
                "id": li.id,
                "invoice_id": li.invoice_id,
                "description": li.description,
                "hsn_sac": li.hsn_sac or "",
                "quantity": li.quantity,
                "unit": li.unit or "pcs",
                "unit_price": li.unit_price,
                "discount": li.discount,
                "tax_rate": li.tax_rate,
                "tax_amount": li.tax_amount,
                "total_amount": li.total_amount,
            }
            for li in inv.line_items
        ],
        "corrections": [
            {
                "id": ch.id,
                "invoice_id": ch.invoice_id,
                "user_id": ch.user_id,
                "field_name": ch.field_name,
                "original_value": ch.original_value,
                "corrected_value": ch.corrected_value,
                "correction_reason": ch.correction_reason,
                "created_at": ch.created_at.isoformat() if ch.created_at else None,
            }
            for ch in inv.corrections
        ]
    }


@router.get("")
def list_invoices(
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve invoices for the authenticated user with multi-field search and filters."""
    q = db.query(Invoice).filter(Invoice.user_id == current_user.id)

    if status and status != "All":
        q = q.filter(Invoice.status.ilike(status))
    if risk_level and risk_level != "All Levels":
        q = q.filter(Invoice.risk_level.ilike(risk_level))
    if search:
        pattern = f"%{search}%"
        q = q.filter(
            Invoice.invoice_number.ilike(pattern)
            | Invoice.vendor_name.ilike(pattern)
            | Invoice.description.ilike(pattern)
            | Invoice.vendor_gstin.ilike(pattern)
        )

    sort_col = getattr(Invoice, sort_by, Invoice.created_at)
    if sort_order == "desc":
        q = q.order_by(sort_col.desc())
    else:
        q = q.order_by(sort_col.asc())

    total = q.count()
    invoices = q.offset(skip).limit(limit).all()
    return {"total": total, "items": [_serialize_invoice(i) for i in invoices]}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a structured invoice with optional line items and raw OCR link."""
    invoice_dict = payload.model_dump(exclude={"line_items"})
    invoice = Invoice(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **invoice_dict,
    )
    db.add(invoice)
    db.flush()

    # Save Line Items
    if payload.line_items:
        for item in payload.line_items:
            li = InvoiceLineItem(
                id=str(uuid.uuid4()),
                invoice_id=invoice.id,
                **item.model_dump(),
            )
            db.add(li)

    # Log Activity
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action="upload",
        details={"invoice_number": invoice.invoice_number, "vendor_name": invoice.vendor_name, "amount": invoice.amount}
    ))

    # Trigger Notification if high risk
    if invoice.risk_level == "high":
        db.add(Notification(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            title="High-Risk Invoice Ingested",
            message=f"Invoice {invoice.invoice_number} flagged for review ({invoice.ai_recommendation[:60]}...)",
            type="error",
            link="/invoices"
        ))

    db.commit()
    db.refresh(invoice)
    return _serialize_invoice(invoice)


@router.post("/upload")
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Multimodal OCR upload endpoint:
    - Preprocesses image/PDF
    - Extracts OCR text & bounding coordinates
    - Extracts structured GST, vendor, line items, and totals
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'. Supported: PDF, PNG, JPG, JPEG, TIFF.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 45 MB limit.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    saved_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_name)
    with open(file_path, "wb") as f:
        f.write(content)

    # Process Document through OCR Engine
    extracted, raw_text, bounding_boxes = process_invoice_document(file_path, file.filename or saved_name)

    # Log Activity
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action="ocr_process",
        details={"filename": file.filename, "engine": "PaddleOCR-VL 1.6 / PyMuPDF", "confidence": extracted.get("ocr_confidence", 0.95)}
    ))
    db.commit()

    return {
        "file_path": file_path,
        "filename": file.filename,
        "raw_text_preview": raw_text[:600] if raw_text else "",
        "bounding_boxes": bounding_boxes[:30],
        "extracted": extracted,
        "demo_mode": False,
    }


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single invoice details with line items and modification audit history."""
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return _serialize_invoice(inv)


@router.patch("/{invoice_id}")
def update_invoice(
    invoice_id: str,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update invoice fields and automatically record changes in InvoiceCorrectionHistory.
    Preserves original OCR values and tracks audit trail.
    """
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    update_dict = payload.model_dump(exclude_none=True, exclude={"correction_reason", "line_items"})
    reason = payload.correction_reason or "Manual Review Correction"

    # Track field-level modifications
    for field, new_val in update_dict.items():
        old_val = getattr(inv, field, None)
        if old_val != new_val and old_val is not None:
            # Record in correction history
            history = InvoiceCorrectionHistory(
                id=str(uuid.uuid4()),
                invoice_id=inv.id,
                user_id=current_user.id,
                field_name=field,
                original_value=str(old_val),
                corrected_value=str(new_val),
                correction_reason=reason,
            )
            db.add(history)
            # If modified by user, mark status as corrected unless approved
            if inv.status in ("pending_review", "processing"):
                inv.status = "corrected"

        setattr(inv, field, new_val)

    # Optional line items replacement
    if payload.line_items is not None:
        db.query(InvoiceLineItem).filter(InvoiceLineItem.invoice_id == inv.id).delete()
        for item in payload.line_items:
            li = InvoiceLineItem(
                id=str(uuid.uuid4()),
                invoice_id=inv.id,
                **item.model_dump(),
            )
            db.add(li)

    # Log Activity
    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action="correction",
        details={"invoice_id": inv.id, "fields_changed": list(update_dict.keys()), "reason": reason}
    ))

    db.commit()
    db.refresh(inv)
    return _serialize_invoice(inv)


@router.get("/{invoice_id}/corrections", response_model=List[CorrectionHistoryResponse])
def get_invoice_corrections(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full revision history and original vs corrected values."""
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return (
        db.query(InvoiceCorrectionHistory)
        .filter(InvoiceCorrectionHistory.invoice_id == invoice_id)
        .order_by(InvoiceCorrectionHistory.created_at.desc())
        .all()
    )


@router.get("/{invoice_id}/raw-ocr")
def get_raw_ocr(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve immutable raw OCR payload."""
    raw = db.query(OCRExtractionResult).filter(OCRExtractionResult.invoice_id == invoice_id).first()
    if not raw:
        return {"raw_text": "", "raw_json": {}, "bounding_boxes": [], "ocr_engine": "PaddleOCR-VL 1.6"}
    return {
        "id": raw.id,
        "invoice_id": raw.invoice_id,
        "raw_text": raw.raw_text,
        "raw_json": raw.raw_json,
        "bounding_boxes": raw.bounding_boxes,
        "ocr_engine": raw.ocr_engine,
        "confidence_scores": raw.confidence_scores,
        "created_at": raw.created_at.isoformat() if raw.created_at else None,
    }


@router.get("/{invoice_id}/export-json")
def export_invoice_json(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download clean JSON representation of structured invoice."""
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return JSONResponse(content=_serialize_invoice(inv))


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an invoice (only if not paid)."""
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    if inv.status == "paid":
        raise HTTPException(status_code=400, detail="Cannot delete a settled invoice.")

    db.add(ActivityLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action="delete",
        details={"invoice_id": inv.id, "invoice_number": inv.invoice_number}
    ))
    db.delete(inv)
    db.commit()
