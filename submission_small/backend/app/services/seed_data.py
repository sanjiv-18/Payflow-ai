"""
Comprehensive Demo Data Seeding for PayFlow AI.

Seeds:
- Admin user (admin@payflow.ai / admin1234)
- Demo user (demo@payflow.ai / demo1234)
- Multi-scenario invoices with GSTIN, line items, and risk tags
- Raw OCR Extraction records
- Correction history records
- Activity audit logs
- System notifications
"""

import uuid
import logging
from datetime import date, datetime, timedelta
from app.models.models import (
    User, Invoice, InvoiceLineItem, OCRExtractionResult,
    InvoiceCorrectionHistory, ActivityLog, Notification, Transaction
)
from app.core.security import get_password_hash
from app.database.database import SessionLocal

logger = logging.getLogger(__name__)

ADMIN_EMAIL = "admin@payflow.ai"
ADMIN_PASSWORD = "admin1234"
ADMIN_NAME = "System Administrator"

DEMO_EMAIL = "demo@payflow.ai"
DEMO_PASSWORD = "demo1234"
DEMO_NAME = "Demo Executive"


def seed_demo_data(user_id: str, db=None):
    """Seed comprehensive enterprise data."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded for this user
        count = db.query(Invoice).filter(Invoice.user_id == user_id).count()
        if count >= 4:
            return

        # 1. Clean Low-Risk SaaS Workflow (AWS Cloud Infrastructure)
        inv1 = Invoice(
            id=str(uuid.uuid4()),
            user_id=user_id,
            invoice_number="INV-2026-AWS-8821",
            invoice_date=str(date.today() - timedelta(days=5)),
            due_date=str(date.today() + timedelta(days=20)),
            po_number="PO-99410",
            invoice_type="Tax Invoice",
            payment_terms="Net 25",
            currency="USD",
            vendor_name="Amazon Web Services Inc.",
            vendor_address="410 Terry Ave N, Seattle, WA 98109",
            vendor_gstin="07AAAAA0000A1Z5",
            vendor_pan="AAAAA0000A",
            vendor_email="billing@aws.amazon.com",
            vendor_phone="+1-800-297-2690",
            buyer_name="PayFlow AI Treasury Inc.",
            buyer_address="548 Market St, San Francisco, CA",
            buyer_gstin="27AAACP1234M1Z2",
            subtotal=54200.00,
            discount=0.0,
            cgst=0.0,
            sgst=0.0,
            igst=0.0,
            total_tax=0.0,
            amount=54200.00,
            description="Dedicated Kubernetes clusters, VPC peering, and Global S3 Storage SLA",
            status="pending_review",
            risk_score=5.0,
            risk_level="low",
            ai_recommendation="Low risk. Complete audit verification passed. Recommend payment approval via PayPal B2B Batch.",
            ocr_confidence=0.99,
            ocr_engine="PaddleOCR-VL 1.6 / PyMuPDF",
            is_demo=True,
        )
        db.add(inv1)
        db.flush()

        # Add line items for inv1
        db.add(InvoiceLineItem(
            id=str(uuid.uuid4()),
            invoice_id=inv1.id,
            description="Amazon EC2 Dedicated Hosts & Kubernetes Cluster",
            hsn_sac="998313",
            quantity=1.0,
            unit="month",
            unit_price=38000.00,
            discount=0.0,
            tax_rate=0.0,
            tax_amount=0.0,
            total_amount=38000.00
        ))
        db.add(InvoiceLineItem(
            id=str(uuid.uuid4()),
            invoice_id=inv1.id,
            description="Amazon CloudFront & Global Data Transfer egress",
            hsn_sac="998315",
            quantity=1.0,
            unit="month",
            unit_price=16200.00,
            discount=0.0,
            tax_rate=0.0,
            tax_amount=0.0,
            total_amount=16200.00
        ))

        # Add raw OCR
        db.add(OCRExtractionResult(
            id=str(uuid.uuid4()),
            invoice_id=inv1.id,
            raw_text="AMAZON WEB SERVICES INC.\nINVOICE: INV-2026-AWS-8821\nAmount Due: $54,200.00 USD\nTerms: Net 25",
            raw_json={"vendor": "Amazon Web Services", "amount": 54200.00, "inv_no": "INV-2026-AWS-8821"},
            bounding_boxes=[{"page": 1, "bbox": [50, 100, 200, 140], "text": "AMAZON WEB SERVICES INC."}],
            ocr_engine="PaddleOCR-VL 1.6",
            confidence_scores={"vendor": 0.99, "amount": 0.99, "invoice_number": 0.98}
        ))

        # 2. Yield Maximizer with Indian GST Breakdown (Apex Technologies Solutions)
        inv2 = Invoice(
            id=str(uuid.uuid4()),
            user_id=user_id,
            invoice_number="INV-2026-APEX-9902",
            invoice_date=str(date.today() - timedelta(days=3)),
            due_date=str(date.today() + timedelta(days=12)),
            po_number="PO-88120",
            invoice_type="Tax Invoice",
            payment_terms="2/10 Net 30",
            currency="USD",
            vendor_name="Apex Enterprise Solutions Pvt Ltd",
            vendor_address="Cyber City, Tower B, Gurugram, Haryana",
            vendor_gstin="06AABCA1234F1Z9",
            vendor_pan="AABCA1234F",
            vendor_email="accounts@apextech.io",
            vendor_phone="+91-124-4902100",
            buyer_name="PayFlow AI Global Operations",
            buyer_address="Bengaluru, Karnataka",
            buyer_gstin="29AAACP9999M1Z8",
            subtotal=24000.00,
            discount=480.00,
            cgst=0.0,
            sgst=0.0,
            igst=4233.60,
            total_tax=4233.60,
            amount=27753.60,
            description="Enterprise ERP Modernization & API Gateway Integration",
            status="reviewed",
            risk_score=12.0,
            risk_level="low",
            ai_recommendation="Early settlement advantage (+2% rebate = $480.00 savings). Settle within discount window.",
            ocr_confidence=0.97,
            ocr_engine="PaddleOCR-VL 1.6 / PyMuPDF",
            is_demo=True,
        )
        db.add(inv2)
        db.flush()

        db.add(InvoiceLineItem(
            id=str(uuid.uuid4()),
            invoice_id=inv2.id,
            description="ERP API Integration & Cloud Microservices Suite",
            hsn_sac="998314",
            quantity=1.0,
            unit="project",
            unit_price=24000.00,
            discount=480.00,
            tax_rate=18.0,
            tax_amount=4233.60,
            total_amount=27753.60
        ))

        # 3. High-Risk Duplicate & Tampered Bank Details (Notion Labs Inc)
        inv3 = Invoice(
            id=str(uuid.uuid4()),
            user_id=user_id,
            invoice_number="INV-2026-NL-441",
            invoice_date=str(date.today() - timedelta(days=2)),
            due_date=str(date.today() + timedelta(days=5)),
            po_number="PO-77401",
            invoice_type="Tax Invoice",
            payment_terms="Net 15",
            currency="USD",
            vendor_name="Notion Labs Inc.",
            vendor_address="2300 Harrison St, San Francisco, CA",
            vendor_gstin="",
            vendor_pan="",
            vendor_email="finance@makenotion.com",
            vendor_phone="+1-415-555-0192",
            buyer_name="PayFlow AI Inc.",
            buyer_address="548 Market St, San Francisco, CA",
            subtotal=14200.00,
            discount=0.0,
            cgst=0.0,
            sgst=0.0,
            igst=0.0,
            total_tax=0.0,
            amount=14200.00,
            description="Enterprise Grid Collaboration 250 Seats Renewal",
            status="rejected",
            risk_score=85.0,
            risk_level="high",
            ai_recommendation="⚠️ FRAUD ALERT: Detected unauthorized routing change from verified SVB to JPMorgan Chase #***8839. Hold payment.",
            ocr_confidence=0.94,
            ocr_engine="PaddleOCR-VL 1.6 / PyMuPDF",
            is_demo=True,
        )
        db.add(inv3)
        db.flush()

        # Add correction history
        db.add(InvoiceCorrectionHistory(
            id=str(uuid.uuid4()),
            invoice_id=inv3.id,
            user_id=user_id,
            field_name="vendor_name",
            original_value="Notion Lab Incorp",
            corrected_value="Notion Labs Inc.",
            correction_reason="OCR typo correction from visual document",
            created_at=datetime.now() - timedelta(hours=4)
        ))

        # 4. Overdue Critical Invoice (DevCore SecOps Partners)
        inv4 = Invoice(
            id=str(uuid.uuid4()),
            user_id=user_id,
            invoice_number="INV-DC-9012",
            invoice_date=str(date.today() - timedelta(days=35)),
            due_date=str(date.today() - timedelta(days=5)),
            po_number="PO-66201",
            invoice_type="Tax Invoice",
            payment_terms="Net 30",
            currency="USD",
            vendor_name="DevCore Engineering Partners",
            vendor_address="Austin, TX",
            subtotal=30000.00,
            discount=0.0,
            cgst=0.0,
            sgst=0.0,
            igst=0.0,
            total_tax=0.0,
            amount=30000.00,
            description="Specialized SecOps Penetration Testing Retainer",
            status="payment_pending",
            risk_score=35.0,
            risk_level="medium",
            ai_recommendation="Past due by 5 days. Critical security retainer subject to service pause. Prioritize immediate PayPal settlement.",
            ocr_confidence=0.98,
            ocr_engine="PaddleOCR-VL 1.6",
            is_demo=True,
        )
        db.add(inv4)
        db.flush()

        # 5. Seed Activity Logs
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            action="login",
            details={"client": "PayFlow Web Console", "method": "JWT Bearer"},
            ip_address="127.0.0.1",
            created_at=datetime.now() - timedelta(minutes=45)
        ))
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            action="ocr_process",
            details={"invoice_number": "INV-2026-AWS-8821", "engine": "PaddleOCR-VL 1.6", "confidence": 0.99},
            ip_address="127.0.0.1",
            created_at=datetime.now() - timedelta(minutes=30)
        ))
        db.add(ActivityLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            action="correction",
            details={"invoice_id": inv3.id, "field": "vendor_name", "reason": "OCR typo correction"},
            ip_address="127.0.0.1",
            created_at=datetime.now() - timedelta(minutes=15)
        ))

        # 6. Seed Notifications
        db.add(Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title="High-Risk Anomaly Detected",
            message="Notion Labs Inc. (INV-2026-NL-441) flagged for bank details mismatch.",
            type="error",
            is_read=False,
            link="/invoices"
        ))
        db.add(Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title="Early Rebate Available",
            message="Apex Enterprise Solutions invoice qualifies for $480.00 discount before Nov 10.",
            type="success",
            is_read=False,
            link="/planner"
        ))
        db.add(Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title="Overdue Invoice Warning",
            message="DevCore Engineering Partners invoice is 5 days overdue.",
            type="warning",
            is_read=True,
            link="/invoices"
        ))

        db.commit()
        logger.info("Successfully seeded PayFlow AI scenario data.")

    except Exception as exc:
        db.rollback()
        logger.error("Failed to seed demo data: %s", exc)
    finally:
        if close_db:
            db.close()


def ensure_admin_and_demo_users():
    """Ensure both the Admin user and Demo user exist in database."""
    db = SessionLocal()
    try:
        # 1. Admin
        admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                password_hash=get_password_hash(ADMIN_PASSWORD),
                role="admin",
                is_active=True,
                is_demo=False,
                last_login=datetime.now(),
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # 2. Demo User
        demo_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not demo_user:
            demo_user = User(
                id=str(uuid.uuid4()),
                name=DEMO_NAME,
                email=DEMO_EMAIL,
                password_hash=get_password_hash(DEMO_PASSWORD),
                role="user",
                is_active=True,
                is_demo=True,
                last_login=datetime.now(),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # Seed data for both
        seed_demo_data(demo_user.id, db)
        seed_demo_data(admin.id, db)

    finally:
        db.close()
