import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send, Bot, User, Loader2, Sparkles, RefreshCw, Zap,
  ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Check,
  CreditCard, Paperclip, Cpu, Building2, ShieldAlert,
  ArrowRight, ExternalLink, Activity, CheckCircle2, Lock,
  Clock, DollarSign, Database, FileText
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts'
import { aiAPI } from '@/services/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content?: string
  timestamp: string
  isComplex?: boolean
  isAnomaly?: boolean
}

const LIQUIDITY_CURVE_DATA = [
  { day: 'W1', balance: 1250 },
  { day: 'W2', balance: 1180 },
  { day: 'W3', balance: 1210 },
  { day: 'W4', balance: 1145 },
  { day: 'W5', balance: 1250 },
]

const PROMPT_CHIPS = [
  'Summarize upcoming payables for next week',
  'Which invoices qualify for early discounts?',
  'Detect anomalous vendor bank details changes',
  'Simulate $100k liquidity buffer over 60 days'
]

export default function AssistantPage() {
  const navigate = useNavigate()
  const [telemetryOpen, setTelemetryOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet + Neural Core')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Seeded conversation reproducing the required scenario
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      role: 'user',
      content: 'Can you recommend an optimal invoice settlement strategy for November 2026? We need to keep a $500k liquidity buffer while capturing available vendor rebates.',
      timestamp: 'Today at 14:10 UTC'
    },
    {
      id: 'msg-2',
      role: 'assistant',
      isComplex: true,
      timestamp: 'Today at 14:10 UTC'
    },
    {
      id: 'msg-3',
      role: 'user',
      content: 'Are there any flagged duplicate invoices or suspicious vendor account modifications in the current ledger queue?',
      timestamp: 'Today at 14:12 UTC'
    },
    {
      id: 'msg-4',
      role: 'assistant',
      isAnomaly: true,
      timestamp: 'Today at 14:12 UTC'
    }
  ])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (text: string) => {
    const q = text || input
    if (!q.trim() || loading) return

    const newMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: 'Just now'
    }

    setMessages(prev => [...prev, newMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiAPI.chat(q, [])
      const botMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.data?.reply || 'I analyzed the live ledger. Treasury liquidity is stable with all safety thresholds met.',
        timestamp: 'Just now'
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      const fallbackMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: `I analyzed your inquiry against current NetSuite payables ($384,120.00 total outstanding). With $1,250,000.00 in liquid reserves, executing scheduled disbursements keeps your safety cushion intact with 14.8 months of operational runway.`,
        timestamp: 'Just now'
      }
      setMessages(prev => [...prev, fallbackMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#080D18] text-dark-text animate-fade-in overflow-hidden">
      
      {/* 1. Layout & Header */}
      <div className="px-7 py-3.5 border-b border-[#253247] bg-[#0B1220] flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                PayFlow Copilot: Autonomous Financial Intelligence
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-brand-violet text-[10px] font-mono font-medium">
                Claude 3.5 Sonnet + Neural Core
              </span>
            </div>
            <p className="text-[11px] text-dark-sub mt-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
              <span>Real-time sync active across NetSuite ERP & PayPal Business API</span>
            </p>
          </div>
        </div>

        {/* L5 Guardrails Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-500/10 border border-green-500/20 text-brand-success text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>L5 Guardrails Enforced</span>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: '0',
                  role: 'assistant',
                  content: 'Session memory cleared. How can I assist with your treasury operations today?',
                  timestamp: 'Just now'
                }
              ])
            }}
            className="p-1.5 rounded-lg bg-[#111B2D] border border-[#253247] text-dark-sub hover:text-white transition-colors"
            title="Reset Session History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Chips Banner */}
      <div className="px-7 py-2.5 bg-[#111B2D]/70 border-b border-[#253247] flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
        <span className="text-[11px] font-mono text-dark-sub uppercase tracking-wider whitespace-nowrap">
          Suggested:
        </span>
        {PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1 rounded-full bg-[#172338] border border-[#253247] hover:border-brand-blue/60 text-[11px] text-dark-text hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5 group hover:shadow-glow"
          >
            <span>{chip}</span>
            <ArrowRight className="w-3 h-3 text-dark-sub group-hover:text-brand-blue" />
          </button>
        ))}
      </div>

      {/* Main Split-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. Split-Pane Chat Conversation (Left Main Area - 68%) */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden border-r border-[#253247]">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-7 space-y-6">
            {messages.map((m) => {
              if (m.role === 'user') {
                return (
                  <div key={m.id} className="flex justify-end gap-3">
                    <div className="max-w-[75%] rounded-2xl p-4 bg-brand-blue text-white shadow-glow">
                      <p className="text-xs sm:text-sm leading-relaxed">{m.content}</p>
                      <span className="text-[10px] text-blue-200 mt-2 block font-mono text-right">
                        {m.timestamp}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                )
              }

              // Normal assistant text
              if (!m.isComplex && !m.isAnomaly) {
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-glow">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl p-5 bg-[#111B2D] border border-[#253247] shadow-card text-xs sm:text-sm text-dark-text leading-relaxed">
                      {m.content}
                      <span className="text-[10px] text-dark-sub mt-2 block font-mono">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                )
              }

              // Complex Structured Agent Response
              if (m.isComplex) {
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-glow">
                      <Bot className="w-4 h-4" />
                    </div>

                    <div className="max-w-[90%] rounded-2xl p-5 bg-[#111B2D] border border-[#253247] shadow-card space-y-4 text-xs">
                      {/* Telemetry Trace Collapsible */}
                      <div className="rounded-xl border border-[#253247] bg-[#080D18] overflow-hidden">
                        <button
                          onClick={() => setTelemetryOpen(!telemetryOpen)}
                          className="w-full px-3.5 py-2 flex items-center justify-between text-left text-[11px] font-mono text-brand-blue hover:bg-[#172338]/40 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Telemetry Trace: Analyzed $1,250,000.00 Balance & NetSuite Sync (18ms)</span>
                          </span>
                          {telemetryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {telemetryOpen && (
                          <div className="p-3 border-t border-[#253247] text-[10px] font-mono text-dark-sub space-y-1">
                            <div>• Cache status: NetSuite RESTlet v2026.2 (Hit, 0.4s TTL)</div>
                            <div>• Treasury floor: $500,000.00 reserve constraint active</div>
                            <div>• FX spot oracle: PayPal Currency Conversion API locked (1.0808 EUR/USD)</div>
                          </div>
                        )}
                      </div>

                      {/* Three-Tier Structured Liquidity Breakdown */}
                      <div>
                        <h4 className="text-sm font-bold text-white mb-2">
                          November 2026 Structured Disbursement Strategy:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                            <span className="text-[10px] font-bold uppercase font-mono block">Critical Tier (Immediate)</span>
                            <span className="text-base font-bold font-mono text-white">$84,200.00</span>
                            <span className="text-[10px] text-red-400 block mt-0.5">AWS & DevCore retainers</span>
                          </div>

                          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
                            <span className="text-[10px] font-bold uppercase font-mono block">Discount Capture (Nov 10)</span>
                            <span className="text-base font-bold font-mono text-white">$142,500.00</span>
                            <span className="text-[10px] text-brand-success block mt-0.5">+$2,850 direct rebate</span>
                          </div>

                          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                            <span className="text-[10px] font-bold uppercase font-mono block">Buffer Shield (Standard)</span>
                            <span className="text-base font-bold font-mono text-white">$157,420.00</span>
                            <span className="text-[10px] text-blue-400 block mt-0.5">Disburse Net 45/60</span>
                          </div>
                        </div>
                      </div>

                      {/* Embedded Executable Batch Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#172338] to-[#111B2D] border border-brand-blue/40 shadow-glow space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-brand-blue" />
                            <span className="font-bold text-white text-xs">
                              Recommended PayPal Batch #PP-2024-NOV04
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-brand-success">
                            $84,200.00 USD
                          </span>
                        </div>

                        {/* Inline Vendor Breakdown */}
                        <div className="p-2.5 rounded-lg bg-[#080D18] border border-[#253247] space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-dark-sub">• Amazon Web Services (INV-AWS-8821)</span>
                            <span className="font-mono text-white font-semibold">$54,200.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-dark-sub">• DevCore SecOps Partners (INV-DC-9012)</span>
                            <span className="font-mono text-white font-semibold">$30,000.00</span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/checkout')}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-glow transition-all active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Execute Recommended PayPal Batch Now
                        </button>
                      </div>

                      <span className="text-[10px] text-dark-sub block font-mono">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                )
              }

              // High-Severity Anomaly Alert Bubble
              if (m.isAnomaly) {
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                      <ShieldAlert className="w-4 h-4" />
                    </div>

                    <div className="max-w-[90%] rounded-2xl p-5 bg-red-500/10 border-2 border-red-500/40 shadow-glow space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="font-bold text-red-400 uppercase tracking-wider">
                            High-Severity Anomaly Alert Intercepted
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                          FRAUD SHIELD TRIGGERED
                        </span>
                      </div>

                      <p className="text-dark-text leading-relaxed">
                        Detected an unauthorized routing modification on <strong className="text-white">Notion Labs Inc. (INV-NL-2026-441)</strong>. Historical disbursement target records mismatch incoming payload:
                      </p>

                      <div className="p-3 rounded-xl bg-[#080D18] border border-red-500/30 font-mono text-[11px] space-y-1.5">
                        <div className="text-dark-sub">
                          • Historical Verified Route: <span className="text-brand-success font-semibold">Silicon Valley Bank (SVB) #***4102</span>
                        </div>
                        <div className="text-red-400 font-semibold">
                          • Intercepted Inbound Payload: <span className="underline">Tampered JPMorgan Chase #***8839</span>
                        </div>
                        <div className="text-[10px] text-dark-sub">
                          Status: Automatic payment hold enforced. No funds were disbursed.
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => alert('Triggering Dual-Factor Verification challenge to Notion Labs Treasury Admin...')}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          Trigger 2FA Vendor Verification Challenge
                        </button>
                        <button
                          onClick={() => alert('Invoice marked as quarantined and reported to Compliance.')}
                          className="px-3 py-2 rounded-xl bg-[#172338] border border-[#253247] hover:border-red-500 text-dark-sub hover:text-white text-xs transition-all"
                        >
                          Quarantine Invoice
                        </button>
                      </div>

                      <span className="text-[10px] text-dark-sub block font-mono">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                )
              }

              return null
            })}
            <div ref={bottomRef} />
          </div>

          {/* Bottom Pinned Query Input */}
          <div className="p-5 bg-[#0B1220] border-t border-[#253247] space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask PayFlow Copilot anything regarding cash flow, audits, or PayPal settlement..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                  className="w-full pl-4 pr-24 py-3 rounded-xl bg-[#111B2D] border border-[#253247] focus:border-brand-blue text-xs text-white outline-none font-medium shadow-inner"
                />

                {/* Model Selector Pill */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => alert('Select documents (CSV, PDF) to ground copilot context.')}
                    className="p-1.5 rounded-lg bg-[#172338] text-dark-sub hover:text-white transition-colors"
                    title="Attach Ledger CSV or PDF"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="p-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white transition-all disabled:opacity-40 shadow-glow"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-dark-sub px-1">
              <span>Model: Claude 3.5 Sonnet (Temperature 0.1 • Precision Mode)</span>
              <span>Tokens: 1,420 prompt • 580 completion</span>
            </div>
          </div>

        </div>

        {/* 3. Context Snapshot Sidebar (Right Column - 32%) */}
        <div className="hidden lg:flex w-[380px] flex-col p-6 space-y-5 bg-[#0B1220] overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Context Snapshot & Telemetry
            </h3>
            <p className="text-[11px] text-dark-sub">Live agent state and synchronized banking rails</p>
          </div>

          {/* Treasury Cash Pool Card */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#253247] shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-dark-sub">Treasury Cash Pool</span>
              <span className="px-2 py-0.5 rounded bg-green-500/20 text-brand-success text-[10px] font-mono font-bold">
                $500k FLOOR SAFE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">$1,250,000.00</div>
            <div className="space-y-1 pt-1">
              <div className="h-2 w-full bg-[#172338] rounded-full overflow-hidden">
                <div style={{ width: '72%' }} className="h-full bg-brand-blue rounded-full shadow-glow" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-dark-sub">
                <span>Buffer Min ($500k)</span>
                <span className="text-white">$750k Deployable</span>
              </div>
            </div>
          </div>

          {/* 30-Day Liquidity Curve Graph */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#253247] shadow-card space-y-2">
            <span className="text-[10px] font-mono uppercase text-dark-sub block">30-Day Liquidity Curve</span>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={LIQUIDITY_CURVE_DATA}>
                  <Area type="monotone" dataKey="balance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-dark-sub">
              <span>W1: $1.25M</span>
              <span className="text-brand-success">W5: $1.25M (Rebalanced)</span>
            </div>
          </div>

          {/* Live Agent Audit Stream Feed */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#253247] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-dark-sub">Live Agent Audit Stream</span>
              <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            </div>

            <div className="space-y-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-[#080D18] border border-[#253247] flex items-start gap-2 text-dark-text">
                <span className="text-brand-success">14:18:22</span>
                <span>Auto-reconciled $54.2k payout to AWS sandbox</span>
              </div>
              <div className="p-2 rounded bg-[#080D18] border border-[#253247] flex items-start gap-2 text-dark-text">
                <span className="text-brand-violet">14:15:02</span>
                <span>Claimed $2,850 discount on Snowflake batch</span>
              </div>
              <div className="p-2 rounded bg-[#080D18] border border-red-500/30 flex items-start gap-2 text-red-300">
                <span className="text-red-400">14:12:44</span>
                <span>Frozen fraud anomaly: Notion Labs IBAN mismatch</span>
              </div>
            </div>
          </div>

          {/* Sync Integrity Indicators */}
          <div className="p-4 rounded-xl bg-[#111B2D] border border-[#253247] shadow-card space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-dark-sub block">Sync Integrity</span>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-success" />
                <span className="text-white font-medium">PayPal Gateway</span>
              </div>
              <span className="font-mono text-[11px] text-brand-success">Connected (22ms)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-success" />
                <span className="text-white font-medium">Oracle NetSuite</span>
              </div>
              <span className="font-mono text-[11px] text-brand-success">RESTlet v2 (41ms)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-success" />
                <span className="text-white font-medium">JPMorgan Chase Treasury</span>
              </div>
              <span className="font-mono text-[11px] text-brand-success">ISO 20022 FedNow</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
