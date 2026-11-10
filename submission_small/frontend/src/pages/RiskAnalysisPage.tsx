import { useState, useEffect } from 'react'
import {
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2,
  RefreshCw, Brain, Eye, ArrowRight, Check, X, FileText,
  AlertCircle, Lock, Sparkles, Scale
} from 'lucide-react'
import { invoiceAPI, aiAPI } from '@/services/api'
import { Invoice, RiskAnalysisResult } from '@/types'

export default function RiskAnalysisPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [analysis, setAnalysis] = useState<RiskAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await invoiceAPI.list()
      const items = res.data.items || []
      setInvoices(items)
      if (items.length > 0 && !selectedInvoice) {
        setSelectedInvoice(items[0])
        runAnalysis(items[0].id)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async (invoiceId: string) => {
    setAnalyzing(true)
    try {
      const res = await aiAPI.riskAnalysis(invoiceId)
      setAnalysis(res.data)
    } catch {
      // ignore
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv)
    runAnalysis(inv.id)
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-7 animate-fade-in text-dark-text">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#253247]">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Intelligent Invoice Risk & Fraud Engine
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-medium text-brand-warning shadow-glow">
              <Scale className="w-3.5 h-3.5" />
              Deterministic Heuristics + Contextual LLM
            </span>
          </div>
          <p className="text-xs text-dark-sub">
            Dual-layer verification: Mathematical checks for duplicates, arithmetic, and GSTIN format, enriched by contextual AI risk justification.
          </p>
        </div>

        <button
          onClick={loadInvoices}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111B2D] border border-[#253247] hover:border-brand-blue text-xs font-medium text-white transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Registry</span>
        </button>
      </div>

      {/* Main Grid: Left selector (4 cols) & Right Risk Inspection (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Column: Invoices Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-[#111B2D] border border-[#253247] rounded-2xl p-5 shadow-card space-y-3">
          <div className="border-b border-[#253247] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Select Invoice to Inspect
            </h3>
            <p className="text-xs text-dark-sub">Click any record to run live risk telemetry</p>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleSelectInvoice(inv)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedInvoice?.id === inv.id
                    ? 'bg-blue-500/10 border-brand-blue shadow-glow'
                    : 'bg-[#172338]/40 border-[#253247] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-xs truncate max-w-[170px]">
                    {inv.vendor_name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    inv.risk_level === 'high'
                      ? 'bg-red-500/20 text-brand-danger'
                      : inv.risk_level === 'medium'
                      ? 'bg-amber-500/20 text-brand-warning'
                      : 'bg-green-500/20 text-brand-success'
                  }`}>
                    {inv.risk_level} Risk
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-dark-sub font-mono">
                  <span>{inv.invoice_number}</span>
                  <span className="text-white font-bold">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deep Risk Telemetry (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {analyzing ? (
            <div className="p-16 bg-[#111B2D] border border-[#253247] rounded-2xl text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-blue" />
              <p className="text-sm text-white font-semibold">Running Multi-Vector Risk Telemetry...</p>
              <p className="text-xs text-dark-sub">Checking duplicate database hashes, arithmetic tolerance, and GSTIN checksums</p>
            </div>
          ) : selectedInvoice && analysis ? (
            <>
              {/* Score Gauge Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111B2D] via-[#172338] to-[#111B2D] border border-[#253247] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  {/* Gauge */}
                  <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#253247]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={analysis.risk_score >= 60 ? 'text-brand-danger' : analysis.risk_score >= 30 ? 'text-brand-warning' : 'text-brand-success'}
                        strokeDasharray={`${analysis.risk_score}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-white font-mono">{analysis.risk_score}</span>
                      <span className="text-[8px] text-dark-sub uppercase font-mono">Score</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">
                        {analysis.risk_score >= 60 ? 'High Risk Assessment' : analysis.risk_score >= 30 ? 'Medium Risk Warning' : 'Low Risk Cleared'}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                        analysis.risk_score >= 60
                          ? 'bg-red-500/20 text-brand-danger border border-red-500/30'
                          : analysis.risk_score >= 30
                          ? 'bg-amber-500/20 text-brand-warning border border-amber-500/30'
                          : 'bg-green-500/20 text-brand-success border border-green-500/30'
                      }`}>
                        {analysis.risk_level} Risk Category
                      </span>
                    </div>
                    <p className="text-xs text-dark-sub mt-1 max-w-xl leading-relaxed">
                      {analysis.recommendation}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-dark-sub">
                  <div>Engine: <span className="text-white font-semibold">{analysis.model_name}</span></div>
                  <div>Invoice: <span className="text-brand-blue font-semibold">{selectedInvoice.invoice_number}</span></div>
                </div>
              </div>

              {/* Deterministic Rule Verification Checks */}
              <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-6 shadow-card space-y-4">
                <div className="border-b border-[#253247] pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Deterministic Algorithmic Rule Checks
                    </h3>
                    <p className="text-xs text-dark-sub">Hard mathematical and cryptographic assertions</p>
                  </div>
                  <span className="text-xs font-mono text-dark-sub">6 Vectors Evaluated</span>
                </div>

                <div className="space-y-2.5">
                  {analysis.rule_checks?.map((chk) => (
                    <div
                      key={chk.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        chk.passed
                          ? 'bg-[#080D18] border-[#253247]/80 text-dark-text'
                          : 'bg-red-500/10 border-red-500/30 text-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          chk.passed ? 'bg-green-500/20 text-brand-success' : 'bg-red-500/20 text-brand-danger'
                        }`}>
                          {chk.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{chk.name}</span>
                          <span className="text-dark-sub text-[11px]">{chk.detail}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px]">
                        <span className={chk.passed ? 'text-brand-success' : 'text-brand-danger font-bold'}>
                          {chk.passed ? 'PASSED (0 pts)' : `+${chk.impact} RISK PTS`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contextual Explanations & Evidence */}
              <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-6 shadow-card space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-brand-violet" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Contextual Explanations & Evidence
                  </h3>
                </div>

                <div className="space-y-2">
                  {analysis.findings?.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-xs leading-relaxed text-dark-text">
                      {f}
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[11px] font-mono text-dark-sub">
                  *{analysis.disclaimer}
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-dark-sub">
              Select an invoice from the left panel to inspect risk score.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
