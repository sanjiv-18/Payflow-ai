from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────────── Auth & User Management ───────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    subscription_tier: Optional[str] = None
    persona: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str = "user"
    subscription_tier: str = "professional"
    persona: str = "business"
    is_active: bool = True
    is_demo: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    is_demo: bool = False


# ─────────────────────── Line Items ───────────────────────

class LineItemBase(BaseModel):
    description: str
    hsn_sac: Optional[str] = ""
    quantity: float = 1.0
    unit: Optional[str] = "pcs"
    unit_price: float = 0.0
    discount: float = 0.0
    tax_rate: float = 18.0
    tax_amount: float = 0.0
    total_amount: float = 0.0


class LineItemCreate(LineItemBase):
    pass


class LineItemResponse(LineItemBase):
    id: str
    invoice_id: str

    class Config:
        from_attributes = True


# ─────────────────────── Invoices ───────────────────────

class InvoiceCreate(BaseModel):
    invoice_number: str
    vendor_name: str
    description: Optional[str] = ""
    amount: float
    currency: str = "USD"
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    po_number: Optional[str] = ""
    invoice_type: Optional[str] = "Tax Invoice"
    payment_terms: Optional[str] = "Net 30"
    
    vendor_address: Optional[str] = ""
    vendor_gstin: Optional[str] = ""
    vendor_pan: Optional[str] = ""
    vendor_email: Optional[str] = ""
    vendor_phone: Optional[str] = ""
    
    buyer_name: Optional[str] = ""
    buyer_address: Optional[str] = ""
    buyer_gstin: Optional[str] = ""
    buyer_contact: Optional[str] = ""

    subtotal: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    cgst: Optional[float] = 0.0
    sgst: Optional[float] = 0.0
    igst: Optional[float] = 0.0
    other_charges: Optional[float] = 0.0
    total_tax: Optional[float] = 0.0
    status: Optional[str] = "pending_review"

    line_items: Optional[List[LineItemCreate]] = None


class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    vendor_name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    po_number: Optional[str] = None
    invoice_type: Optional[str] = None
    payment_terms: Optional[str] = None
    
    vendor_address: Optional[str] = None
    vendor_gstin: Optional[str] = None
    vendor_pan: Optional[str] = None
    vendor_email: Optional[str] = None
    vendor_phone: Optional[str] = None
    
    buyer_name: Optional[str] = None
    buyer_address: Optional[str] = None
    buyer_gstin: Optional[str] = None
    buyer_contact: Optional[str] = None

    subtotal: Optional[float] = None
    discount: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    other_charges: Optional[float] = None
    total_tax: Optional[float] = None
    
    status: Optional[str] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    ai_recommendation: Optional[str] = None
    correction_reason: Optional[str] = "Manual Field Correction"
    line_items: Optional[List[LineItemCreate]] = None


class CorrectionHistoryResponse(BaseModel):
    id: str
    invoice_id: str
    user_id: str
    field_name: str
    original_value: Optional[str]
    corrected_value: Optional[str]
    correction_reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class OCRExtractionResponse(BaseModel):
    id: str
    invoice_id: str
    raw_text: str
    raw_json: Dict[str, Any]
    bounding_boxes: List[Dict[str, Any]]
    ocr_engine: str
    confidence_scores: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    invoice_number: str
    invoice_date: Optional[str]
    due_date: Optional[str]
    po_number: Optional[str] = ""
    invoice_type: Optional[str] = "Tax Invoice"
    payment_terms: Optional[str] = "Net 30"
    currency: str
    
    vendor_name: str
    vendor_address: Optional[str] = ""
    vendor_gstin: Optional[str] = ""
    vendor_pan: Optional[str] = ""
    vendor_email: Optional[str] = ""
    vendor_phone: Optional[str] = ""
    
    buyer_name: Optional[str] = ""
    buyer_address: Optional[str] = ""
    buyer_gstin: Optional[str] = ""
    buyer_contact: Optional[str] = ""

    subtotal: float = 0.0
    discount: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    igst: float = 0.0
    other_charges: float = 0.0
    total_tax: float = 0.0
    amount: float
    description: str

    status: str
    risk_score: float
    risk_level: str
    ai_recommendation: str
    ocr_confidence: float = 0.95
    ocr_engine: str = "PyMuPDF + Vision Agent"
    file_path: Optional[str] = None
    is_demo: bool
    created_at: datetime
    updated_at: datetime

    line_items: List[LineItemResponse] = []
    corrections: List[CorrectionHistoryResponse] = []

    class Config:
        from_attributes = True


# ─────────────────────── AI & Assistant ───────────────────────

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Any]] = []


class PaymentPlanRequest(BaseModel):
    budget: Optional[float] = 5000.0
    invoice_ids: Optional[List[str]] = None


# ─────────────────────── Transactions ───────────────────────

class CreateOrderRequest(BaseModel):
    invoice_id: str


class CaptureOrderRequest(BaseModel):
    order_id: str
    invoice_id: str


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    invoice_id: str
    paypal_order_id: Optional[str]
    paypal_capture_id: Optional[str]
    amount: float
    currency: str
    status: str
    payment_method: str = "PayPal Sandbox B2B Gateway"
    created_at: datetime
    captured_at: Optional[datetime]
    invoice: Optional[InvoiceResponse] = None

    class Config:
        from_attributes = True


# ─────────────────────── Activity Log ───────────────────────

class ActivityLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    details: Dict[str, Any]
    ip_address: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────── Notifications ───────────────────────

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────── Reports ───────────────────────

class ReportCreate(BaseModel):
    report_type: str  # monthly_invoice, gst_summary, vendor_wise, payment_history, risk_analysis
    period: Optional[str] = "30d"
    title: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    user_id: str
    report_type: str
    title: str
    file_path: str
    file_size_bytes: int
    parameters: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
