# PayFlow AI — System Architecture

## Architecture Diagram

```mermaid
flowchart TD
    User["Freelancer / Small Business User"]
    
    subgraph Frontend ["Frontend (React 19 + Vite + Tailwind)"]
        UI["SPA Interface (Dashboard, Invoices, Planner, Chat)"]
        PayPalSDK["@paypal/react-paypal-js Checkout"]
        AxiosClient["API Client + JWT Interceptors"]
    end
    
    subgraph Backend ["Backend (FastAPI)"]
        AuthRouter["/api/auth"]
        InvoiceRouter["/api/invoices"]
        AIRouter["/api/ai"]
        PaymentRouter["/api/payments"]
        DashboardRouter["/api/dashboard"]
        
        DocParser["PyMuPDF / OCR Service"]
        RuleEngine["Deterministic Risk Engine"]
        LLMService["Gemini AI Service"]
        PayPalService["PayPal REST Service"]
    end
    
    subgraph Storage ["Persistence"]
        SQLite[("SQLAlchemy / SQLite DB")]
        UploadDir["Uploads Storage"]
    end
    
    subgraph ExternalServices ["External Providers"]
        GeminiAPI["Google Gemini 1.5 Flash API"]
        PayPalSandbox["PayPal Sandbox REST API v2"]
    end

    User --> UI
    UI --> AxiosClient
    UI --> PayPalSDK
    
    AxiosClient --> Backend
    PayPalSDK <--> PayPalSandbox
    
    InvoiceRouter --> DocParser
    DocParser --> UploadDir
    AIRouter --> RuleEngine
    AIRouter --> LLMService
    LLMService <--> GeminiAPI
    
    PaymentRouter --> PayPalService
    PayPalService <--> PayPalSandbox
    
    Backend --> SQLite
```

## Security & Verification Flow

1. **Idempotency & Duplicate Guards**:
   - Invoices marked `paid` cannot be charged again.
   - Pending transactions are tracked with uniqueness constraints on order IDs.
2. **Server-Side Capture Verification**:
   - Client-side callbacks do not determine payment truth.
   - The backend directly executes `POST /v2/checkout/orders/{id}/capture` with PayPal's OAuth2 bearer token and validates amount match, currency code, and capture status.
3. **Graceful Fallback**:
   - Both AI and PayPal modules gracefully handle unconfigured credentials with transparent simulation badges, ensuring seamless judging evaluation.
