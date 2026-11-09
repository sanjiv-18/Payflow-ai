# PayFlow AI — API Documentation

Interactive Swagger documentation is available at `http://127.0.0.1:8000/api/docs`.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Create a new user account.
- **Request Body**:
  ```json
  { "name": "Jane Doe", "email": "jane@example.com", "password": "password123" }
  ```
- **Response** `201 Created`:
  ```json
  { "access_token": "...", "token_type": "bearer", "user": { ... } }
  ```

### `POST /api/auth/login`
Authenticate with email and password.
- **Request Body**:
  ```json
  { "email": "jane@example.com", "password": "password123" }
  ```
- **Response** `200 OK`:
  ```json
  { "access_token": "...", "token_type": "bearer", "user": { ... } }
  ```

### `POST /api/auth/demo`
One-click demo login. Seeds 5 realistic sample invoices and returns an authenticated JWT.

---

## 2. Invoices (`/api/invoices`)

### `GET /api/invoices`
List invoices with filtering and pagination.
- **Query Parameters**:
  - `status` (`pending`, `approved`, `paid`, `overdue`, `on_hold`, `rejected`)
  - `risk_level` (`low`, `medium`, `high`)
  - `search` (text search across vendor, number, description)
  - `skip`, `limit`

### `POST /api/invoices/upload`
Upload an invoice file (PDF, PNG, JPG, JPEG, max 10MB).
- **Form Data**: `file`
- **Response**: Extracted structured metadata, OCR preview, and AI extraction results.

### `PATCH /api/invoices/{id}`
Update invoice fields or review status.

### `DELETE /api/invoices/{id}`
Delete an unpaid invoice.

---

## 3. AI Services (`/api/ai`)

### `POST /api/ai/analyze-invoice`
Run hybrid deterministic + AI risk evaluation on a specific invoice.
- **Request**: `{ "invoice_id": "uuid" }`
- **Response**:
  ```json
  {
    "risk_score": 70.0,
    "risk_level": "high",
    "findings": [
      "Duplicate invoice number 'INV-2025-088' found in prior period."
    ],
    "recommendation": "Hold for review before payment.",
    "model_name": "gemini-1.5-flash"
  }
  ```

### `POST /api/ai/payment-plan`
Generate prioritized payment schedule given an optional budget.
- **Request**: `{ "budget": 5000.0 }`

### `POST /api/ai/chat`
Ask natural language questions about existing invoices and finances.
- **Request**:
  ```json
  {
    "message": "Which invoices are overdue?",
    "history": []
  }
  ```

---

## 4. Payments (`/api/payments`)

### `POST /api/payments/create-order`
Creates a PayPal Sandbox order for an approved invoice.
- **Request**: `{ "invoice_id": "uuid" }`
- **Response**:
  ```json
  {
    "order_id": "...",
    "transaction_id": "...",
    "amount": 450.0,
    "currency": "USD"
  }
  ```

### `POST /api/payments/capture-order`
Executes server-side capture and verification with PayPal.
- **Request**: `{ "order_id": "...", "invoice_id": "uuid" }`
- **Response**:
  ```json
  {
    "success": true,
    "capture_id": "...",
    "amount": 450.0,
    "captured_at": "..."
  }
  ```

### `GET /api/payments`
Lists all transaction records and captured payment audit logs.
