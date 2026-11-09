import { useState, useEffect } from 'react'
import {
  FileText, Download, RefreshCw, CheckCircle2, AlertCircle,
  Calendar, Layers, ShieldCheck, Sparkles, Filter, Clock,
  ArrowRight, FileSpreadsheet, Lock
} from 'lucide-react'
import { reportAPI } from '@/services/api'
import { GeneratedReport } from '@/types'

const REPORT_TEMPLATES = [
  {
    type: 'monthly_invoice',
    title: 'Monthly Billing & Payables Audit',
    desc: 'Consolidated commercial obligations, settlement status breakdown, and pending payables.',
    badge: 'Standard Accounting'
  },
  {
    type: 'gst_summary',
    title: 'Indian GST & Tax Intelligence Summary',
    desc: 'Itemized CGST, SGST, IGST breakdown, HSN/SAC allocations, and input tax credit reconciliations.',
    badge: 'Tax Compliance'
  },
  {
    type: 'vendor_wise',
    title: 'Vendor Expenditure & Concentration Analysis',
    desc: 'Disbursement frequency, average invoice amounts, and vendor exposure metrics.',
    badge: 'Procurement'
  },
  {
    type: 'payment_history',
    title: 'PayPal Settlement & Treasury Ledger',
    desc: 'Cryptographically verified PayPal sandbox capture IDs, timestamps, and fee waivers.',
    badge: 'Treasury'
  },
  {
    type: 'risk_analysis',
    title: 'High-Risk & Duplicate Fraud Audit',
    desc: 'Deterministic collision logs, bank details mismatch alerts, and AI risk justifications.',
    badge: 'SecOps / Risk'
  }
]

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState('gst_summary')
  const [period, setPeriod] = useState('30d')
  const [customTitle, setCustomTitle] = useState('')
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState('')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await reportAPI.list()
      setReports(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setToast('')
    try {
      const tmpl = REPORT_TEMPLATES.find(t => t.type === selectedType)
      const titleToUse = customTitle.trim() || tmpl?.title || 'Financial Intelligence Audit Report'
      
      const res = await reportAPI.generate({
        report_type: selectedType,
        period,
        title: titleToUse
      })
      setReports(prev => [res.data, ...prev])
      setToast(`Generated ${titleToUse} successfully. Ready for PDF download.`)
      setCustomTitle('')
    } catch (err: any) {
      setToast('Report generation failed. Verify database records are loaded.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-7 animate-fade-in text-dark-text">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#253247]">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Financial & GST PDF Reporting Engine
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-medium text-brand-success shadow-glow">
              <FileText className="w-3.5 h-3.5" />
              ReportLab v5.1 PDF Compiler Active
            </span>
          </div>
          <p className="text-xs text-dark-sub">
            Generate and export SOC-1 compliant audit packages, Indian GST tax returns, and PayPal settlement receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111B2D] border border-[#253247] text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
            <span className="text-dark-sub">Security:</span>
            <span className="font-mono text-white font-medium">SHA-256 Digitally Sealed</span>
          </div>
        </div>
      </div>

      {toast && (
        <div className="flex items-center justify-between p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-brand-success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast('')} className="text-dark-sub hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 bg-[#111B2D] border border-[#253247] rounded-2xl p-6 shadow-card space-y-5">
          <div className="border-b border-[#253247] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Compile On-Demand Audit PDF
            </h3>
            <p className="text-xs text-dark-sub">Select report parameters to assemble live records from the database</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Select Template */}
            <div>
              <label className="text-xs uppercase font-mono text-dark-sub block mb-2">
                1. Select Report Template
              </label>
              <div className="space-y-2">
                {REPORT_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.type}
                    onClick={() => setSelectedType(tmpl.type)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      selectedType === tmpl.type
                        ? 'bg-blue-500/10 border-brand-blue shadow-glow'
                        : 'bg-[#172338]/40 border-[#253247] hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{tmpl.title}</span>
                        <span className="px-2 py-0.5 rounded bg-[#111B2D] text-dark-sub text-[10px] font-mono border border-[#253247]">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-dark-sub leading-relaxed">{tmpl.desc}</p>
                    </div>
                    {selectedType === tmpl.type && (
                      <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeframe & Custom Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs uppercase font-mono text-dark-sub block mb-1">
                  2. Reporting Window
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#080D18] border border-[#253247] text-xs text-white outline-none focus:border-brand-blue font-mono"
                >
                  <option value="30d">Last 30 Days (Trailing)</option>
                  <option value="90d">Last Quarter (90 Days)</option>
                  <option value="this_month">Current Fiscal Month</option>
                  <option value="all">Complete Multi-Year Ledger</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase font-mono text-dark-sub block mb-1">
                  3. Custom Report Header Title
                </label>
                <input
                  type="text"
                  placeholder="Optional custom title..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#080D18] border border-[#253247] text-xs text-white outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-glow transition-all active:scale-95 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling ReportLab PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Compile Audit PDF Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-success" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Audit Compliance & Integrity
              </h3>
            </div>
            <p className="text-xs text-dark-sub leading-relaxed">
              Every report compiled by PayFlow AI executes cryptographic validation checks against the live SQLite treasury ledger before generating the PDF document:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-success mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Indian GST / HSN Compliance:</span>
                  <span className="text-dark-sub text-[11px]">Validates state-wise CGST, SGST, IGST tax distribution and GSTIN checksum format.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">PayPal Sandbox Verification:</span>
                  <span className="text-dark-sub text-[11px]">Embeds server-verified capture IDs (`CAP-XXXXX-PAYPAL-SB`) directly on the report.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-violet mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">AI Executive Summary:</span>
                  <span className="text-dark-sub text-[11px]">Includes automated compliance assessment and risk commentary.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Generated Reports Archive */}
      <div className="bg-[#111B2D] border border-[#253247] rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#253247] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Generated Reports Archive
            </h3>
            <p className="text-xs text-dark-sub">Download previously compiled PDF audit packages</p>
          </div>
          <button
            onClick={fetchReports}
            className="p-1.5 rounded-lg bg-[#080D18] border border-[#253247] text-dark-sub hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="py-12 text-center text-dark-sub text-xs">
            <FileText className="w-10 h-10 mx-auto text-dark-sub/40 mb-2" />
            No reports compiled yet. Use the form above to generate your first audit PDF report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#172338]/50 text-dark-sub font-mono uppercase text-[11px] border-b border-[#253247]">
                <tr>
                  <th className="py-3 px-4">Report Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Date Generated</th>
                  <th className="py-3 px-4 text-center">Download PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253247]/60">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#172338]/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-blue flex-shrink-0" />
                      <span>{rep.title}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-dark-sub text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-[#172338] text-white">
                        {rep.report_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-dark-sub">
                      {(rep.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 font-mono text-dark-sub text-[11px]">
                      {new Date(rep.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={reportAPI.downloadUrl(rep.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue/20 hover:bg-brand-blue text-brand-blue hover:text-white border border-brand-blue/30 text-xs font-semibold transition-all shadow-glow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
