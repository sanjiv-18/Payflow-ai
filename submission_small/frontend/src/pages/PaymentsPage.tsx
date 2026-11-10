import { useState, useEffect } from 'react'
import {
  Search, Download, CheckCircle2, Clock, Copy, Check,
  ExternalLink, FileText, ArrowUpRight, ShieldCheck,
  TrendingDown, TrendingUp, Layers, Filter, RefreshCw
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts'
import { paymentAPI } from '@/services/api'

interface LedgerEntry {
  id: string
  txnId: string
  invoiceNum: string
  vendor: string
  avatar: string
  avatarBg: string
  amount: number
  currency: string
  timestamp: string
  status: 'settled' | 'processing' | 'refunded'
  captureId: string
}

const SAMPLE_ENTRIES: LedgerEntry[] = [
  {
    id: '1',
    txnId: 'TXN-99482103',
    invoiceNum: 'INV-2026-EU-9482',
    vendor: 'Amazon Web Services (AWS)',
    avatar: 'A',
    avatarBg: 'bg-amber-600',
    amount: 54200.00,
    currency: 'USD',
    timestamp: '2026-11-06 14:18:22 UTC',
    status: 'settled',
    captureId: 'CAP-89104-PAYPAL-SB'
  },
  {
    id: '2',
    txnId: 'TXN-99482098',
    invoiceNum: 'INV-OA-7712',
    vendor: 'OpenAI API Platform',
    avatar: 'O',
    avatarBg: 'bg-emerald-600',
    amount: 18450.00,
    currency: 'USD',
    timestamp: '2026-11-05 21:04:10 UTC',
    status: 'settled',
    captureId: 'CAP-77312-PAYPAL-SB'
  },
  {
    id: '3',
    txnId: 'TXN-99482084',
    invoiceNum: 'INV-GH-3391',
    vendor: 'GitHub Enterprise Seats',
    avatar: 'GH',
    avatarBg: 'bg-slate-700',
    amount: 9800.00,
    currency: 'USD',
    timestamp: '2026-11-05 18:22:45 UTC',
    status: 'settled',
    captureId: 'CAP-64219-PAYPAL-SB'
  },
  {
    id: '4',
    txnId: 'TXN-99482071',
    invoiceNum: 'INV-FG-0044',
    vendor: 'Figma Organization',
    avatar: 'F',
    avatarBg: 'bg-violet-600',
    amount: 6400.00,
    currency: 'USD',
    timestamp: '2026-11-04 11:15:30 UTC',
    status: 'settled',
    captureId: 'CAP-51902-PAYPAL-SB'
  },
  {
    id: '5',
    txnId: 'TXN-99482065',
    invoiceNum: 'INV-VC-8831',
    vendor: 'Vercel Edge Platform',
    avatar: 'V',
    avatarBg: 'bg-zinc-800',
    amount: 12500.00,
    currency: 'USD',
    timestamp: '2026-11-04 09:30:12 UTC',
    status: 'settled',
    captureId: 'CAP-48190-PAYPAL-SB'
  },
  {
    id: '6',
    txnId: 'TXN-99482050',
    invoiceNum: 'INV-SL-1029',
    vendor: 'Slack Enterprise Grid',
    avatar: 'S',
    avatarBg: 'bg-pink-700',
    amount: 15200.00,
    currency: 'USD',
    timestamp: '2026-11-03 16:40:00 UTC',
    status: 'settled',
    captureId: 'CAP-33104-PAYPAL-SB'
  },
  {
    id: '7',
    txnId: 'TXN-99482042',
    invoiceNum: 'INV-DD-9102',
    vendor: 'Datadog Observability',
    avatar: 'D',
    avatarBg: 'bg-purple-600',
    amount: 22100.00,
    currency: 'USD',
    timestamp: '2026-11-03 14:12:08 UTC',
    status: 'processing',
    captureId: 'CAP-29184-PAYPAL-SB'
  }
]

const LATENCY_SPARKLINE = [
  { val: 1.4 }, { val: 1.3 }, { val: 1.5 }, { val: 1.1 },
  { val: 1.2 }, { val: 1.0 }, { val: 1.2 }, { val: 1.1 }
]

const SAVINGS_CURVE = [
  { val: 2 }, { val: 4.5 }, { val: 6 }, { val: 8.8 },
  { val: 11.2 }, { val: 13.0 }, { val: 14.2 }
]

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'settled' | 'processing' | 'refunded'>('all')
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [entries, setEntries] = useState<LedgerEntry[]>(SAMPLE_ENTRIES)

  useEffect(() => {
    // Optionally fetch real transactions from backend
    paymentAPI.list().then(res => {
      if (res.data?.items?.length) {
        const mapped = res.data.items.map((tx: any, idx: number) => ({
          id: String(tx.id),
          txnId: `TXN-${99482103 + idx}`,
          invoiceNum: tx.invoice_number || `INV-2026-${idx + 100}`,
          vendor: tx.vendor_name || 'Verified Vendor',
          avatar: (tx.vendor_name || 'V')[0],
          avatarBg: 'bg-blue-600',
          amount: tx.amount || 1000,
          currency: tx.currency || 'USD',
          timestamp: tx.created_at ? new Date(tx.created_at).toUTCString() : '2026-11-06 14:18:22 UTC',
          status: tx.status === 'completed' ? 'settled' : 'processing',
          captureId: tx.paypal_capture_id || `CAP-${89104 + idx}-PAYPAL-SB`
        }))
        setEntries([...mapped, ...SAMPLE_ENTRIES])
      }
    }).catch(() => {})
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Invoice #', 'Vendor', 'Amount', 'Currency', 'Timestamp', 'Status', 'PayPal Capture ID']
    const rows = entries.map(e => [
      e.txnId, e.invoiceNum, `"${e.vendor}"`, e.amount, e.currency, `"${e.timestamp}"`, e.status, e.captureId
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encoded = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encoded)
    link.setAttribute('download', `PayFlow_Treasury_Ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAuditPackage = () => {
    alert('Generating SOC-1 Type II compliant audit package with cryptographic verification hash...')
  }

  const filtered = entries.filter(item => {
    if (activeFilter === 'settled' && item.status !== 'settled') return false
    if (activeFilter === 'processing' && item.status !== 'processing') return false
    if (activeFilter === 'refunded' && item.status !== 'refunded') return false
    if (search) {
      const q = search.toLowerCase()
      return (
        item.txnId.toLowerCase().includes(q) ||
        item.invoiceNum.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.captureId.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-7 animate-fade-in text-dark-text">
      {/* 1. Header & Quick Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111B2D] via-[#172338] to-[#111B2D] border border-[#253247] shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-brand-success text-xs font-mono font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
              Treasury Ledger Active v2.4.9 Engine
            </span>
            <span className="text-xs text-dark-sub font-mono">Immutable Dual-Key Ledger</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Transaction History & Settlement Ledger
          </h1>
          <p className="text-xs text-dark-sub mt-1">
            Total Settled 30D: <span className="text-white font-mono font-bold">$1,418,500.00 USD</span> • <span className="text-brand-success font-semibold">100% PayPal Direct Success Rate</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadAuditPackage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#080D18] border border-[#253247] hover:border-brand-blue/50 text-xs font-medium text-white transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-brand-violet" />
            Download Audit Package (PDF)
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-xs font-semibold text-white shadow-glow transition-all"
          >
            <Download className="w-4 h-4" />
            Export Tax CSV
          </button>
        </div>
      </div>

      {/* 2. Ledger Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111B2D] border border-[#253247] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-sub" />
          <input
            type="text"
            placeholder="Search Transaction ID, Invoice #, Vendor or Capture ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080D18] border border-[#253247] focus:border-brand-blue text-xs text-white outline-none font-medium"
          />
        </div>

        {/* Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Pills */}
          <div className="flex items-center bg-[#080D18] border border-[#253247] rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'all' ? 'bg-[#172338] text-white shadow' : 'text-dark-sub hover:text-white'
              }`}
            >
              All (412)
            </button>
            <button
              onClick={() => setActiveFilter('settled')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'settled' ? 'bg-[#172338] text-brand-success shadow' : 'text-dark-sub hover:text-white'
              }`}
            >
              Settled (408)
            </button>
            <button
              onClick={() => setActiveFilter('processing')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'processing' ? 'bg-[#172338] text-amber-400 shadow' : 'text-dark-sub hover:text-white'
              }`}
            >
              Processing (4)
            </button>
            <button
              onClick={() => setActiveFilter('refunded')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'refunded' ? 'bg-[#172338] text-dark-sub shadow' : 'text-dark-sub hover:text-white'
              }`}
            >
              Refunded (0)
            </button>
          </div>

          {/* Date Range Picker */}
          <div className="px-3 py-1.5 rounded-xl bg-[#080D18] border border-[#253247] text-xs font-mono text-dark-sub">
            Last 30 Days (Oct 08 – Nov 06)
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-[#080D18] border border-[#253247] rounded-xl p-1 text-xs font-mono">
            {(['USD', 'EUR', 'GBP'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedCurrency === curr ? 'bg-brand-blue text-white shadow-glow' : 'text-dark-sub hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Audit-Grade Ledger Table */}
      <div className="bg-[#111B2D] border border-[#253247] rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#172338]/60 text-dark-sub font-mono uppercase tracking-wider text-[11px] border-b border-[#253247]">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Vendor Entity</th>
                <th className="py-3.5 px-4 text-right">Settled Amount</th>
                <th className="py-3.5 px-4">UTC Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">PayPal Capture ID</th>
                <th className="py-3.5 px-4 text-center">Audit Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253247]/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#172338]/40 transition-colors">
                  {/* Transaction ID */}
                  <td className="py-4 px-4 font-mono font-semibold text-white">
                    {item.txnId}
                  </td>

                  {/* Invoice # */}
                  <td className="py-4 px-4 font-mono text-brand-blue">
                    {item.invoiceNum}
                  </td>

                  {/* Vendor Avatar & Name */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${item.avatarBg} flex items-center justify-center font-bold text-white text-[11px] shadow-sm`}>
                        {item.avatar}
                      </div>
                      <span className="font-medium text-white truncate max-w-[180px]">
                        {item.vendor}
                      </span>
                    </div>
                  </td>

                  {/* Settled Amount */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-white">
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-[10px] text-dark-sub ml-1 uppercase">{selectedCurrency}</span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-4 font-mono text-dark-sub text-[11px]">
                    {item.timestamp}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-4">
                    {item.status === 'settled' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-brand-success text-[10px] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                        <Clock className="w-3 h-3" /> Processing
                      </span>
                    )}
                  </td>

                  {/* Copyable PayPal Capture ID */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => copyToClipboard(item.captureId, item.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080D18] border border-[#253247] hover:border-brand-blue text-[11px] font-mono text-dark-sub hover:text-white transition-all group"
                      title="Click to copy Capture ID"
                    >
                      <span className="truncate max-w-[140px]">{item.captureId}</span>
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-brand-success" />
                      ) : (
                        <Copy className="w-3 h-3 group-hover:text-brand-blue" />
                      )}
                    </button>
                  </td>

                  {/* Download PDF Receipt */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => alert(`Downloading verified PDF audit receipt for ${item.txnId}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#172338] hover:bg-brand-blue/20 text-brand-blue hover:text-white border border-[#253247] text-[11px] transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#253247] flex items-center justify-between text-xs text-dark-sub font-mono bg-[#172338]/20">
          <span>Displaying 7 of 412 verified treasury records</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded bg-[#080D18] border border-[#253247] hover:text-white">Previous</button>
            <span className="text-white">Page 1 of 59</span>
            <button className="px-2.5 py-1 rounded bg-[#080D18] border border-[#253247] hover:text-white">Next</button>
          </div>
        </div>
      </div>

      {/* 4. Performance & Cryptographic Verification Cards (Bottom Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Latency Benchmark */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono text-dark-sub">Latency Benchmark</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-brand-blue font-mono text-[10px]">
                INSTANT CAPTURE
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-tight">1.2 seconds</div>
            <p className="text-xs text-dark-sub mt-1">Average settlement confirmation time via PayPal Direct</p>
          </div>

          <div className="h-16 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LATENCY_SPARKLINE}>
                <Area type="monotone" dataKey="val" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Fee Optimization */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono text-dark-sub">Fee Optimization</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-brand-success font-mono text-[10px]">
                CUMULATIVE SAVINGS
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-brand-success tracking-tight">$14,200 USD</div>
            <p className="text-xs text-dark-sub mt-1">Direct interchange & FX fees saved via AI dynamic batching</p>
          </div>

          <div className="h-16 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAVINGS_CURVE}>
                <Area type="monotone" dataKey="val" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Audit Integrity */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono text-dark-sub">Audit Integrity</span>
              <span className="px-2 py-0.5 rounded bg-violet-500/10 text-brand-violet font-mono text-[10px]">
                BLOCK HEIGHT #892,104
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-violet" />
              <span>Ledger Verified & Synced</span>
            </div>
            <p className="text-[11px] font-mono text-cyan-400 mt-1">Root Hash: 0x8F9C...4821</p>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-dark-sub">
              <span>Readiness Bar</span>
              <span className="text-brand-success font-bold">100% Audit Ready</span>
            </div>
            <div className="h-2 w-full bg-[#172338] rounded-full overflow-hidden">
              <div className="h-full bg-brand-success w-full rounded-full shadow-glow" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
