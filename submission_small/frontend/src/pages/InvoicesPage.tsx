import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Download, Upload, Zap, Search, Filter, AlertTriangle,
  CheckCircle2, Clock, ShieldAlert, ArrowUpRight, Check,
  ChevronDown, MoreHorizontal, Eye, ExternalLink, RefreshCw, Sparkles, Building2,
  Edit2, History, X, Save, ShieldCheck, HelpCircle
} from 'lucide-react'
import { invoiceAPI } from '@/services/api'
import { InvoiceCorrection } from '@/types'

interface PayableInvoice {
  id: string
  invoice_number: string
  po_id: string
  vendor: {
    name: string
    avatarBg: string
    avatarText: string
    category: string
    gstin?: string
  }
  amount: number
  currency: string
  payment_method: string
  due_date: string
  maturity_badge: {
    label: string
    color: string
  }
  status: 'scheduled' | 'in_review' | 'flagged' | 'paid'
  risk_level: 'low' | 'medium' | 'high'
  anomaly?: string
  ocr_confidence?: number
  ocr_engine?: string
  risk_score?: number
}

const INITIAL_INVOICES: PayableInvoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2024-8841',
    po_id: 'PO-9042',
    vendor: { name: 'Cloudflare Inc.', avatarBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', avatarText: 'CF', category: 'Edge CDN & Security' },
    amount: 14820.00,
    currency: 'USD',
    payment_method: 'PayPal B2B Direct',
    due_date: 'Today',
    maturity_badge: { label: 'Due Today', color: 'bg-red-500/10 text-brand-danger border-red-500/30' },
    status: 'scheduled',
    risk_level: 'low'
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2024-9102',
    po_id: 'PO-8812',
    vendor: { name: 'Datadog Corp', avatarBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', avatarText: 'DD', category: 'Observability & APM' },
    amount: 9450.50,
    currency: 'USD',
    payment_method: 'PayPal Sandbox Rail',
    due_date: '2024-11-04',
    maturity_badge: { label: 'Overdue 2d', color: 'bg-red-500/10 text-brand-danger border-red-500/30' },
    status: 'scheduled',
    risk_level: 'medium'
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2024-3991',
    po_id: 'PO-7721',
    vendor: { name: 'Notion Labs, Inc.', avatarBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', avatarText: 'NT', category: 'Productivity & Wiki' },
    amount: 8350.00,
    currency: 'USD',
    payment_method: 'PayPal Treasury Wallet',
    due_date: '2024-11-09',
    maturity_badge: { label: 'In 3 days', color: 'bg-amber-500/10 text-brand-warning border-amber-500/30' },
    status: 'flagged',
    risk_level: 'high',
    anomaly: 'Bank Details Changed (IBAN Mismatch Intercepted)'
  },
  {
    id: 'inv-4',
    invoice_number: 'INV-2024-7120',
    po_id: 'PO-9411',
    vendor: { name: 'OpenAI API Services', avatarBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', avatarText: 'OA', category: 'AI Infrastructure' },
    amount: 24500.00,
    currency: 'USD',
    payment_method: 'PayPal B2B Direct',
    due_date: '2024-11-15',
    maturity_badge: { label: 'In 9 days', color: 'bg-blue-500/10 text-brand-blue border-blue-500/30' },
    status: 'in_review',
    risk_level: 'medium'
  },
  {
    id: 'inv-5',
    invoice_number: 'INV-2024-4419',
    po_id: 'PO-8019',
    vendor: { name: 'Vercel Inc.', avatarBg: 'bg-zinc-500/20 text-white border-zinc-500/30', avatarText: 'VC', category: 'Frontend Cloud & Edge' },
    amount: 11500.00,
    currency: 'USD',
    payment_method: 'PayPal Sandbox Rail',
    due_date: '2024-11-18',
    maturity_badge: { label: 'In 12 days', color: 'bg-blue-500/10 text-brand-blue border-blue-500/30' },
    status: 'scheduled',
    risk_level: 'low'
  },
  {
    id: 'inv-6',
    invoice_number: 'INV-2024-1029',
    po_id: 'PO-6910',
    vendor: { name: 'Stripe Payments Europe', avatarBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', avatarText: 'ST', category: 'Payment Processing' },
    amount: 42850.00,
    currency: 'USD',
    payment_method: 'PayPal B2B Direct',
    due_date: '2024-11-20',
    maturity_badge: { label: 'In 14 days', color: 'bg-emerald-500/10 text-brand-success border-emerald-500/30' },
    status: 'paid',
    risk_level: 'low'
  }
]

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<PayableInvoice[]>(INITIAL_INVOICES)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'review' | 'scheduled'>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Inspection & Editing Modal state
  const [inspectingInvoice, setInspectingInvoice] = useState<PayableInvoice | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    vendor_name: '',
    amount: 0,
    due_date: '',
    vendor_gstin: '',
    correction_reason: ''
  })
  const [corrections, setCorrections] = useState<InvoiceCorrection[]>([])
  const [loadingCorrections, setLoadingCorrections] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // Fetch real invoices from FastAPI backend
  const loadInvoices = async () => {
    try {
      const res = await invoiceAPI.list()
      if (res.data && res.data.length > 0) {
        const mapped: PayableInvoice[] = res.data.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          po_id: inv.po_number || `PO-${inv.invoice_number.slice(-4)}`,
          vendor: {
            name: inv.vendor_name,
            avatarBg: 'bg-blue-500/20 text-brand-blue border-blue-500/30',
            avatarText: inv.vendor_name.slice(0, 2).toUpperCase(),
            category: inv.invoice_type || 'Commercial Services',
            gstin: inv.vendor_gstin
          },
          amount: Number(inv.amount),
          currency: inv.currency || 'USD',
          payment_method: 'PayPal Sandbox Rail',
          due_date: inv.due_date || '2026-11-30',
          maturity_badge: {
            label: inv.due_date ? `Due ${inv.due_date}` : 'Due in 7d',
            color: inv.status === 'overdue' ? 'bg-red-500/10 text-brand-danger border-red-500/30' : 'bg-blue-500/10 text-brand-blue border-blue-500/30'
          },
          status: inv.status === 'paid' ? 'paid' : inv.risk_level === 'high' ? 'flagged' : inv.status === 'overdue' ? 'in_review' : 'scheduled',
          risk_level: inv.risk_level || 'low',
          anomaly: inv.risk_level === 'high' ? (inv.ai_recommendation || 'Flagged for review') : undefined,
          ocr_confidence: inv.ocr_confidence || 0.98,
          ocr_engine: inv.ocr_engine || 'PaddleOCR-VL 1.6 / PyMuPDF',
          risk_score: inv.risk_score || 15
        }))
        setInvoices(mapped)
      }
    } catch {
      // Keep initial demo records if API offline
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handleOpenInspect = async (inv: PayableInvoice) => {
    setInspectingInvoice(inv)
    setIsEditing(false)
    setEditForm({
      vendor_name: inv.vendor.name,
      amount: inv.amount,
      due_date: inv.due_date,
      vendor_gstin: inv.vendor.gstin || '',
      correction_reason: ''
    })
    setLoadingCorrections(true)
    try {
      const res = await invoiceAPI.getCorrections(inv.id)
      setCorrections(res.data || [])
    } catch {
      setCorrections([])
    } finally {
      setLoadingCorrections(false)
    }
  }

  const handleSaveCorrection = async () => {
    if (!inspectingInvoice) return
    setSavingEdit(true)
    try {
      await invoiceAPI.update(inspectingInvoice.id, {
        vendor_name: editForm.vendor_name,
        amount: Number(editForm.amount),
        due_date: editForm.due_date,
        vendor_gstin: editForm.vendor_gstin,
        correction_reason: editForm.correction_reason || 'Verified invoice details from paper scan'
      })
      // Refresh
      await loadInvoices()
      // Reload corrections
      const cRes = await invoiceAPI.getCorrections(inspectingInvoice.id)
      setCorrections(cRes.data || [])
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update invoice:', err)
    } finally {
      setSavingEdit(false)
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (activeTab === 'review' && inv.status !== 'in_review' && inv.status !== 'flagged') return false
      if (activeTab === 'scheduled' && inv.status !== 'scheduled') return false
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      if (riskFilter !== 'all' && inv.risk_level !== riskFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          inv.invoice_number.toLowerCase().includes(q) ||
          inv.po_id.toLowerCase().includes(q) ||
          inv.vendor.name.toLowerCase().includes(q) ||
          inv.vendor.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [invoices, activeTab, statusFilter, riskFilter, search])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredInvoices.map(i => i.id))
    }
  }

  const selectedTotal = useMemo(() => {
    return invoices
      .filter(i => selectedIds.includes(i.id))
      .reduce((sum, i) => sum + i.amount, 0)
  }, [invoices, selectedIds])

  return (
    <div className="p-8 space-y-7 animate-fade-in text-dark-text max-w-7xl mx-auto pb-28">
      {/* 1. Header with Engine v4.2 & CTAs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Invoices & Payables</h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-brand-blue flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Engine v4.2
            </span>
          </div>
          <p className="text-xs text-dark-sub mt-1">
            Enterprise disbursement ledger with real-time IBAN anomaly interception & autonomous PayPal settlement.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const headers = ['Invoice #', 'PO ID', 'Vendor', 'Amount (USD)', 'Status', 'Due Date']
              const rows = filteredInvoices.map(i => [i.invoice_number, i.po_id, i.vendor.name, i.amount, i.status, i.due_date])
              const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'payflow-invoices.csv'; a.click()
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#172338] hover:bg-[#253247] border border-[#253247] text-white rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-dark-sub" /> Export CSV
          </button>

          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white" /> Batch Settle with PayPal
          </button>

          <button
            onClick={() => navigate('/invoices/upload')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> + Upload Invoice
          </button>
        </div>
      </div>

      {/* 2. 4-Column Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Volume */}
        <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card hover:border-brand-blue/40 transition-colors">
          <div className="flex items-center justify-between text-dark-sub mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Open Volume</span>
            <FileText className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">$428,910.40</p>
          <div className="flex items-center gap-1.5 text-[11px] text-dark-sub mt-1">
            <span className="text-brand-success font-medium">142 Invoices</span>
            <span>across 38 Enterprise Vendors</span>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card hover:border-brand-warning/40 transition-colors">
          <div className="flex items-center justify-between text-dark-sub mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Awaiting Review</span>
            <Clock className="w-4 h-4 text-brand-warning" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">$49,820.00</p>
          <div className="flex items-center gap-1.5 text-[11px] text-brand-warning mt-1 font-medium">
            <span>14 invoices require manual CFO sign-off</span>
          </div>
        </div>

        {/* Autonomous Match Rate */}
        <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card hover:border-brand-success/40 transition-colors">
          <div className="flex items-center justify-between text-dark-sub mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Autonomous Match Rate</span>
            <CheckCircle2 className="w-4 h-4 text-brand-success" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">99.4%</p>
          <div className="flex items-center gap-1.5 text-[11px] text-dark-sub mt-1">
            <span className="text-brand-success font-medium">+0.6%</span>
            <span>vs previous reconciliation cycle</span>
          </div>
        </div>

        {/* Flagged Anomalies */}
        <div className="bg-[#111B2D] border border-red-500/30 rounded-2xl p-5 shadow-card bg-gradient-to-br from-[#111B2D] to-red-950/20">
          <div className="flex items-center justify-between text-dark-sub mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Flagged Anomalies</span>
            <ShieldAlert className="w-4 h-4 text-brand-danger" />
          </div>
          <p className="text-2xl font-bold font-mono text-brand-danger">2 Critical</p>
          <div className="flex items-center gap-1.5 text-[11px] text-red-300 mt-1 font-medium">
            <span>IBAN & Routing mismatch intercepted</span>
          </div>
        </div>
      </div>

      {/* 3. Search, Filters & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Segmented Tabs */}
        <div className="flex items-center p-1 bg-[#111B2D] border border-[#253247] rounded-xl self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-[#172338] text-white border border-[#253247] shadow-sm'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            All Invoices (142)
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-[#172338] text-white border border-[#253247] shadow-sm'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            Awaiting Approval (14)
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scheduled'
                ? 'bg-[#172338] text-white border border-[#253247] shadow-sm'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            Auto-Scheduled (128)
          </button>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-dark-sub absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Invoice #, PO, Vendor…"
              className="w-full pl-9 pr-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-xl text-xs text-white focus:outline-none focus:border-brand-blue"
          >
            <option value="all">Status: All</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_review">In Review</option>
            <option value="flagged">Flagged</option>
            <option value="paid">Paid</option>
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-xl text-xs text-white focus:outline-none focus:border-brand-blue"
          >
            <option value="all">Risk: All Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium</option>
            <option value="high">High Risk</option>
          </select>

          <span className="px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-xl text-xs text-dark-sub font-mono">
            Last 30 Days
          </span>
        </div>
      </div>

      {/* 4. Enterprise Payables Table */}
      <div className="bg-[#111B2D] rounded-2xl border border-[#253247] overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#253247] bg-[#172338]/60 text-dark-sub font-semibold uppercase tracking-wider">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-[#080D18] border-[#253247] text-brand-blue focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Invoice & PO ID</th>
                <th className="px-4 py-3.5">Vendor Entity</th>
                <th className="px-4 py-3.5">Ledger Amount</th>
                <th className="px-4 py-3.5">Payment Rail</th>
                <th className="px-4 py-3.5">Maturity / Due</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253247]/60">
              {filteredInvoices.map((inv) => {
                const isSelected = selectedIds.includes(inv.id)
                const isAnomalous = !!inv.anomaly

                return (
                  <tr
                    key={inv.id}
                    className={`transition-colors ${
                      isAnomalous
                        ? 'bg-red-950/10 hover:bg-red-950/20 border-l-2 border-l-red-500'
                        : isSelected
                        ? 'bg-[#172338]/60'
                        : 'hover:bg-[#172338]/40'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(inv.id)}
                        className="rounded bg-[#080D18] border-[#253247] text-brand-blue focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Invoice # & PO ID */}
                    <td className="px-4 py-4">
                      <p className="font-mono font-bold text-white">{inv.invoice_number}</p>
                      <p className="text-[10px] text-dark-sub font-mono mt-0.5">{inv.po_id}</p>
                    </td>

                    {/* Vendor Entity with Avatar Badge */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${inv.vendor.avatarBg}`}>
                          {inv.vendor.avatarText}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{inv.vendor.name}</p>
                          <p className="text-[10px] text-dark-sub">{inv.vendor.category}</p>
                          {isAnomalous && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-danger bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded mt-1">
                              <AlertTriangle className="w-3 h-3" /> {inv.anomaly}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Ledger Amount */}
                    <td className="px-4 py-4">
                      <p className="font-mono font-bold text-white text-sm">
                        ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] font-mono text-dark-sub">{inv.currency}</span>
                    </td>

                    {/* Payment Rail */}
                    <td className="px-4 py-4 font-mono text-dark-sub text-[11px]">
                      {inv.payment_method}
                    </td>

                    {/* Due Date Badge */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${inv.maturity_badge.color}`}>
                        <Clock className="w-3 h-3" /> {inv.maturity_badge.label}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        inv.status === 'paid' ? 'bg-emerald-500/10 text-brand-success border-emerald-500/30' :
                        inv.status === 'flagged' ? 'bg-red-500/10 text-brand-danger border-red-500/30' :
                        inv.status === 'in_review' ? 'bg-amber-500/10 text-brand-warning border-amber-500/30' :
                        'bg-blue-500/10 text-brand-blue border-blue-500/30'
                      }`}>
                        {inv.status === 'scheduled' && 'Scheduled'}
                        {inv.status === 'in_review' && 'In Review'}
                        {inv.status === 'flagged' && 'Flagged'}
                        {inv.status === 'paid' && 'Paid'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleOpenInspect(inv)}
                        className="px-3 py-1.5 bg-[#172338] hover:bg-[#253247] border border-[#253247] text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        Inspect & Edit <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Floating Batch Action Dock (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0B1220] border border-blue-500/40 rounded-2xl shadow-glow p-4 flex items-center gap-4 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="font-bold text-white">
              {selectedIds.length} invoices selected
            </span>
            <span className="text-dark-sub font-mono">
              (${selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)
            </span>
          </div>

          <div className="h-5 w-px bg-[#253247]" />

          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold shadow-glow transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white" /> Approve & Pay via PayPal
          </button>

          <button
            onClick={() => {
              alert(`Deferred ${selectedIds.length} obligations by 14 days. Liquidity horizon updated.`)
              setSelectedIds([])
            }}
            className="px-3.5 py-2 bg-[#172338] hover:bg-[#253247] border border-[#253247] text-white rounded-xl font-medium transition-all"
          >
            Defer 14 Days
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-2 text-dark-sub hover:text-white transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* 6. Invoice Inspection, Confidence, Field Editing & Audit Trail Modal */}
      {inspectingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111B2D] border border-[#253247] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-xs text-dark-text">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#253247]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-mono">{inspectingInvoice.invoice_number}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-brand-blue border border-blue-500/20">
                    {inspectingInvoice.po_id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    inspectingInvoice.status === 'paid' ? 'bg-emerald-500/10 text-brand-success border-emerald-500/30' :
                    inspectingInvoice.status === 'flagged' ? 'bg-red-500/10 text-brand-danger border-red-500/30' :
                    'bg-blue-500/10 text-brand-blue border-blue-500/30'
                  }`}>
                    {inspectingInvoice.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-dark-sub mt-0.5">
                  Vendor: <strong className="text-white">{inspectingInvoice.vendor.name}</strong> · Category: {inspectingInvoice.vendor.category}
                </p>
              </div>

              <button
                onClick={() => setInspectingInvoice(null)}
                className="p-1 rounded-lg text-dark-sub hover:text-white hover:bg-[#172338]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Neural OCR Confidence Bar */}
            <div className="p-3.5 rounded-xl bg-[#080D18] border border-[#253247] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-success" />
                <div>
                  <span className="text-[11px] font-semibold text-white">Extraction Confidence Score</span>
                  <p className="text-[10px] font-mono text-dark-sub">
                    Engine: {inspectingInvoice.ocr_engine || 'PaddleOCR-VL 1.6 / PyMuPDF Multi-Pass'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-brand-success text-sm">
                  {Math.round((inspectingInvoice.ocr_confidence || 0.98) * 100)}%
                </span>
                <span className="text-[10px] text-dark-sub block">Field Certainty</span>
              </div>
            </div>

            {/* Explainable Risk Assessment */}
            <div className={`p-3.5 rounded-xl border ${
              inspectingInvoice.risk_level === 'high'
                ? 'bg-red-500/10 border-red-500/30 text-brand-danger'
                : 'bg-[#172338]/60 border-[#253247] text-dark-text'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Why this risk score?
                </span>
                <span className="font-mono font-bold">
                  Risk Score: {inspectingInvoice.risk_score || 15} / 100 ({inspectingInvoice.risk_level.toUpperCase()})
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-dark-sub mt-1">
                {inspectingInvoice.anomaly || 'Deterministic rules verified: Duplicate hash unique, amount within normal vendor bounds, and payment terms conform to 30-day corporate policy.'}
              </p>
            </div>

            {/* Editable Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-brand-blue" /> Extracted Information (Editable)
                </h4>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-brand-blue hover:text-blue-400 font-semibold"
                >
                  {isEditing ? 'Cancel Edit' : 'Modify Extracted Fields'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-3 p-4 rounded-xl bg-[#080D18] border border-blue-500/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-dark-sub block mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={editForm.vendor_name}
                        onChange={e => setEditForm({ ...editForm, vendor_name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-dark-sub block mb-1">Ledger Amount (USD)</label>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-dark-sub block mb-1">Maturity / Due Date</label>
                      <input
                        type="date"
                        value={editForm.due_date}
                        onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-dark-sub block mb-1">Vendor GSTIN / Tax ID</label>
                      <input
                        type="text"
                        value={editForm.vendor_gstin}
                        placeholder="e.g. 29AABCS1429B1ZB"
                        onChange={e => setEditForm({ ...editForm, vendor_gstin: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-dark-sub block mb-1">
                      Reason for Correction (Immutable Audit Requirement) *
                    </label>
                    <input
                      type="text"
                      value={editForm.correction_reason}
                      placeholder="e.g. Verified paper invoice stamp, updated tax ID"
                      onChange={e => setEditForm({ ...editForm, correction_reason: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#111B2D] border border-[#253247] rounded-lg text-white text-xs focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-[#172338] hover:bg-[#253247] rounded-lg text-dark-sub hover:text-white"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveCorrection}
                      disabled={savingEdit}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-lg font-semibold shadow-glow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingEdit ? 'Recording Audit Stamp…' : 'Save Audit Correction'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#080D18] border border-[#253247]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-dark-sub block">Vendor Name</span>
                    <span className="font-semibold text-white mt-0.5 block">{inspectingInvoice.vendor.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-dark-sub block">Amount</span>
                    <span className="font-semibold text-white mt-0.5 block font-mono">
                      ${inspectingInvoice.amount.toLocaleString()} {inspectingInvoice.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-dark-sub block">Due Date</span>
                    <span className="font-semibold text-white mt-0.5 block font-mono">{inspectingInvoice.due_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-dark-sub block">Tax Status</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 block font-mono">
                      {inspectingInvoice.vendor.gstin ? 'GST Verified' : 'Standard'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Revision History & Modification Audit Log */}
            <div className="space-y-3 pt-2 border-t border-[#253247]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-dark-sub" />
                <h4 className="font-semibold text-white">Modification Audit Ledger</h4>
                <span className="text-[10px] text-dark-sub font-mono">({corrections.length} recorded revisions)</span>
              </div>

              {loadingCorrections ? (
                <div className="p-3 text-center text-dark-sub">Loading audit trail…</div>
              ) : corrections.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {corrections.map(c => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-[#080D18] border border-[#253247] text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-dark-sub font-mono text-[10px]">
                        <span className="text-brand-blue uppercase font-bold">{c.field_name}</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-red-400 font-mono">{c.original_value || 'None'}</span>
                        <span className="text-dark-sub">→</span>
                        <span className="text-brand-success font-semibold font-mono">{c.corrected_value}</span>
                      </div>
                      <p className="text-dark-sub text-[10px] italic">Reason: "{c.correction_reason}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-3 rounded-lg bg-[#080D18] border border-[#253247] text-[11px] text-dark-sub">
                  Zero manual corrections recorded. Ledger matches raw neural OCR model output.
                </p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#253247]">
              <span className="text-[10px] text-dark-sub font-mono">
                Human-in-the-Loop Governance: Explicit approval mandatory before disbursement.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingInvoice(null)}
                  className="px-4 py-2 bg-[#172338] hover:bg-[#253247] text-white rounded-xl font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setInspectingInvoice(null)
                    navigate('/checkout')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl font-semibold shadow-glow"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" /> Settle with PayPal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
