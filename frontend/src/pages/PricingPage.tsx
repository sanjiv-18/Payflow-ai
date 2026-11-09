import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check, X, Zap, Shield, Sparkles, Building2, User,
  HelpCircle, ArrowRight, Info, CheckCircle2, Sliders, ExternalLink
} from 'lucide-react'

interface PlanTier {
  id: string
  name: string
  tagline: string
  priceUSD: number
  priceINR: number
  badge?: string
  popular?: boolean
  limits: {
    invoicesPerMonth: number | 'Unlimited'
    seats: number | 'Unlimited'
    reportExports: number | 'Unlimited'
    aiQueries: number | 'Unlimited'
    retentionDays: number | 'Permanent'
  }
  features: string[]
  unsupportedFeatures: string[]
  ctaText: string
  ctaVariant: 'secondary' | 'primary' | 'outline'
}

const TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free Community',
    tagline: 'Ideal for independent freelancers and micro-contractors getting started.',
    priceUSD: 0,
    priceINR: 0,
    limits: {
      invoicesPerMonth: 10,
      seats: 1,
      reportExports: 3,
      aiQueries: 25,
      retentionDays: 90
    },
    features: [
      'Multi-engine OCR extraction (PDF & Images)',
      'Single invoice view & editable fields',
      'Basic rule-based risk checks',
      'Single-item PayPal Sandbox checkout',
      'Community support'
    ],
    unsupportedFeatures: [
      'Indian GST (CGST/SGST/IGST) calculations',
      'Payment Planner & budget optimization',
      'Batch settlements with PayPal',
      'Audit log & field correction history',
      'Admin role-based access control (RBAC)'
    ],
    ctaText: 'Current Active Tier',
    ctaVariant: 'outline'
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For active freelancers and growing sole proprietors with regular vendors.',
    priceUSD: 19,
    priceINR: 1499,
    limits: {
      invoicesPerMonth: 60,
      seats: 2,
      reportExports: 20,
      aiQueries: 200,
      retentionDays: 365
    },
    features: [
      'Everything in Free Community',
      'Indian GST breakdown & HSN code extraction',
      'Full field correction history & audit trail',
      'Client & vendor expense management',
      'Payment due-date tracking & reminders',
      'Standard PDF financial reports (ReportLab)',
      'Email support (24h response)'
    ],
    unsupportedFeatures: [
      'Autonomous payment budget allocation',
      'Batch PayPal disbursements',
      'Custom risk rules & multi-entity management'
    ],
    ctaText: 'Select Starter',
    ctaVariant: 'secondary'
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'For small businesses and growing teams needing payment automation & risk intelligence.',
    priceUSD: 49,
    priceINR: 3999,
    popular: true,
    badge: 'MOST POPULAR',
    limits: {
      invoicesPerMonth: 300,
      seats: 5,
      reportExports: 'Unlimited',
      aiQueries: 'Unlimited',
      retentionDays: 'Permanent'
    },
    features: [
      'Everything in Starter',
      'AI Payment Decision Agent (Budget Prioritizer)',
      'Batch Settle with verified PayPal B2B capture',
      'Deep AI anomaly & duplicate detection',
      'Unlimited executive PDF audit reports',
      'Conversational AI assistant with natural language queries',
      'Vendor risk scorecards & IBAN anomaly alerts',
      'Priority OCR queue & faster throughput'
    ],
    unsupportedFeatures: [
      'Custom ERP integrations (SAP/Oracle)',
      'Dedicated compliance manager'
    ],
    ctaText: 'Upgrade to Professional',
    ctaVariant: 'primary'
  },
  {
    id: 'business',
    name: 'Business & Accounting',
    tagline: 'For accounting firms, CFOs and enterprises managing multiple entities.',
    priceUSD: 99,
    priceINR: 7999,
    badge: 'ENTERPRISE READY',
    limits: {
      invoicesPerMonth: 'Unlimited',
      seats: 'Unlimited',
      reportExports: 'Unlimited',
      aiQueries: 'Unlimited',
      retentionDays: 'Permanent'
    },
    features: [
      'Everything in Professional',
      'Role-based access control (Admin, Auditor, Accountant)',
      'Accountant bulk-invoice ingestion console',
      'Immutable cryptographic activity audit log',
      'Custom webhook triggers & export pipelines',
      'Multi-currency PayPal Sandbox & Live routing',
      'Dedicated account manager & SLA guarantee'
    ],
    unsupportedFeatures: [],
    ctaText: 'Contact Enterprise Sales',
    ctaVariant: 'secondary'
  }
]

export default function PricingPage() {
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null)

  const discountMultiplier = billingCycle === 'annual' ? 0.8 : 1.0

  return (
    <div className="min-h-screen bg-[#0B0F14] text-dark-text p-6 sm:p-10 max-w-7xl mx-auto space-y-12">
      {/* 1. Header & Positioning */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151F29] border border-[#263640] text-xs font-mono text-dark-sub">
          <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
          <span>Transparent, Value-Based Packaging</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Simple, Predictable Plans for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
            Every Stage of Growth
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-dark-sub leading-relaxed">
          From solo freelancers extracting receipts to accountants managing high-volume client payables with verified PayPal settlements.
        </p>

        {/* Currency & Billing Interval Toggles */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          {/* Monthly / Annual */}
          <div className="p-1 rounded-xl bg-[#151F29] border border-[#263640] flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-brand-blue text-white font-semibold shadow-glow'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-brand-blue text-white font-semibold shadow-glow'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-brand-success px-1.5 py-0.2 rounded font-mono font-bold">
                SAVE 20%
              </span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="p-1 rounded-xl bg-[#151F29] border border-[#263640] flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currency === 'USD'
                  ? 'bg-[#1B2933] text-white font-semibold border border-[#263640]'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currency === 'INR'
                  ? 'bg-[#1B2933] text-white font-semibold border border-[#263640]'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start sm:items-center gap-3 max-w-4xl mx-auto text-xs text-dark-text shadow-sm">
        <Info className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <span className="font-semibold text-white">Proposed Subscription Tiers: </span>
          <span className="text-dark-sub">
            These tiers represent the commercial packaging roadmap. During this hackathon demo, all features (OCR, Risk Engine, Payment Planner, PayPal Sandbox capture, PDF reports) are currently unlocked with zero billing gates.
          </span>
        </div>
      </div>

      {/* 2. Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIERS.map(tier => {
          const rawPrice = currency === 'USD' ? tier.priceUSD : tier.priceINR
          const finalPrice = Math.round(rawPrice * discountMultiplier)
          const symbol = currency === 'USD' ? '$' : '₹'

          return (
            <div
              key={tier.id}
              className={`rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between relative shadow-card ${
                tier.popular
                  ? 'bg-gradient-to-b from-[#1B2933] to-[#151F29] border-brand-blue shadow-glow'
                  : 'bg-[#151F29] border-[#263640] hover:border-[#10B981]/50'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-brand-blue text-white shadow-glow">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-dark-sub mt-1 leading-relaxed min-h-[36px]">
                    {tier.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-[#263640]/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {finalPrice === 0 ? 'Free' : `${symbol}${finalPrice.toLocaleString()}`}
                    </span>
                    {finalPrice > 0 && (
                      <span className="text-xs text-dark-sub font-mono">
                        / month {billingCycle === 'annual' && 'billed annually'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-dark-sub font-mono mt-1 block">
                    {tier.limits.invoicesPerMonth === 'Unlimited'
                      ? 'Unlimited invoices'
                      : `Up to ${tier.limits.invoicesPerMonth} invoices / month`}
                  </span>
                </div>

                {/* Key Usage Limits */}
                <div className="space-y-1.5 py-2 text-[11px] font-mono text-dark-sub">
                  <div className="flex justify-between">
                    <span>Active Seats:</span>
                    <span className="text-white font-medium">{tier.limits.seats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PDF Reports:</span>
                    <span className="text-white font-medium">{tier.limits.reportExports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Assistant Queries:</span>
                    <span className="text-white font-medium">{tier.limits.aiQueries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Log Retention:</span>
                    <span className="text-white font-medium">
                      {tier.limits.retentionDays === 'Permanent' ? 'Permanent' : `${tier.limits.retentionDays} Days`}
                    </span>
                  </div>
                </div>

                {/* Included Features */}
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-semibold text-white uppercase tracking-wider block">
                    What's Included:
                  </span>
                  <ul className="space-y-2">
                    {tier.features.map((f, i) => (
                      <li key={i} className="text-xs text-dark-sub flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-success flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {tier.unsupportedFeatures.map((f, i) => (
                      <li key={i} className="text-xs text-[#475569] flex items-start gap-2 line-through">
                        <X className="w-3.5 h-3.5 text-[#475569] flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-[#263640]/60">
                <button
                  onClick={() => setSelectedPlanModal(tier.name)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    tier.ctaVariant === 'primary'
                      ? 'bg-brand-blue hover:bg-emerald-600 text-white shadow-glow active:scale-95'
                      : tier.ctaVariant === 'secondary'
                      ? 'bg-[#1B2933] hover:bg-[#263640] text-white border border-[#263640]'
                      : 'bg-[#151F29] text-dark-sub border border-[#263640] hover:text-white'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Deep Feature Comparison Matrix */}
      <div className="bg-[#151F29] rounded-2xl border border-[#263640] p-6 sm:p-8 space-y-6 shadow-card">
        <div>
          <h2 className="text-xl font-bold text-white">Detailed Plan Feature Matrix</h2>
          <p className="text-xs text-dark-sub mt-1">
            Compare capabilities across document extraction, Indian GST compliance, AI risk engine, and PayPal disbursements.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#263640] text-dark-sub uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Capability / Module</th>
                <th className="py-3 px-4 font-semibold text-center">Free Community</th>
                <th className="py-3 px-4 font-semibold text-center">Starter</th>
                <th className="py-3 px-4 font-semibold text-center text-brand-blue">Professional</th>
                <th className="py-3 px-4 font-semibold text-center">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263640]/60 text-dark-sub">
              {/* Row 1 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">OCR Ingestion Engine</td>
                <td className="py-3.5 px-4 text-center">Standard PyMuPDF</td>
                <td className="py-3.5 px-4 text-center">PaddleOCR-VL 1.6</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">High-Priority Neural OCR</td>
                <td className="py-3.5 px-4 text-center">Dedicated Multi-Core GPU</td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Indian GST & HSN Breakdown</td>
                <td className="py-3.5 px-4 text-center text-[#475569]">—</td>
                <td className="py-3.5 px-4 text-center">CGST & SGST</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">CGST / SGST / IGST + ITC</td>
                <td className="py-3.5 px-4 text-center">Multi-State GSTIN Portals</td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Explainable Risk & Anomaly Score</td>
                <td className="py-3.5 px-4 text-center">Basic (Duplicate hash)</td>
                <td className="py-3.5 px-4 text-center">5 Rule Checks</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">Full 6 Rule Checks + AI Telemetry</td>
                <td className="py-3.5 px-4 text-center">Custom Policy Builder</td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">AI Payment Decision Agent</td>
                <td className="py-3.5 px-4 text-center text-[#475569]">—</td>
                <td className="py-3.5 px-4 text-center text-[#475569]">—</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">Budget-constrained Autopilot</td>
                <td className="py-3.5 px-4 text-center">Multi-account Liquidity Routing</td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">PayPal Disbursement Engine</td>
                <td className="py-3.5 px-4 text-center">Single-item Sandbox</td>
                <td className="py-3.5 px-4 text-center">Single-item Sandbox</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">Batch Settlement + Verified Capture</td>
                <td className="py-3.5 px-4 text-center">Live Production + Sandbox</td>
              </tr>
              {/* Row 6 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Audit Trail & Correction History</td>
                <td className="py-3.5 px-4 text-center text-[#475569]">—</td>
                <td className="py-3.5 px-4 text-center">Field Change Log</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">Full Cryptographic Audit Trail</td>
                <td className="py-3.5 px-4 text-center">Compliance Export (SOC2/GDPR)</td>
              </tr>
              {/* Row 7 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">ReportLab 5.1 PDF Compilations</td>
                <td className="py-3.5 px-4 text-center">3 / month</td>
                <td className="py-3.5 px-4 text-center">20 / month</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">Unlimited</td>
                <td className="py-3.5 px-4 text-center">Scheduled Automated Email</td>
              </tr>
              {/* Row 8 */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Multi-User RBAC & Admin Tools</td>
                <td className="py-3.5 px-4 text-center text-[#475569]">—</td>
                <td className="py-3.5 px-4 text-center text-[#475569]">—</td>
                <td className="py-3.5 px-4 text-center">Up to 5 Users</td>
                <td className="py-3.5 px-4 text-center text-brand-blue font-semibold">Unlimited Custom Roles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Frequently Asked Questions */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-white text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#151F29] border border-[#263640] space-y-1.5">
            <h4 className="text-xs font-bold text-white">Can I use PayFlow AI with real PayPal accounts?</h4>
            <p className="text-[11px] text-dark-sub leading-relaxed">
              Yes. PayFlow AI uses the official PayPal Orders v2 REST API. You can toggle between Sandbox (for safe testing) and Production by providing your PayPal Developer credentials in Settings.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#151F29] border border-[#263640] space-y-1.5">
            <h4 className="text-xs font-bold text-white">How does Indian GST compliance work?</h4>
            <p className="text-[11px] text-dark-sub leading-relaxed">
              Our extraction engine automatically parses 15-character GSTINs, separates CGST and SGST for intra-state billing, and extracts IGST for inter-state transactions, ready for GSTR-2B reconciliation.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#151F29] border border-[#263640] space-y-1.5">
            <h4 className="text-xs font-bold text-white">What happens if an invoice has low OCR confidence?</h4>
            <p className="text-[11px] text-dark-sub leading-relaxed">
              All parsed fields remain 100% human-editable. When an accountant updates an extracted amount or vendor name, an immutable correction record is stamped into the audit ledger.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#151F29] border border-[#263640] space-y-1.5">
            <h4 className="text-xs font-bold text-white">Will PayFlow make automated payments without my review?</h4>
            <p className="text-[11px] text-dark-sub leading-relaxed">
              Never. PayFlow AI adheres to strict Human-in-the-Loop governance. The AI Agent suggests payment plans based on your budget, but requires explicit human approval before any transaction is executed.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Modal when clicking Plan Button */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151F29] border border-[#263640] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-success" />
                <h3 className="font-bold text-white text-sm">{selectedPlanModal} Tier Selected</h3>
              </div>
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="text-dark-sub hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-dark-sub leading-relaxed">
              You selected the <strong className="text-white">{selectedPlanModal}</strong> tier.
              <br /><br />
              During this hackathon evaluation, all enterprise modules (OCR extraction, GST breakdown, Risk scorecards, Payment Planner, and PayPal verification) are fully accessible without restriction in your live demo session.
            </p>
            <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#263640] text-[11px] font-mono text-brand-blue">
              Workspace Mode: Pre-seeded Hackathon Evaluator (All Entitlements Active)
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedPlanModal(null)
                  navigate('/')
                }}
                className="px-4 py-2 bg-brand-blue hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-glow"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
