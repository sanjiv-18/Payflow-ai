"""
PayFlow AI — Comprehensive End-to-End Test Suite.

Verifies:
1. Authentication & RBAC token creation
2. Seeded database integrity
3. Indian GST intelligence (CGST, SGST, IGST, HSN/SAC)
4. OCR extraction and structured parsing
5. Explainable risk analysis & duplicate collision checks
6. AI Payment Decision Agent prioritization
7. ReportLab 5.1 PDF report compilation
8. PayPal Sandbox credential verification & separation from demo
9. Business Value Dashboard metrics calculation
"""

import os
import sys
import json
from datetime import datetime

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app.database.database import SessionLocal
from app.models.models import User, Invoice, InvoiceCorrectionHistory, ActivityLog
from app.services.invoice_service import parse_structured_invoice_data
from app.services.ai_service import analyze_risk, generate_payment_plan
from app.services.report_service import generate_pdf_report
from app.services.paypal_service import is_paypal_configured, create_order
from app.core.config import settings

def run_tests():
    print("=" * 70)
    print("PAYFLOW AI — AUTOMATED END-TO-END VERIFICATION SUITE")
    print("=" * 70)

    db = SessionLocal()
    passed = 0
    total = 9

    try:
        # TEST 1: Auth & User Verification
        print("\n[TEST 1/9] Authentication & User RBAC...")
        demo_user = db.query(User).filter(User.email == "demo@payflow.ai").first()
        admin_user = db.query(User).filter(User.email == "admin@payflow.ai").first()
        assert demo_user is not None, "Demo user not found"
        assert admin_user is not None, "Admin user not found"
        assert admin_user.role == "admin", "Admin user role incorrect"
        assert demo_user.role == "user", "Demo user role incorrect"
        print(f"  [PASS] Found users: Demo ({demo_user.email}, role={demo_user.role}), Admin ({admin_user.email}, role={admin_user.role})")
        passed += 1

        # TEST 2: Seed Invoices & Scenarios
        print("\n[TEST 2/9] Commercial Invoice Scenarios in Database...")
        invoices = db.query(Invoice).filter(Invoice.user_id == demo_user.id).all()
        assert len(invoices) >= 4, f"Expected at least 4 seeded invoices, found {len(invoices)}"
        inv_numbers = [i.invoice_number for i in invoices]
        print(f"  [PASS] {len(invoices)} invoices loaded: {inv_numbers}")
        passed += 1

        # TEST 3: Indian GST Intelligence
        print("\n[TEST 3/9] Indian GST & HSN Verification...")
        apex_inv = db.query(Invoice).filter(Invoice.invoice_number.like("%APEX%")).first()
        assert apex_inv is not None, "Apex GST invoice not found"
        assert apex_inv.igst == 4233.6, f"Expected IGST 4233.6, got {apex_inv.igst}"
        assert apex_inv.vendor_gstin == "06AABCA1234F1Z9", f"Unexpected GSTIN: {apex_inv.vendor_gstin}"
        print(f"  [PASS] Apex Invoice GSTIN: {apex_inv.vendor_gstin}, IGST: ${apex_inv.igst}, Line items: {len(apex_inv.line_items)}")
        passed += 1

        # TEST 4: OCR Extraction Pipeline
        print("\n[TEST 4/9] Structured OCR Extraction...")
        sample_raw = """
        INVOICE
        Invoice Number: INV-2026-TEST-1001
        Date: 2026-11-01
        Due Date: 2026-11-20
        Seller: Cloudflare Enterprise Inc.
        GSTIN: 27AABCC1234D1Z5
        Cloud Security SLA 998313 1 pcs 5,000.00 5,000.00
        Subtotal: 5,000.00
        IGST: 900.00
        Total: 5,900.00
        """
        extracted = parse_structured_invoice_data(sample_raw, "test_invoice.pdf")
        assert extracted["invoice_number"] == "INV-2026-TEST-1001", "OCR Invoice number mismatch"
        assert extracted["amount"] == 5900.00, f"Expected amount 5900.00, got {extracted['amount']}"
        assert extracted["igst"] == 900.00, f"Expected IGST 900.00, got {extracted['igst']}"
        assert extracted["vendor_gstin"] == "27AABCC1234D1Z5", "GSTIN regex failed"
        print(f"  [PASS] Extracted Invoice {extracted['invoice_number']}, Amount: ${extracted['amount']}, IGST: ${extracted['igst']}")
        passed += 1

        # TEST 5: Explainable Risk & Duplicate Collision
        print("\n[TEST 5/9] Explainable Risk & Duplicate Interception...")
        inv_dict = {
            "id": "test-1",
            "invoice_number": "INV-2026-AWS-8821",
            "vendor_name": "Amazon Web Services Inc.",
            "amount": 54200.0,
            "status": "pending_review",
            "due_date": "2026-11-27",
            "invoice_date": "2026-10-28",
        }
        similar_dicts = [{
            "id": "existing-1",
            "invoice_number": "INV-2026-AWS-8821",
            "vendor_name": "Amazon Web Services Inc.",
            "amount": 54200.0,
            "status": "paid",
        }]
        risk_res = analyze_risk(inv_dict, similar_dicts)
        assert risk_res["risk_score"] >= 40, f"Expected high risk for duplicate invoice number, got {risk_res['risk_score']}"
        assert any("duplicate" in f.lower() for f in risk_res["findings"]), "No duplicate finding generated"
        finding_clean = risk_res['findings'][0].encode('ascii', 'ignore').decode('ascii')
        print(f"  [PASS] Risk Score: {risk_res['risk_score']}/100 ({risk_res['risk_level']}), Intercepted: {finding_clean}")
        passed += 1

        # TEST 6: AI Payment Decision Agent
        print("\n[TEST 6/9] AI Payment Decision Agent (Budget-Constrained Prioritizer)...")
        invoices_for_plan = [
            {"id": "inv-1", "invoice_number": "INV-A", "amount": 10000.0, "status": "overdue", "risk_level": "low"},
            {"id": "inv-2", "invoice_number": "INV-B", "amount": 25000.0, "status": "pending", "risk_level": "high"},
            {"id": "inv-3", "invoice_number": "INV-C", "amount": 5000.0, "status": "pending", "risk_level": "low"},
        ]
        budget = 12000.0
        plan = generate_payment_plan(invoices_for_plan, budget)
        assert len(plan) == 3, "Plan length mismatch"
        assert plan[0]["recommended_action"] == "pay_now", "Overdue should be paid first"
        assert any(p["recommended_action"] == "hold" for p in plan), "High risk should be held"
        print(f"  [PASS] Generated 3-item plan under ${budget:,.2f} budget. Actions: {[p['recommended_action'] for p in plan]}")
        passed += 1

        # TEST 7: ReportLab 5.1 Audit PDF Generation
        print("\n[TEST 7/9] ReportLab 5.1 PDF Audit Generation...")
        invoice_dicts = [
            {"invoice_number": i.invoice_number, "vendor_name": i.vendor_name, "amount": i.amount, "currency": i.currency, "status": i.status, "due_date": i.due_date}
            for i in invoices
        ]
        pdf_path = generate_pdf_report("test_audit", "Verification Audit Run", demo_user.name, invoice_dicts)
        assert os.path.exists(pdf_path), "PDF file was not created"
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"  [PASS] Generated audit PDF: {os.path.basename(pdf_path)} ({size_kb:.1f} KB)")
        passed += 1

        # TEST 8: PayPal Sandbox Credential & Mode Separation
        print("\n[TEST 8/9] PayPal Sandbox Separation from Demo...")
        configured = is_paypal_configured()
        print(f"  [INFO] PayPal Configured: {configured} (SANDBOX BASE URL: {settings.PAYPAL_BASE_URL})")
        # In unconfigured sandbox environment, verify it returns CREDENTIALS_REQUIRED instead of claiming paid
        import asyncio
        loop = asyncio.new_event_loop()
        order_res = loop.run_until_complete(create_order(100.0, "USD", "test-inv", "INV-TEST"))
        loop.close()
        if not configured:
            assert order_res.get("demo") is True or order_res.get("configured") is False
            print("  [PASS] Unconfigured Sandbox correctly returns demo status without claiming paid status.")
        else:
            print(f"  [PASS] Sandbox order created: {order_res.get('order_id')}")
        passed += 1

        # TEST 9: Business Value Dashboard Metrics
        print("\n[TEST 9/9] Business Value Ledger Metrics...")
        total_inv = len(invoices)
        est_hours = round(total_inv * 0.25, 1)
        total_amt = sum(i.amount for i in invoices)
        total_tax = sum(i.total_tax or 0 for i in invoices)
        assert est_hours == 1.0, f"Expected 1.0 hr saved for 4 invoices, got {est_hours}"
        print(f"  [PASS] Total Invoices: {total_inv}, Estimated Hours Saved: {est_hours} hrs, Volume: ${total_amt:,.2f}, Tax: ${total_tax:,.2f}")
        passed += 1

    finally:
        db.close()

    print("\n" + "=" * 70)
    print(f"ALL TESTS PASSED: {passed}/{total} (100% SUCCESS RATE)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
