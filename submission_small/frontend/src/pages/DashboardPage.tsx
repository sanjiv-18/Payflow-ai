import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, DollarSign, CheckCircle2, Clock, AlertTriangle, ShieldAlert,
  TrendingUp, ArrowUpRight, Sparkles, RefreshCw, Plus, ArrowRight, ShieldCheck,
  Briefcase, Building2, Calculator, Layers, HelpCircle, FileSpreadsheet, Info
} from 'lucide-react'
import { dashboardAPI } from '@/services/api'
import { DashboardSummary } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  pending: '#3B82F6',
  approved: '#8B5CF6',
  paid: '#22C55E',
  overdue: '#EF4444',
  on_hold: '#F59E0B',
  rejected: '#64748B'
}

function KPI({
  icon: Icon,
  label,
  value,
  sub,
  color,
  badge
}: {
  icon: any
  label: string
  value: string | number
  sub?: string
  color: string
  badge?: string
}) {
  return (
    <div className="bg-[#151F29] rounded-2xl border border-[#263640] p-5 hover:border-[#10B981]/50 transition-all duration-200 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-dark-sub uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
        <div className="flex items-center justify-between mt-1">
          {sub && <p className="text-[11px] text-dark-sub">{sub}</p>}
          {badge && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B2933] text-dark-sub border border-[#263640]">{badge}</span>}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePersona, setActivePersona] = useState<'all' | 'freelancer' | 'business' | 'accountant'>('all')
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await dashboardAPI.summary()
      setData(res.data)
    } catch {
      setError('Could not load dashboard data. Please ensure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex items-center gap-3 text-dark-sub">
        <RefreshCw className="w-5 h-5 animate-spin text-brand-blue" />
        <span className="text-sm font-medium">Aggregating financial ledger data…</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-8">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-brand-danger text-sm flex items-center justify-between">
        <span>{error}</span>
        <button onClick={load} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-semibold">
          Retry
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const pieData = data.status_distribution.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' '),
    value: s.count,
    color: STATUS_COLORS[s.status] || '#64748B'
  }))

  return (
    <div className="p-8 space-y-8 animate-fade-in text-dark-text max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Financial Overview</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-brand-blue">
              REAL-TIME
            </span>
          </div>
          <p className="text-xs text-dark-sub mt-1">
            PayFlow AI Financial Operations · {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices/upload')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" /> Upload Invoice
          </button>
          <button
            onClick={() => navigate('/planner')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B2933] hover:bg-[#263640] border border-[#263640] text-white rounded-xl text-xs font-semibold transition-all"
          >
            Payment Planner <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={load}
            className="p-2.5 bg-[#151F29] border border-[#263640] rounded-xl text-dark-sub hover:text-white transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persona Experience Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#151F29] border border-[#263640]">
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-white">
          <Layers className="w-4 h-4 text-brand-blue" />
          <span>Workflow View:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActivePersona('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activePersona === 'all'
                ? 'bg-[#1B2933] text-white font-bold border border-[#263640]'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            All-in-One Executive
          </button>
          <button
            onClick={() => setActivePersona('freelancer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activePersona === 'freelancer'
                ? 'bg-emerald-500/20 text-brand-blue font-bold border border-emerald-500/30'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Freelancer Experience</span>
          </button>
          <button
            onClick={() => setActivePersona('business')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activePersona === 'business'
                ? 'bg-teal-500/20 text-brand-mint font-bold border border-teal-500/30'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Small Business</span>
          </button>
          <button
            onClick={() => setActivePersona('accountant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activePersona === 'accountant'
                ? 'bg-emerald-500/20 text-brand-success font-bold border border-emerald-500/30'
                : 'text-dark-sub hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Accountant Console</span>
          </button>
        </div>
      </div>

      {/* Persona Contextual Guidance Banner */}
      {activePersona === 'freelancer' && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-brand-blue">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white">Freelancer Workspace Active</h4>
              <p className="text-dark-sub mt-0.5">
                Simple invoice tracking, upcoming client payment deadlines, past disbursement history, and clean expense summaries.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/invoices')}
              className="px-3 py-1.5 bg-[#172338] hover:bg-[#253247] text-white rounded-lg font-medium border border-[#253247]"
            >
              Track Due Dates
            </button>
            <button
              onClick={() => navigate('/payments')}
              className="px-3 py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-lg font-medium shadow-glow"
            >
              Payment Receipts
            </button>
          </div>
        </div>
      )}

      {activePersona === 'business' && (
        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 text-brand-violet">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white">Small Business Operations Active</h4>
              <p className="text-dark-sub mt-0.5">
                Vendor risk management, AI Payment Budget Prioritization, Indian GST input tax analytics, and board-ready financial reports.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/planner')}
              className="px-3 py-1.5 bg-brand-violet hover:bg-purple-600 text-white rounded-lg font-medium shadow-glow-violet"
            >
              AI Payment Planner
            </button>
            <button
              onClick={() => navigate('/risk-analysis')}
              className="px-3 py-1.5 bg-[#172338] hover:bg-[#253247] text-white rounded-lg font-medium border border-[#253247]"
            >
              Vendor Risk Scores
            </button>
          </div>
        </div>
      )}

      {activePersona === 'accountant' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-brand-success">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white">Accountant & Audit Console Active</h4>
              <p className="text-dark-sub mt-0.5">
                Multi-page bulk ingestion, editable OCR fields, immutable correction audit logs, CGST/SGST/IGST tax ledgers, and ReportLab PDF downloads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/invoices/upload')}
              className="px-3 py-1.5 bg-brand-success hover:bg-emerald-600 text-white rounded-lg font-medium shadow-glow"
            >
              Bulk Upload
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-3 py-1.5 bg-[#172338] hover:bg-[#253247] text-white rounded-lg font-medium border border-[#253247]"
            >
              Export PDF Audit
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPI
          icon={FileText}
          label="Total Invoices"
          value={data.total_invoices}
          sub="Commercial obligations"
          color="bg-blue-500/20 text-brand-blue border border-blue-500/30"
        />
        <KPI
          icon={DollarSign}
          label="Outstanding"
          value={`$${data.total_outstanding.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="Unpaid balance"
          color="bg-violet-500/20 text-brand-violet border border-violet-500/30"
        />
        <KPI
          icon={CheckCircle2}
          label="Paid Invoices"
          value={data.paid_invoices}
          sub="Captured transactions"
          color="bg-emerald-500/20 text-brand-success border border-emerald-500/30"
        />
        <KPI
          icon={Clock}
          label="Pending"
          value={data.pending_invoices}
          sub="Awaiting authorization"
          color="bg-sky-500/20 text-sky-400 border border-sky-500/30"
        />
        <KPI
          icon={AlertTriangle}
          label="Overdue"
          value={data.overdue_invoices}
          sub="Action required"
          color="bg-red-500/20 text-brand-danger border border-red-500/30"
          badge="High Priority"
        />
        <KPI
          icon={ShieldAlert}
          label="High Risk"
          value={data.high_risk_invoices}
          sub="Flagged by rules"
          color="bg-amber-500/20 text-brand-warning border border-amber-500/30"
        />
      </div>

      {/* 3. Business Value Dashboard — Measurable Live Metrics */}
      <div className="bg-[#111B2D] rounded-2xl border border-[#253247] p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#253247]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-blue" />
              <h2 className="text-base font-bold text-white tracking-tight">Measurable Business Value Delivered</h2>
            </div>
            <p className="text-xs text-dark-sub mt-0.5">
              Verified operational statistics computed directly from your active database records.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-success flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Honest Metrics · Zero Speculative Data</span>
          </span>
        </div>

        {data.total_invoices > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Value Card 1 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-dark-sub">Time Saved via OCR</span>
                <p className="text-xl font-extrabold text-white mt-1">
                  ~{data.estimated_hours_saved || 0} Hours
                </p>
              </div>
              <p className="text-[11px] text-dark-sub mt-2 border-t border-[#253247]/60 pt-2">
                Honest metric: Based on ~15 min manual entry & reconciliation saved per invoice across {data.total_invoices} processed documents.
              </p>
            </div>

            {/* Value Card 2 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-dark-sub">Duplicate Payments Intercepted</span>
                <p className="text-xl font-extrabold text-brand-danger mt-1">
                  {data.duplicates_detected || 0} Invoices
                </p>
              </div>
              <p className="text-[11px] text-dark-sub mt-2 border-t border-[#253247]/60 pt-2">
                {data.duplicates_detected && data.duplicates_detected > 0
                  ? `Identified hash collisions preventing accidental double payments.`
                  : `Zero duplicate invoice numbers detected. Commercial ledger is clean.`}
              </p>
            </div>

            {/* Value Card 3 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-dark-sub">Invoices Requiring Review</span>
                <p className="text-xl font-extrabold text-brand-warning mt-1">
                  {data.invoices_requiring_review || 0} Awaiting Action
                </p>
              </div>
              <p className="text-[11px] text-dark-sub mt-2 border-t border-[#253247]/60 pt-2">
                Human-in-the-loop: Invoices with high risk score, unusual amount or unconfirmed vendor details.
              </p>
            </div>

            {/* Value Card 4 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-dark-sub">Indian GST Managed</span>
                <p className="text-xl font-extrabold text-brand-success mt-1">
                  ${(data.gst_summary?.total_tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-[11px] text-dark-sub mt-2 border-t border-[#253247]/60 pt-2 font-mono">
                CGST: ${(data.gst_summary?.total_cgst || 0).toFixed(0)} | SGST: ${(data.gst_summary?.total_sgst || 0).toFixed(0)} | IGST: ${(data.gst_summary?.total_igst || 0).toFixed(0)}
              </p>
            </div>

            {/* Value Card 5 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-dark-sub">Upcoming Obligations (30d)</span>
                <p className="text-xl font-extrabold text-white mt-1">
                  {data.upcoming_payments.length} Invoices (${data.upcoming_payments.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()})
                </p>
              </div>
              <p className="text-[11px] text-dark-sub mt-2 border-t border-[#253247]/60 pt-2">
                Scheduled deadlines monitored for early payment discount capture and penalty avoidance.
              </p>
            </div>

            {/* Value Card 6 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-dark-sub">Correction Rate</span>
                <p className="text-xl font-extrabold text-brand-blue mt-1">
                  {data.correction_rate !== undefined ? `${data.correction_rate}%` : '0.0%'}
                </p>
              </div>
              <p className="text-[11px] text-dark-sub mt-2 border-t border-[#253247]/60 pt-2">
                Measures the percentage of extracted fields adjusted by human review. Keeps neural models honest.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-[#080D18] border border-[#253247] space-y-3">
            <Info className="w-8 h-8 text-dark-sub mx-auto" />
            <h3 className="text-sm font-bold text-white">No Invoices Ingested Yet</h3>
            <p className="text-xs text-dark-sub max-w-md mx-auto">
              Your business value ledger activates automatically once invoices are uploaded. All statistics reflect actual document counts with zero simulated inflation.
            </p>
            <button
              onClick={() => navigate('/invoices/upload')}
              className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-glow"
            >
              Upload First Invoice
            </button>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Payment Bar Chart */}
        <div className="lg:col-span-2 bg-[#111B2D] rounded-2xl border border-[#253247] p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-brand-blue">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Monthly Payment Volume</h3>
                <p className="text-[11px] text-dark-sub">Cash flow distribution by settlement status</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-dark-sub px-2 py-1 rounded bg-[#172338] border border-[#253247]">
              USD ($)
            </span>
          </div>

          {data.monthly_data.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthly_data} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253247" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#253247' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#253247' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#253247', borderRadius: '12px', color: '#F8FAFC', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']}
                />
                <Bar dataKey="paid" fill="#22C55E" name="Paid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#3B82F6" name="Pending" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" fill="#EF4444" name="Overdue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-dark-sub text-xs">
              No historical data available. Upload invoices to visualize trends.
            </div>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-[#111B2D] rounded-2xl border border-[#253247] p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Status Breakdown</h3>
            <span className="text-[10px] font-mono text-dark-sub">{data.total_invoices} total</span>
          </div>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="#111B2D" strokeWidth={2} />)}
                </Pie>
                <Legend iconSize={8} formatter={(v) => <span className="text-[11px] text-dark-sub">{v}</span>} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#253247', borderRadius: '12px', color: '#F8FAFC', fontSize: '12px' }}
                  formatter={(v: any) => [v, 'invoices']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-dark-sub text-xs">No distribution data</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Financial Insights Panel */}
        <div className="bg-gradient-to-br from-[#111B2D] to-[#172338] rounded-2xl border border-violet-500/30 p-6 shadow-glow-violet relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-brand-violet">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Financial Insights</h3>
            <span className="ml-auto text-[10px] font-mono text-brand-violet bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              AUTOPILOT
            </span>
          </div>

          {data.ai_insights.length > 0 ? (
            <ul className="space-y-3">
              {data.ai_insights.map((ins, i) => (
                <li key={i} className="text-xs text-dark-sub leading-relaxed flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#253247]/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-violet mt-1.5 flex-shrink-0" />
                  <span className="text-slate-200">{ins}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-dark-sub">Upload invoices to trigger automated financial intelligence.</p>
          )}
        </div>

        {/* Upcoming Payment Deadlines */}
        <div className="bg-[#111B2D] rounded-2xl border border-[#253247] p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-warning" />
              <h3 className="text-sm font-semibold text-white">Upcoming Obligations</h3>
            </div>
            <span className="text-[10px] text-dark-sub font-mono">Next 30 Days</span>
          </div>

          {data.upcoming_payments.length > 0 ? (
            <ul className="space-y-3">
              {data.upcoming_payments.map(inv => (
                <li key={inv.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#172338]/60 border border-[#253247]/60 text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-white truncate">{inv.vendor_name}</p>
                    <p className="text-[10px] text-dark-sub font-mono mt-0.5">Due: {inv.due_date}</p>
                  </div>
                  <span className="font-bold text-white font-mono flex-shrink-0">
                    ${inv.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-dark-sub text-center py-8">No impending deadlines in the next 30 days.</p>
          )}
        </div>

        {/* Recent Transactions Ledger */}
        <div className="bg-[#111B2D] rounded-2xl border border-[#253247] p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-brand-success" />
                <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              </div>
              <button onClick={() => navigate('/payments')} className="text-xs text-brand-blue hover:text-blue-400 font-medium">
                View All
              </button>
            </div>

            {data.recent_transactions.length > 0 ? (
              <ul className="space-y-3">
                {data.recent_transactions.slice(0, 5).map(tx => (
                  <li key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#172338]/60 border border-[#253247]/60 text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-white truncate">{(tx as any).vendor_name || 'Disbursement'}</p>
                      <p className="text-[10px] text-dark-sub font-mono mt-0.5">
                        {tx.created_at ? format(new Date(tx.created_at), 'MMM d, yyyy') : 'Recently'}
                      </p>
                    </div>
                    <span className={`font-bold font-mono ${tx.status === 'completed' ? 'text-brand-success' : 'text-dark-sub'}`}>
                      ${tx.amount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-dark-sub text-center py-8">No payments logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
