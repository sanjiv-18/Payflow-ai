# PayFlow AI — Enterprise Invoice Intelligence & Payment Automation Platform

> **PayPal AI Hackathon 2026 Submission**  
> *From Invoice to Intelligence to Payment.*

PayFlow AI is an enterprise-oriented invoice intelligence and payment automation platform designed to streamline invoice processing, financial risk assessment, Indian GST compliance, payment planning, and verified PayPal settlements.

The platform combines multimodal document extraction, deterministic financial validation, AI-powered risk analysis, intelligent payment recommendations, and human-authorized payment execution through an integrated web dashboard.

---

## 1. System Architecture

```text
                  ┌──────────────────────────────────────────────┐
                  │        PayFlow AI Enterprise Suite           │
                  └──────────────────────┬───────────────────────┘
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │             React / Vite Frontend             │
                  │  Dashboard | Invoices | Planner | Reports     │
                  │  Analytics | Assistant | Checkout | Admin     │
                  └──────────────────────┬───────────────────────┘
                                         │
                                  REST API Requests
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │                FastAPI Backend                │
                  └──────────────────────┬───────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
┌─────────▼──────────┐       ┌───────────▼──────────┐       ┌──────────▼─────────┐
│ Document Intelligence│     │ Financial Intelligence│     │ Payment Automation │
├─────────────────────┤     ├──────────────────────┤     ├─────────────────────┤
│ PDF / Image Upload  │     │ Risk Assessment      │     │ Payment Planner     │
│ PaddleOCR-VL        │     │ Duplicate Detection  │     │ PayPal REST API     │
│ PyMuPDF             │     │ GST Validation       │     │ Order Creation      │
│ Image Preprocessing │     │ HSN / SAC Validation │     │ Verified Capture    │
│ OCR Extraction      │     │ AI Risk Explanations │     │ Transaction Ledger  │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
          │                              │                              │
          └──────────────────────────────┼──────────────────────────────┘
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │             Supporting Services              │
                  ├──────────────────────────────────────────────┤
                  │ PayFlow AI Copilot | GST Intelligence        │
                  │ Audit Reports | Notifications | RBAC         │
                  │ Invoice History | Financial Analytics        │
                  └──────────────────────┬───────────────────────┘
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │                 Data Storage                  │
                  │                 SQLite Database               │
                  └──────────────────────────────────────────────┘
```

---

## 2. Core Capabilities

### 2.1 Advanced Multimodal OCR Engine

- **Supported Formats:** Scanned PDF, PNG, JPG, JPEG, TIFF, handwritten bills, and digital invoices.
- **Document Preprocessing:** Automatic deskewing, contrast enhancement, grayscale binarization, and noise filtering using Pillow.
- **Multi-Engine Extraction:** PyMuPDF vector extraction combined with PaddleOCR-VL 1.6 extraction heuristics.
- **Structured Data Recognition:** Extracts vendor information, invoice numbers, dates, payable totals, and other financial fields.
- **Immutable OCR Storage:** Preserves original extraction results separately in `ocr_extraction_results`.
- **Editable Extraction Results:** Allows users to review and correct extracted invoice information.

### 2.2 Invoice Review & Correction Management

- Invoice lifecycle management with the following statuses:
  - Pending Review
  - Processing
  - Reviewed
  - Corrected
  - Approved
  - Rejected
  - Payment Pending
  - Paid
- Field-level correction tracking.
- Records original OCR values and corrected values.
- Maintains editor identity, timestamps, and correction justification.
- Preserves invoice revision history in `invoice_correction_history`.

### 2.3 Intelligent Risk & Fraud Analysis Engine

**Dual-Layer Risk Assessment (0–100 Score)**

The platform combines deterministic financial validation with contextual AI-generated explanations.

| Risk Indicator | Risk Score |
|---|---:|
| Duplicate Invoice Number | +40 |
| Duplicate Vendor and Amount | +30 |
| Inconsistent Invoice Dates | +20 |
| High-Value Single Disbursement | +15 |
| Arithmetic Variance | +15 |

Additional capabilities:

- GSTIN checksum and format validation.
- Duplicate invoice collision detection.
- Vendor and amount matching.
- Invoice date and due-date consistency checks.
- Subtotal and tax arithmetic validation.
- Contextual risk explanations using Google Gemini 1.5 Flash.
- Recommended human verification actions.

### 2.4 Indian GST & Tax Intelligence

- Automatic identification of intra-state and inter-state transactions.
- **Intra-State Transactions:** CGST + SGST.
- **Inter-State Transactions:** IGST.
- HSN/SAC code tracking at line-item level.
- Tax rate categorization:
  - 0%
  - 5%
  - 12%
  - 18%
  - 28%
- Vendor-wise tax breakdown.
- Monthly GST collection and tax analytics.
- Input Tax Credit (ITC) reconciliation features.

### 2.5 Smart Payment Planner & Cash Flow Optimizer

The intelligent payment planner evaluates invoices against available treasury budgets and payment priorities.

**Payment Classification:**

- **Pay Now:** Low or medium-risk invoices with immediate deadlines and available budget.
- **Review First:** High-value invoices or invoices with missing tax information.
- **Schedule Later:** Invoices that can be deferred according to payment terms.
- **Hold for Verification:** Duplicate invoices or suspicious banking information.

Additional capabilities:

- Dynamic budget allocation.
- Invoice prioritization.
- Payment deadline evaluation.
- Financial recommendation explanations.
- Cash-flow optimization.

**Human-in-the-Loop Guardrail:** AI recommendations do not independently authorize or execute payments. Explicit human approval is mandatory.

### 2.6 PayPal Payment Automation

Integration with the official PayPal REST API v2 Sandbox.

**Payment Workflow:**

1. Server-side PayPal order creation.
2. Strict invoice amount binding.
3. Human authorization and approval.
4. Server-side payment capture.
5. Capture status, amount, and currency verification.
6. Transaction archival in the payment ledger.

Key endpoints:

```http
POST /api/payments/create-order
POST /api/payments/capture-order
```

Additional capabilities:

- PayPal Sandbox integration.
- Verified transaction records.
- Idempotency protection against duplicate settlement.
- Payment history tracking.
- No simulated successful payments without verified server-side capture.

### 2.7 PayFlow Intelligence Copilot

Conversational financial assistant powered by Gemini / Claude.

Capabilities:

- Natural-language financial queries.
- Outstanding invoice analysis.
- Cash-flow summaries.
- GST allocation queries.
- Duplicate invoice alerts.
- Vendor expenditure analysis.
- Database-context-based responses.

Example queries:

```text
Which invoices are overdue?

What is our total IGST exposure?

Show invoices with high risk scores.

Which vendors have the highest expenditure?
```

### 2.8 Audit-Grade PDF Report Generation

Powered by **ReportLab 5.1**.

The platform generates five financial and compliance reports:

| Report | Report Identifier |
|---|---|
| Monthly Billing & Payables Audit | `monthly_invoice` |
| Indian GST Tax Intelligence Return | `gst_summary` |
| Vendor Expenditure Analysis | `vendor_wise` |
| PayPal Settlement & Treasury Ledger | `payment_history` |
| High-Risk & Duplicate Fraud Audit | `risk_analysis` |

Reports include executive summaries, KPI tables, financial breakdowns, and cryptographic digital seals as specified by the reporting module.

### 2.9 Administration & Role-Based Access Control

- Administrator and standard-user roles.
- Backend-enforced role-based permissions.
- User activation and deactivation.
- Administrator privilege assignment.
- System-wide activity audit logs.
- Login, upload, correction, report, and payment activity tracking.

### 2.10 Notification Center

- Real-time notification tray.
- Unread notification counts.
- High-risk invoice alerts.
- Overdue invoice notifications.
- Early payment discount alerts.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | SQLite |
| OCR Engine | PaddleOCR-VL 1.6, PyMuPDF |
| Image Processing | Pillow |
| AI Integration | Google Gemini 1.5 Flash, Claude |
| Financial Intelligence | Deterministic Risk Engine |
| Payment Gateway | PayPal REST API v2 Sandbox |
| PDF Generation | ReportLab 5.1 |
| Authentication | JWT, Role-Based Access Control |

---

## 4. Visual Design System

### Premium Emerald Dark Mode

PayFlow AI follows a premium fintech-inspired dark interface designed for enterprise financial operations.

| Design Element | Color |
|---|---|
| Main Canvas | `#0B0F14` |
| Sidebar & Header | `#101820` |
| Cards & Surfaces | `#151F29` |
| Elevated Panels | `#1B2933` |
| Structural Borders | `#263640` |
| Primary Accent | `#10B981` |
| Secondary Accent | `#34D399` |
| Main Text | `#F8FAFC` |
| Muted Text | `#94A3B8` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |

---

## 5. Customer Personas & Dedicated Experiences

### Freelancers

- Invoice status tracking.
- Payment due-date monitoring.
- Client payment receipts.
- Monthly expense summaries.

### Small Businesses

- Vendor relationship management.
- AI Payment Decision Agent.
- Invoice risk analysis.
- GST input tax analytics.
- Executive financial reports.

### Accountants & Auditors

- Bulk document ingestion.
- Editable OCR fields with confidence scores.
- Invoice correction history.
- GST tax summaries.
- Audit-ready PDF reports.

---

## 6. Subscription & Pricing Model

The platform proposes four subscription tiers.

| Tier | Proposed Pricing | Limits | Entitlements |
|---|---|---|---|
| Free Community | $0/month | 10 invoices, 1 seat | Multi-engine OCR, basic checks, single PayPal checkout |
| Starter | $19 / ₹1,499 per month | 60 invoices, 2 seats | CGST/SGST breakdown, audit logs, standard reports |
| Professional | $49 / ₹3,999 per month | 300 invoices, 5 seats | IGST, ITC reconciliation, AI payment decisions, batch PayPal |
| Business | $99 / ₹7,999 per month | Unlimited | Multi-user RBAC, compliance exports, dedicated OCR queue |

*Pricing and entitlements represent the proposed subscription model.*

---

## 7. Local Development Setup

### 7.1 Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Git

### 7.2 Clone the Repository

```bash
git clone https://github.com/sanjiv-18/Payflow-ai.git

cd Payflow-ai
```

### 7.3 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment.

**Windows:**

```powershell
venv\Scripts\activate
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Initialize the database:

```bash
python migrate_db.py
```

Start the FastAPI backend:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend API:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 7.4 Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend application:

```text
http://localhost:5173
```

---

## 8. Automated Testing & Verification

Run the dedicated product verification script:

```bash
cd backend

python verify_product.py
```

The verification script covers nine verification modules and reports the overall test results.

### Frontend Build Verification

```bash
cd frontend

npm run build
```

---

## 9. Pre-Seeded Test Credentials

The application provides pre-seeded accounts for demonstration and testing.

| Role | Email | Password |
|---|---|---|
| System Administrator | `admin@payflow.ai` | `admin1234` |
| Demo Executive | `demo@payflow.ai` | `demo1234` |

**Administrator Access:**
- User management.
- Global activity logs.
- System health information.

**Demo Executive Access:**
- Invoice processing.
- Payment planning.
- Financial analytics.
- Risk analysis.

*These are demonstration credentials. Replace default passwords and configure secure authentication credentials before any production deployment. Never publish real credentials or API secrets.*

---

## 10. PayPal Sandbox Integration

### Configuration

1. Visit the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Create or select a Sandbox application.
3. Obtain the Sandbox Client ID and Client Secret.
4. Configure the following variables in `backend/.env`:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

5. Navigate to the Invoices or Payment Planner section.
6. Select invoices and initiate the payment workflow.
7. Navigate to the Checkout page.
8. Verify that the environment is set to `PayPal Sandbox Rail`.
9. Complete the mandatory Human-in-the-Loop Sign-off.
10. Select **Approve & Release**.
11. Verify the server-side capture response and transaction record.
12. Review the transaction in the Payments section.

**Important:** Payments must be verified through the PayPal Sandbox capture workflow. A successful simulated response must not be treated as a completed payment.

---

## 11. Complete Hackathon Demo Workflow

### Step 1: Landing Page

- Open `/welcome`.
- Explore the PayFlow AI introduction.
- Review the customer benefit pillars.
- Test the Freelancer, Small Business, and Accountant personas.
- Launch the live demo workspace.

### Step 2: Executive Dashboard

- Open the main dashboard.
- Review total invoices.
- Inspect estimated hours saved.
- Monitor duplicate invoices intercepted.
- Explore Indian GST metrics.
- Switch between persona views.

### Step 3: Invoice Ingestion

- Navigate to `/invoices/upload`.
- Upload a sample PDF or invoice image.
- Observe OCR extraction.
- Review extracted invoice fields and GSTIN validation.

### Step 4: Invoice Review & Correction

- Open `/invoices`.
- Select an invoice and choose Inspect & Edit.
- Review extraction confidence and risk explanations.
- Modify invoice fields where necessary.
- Provide correction justification.
- Verify the modification audit history.

### Step 5: AI Payment Planning

- Navigate to `/planner`.
- Enter the available treasury budget.
- Run the AI optimization process.
- Review Pay Now, Hold, and Defer recommendations.

### Step 6: PayPal Payment Execution

- Open `/checkout`.
- Review the payment authorization.
- Complete mandatory human approval.
- Execute the PayPal Sandbox capture.
- Verify the payment transaction.

### Step 7: Audit Report Generation

- Navigate to `/reports`.
- Select a report category.
- Generate the required financial or GST report.
- Download the generated PDF.

### Step 8: AI Intelligence Copilot

- Open `/assistant`.
- Ask financial questions.
- Review answers grounded in database context.

### Step 9: Subscription Plans

- Navigate to `/plans`.
- Explore the proposed subscription tiers.
- Test USD/INR currency switching.
- Explore annual discount options.

---

## 12. Verified Integration Tests

The following verification scenarios are documented for the project.

| Test Scenario | Verification Method |
|---|---|
| FastAPI Backend Initialization | `GET /api/docs` |
| Vite Frontend Development Server | `GET /` |
| JWT Authentication & RBAC | `POST /api/auth/login` |
| ReportLab PDF Generation | `POST /api/reports/generate` |
| OCR Pipeline & Preprocessing | PyMuPDF text and vector extraction |
| PayPal Sandbox Order Creation | PayPal Sandbox REST API |
| Deterministic Risk Engine | Six-vector mathematical assertions |
| TypeScript Compilation | `npm run build` |

---

## 13. Security & Safe Payment Guidelines

1. **Human-in-the-Loop Authorization:** AI recommendations cannot independently authorize or execute financial disbursements.
2. **Payment Verification:** Payment status must be based on verified server-side PayPal capture responses.
3. **Duplicate Payment Protection:** Idempotency mechanisms help prevent duplicate settlement.
4. **Role-Based Access Control:** Administrative and standard-user permissions are enforced through backend endpoints.
5. **Invoice Auditability:** Original OCR extraction and manual correction history are maintained separately.
6. **Credential Protection:** PayPal Client Secrets and other sensitive configuration values must remain server-side and must not be committed to GitHub.
7. **Financial Validation:** Invoice arithmetic, GST information, duplicate identifiers, and payment conditions are checked before payment recommendations.

---

## 14. Project Highlights

- Multimodal invoice intelligence.
- AI-assisted financial risk analysis.
- Indian GST and HSN/SAC intelligence.
- Intelligent payment prioritization.
- Verified PayPal Sandbox integration.
- Human-authorized financial operations.
- Conversational financial intelligence.
- Audit-oriented PDF report generation.
- Role-based administrative management.
- Premium enterprise fintech dashboard.

---

## 15. License

This project is licensed under the MIT License.

See [LICENSE](LICENSE) for additional details.

---

**PayFlow AI — From Invoice to Intelligence to Payment.**
