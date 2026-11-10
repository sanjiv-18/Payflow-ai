"""
Reports Router for PayFlow AI.

Generates and downloads audit-ready PDF reports:
- Monthly billing & invoice summary
- GST & Tax intelligence summary
- Vendor-wise expenditure
- Settlement & payment ledger
- Risk & fraud analysis
"""

import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import User, Invoice, Transaction, GeneratedReport, ActivityLog
from app.schemas.schemas import ReportCreate, ReportResponse
from app.core.deps import get_current_user
from app.services.report_service import generate_pdf_report

router = APIRouter()


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a PDF report from live database records."""
    # Fetch user invoices
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    inv_dicts = [
        {
            "invoice_number": inv.invoice_number,
            "vendor_name": inv.vendor_name,
            "amount": inv.amount,
            "currency": inv.currency,
            "invoice_date": inv.invoice_date,
            "due_date": inv.due_date,
            "status": inv.status,
            "risk_level": inv.risk_level,
            "subtotal": inv.subtotal,
            "cgst": inv.cgst,
            "sgst": inv.sgst,
            "igst": inv.igst,
            "total_tax": inv.total_tax,
        }
        for inv in invoices
    ]

    title = payload.title or f"{payload.report_type.replace('_', ' ').title()} Report"
    
    try:
        pdf_path = generate_pdf_report(
            report_type=payload.report_type,
            title=title,
            user_name=current_user.name,
            invoices=inv_dicts,
            parameters={"period": payload.period}
        )
        file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0

        report_record = GeneratedReport(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            report_type=payload.report_type,
            title=title,
            file_path=pdf_path,
            file_size_bytes=file_size,
            parameters={"period": payload.period}
        )
        db.add(report_record)

        # Log Activity
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            action="report_generate",
            details={"report_type": payload.report_type, "title": title}
        ))

        db.commit()
        db.refresh(report_record)
        return report_record

    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {exc}")


@router.get("", response_model=List[ReportResponse])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all generated reports for the current user."""
    return (
        db.query(GeneratedReport)
        .filter(GeneratedReport.user_id == current_user.id)
        .order_by(GeneratedReport.created_at.desc())
        .all()
    )


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download a generated PDF report file."""
    report = (
        db.query(GeneratedReport)
        .filter(GeneratedReport.id == report_id, GeneratedReport.user_id == current_user.id)
        .first()
    )
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report document not found.")

    return FileResponse(
        path=report.file_path,
        filename=os.path.basename(report.file_path),
        media_type="application/pdf",
    )
