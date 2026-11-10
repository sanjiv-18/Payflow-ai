import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
    JSON,
    Integer,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


class User(Base):
    """Represents a user of PayFlow AI with RBAC permissions."""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    # Role: admin or user
    role = Column(String(50), default="user", nullable=False)
    subscription_tier = Column(String(50), default="professional", nullable=False)
    persona = Column(String(50), default="business", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_demo = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    corrections = relationship("InvoiceCorrectionHistory", back_populates="user")
    activities = relationship("ActivityLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reports = relationship("GeneratedReport", back_populates="user")


class Invoice(Base):
    """Represents an invoice managed by PayFlow AI with comprehensive GST & OCR fields."""

    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Invoice Metadata
    invoice_number = Column(String(100), nullable=False, index=True)
    invoice_date = Column(String(20))
    due_date = Column(String(20))
    po_number = Column(String(100), default="")
    invoice_type = Column(String(50), default="Tax Invoice")  # Tax Invoice, Proforma, Bill of Supply
    payment_terms = Column(String(100), default="Net 30")
    currency = Column(String(10), default="USD")
    
    # Seller Information
    vendor_name = Column(String(255), nullable=False, index=True)
    vendor_address = Column(Text, default="")
    vendor_gstin = Column(String(30), default="")
    vendor_pan = Column(String(20), default="")
    vendor_email = Column(String(100), default="")
    vendor_phone = Column(String(50), default="")
    
    # Buyer Information
    buyer_name = Column(String(255), default="")
    buyer_address = Column(Text, default="")
    buyer_gstin = Column(String(30), default="")
    buyer_contact = Column(String(100), default="")

    # Financial & Tax Summary
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    other_charges = Column(Float, default=0.0)
    total_tax = Column(Float, default=0.0)
    amount = Column(Float, nullable=False)  # Grand Total Payable
    description = Column(Text, default="")

    # Review Statuses: pending_review, processing, reviewed, corrected, approved, rejected, payment_pending, paid
    # Workflow status reflecting invoice lifecycle stages
    # Possible values: uploaded, processing, review_required, verified, approved, scheduled_for_payment, paid, rejected
    status = Column(String(50), default="uploaded", index=True)
    # History of status changes with timestamps for auditability
    workflow_history = Column(JSON, default=list, nullable=False)
    
    # Risk Analysis
    risk_score = Column(Float, default=0.0)  # 0 to 100
    risk_level = Column(String(20), default="low")  # low, medium, high
    ai_recommendation = Column(Text, default="")

    # OCR Pipeline Telemetry
    ocr_confidence = Column(Float, default=0.95)
    ocr_engine = Column(String(50), default="PyMuPDF + Vision Agent")
    file_path = Column(String(500))
    is_demo = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    raw_ocr = relationship("OCRExtractionResult", back_populates="invoice", uselist=False, cascade="all, delete-orphan")
    corrections = relationship("InvoiceCorrectionHistory", back_populates="invoice", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="invoice", cascade="all, delete-orphan")
    analyses = relationship("AIAnalysis", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLineItem(Base):
    """Represents an itemized line item inside an invoice with HSN/SAC and GST breakdown."""

    __tablename__ = "invoice_line_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    hsn_sac = Column(String(50), default="")
    quantity = Column(Float, default=1.0)
    unit = Column(String(20), default="pcs")
    unit_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax_rate = Column(Float, default=18.0)  # e.g., 18% GST
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)

    invoice = relationship("Invoice", back_populates="line_items")


class OCRExtractionResult(Base):
    """Stores raw, unmodified OCR output separately to preserve original document truth."""

    __tablename__ = "ocr_extraction_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False, unique=True, index=True)
    raw_text = Column(Text, default="")
    raw_json = Column(JSON, default=dict)
    bounding_boxes = Column(JSON, default=list)
    ocr_engine = Column(String(50), default="PaddleOCR-VL 1.6 / PyMuPDF")
    confidence_scores = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoice = relationship("Invoice", back_populates="raw_ocr")


class InvoiceCorrectionHistory(Base):
    """Maintains an audit trail of every manual or AI correction made to an invoice."""

    __tablename__ = "invoice_correction_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    field_name = Column(String(100), nullable=False)
    original_value = Column(Text)
    corrected_value = Column(Text)
    correction_reason = Column(String(255), default="Manual OCR Review Correction")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoice = relationship("Invoice", back_populates="corrections")
    user = relationship("User", back_populates="corrections")


class Transaction(Base):
    """Represents a verified PayPal payment transaction linked to an invoice."""

    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    paypal_order_id = Column(String(255), unique=True)
    paypal_capture_id = Column(String(255))
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    # Status: pending, completed, failed, cancelled
    status = Column(String(50), default="pending")
    payment_method = Column(String(50), default="PayPal Sandbox B2B Gateway")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    captured_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="transactions")
    invoice = relationship("Invoice", back_populates="transactions")


class AIAnalysis(Base):
    """Stores deep risk and compliance findings for an invoice."""

    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(20), default="low")
    findings = Column(JSON, default=list)
    recommendation = Column(Text, default="")
    model_name = Column(String(100), default="PayFlow Risk Engine v4.2")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoice = relationship("Invoice", back_populates="analyses")


class ActivityLog(Base):
    """Immutable audit trail of user, document, payment, and administrative activities."""

    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # login, upload, ocr_process, correction, report_generate, payment_complete, etc.
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="activities")


class Notification(Base):
    """User notifications and alerts for invoice processing, risk flags, and payment deadlines."""

    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # success, warning, error, info
    is_read = Column(Boolean, default=False, index=True)
    link = Column(String(255), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class GeneratedReport(Base):
    """Metadata for generated PDF and CSV business intelligence and tax reports."""

    __tablename__ = "generated_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    report_type = Column(String(100), nullable=False)  # monthly_invoice, gst_summary, vendor_wise, payment_history, risk_analysis
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    parameters = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")
