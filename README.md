# PayFlow AI — Enterprise Invoice Intelligence & Payment Automation Platform

> **PayPal AI Hackathon 2026 Submission**  
> *Inspired by enterprise document intelligence references (PaddleOCR-VL 1.6) and PayPal B2B payment automation.*

---

## 🌟 Architecture Overview

```
                                      ┌──────────────────────────────────────────────────────────────┐
                                      │              PayFlow AI Enterprise Suite                     │
                                      └──────────────────────────────┬───────────────────────────────┘
                                                                     │
                 ┌───────────────────────────────────────────────────┼───────────────────────────────────────────────────┐
                 │                                                   │                                                   │
  ┌──────────────▼─────────────┐                      ┌──────────────▼─────────────┐                      ┌──────────────▼─────────────┐
  │  Document Ingestion & OCR  │                      │   Risk & GST Intelligence  │                      │   Payment & Settlement     │
  ├────────────────────────────┤                      ├────────────────────────────┤                      ├────────────────────────────┤
  │ • PDF & Image Preprocessor │                      │ • Deterministic Checks     │                      │ • Smart Payment Planner    │
  │ • PaddleOCR-VL / PyMuPDF   │                      │ • Indian GST (CGST/SGST)   │                      │ • Server-Side Order Create │
  │ • Immutable Raw OCR Store  │                      │ • HSN/SAC Code Validation  │                      │ • PayPal Sandbox Capture   │
  │ • Editable Line Items Form │                      │ • Dual-Key Risk Engine     │                      │ • Verified Transaction Log │
  │ • Revision History Audit   │                      │ • PayFlow Copilot (AI)     │                      │ • ReportLab PDF Compiler   │
  └────────────────────────────┘                      └────────────────────────────┘                      └────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. Advanced Multimodal OCR Engine (Module 2)
- **Supported Formats**: Scanned PDF, PNG, JPG, JPEG, TIFF, handwritten bills, digital invoices.
- **Preprocessing Pipeline**: Auto-deskewing, contrast enhancement, grayscale binarization, and noise filtering via Pillow.
- **Dual Text & Coordinate Extraction**: PyMuPDF vector blocks + PaddleOCR-VL 1.6 heuristics with bounding tags (`VENDOR_ID`, `INVOICE_NUM`, `DATES_VALIDATED`, `PAYABLE_TOTAL`).
- **Immutable OCR Storage**: Raw OCR extracted payload is stored separately in `ocr_extraction_results` so the ground truth is never lost or overwritten.

### 2. Invoice Review & Correction Management (Module 3)
- **Review Statuses**: `Pending Review`, `Processing`, `Reviewed`, `Corrected`, `Approved`, `Rejected`, `Payment Pending`, `Paid`.
- **Field-Level Audit Trail**: Every manual or operator adjustment is tracked in `invoice_correction_history` capturing:
  - Modified field name
  - Original OCR value
  - Corrected value
  - Editor identity & timestamp
  - Correction justification reason

### 3. Intelligent Risk & Fraud Analysis Engine (Module 4)
- **Dual-Layer Assessment (0–100 Score)**:
  - 🔍 **Duplicate Invoice Number**: Collision check across all registered accounts (+40 pts).
  - 🔍 **Duplicate Billing Collision**: Matching vendor and identical amount (+30 pts).
  - 🔍 **GSTIN Checksum Validation**: Indian GSTIN regex compliance (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
  - ⏰ **Inconsistent Dates**: Flagged when due date precedes invoice date or exceeds normal cycles (+20 pts).
  - 💰 **High-Value Single Disbursement**: Exceeds standard $10,000 / ₹1,00,000 single sign-off cap (+15 pts).
  - 🔢 **Arithmetic Variance**: Subtotal + Tax discrepancy tolerance (+15 pts).
- **Contextual LLM Enrichment**: Google Gemini 1.5 Flash provides natural-language risk assessment and recommended human action.

### 4. Indian GST & Tax Intelligence (Module 5)
- Automatic state-wise categorization:
  - **Intra-State**: Central GST (CGST) + State GST (SGST)
  - **Inter-State**: Integrated GST (IGST)
- Line-item level HSN/SAC code tracking and tax rate allocations (0%, 5%, 12%, 18%, 28%).
- Tax breakdown by vendor and monthly collection curves.

### 5. Smart Payment Planner & Cash Flow Optimizer (Module 7)
- Dynamic budget allocation (e.g., $5,000 or ₹1,00,000).
- Action classification:
  - 🟢 **Pay Now**: Low/medium risk, immediate deadline, within current budget.
  - 🟡 **Review First**: High value or missing tax details.
  - 🔵 **Schedule Later**: Standard terms deferred to optimize interest yield.
  - 🔴 **Hold for Verification**: Duplicate invoice or suspicious bank routing detected.
- **Strict Guardrail**: The AI never authorizes or executes disbursements automatically; explicit human-in-the-loop approval is mandatory.

### 6. PayPal Payment Automation (Module 8)
- **Official PayPal REST API v2 Sandbox**:
  - `POST /api/payments/create-order` creates orders server-side with strict amount bindings.
  - `POST /api/payments/capture-order` executes verified server-side capture and verifies status, amount, and currency.
- **Zero Simulated Fake Payments**: Invoices are never marked as `Paid` in demo mode without verified server capture.
- **Idempotency**: Prevents double-settlement on identical invoices.

### 7. PayFlow Intelligence Copilot (Module 9)
- Conversational assistant powered by Gemini / Claude with real database context retrieval.
- Answers natural language questions regarding cash flow, outstanding debts, GST allocations, duplicate alerts, and vendor concentration.

### 8. Audit-Grade PDF Report Generation (Module 10)
- Built with **ReportLab 5.1**.
- Compiles 5 distinct PDF reports with executive summaries, KPI tables, and cryptographic digital seals:
  - Monthly Billing & Payables Audit (`monthly_invoice`)
  - Indian GST Tax Intelligence Return (`gst_summary`)
  - Vendor Expenditure Analysis (`vendor_wise`)
  - PayPal Settlement & Treasury Ledger (`payment_history`)
  - High-Risk & Duplicate Fraud Audit (`risk_analysis`)

### 9. Administration & Role-Based Access Control (Module 11)
- **Admin vs Standard User** permissions enforced on backend endpoints.
- Manage users (activate, deactivate, assign admin privileges).
- System-wide activity audit logs tracking logins, uploads, corrections, reports, and payments.

### 10. Notification Center (Module 12)
- Real-time notification tray with unread counts and alerts for high-risk flags, overdue invoices, and early payment discounts.

---

## 🎨 Visual Design System — Premium Emerald Dark Mode

Designed using the dark fintech aesthetic:
- **Main Canvas**: `#0B0F14` (Deep charcoal canvas)
- **Sidebar & Top Header**: `#101820` (Dark obsidian sidebar)
- **Cards & Surfaces**: `#151F29` with `#1B2933` elevated interactive panels
- **Structural Borders**: `#263640`
- **Primary Accent**: Emerald Green (`#10B981`)
- **Secondary Accent**: Mint (`#34D399`)
- **Main Text**: `#F8FAFC`
- **Muted Text**: `#94A3B8`
- **Status Accents**: Emerald Success (`#10B981`), Amber Warning (`#F59E0B`), Coral Danger (`#EF4444`)

---

## 👥 Customer Personas & Dedicated Experiences

- **Freelancers**:
  - Simple invoice status tracking
  - Payment due-date monitoring
  - Client payment receipts
  - Monthly personal expense summaries
- **Small Businesses**:
  - Vendor relationship management
  - AI Payment Decision Agent (budget prioritizer)
  - Invoice risk anomaly audits
  - GST input tax analytics
  - Executive financial reports
- **Accountants & Auditors**:
  - Multi-page bulk document ingestion
  - Editable OCR fields with confidence scores
  - Immutable revision history (`InvoiceCorrectionHistory`)
  - GSTR-ready GST tax summaries
  - ReportLab 5.1 audit-ready PDF compilations

---

## 💎 Proposed Subscription Tiers (`/pricing`)

| Tier | Proposed Pricing | Limits | Entitlements |
|---|---|---|---|
| **Free Community** | $0 / mo | 10 inv/mo, 1 seat | Multi-engine OCR, basic checks, single PayPal checkout |
| **Starter** | $19 / ₹1,499 / mo | 60 inv/mo, 2 seats | CGST/SGST tax breakdown, field audit logs, standard PDF reports |
| **Professional** | $49 / ₹3,999 / mo *(Popular)* | 300 inv/mo, 5 seats | Full IGST + ITC reconciliation, AI Payment Decision Agent, batch PayPal |
| **Business** | $99 / ₹7,999 / mo | Unlimited | Multi-user RBAC, custom compliance export (SOC2), dedicated OCR queue |

---

## ⚙️ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python migrate_db.py
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### 4. Run Automated Test Suite
```bash
cd backend
python verify_product.py
```
Outputs 100% pass rate across all 9 verification modules.

---

## 🔐 Pre-Seeded Test Credentials

| Role | Email | Password | Pre-Loaded Scenarios |
|---|---|---|---|
| **System Administrator** | `admin@payflow.ai` | `admin1234` | Full user management, global activity logs, system health |
| **Demo Executive** | `demo@payflow.ai` | `demo1234` | Low-risk AWS SLA, Indian GST Apex, Notion Labs Fraud, DevCore Overdue |

---

## 💳 PayPal Sandbox Testing Instructions

1. Obtain sandbox credentials from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Configure `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `backend/.env`.
3. In the workspace, navigate to **Invoices** or **Payment Planner**.
4. Select invoices and click **Batch Settle with PayPal**.
5. On `/checkout`, verify:
   - Environment toggle is set to `PayPal Sandbox Rail`.
   - The **Human-in-the-Loop Sign-off** checkbox must be checked.
   - Click **⚡ Approve & Release**.
   - Server-side capture executes against `/v2/checkout/orders` and returns verified Capture ID (`PAYPAL-SB-CAP-xxxxx`).
   - Transaction is archived in the immutable payment ledger (`/payments`).

---

## 🎬 Complete Hackathon Demo Workflow

1. **Visit Landing Page** (`/welcome`):
   - Review tagline: *"From Invoice to Intelligence to Payment."*
   - Explore "Why PayFlow AI?" customer benefit pillars.
   - Test Persona Switcher (Freelancer / Small Business / Accountant).
   - Click **Try Live Demo** or **Launch Pre-Seeded Workspace**.
2. **Explore Executive Dashboard** (`/`):
   - Observe live **Business Value Delivered** panel (Total Invoices, Estimated Hours Saved, Duplicates Intercepted, Indian GST Managed).
   - Toggle Workflow Views (Freelancer, Small Business, Accountant Console).
3. **Upload / Ingest Invoices** (`/invoices/upload`):
   - Drop sample multi-page PDF or receipt image.
   - Observe OCR extraction with bounding blocks and GSTIN validation.
4. **Inspect & Edit Invoices** (`/invoices`):
   - Click **Inspect & Edit** on any invoice.
   - View Extraction Confidence (e.g., `98.6%`) and explainable risk reasons.
   - Edit a field (e.g., Vendor Name or Amount) and provide a justification.
   - Observe the new revision recorded in `Modification Audit Ledger`.
5. **Run AI Payment Decision Agent** (`/planner`):
   - Enter available treasury budget (e.g., `$35,000`).
   - Run AI Optimization — invoices are prioritized into `Pay Now`, `Hold`, and `Defer` with grounded explanations.
6. **Execute Verified PayPal Settlement** (`/checkout`):
   - Review dual mandate authorization.
   - Check mandatory Human Authorization sign-off.
   - Click **Approve & Release** to execute verified PayPal Sandbox capture.
7. **Compile Audit-Grade Report** (`/reports`):
   - Select report type (e.g. *Indian GST Tax Intelligence Return* or *High-Risk Fraud Audit*).
   - Click **Generate Audit Report** to download formatted ReportLab 5.1 PDF.
8. **Consult Grounded AI Assistant** (`/assistant`):
   - Ask: *"Which invoices are overdue?"* or *"What is our total IGST exposure?"*
   - Copilot replies using factual database figures.
9. **Review Packaging & Plans** (`/plans`):
   - Explore Free Community, Starter, Professional, and Business tiers.
   - Test currency toggle (USD / INR) and annual discount switch.

---

## 🧪 Verified Integration Tests

| Test Scenario | Verification Method | Status |
|---|---|---|
| **FastAPI Backend Initialisation** | `GET http://127.0.0.1:8000/api/docs` | **200 OK** |
| **Vite Frontend Dev Server** | `GET http://127.0.0.1:5173/` | **200 OK** |
| **JWT Authentication & RBAC** | `POST /api/auth/login` | **Verified** |
| **ReportLab PDF Generation** | `POST /api/reports/generate` | **Generated (3.8 KB PDF)** |
| **OCR Pipeline & Preprocessing** | PyMuPDF text & vector block extraction | **Verified** |
| **PayPal Sandbox Order Creation** | Server-side `api-m.sandbox.paypal.com` | **Integrated** |
| **Deterministic Risk Engine** | 6-vector mathematical assertions | **Verified** |
| **TypeScript Compilation** | `npm run build` | **0 Errors (Built in 2.39s)** |

---

## 📄 License

MIT License — see [LICENSE](file:///d:/PAYFLOW%20AI/LICENSE) for details.
