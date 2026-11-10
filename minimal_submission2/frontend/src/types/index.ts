export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  subscription_tier?: string;
  persona?: string;
  is_active?: boolean;
  is_demo?: boolean;
  last_login?: string | null;
  created_at: string;
}

export interface InvoiceLineItem {
  id?: string;
  invoice_id?: string;
  description: string;
  hsn_sac?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number;
}

export interface InvoiceCorrection {
  id: string;
  invoice_id: string;
  user_id: string;
  field_name: string;
  original_value: string | null;
  corrected_value: string | null;
  correction_reason: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  vendor_name: string;
  description: string;
  amount: number;
  currency: string;
  invoice_date: string | null;
  due_date: string | null;
  po_number?: string;
  invoice_type?: string;
  payment_terms?: string;
  
  vendor_address?: string;
  vendor_gstin?: string;
  vendor_pan?: string;
  vendor_email?: string;
  vendor_phone?: string;
  
  buyer_name?: string;
  buyer_address?: string;
  buyer_gstin?: string;
  buyer_contact?: string;

  subtotal?: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  other_charges?: number;
  total_tax?: number;

  status: string; // pending_review, processing, reviewed, corrected, approved, rejected, payment_pending, paid
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  ai_recommendation: string;
  ocr_confidence?: number;
  ocr_engine?: string;
  file_path?: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;

  line_items?: InvoiceLineItem[];
  corrections?: InvoiceCorrection[];
}

export interface RuleCheck {
  id: string;
  name: string;
  passed: boolean;
  impact: number;
  detail: string;
}

export interface RiskAnalysisResult {
  invoice_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  rule_score: number;
  rule_checks: RuleCheck[];
  findings: string[];
  recommendation: string;
  model_name: string;
  is_real_ai: boolean;
  disclaimer: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  invoice_id: string;
  invoice_number?: string;
  vendor_name?: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  created_at: string;
  captured_at: string | null;
}

export interface PaymentRecommendation {
  invoice_id: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  currency: string;
  due_date: string;
  risk_level: 'low' | 'medium' | 'high';
  priority: number;
  recommended_action: string;
  reason: string;
}

export interface DashboardSummary {
  total_invoices: number;
  total_amount?: number;
  total_outstanding: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  high_risk_invoices: number;
  duplicates_detected?: number;
  invoices_requiring_review?: number;
  estimated_hours_saved?: number;
  avg_invoice_value?: number;
  ocr_success_rate?: number;
  correction_rate?: number;
  gst_summary?: {
    total_cgst: number;
    total_sgst: number;
    total_igst: number;
    total_tax: number;
  };
  recent_transactions: Transaction[];
  upcoming_payments: Array<{
    id: string;
    invoice_number: string;
    vendor_name: string;
    amount: number;
    currency: string;
    due_date: string;
    status: string;
    risk_level: 'low' | 'medium' | 'high';
  }>;
  monthly_data: Array<{
    month: string;
    paid: number;
    pending: number;
    overdue: number;
  }>;
  status_distribution: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  ai_insights: string[];
}

export interface GeneratedReport {
  id: string;
  user_id: string;
  report_type: string;
  title: string;
  file_path: string;
  file_size_bytes: number;
  parameters: Record<string, any>;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface ActivityLogItem {
  id: string;
  user_id?: string;
  action: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
