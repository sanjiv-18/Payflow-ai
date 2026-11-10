import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, DollarSign, Clock, PauseCircle, CheckCircle2,
  AlertTriangle, ShieldCheck, ArrowRight, Zap, RefreshCw,
  Sliders, TrendingUp, Check, Layers, AlertCircle, ChevronRight,
  ExternalLink, CreditCard, Sparkles, Shield, BarChart3, Lock
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine
} from 'recharts'
import { aiAPI } from '@/services/api'

const HORIZON_DATA = [
  { day: 'Day 0', optimized: 1250, unoptimized: 1250, buffer: 500 },
  { day: 'Day 5', optimized: 1210, unoptimized: 1140, buffer: 500 },
  { day: 'Day 10', optimized: 1180, unoptimized: 1020, buffer: 500 },
  { day: 'Day 15', optimized: 1145, unoptimized: 910, buffer: 500 },
  { day: 'Day 20', optimized: 1105, unoptimized: 830, buffer: 500 },
  { day: 'Day 25', optimized: 1060, unoptimized: 740, buffer: 500 },
  { day: 'Day 30', optimized: 1025, unoptimized: 680, buffer: 500 },
  { day: 'Day 40', optimized: 970, unoptimized: 580, buffer: 500 },
  { day: 'Day 50', optimized: 920, unoptimized: 510, buffer: 500 },
  { day: 'Day 60', optimized: 890, unoptimized: 460, buffer: 500 },
]

interface QueueItem {
  id: string
  vendor: string
  category: string
  avatar: string
  avatarBg: string
  invoiceNum: string
  amount: number
  dueDate: string
  urgency: 'critical' | 'yield' | 'standard'
  urgencyLabel: string
  action: 'pay' | 'defer' | 'review'
  rebate?: string
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q-1',
    vendor: 'Amazon Web Services (AWS)',
    category: 'Cloud Infrastructure SLA',
    avatar: 'A',
    avatarBg: 'bg-amber-600',
    invoiceNum: 'INV-AWS-8821',
    amount: 54200.00,
    dueDate: 'In 24 hours',
    urgency: 'critical',
    urgencyLabel: 'Critical (24h)',
    action: 'pay'
  },
  {
    id: 'q-2',
    vendor: 'DevCore Engineering Partners',
    category: 'Specialized SecOps Retainer',
    avatar: 'D',
    avatarBg: 'bg-blue-600',
    invoiceNum: 'INV-DC-9012',
    amount: 30000.00,
    dueDate: 'In 48 hours',
    urgency: 'critical',
    urgencyLabel: 'Critical (48h)',
    action: 'pay'
  },
  {
    id: 'q-3',
    vendor: 'Snowflake Data Cloud',
    category: 'Enterprise Data Warehouse',
    avatar: 'S',
    avatarBg: 'bg-cyan-600',
    invoiceNum: 'INV-SNOW-4419',
    amount: 82500.00,
    dueDate: 'Nov 10 (2/10 Net 30)',
    urgency: 'yield',
    urgencyLabel: '2% Rebate Available',
    action: 'pay',
    rebate: 'Capture $1,650'
  },
  {
    id: 'q-4',
    vendor: 'Salesforce Enterprise CRM',
    category: 'Global Sales Cloud Seats',
    avatar: 'SF',
    avatarBg: 'bg-indigo-600',
    invoiceNum: 'INV-SF-2026-09',
    amount: 45000.00,
    dueDate: 'Dec 02 (Net 45)',
    urgency: 'standard',
    urgencyLabel: 'Standard Net 45',
    action: 'defer'
  }
]

export default function PlannerPage() {
  const navigate = useNavigate()
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE)
  const [simulating, setSimulating] = useState(false)
  const [tier3AutoDisburse, setTier3AutoDisburse] = useState(true)
  const [safetyBuffer, setSafetyBuffer] = useState('500,000')
  const [vendorCap, setVendorCap] = useState('100,000')
  const [toastMessage, setToastMessage] = useState('')

  const handleSimulateMatrix = () => {
    setSimulating(true)
    setTimeout(() => {
      setSimulating(false)
      setToastMessage('Liquidity matrix re-simulated. Yield optimal disbursement paths synchronized.')
    }, 600)
  }

  const handleActionChange = (id: string, action: 'pay' | 'defer' | 'review') => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, action } : item))
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-7 animate-fade-in text-dark-text">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#253247]">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Smart Payment Planner & Cash Flow Optimizer
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-medium text-brand-blue shadow-glow">
              <Zap className="w-3.5 h-3.5" />
              Algorithmic Liquidity Router Active
            </span>
          </div>
          <p className="text-xs text-dark-sub">
            Continuous cash flow modeling, high-yield rebate capture, and autonomous PayPal B2B batch disbursement scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateMatrix}
            disabled={simulating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#172338] border border-[#253247] hover:border-brand-blue/50 text-xs font-medium text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-blue ${simulating ? 'animate-spin' : ''}`} />
            <span>Re-simulate Matrix</span>
          </button>

          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-glow transition-all active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            Commit Batch Execution ($84.2k)
          </button>
        </div>
      </div>

      {/* Notifications */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-brand-success">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-dark-sub hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Core Treasury Metrics (4-Card Strip) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Treasury Reserves */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card relative overflow-hidden group hover:border-[#3B82F6]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-dark-sub">Treasury Reserves</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-brand-blue flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">$1,250,000.00</div>
          <p className="text-[11px] text-dark-sub mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-success" />
            <span>Across Mercury Vault & PayPal Business</span>
          </p>
        </div>

        {/* Pending Payables */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-dark-sub">Pending Payables</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-brand-warning flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">$384,120.00</div>
          <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1.5">
            <span>34 queued invoices • 2 overdue ($18,400)</span>
          </p>
        </div>

        {/* Projected Runway */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card relative overflow-hidden group hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-dark-sub">Projected Runway</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-brand-violet flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">14.8 Mo</div>
          <p className="text-[11px] text-dark-sub mt-1.5 flex items-center gap-1.5">
            <span className="text-brand-success font-semibold font-mono">+1.2 Mo</span>
            <span>cushion post-optimized batching</span>
          </p>
        </div>

        {/* Planner Engine Efficiency */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card relative overflow-hidden group hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-dark-sub">Planner Efficiency</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-brand-success flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">98% Optimal</div>
          <p className="text-[11px] text-brand-success mt-1.5 flex items-center gap-1 font-mono">
            <span>+$2,850 direct rebate captured</span>
          </p>
        </div>
      </div>

      {/* 3. Three-Tier Disbursement Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tier 1: Critical (24-48h) */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-red-500/30 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tier 1: Critical (24–48h)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[10px] font-bold">
                URGENT
              </span>
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 text-xs text-red-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">SLA Disruption Risk:</span>
                  AWS cloud compute & security retainers will freeze if not settled within 48h.
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold font-mono text-white tracking-tight mb-1">
              $84,200.00
            </div>
            <p className="text-xs text-dark-sub mb-4">
              4 high-priority invoices • AWS ($54.2k), DevCore ($30.0k)
            </p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-glow transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Pay Now via PayPal B2B Batch
          </button>
        </div>

        {/* Tier 2: Yield Maximizers */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-violet-500/30 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tier 2: Yield Maximizers
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-violet-500/20 text-brand-violet font-mono text-[10px] font-bold">
                2% REBATE
              </span>
            </div>

            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4 text-xs text-violet-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-violet flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">2/10 Net 30 Capture:</span>
                  Qualifies for $2,850 direct early-payment rebate when disbursed by Nov 10.
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold font-mono text-white tracking-tight mb-1">
              $142,500.00
            </div>
            <p className="text-xs text-dark-sub mb-4">
              6 invoices • Snowflake, Datadog, Stripe Gateway
            </p>
          </div>

          <button
            onClick={() => {
              setToastMessage('Scheduled Tier 2 invoices for optimal rebate release on Nov 10.')
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-violet hover:bg-violet-600 text-white text-xs font-semibold shadow-glow transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" />
            Schedule for Best Yield (Nov 10)
          </button>
        </div>

        {/* Tier 3: Standard Net 30/60 */}
        <div className="p-5 rounded-2xl bg-[#111B2D] border border-blue-500/30 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tier 3: Standard Net 30/60
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-brand-blue font-mono text-[10px] font-bold">
                TREASURY YIELD
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4 text-xs text-blue-200">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Interest Optimization:</span>
                  Retaining cash in 4.8% APY Mercury treasury generates $1,940 float income.
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold font-mono text-white tracking-tight mb-1">
              $157,420.00
            </div>
            <p className="text-xs text-dark-sub mb-4">
              24 invoices • Salesforce, Figma, Google Workspace
            </p>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#172338] border border-[#253247]">
            <span className="text-xs font-medium text-white">Auto-Disburse on Due Date</span>
            <button
              onClick={() => setTier3AutoDisburse(!tier3AutoDisburse)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                tier3AutoDisburse ? 'bg-brand-blue' : 'bg-[#253247]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  tier3AutoDisburse ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Liquidity Horizon Simulator */}
      <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#253247] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Liquidity Horizon Simulator (60-Day Runway Projection)
              </h3>
            </div>
            <p className="text-xs text-dark-sub mt-0.5">
              PayFlow AI dynamic curve preserves liquidity cushion strictly above the $500,000 threshold.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-brand-blue font-semibold">
              <span className="w-3 h-1 bg-brand-blue rounded-full" /> PayFlow AI Optimized Route
            </span>
            <span className="flex items-center gap-1.5 text-dark-sub">
              <span className="w-3 h-1 bg-slate-500 rounded-full" /> Unoptimized Settlement
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-3 h-0.5 bg-red-400 border border-dashed border-red-400" /> $500k Safety Buffer
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HORIZON_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#253247" vertical={false} />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `$${v}k`}
                domain={[300, 1400]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111B2D',
                  borderColor: '#253247',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  color: '#F8FAFC',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`$${val},000 USD`, '']}
              />
              <ReferenceLine y={500} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Minimum Reserve ($500k)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
              <Line
                type="monotone"
                dataKey="optimized"
                name="PayFlow Optimized"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3B82F6', stroke: '#111B2D', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
              <Line
                type="monotone"
                dataKey="unoptimized"
                name="Unoptimized"
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#64748B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Queue Ledger & Guardrails */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Queue Ledger (8 Cols) */}
        <div className="lg:col-span-8 bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between border-b border-[#253247] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Execution Queue Ledger
              </h3>
              <p className="text-xs text-dark-sub">Review individual vendor approvals before triggering PayPal B2B Batch</p>
            </div>
            <span className="text-xs font-mono text-dark-sub">4 Invoices Queued</span>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#172338]/60 border border-[#253247] hover:border-brand-blue/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl ${item.avatarBg} flex items-center justify-center font-bold text-white text-xs shadow-md`}>
                    {item.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{item.vendor}</span>
                      <span className="text-[10px] font-mono text-dark-sub">({item.invoiceNum})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-sub mt-0.5">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">{item.dueDate}</span>
                      {item.rebate && (
                        <>
                          <span>•</span>
                          <span className="text-brand-success font-mono font-semibold">{item.rebate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-base">
                      ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] uppercase font-mono block text-dark-sub">USD</span>
                  </div>

                  {/* Actions Selector */}
                  <div className="flex items-center rounded-xl bg-[#080D18] border border-[#253247] p-1 text-xs">
                    <button
                      onClick={() => handleActionChange(item.id, 'pay')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        item.action === 'pay'
                          ? 'bg-brand-blue text-white shadow-glow'
                          : 'text-dark-sub hover:text-white'
                      }`}
                    >
                      Pay
                    </button>
                    <button
                      onClick={() => handleActionChange(item.id, 'review')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        item.action === 'review'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-dark-sub hover:text-white'
                      }`}
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleActionChange(item.id, 'defer')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        item.action === 'defer'
                          ? 'bg-purple-500/20 text-brand-violet'
                          : 'text-dark-sub hover:text-white'
                      }`}
                    >
                      Defer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guardrails & Agent Telemetry (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Autonomous Guardrails Panel */}
          <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-brand-blue" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Autonomous Guardrails
              </h3>
            </div>
            <p className="text-xs text-dark-sub mb-4">
              Hard programmatic limits preventing over-drafts or abnormal single disbursements.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-dark-sub block mb-1">
                  Safety Cushion Floor ($)
                </label>
                <input
                  type="text"
                  value={safetyBuffer}
                  onChange={(e) => setSafetyBuffer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#253247] text-xs font-mono text-white outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-dark-sub block mb-1">
                  Per-Vendor Batch Cap ($)
                </label>
                <input
                  type="text"
                  value={vendorCap}
                  onChange={(e) => setVendorCap(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#253247] text-xs font-mono text-white outline-none focus:border-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Continuous Agent Telemetry */}
          <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-violet" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Agent Telemetry
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            </div>

            <div className="space-y-2 text-[11px] font-mono text-dark-sub">
              <div className="p-2 rounded-lg bg-[#080D18] border border-[#253247]/60 flex items-start gap-2">
                <span className="text-brand-blue">14:22:01</span>
                <span>Mercury balance synced: $1,250,000 OK</span>
              </div>
              <div className="p-2 rounded-lg bg-[#080D18] border border-[#253247]/60 flex items-start gap-2">
                <span className="text-brand-violet">14:21:40</span>
                <span>Optimized rebate delta: +$2,850.00 confirmed</span>
              </div>
              <div className="p-2 rounded-lg bg-[#080D18] border border-[#253247]/60 flex items-start gap-2">
                <span className="text-brand-success">14:20:12</span>
                <span>PayPal Sandbox Gateway ping: 18ms latency</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
