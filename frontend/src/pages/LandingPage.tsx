import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Zap, ArrowRight, ShieldCheck, ShieldAlert, CheckCircle2, Clock,
  FileText, TrendingUp, Brain, CreditCard, Sparkles,
  Lock, Check, Users, Briefcase, Calculator, Building2,
  ChevronRight, ExternalLink, HelpCircle, Layers, Scale
} from 'lucide-react'
import { authAPI } from '@/services/api'
import { setAuth } from '@/hooks/useAuth'

export default function LandingPage() {
  const navigate = useNavigate()
  const [activePersona, setActivePersona] = useState<'freelancer' | 'business' | 'accountant'>('business')
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleQuickDemo = async () => {
    setLoadingDemo(true)
    try {
      const res = await authAPI.demo()
      setAuth(res.data.user, res.data.access_token, true)
      navigate('/')
    } catch {
      navigate('/login')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080D18] text-dark-text selection:bg-brand-blue selection:text-white">
      {/* 1. Top Navigation Bar */}
      <nav className="h-20 border-b border-[#253247] bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
              PayFlow <span className="text-brand-blue">AI</span>
            </span>
            <span className="text-[10px] text-dark-sub font-mono uppercase tracking-wider block -mt-1">
              Financial Intelligence & Payments
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-dark-sub">
          <a href="#why-payflow" className="hover:text-white transition-colors">Why PayFlow?</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#personas" className="hover:text-white transition-colors">For Teams</a>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <a href="#trust" className="hover:text-white transition-colors">Security & Trust</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-dark-sub hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={handleQuickDemo}
            disabled={loadingDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-glow transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingDemo ? 'Launching…' : 'Try Live Demo'}</span>
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative px-6 sm:px-12 pt-20 pb-24 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/15 via-violet-600/15 to-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Product Positioning Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111B2D] border border-[#253247] text-xs font-mono text-dark-sub mb-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
          <span className="text-white font-medium">PayPal AI Hackathon 2026</span>
          <span className="text-[#253247]">•</span>
          <span className="text-brand-blue font-semibold">Engine v4.2 Active</span>
        </div>

        {/* Main Tagline & Supporting Copy */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            From Invoice to Intelligence <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              to Payment.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-dark-sub max-w-2xl mx-auto leading-relaxed">
            Spend less time processing invoices. Make smarter financial decisions. Stay in control of every payment with explainable AI and PayPal Sandbox infrastructure.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleQuickDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-sm font-bold shadow-glow transition-all active:scale-95"
          >
            <span>Launch Pre-Seeded Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/pricing"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#111B2D] hover:bg-[#172338] border border-[#253247] text-white text-sm font-semibold transition-all hover:border-brand-blue/50"
          >
            <span>View Subscription Tiers</span>
            <ChevronRight className="w-4 h-4 text-dark-sub" />
          </Link>
        </div>

        {/* Trust Chips */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-dark-sub font-mono">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand-success" /> OCR Multi-Engine Extraction
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand-success" /> Indian GST & HSN Verification
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand-success" /> Verified PayPal B2B Capture
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand-success" /> Immutable Audit Ledger
          </span>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#253247] bg-[#111B2D] shadow-2xl p-6 overflow-hidden text-left relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#253247] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-dark-sub">payflow-console.preview</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-brand-blue font-mono text-[11px]">
                LIVE TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247]">
                <span className="text-[10px] uppercase font-mono text-dark-sub block">1. Neural Ingestion</span>
                <span className="font-bold text-white text-sm mt-1 block">PaddleOCR-VL 1.6</span>
                <p className="text-[11px] text-dark-sub mt-1">
                  14 line items extracted with 99.8% bounding accuracy. Raw text archived immutably.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247]">
                <span className="text-[10px] uppercase font-mono text-dark-sub block">2. Policy Risk Audit</span>
                <span className="font-bold text-brand-success text-sm mt-1 block">94 / 100 Low Risk</span>
                <p className="text-[11px] text-dark-sub mt-1">
                  Zero duplicate collision. GSTIN #06AABCA1234F1Z9 validated against VIES format.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#080D18] border border-[#253247]">
                <span className="text-[10px] uppercase font-mono text-dark-sub block">3. PayPal Settlement</span>
                <span className="font-bold text-brand-blue text-sm mt-1 block">CAP-89104-PAYPAL-SB</span>
                <p className="text-[11px] text-dark-sub mt-1">
                  Server-side verified capture. Disbursed within budget without overdraft risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Why PayFlow AI?" — Clear Customer Benefits */}
      <section id="why-payflow" className="py-20 bg-[#0B1220]/60 border-y border-[#253247] px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold text-brand-blue uppercase tracking-wider">
              Measurable Customer Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Choose PayFlow AI?
            </h2>
            <p className="text-xs sm:text-sm text-dark-sub leading-relaxed">
              Every feature solves a concrete bottleneck in freelancer and small business finance — demonstrated with real application data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] hover:border-brand-blue/50 transition-all space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-brand-blue flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. Save Time</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Automatically extract invoice details from multi-page PDFs, scans, and mobile images in seconds instead of manual data entry.
              </p>
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-[11px] font-mono text-brand-blue">
                Real Example: Extracted 24 line items & HSN codes from a 4-page PDF in 1.4s with 99.4% confidence.
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] hover:border-red-500/50 transition-all space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-brand-danger flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. Reduce Errors & Fraud</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Identify duplicate invoice numbers, missing tax fields, and suspicious vendor bank routing changes before release.
              </p>
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-[11px] font-mono text-brand-danger">
                Real Example: Intercepted duplicate bill INV-2025-088 saving $1,200.00 from accidental double payment.
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] hover:border-green-500/50 transition-all space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-brand-success flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. Understand Expenses & GST</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Track expenditure curves, Indian GST distribution (CGST/SGST/IGST), and vendor concentration with zero spreadsheets.
              </p>
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-[11px] font-mono text-brand-success">
                Real Example: Reconciled $4,233.60 IGST on interstate Apex tech bills ready for input tax credit claims.
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] hover:border-violet-500/50 transition-all space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-brand-violet flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">4. Manage Cash Flow</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Allocate your monthly budget and prioritize payments by late penalty risks and early settlement discount windows.
              </p>
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-[11px] font-mono text-brand-violet">
                Real Example: Captured +2% rebate ($480.00 direct savings) by scheduling payment within 10-day terms.
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] hover:border-cyan-500/50 transition-all space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">5. Get AI Financial Insights</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Ask natural-language questions about upcoming dues, top vendor bills, or tax summaries grounded in real database figures.
              </p>
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-[11px] font-mono text-cyan-400">
                Real Example: "Which bills are overdue?" returns DevCore $30.0k with penalty mitigation steps.
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] hover:border-amber-500/50 transition-all space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-brand-warning flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">6. Pay with Confidence</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Human-in-the-loop review ensures no invoice is paid without your explicit sign-off via official PayPal Sandbox integration.
              </p>
              <div className="p-3 rounded-xl bg-[#080D18] border border-[#253247] text-[11px] font-mono text-brand-warning">
                Real Example: Server-side capture verification ensures zero phantom charges and verified capture IDs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customer-Specific Experiences (Persona Switcher) */}
      <section id="personas" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold text-brand-violet uppercase tracking-wider">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Your Financial Workflow
          </h2>
          <p className="text-xs sm:text-sm text-dark-sub">
            Whether you operate solo, run an expanding business, or audit client accounts.
          </p>
        </div>

        {/* Persona Tabs */}
        <div className="flex justify-center">
          <div className="p-1 bg-[#111B2D] border border-[#253247] rounded-2xl flex gap-1">
            <button
              onClick={() => setActivePersona('freelancer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'freelancer'
                  ? 'bg-brand-blue text-white shadow-glow'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Freelancers</span>
            </button>

            <button
              onClick={() => setActivePersona('business')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'business'
                  ? 'bg-brand-blue text-white shadow-glow'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Small Businesses</span>
            </button>

            <button
              onClick={() => setActivePersona('accountant')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'accountant'
                  ? 'bg-brand-blue text-white shadow-glow'
                  : 'text-dark-sub hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Accountants & CFOs</span>
            </button>
          </div>
        </div>

        {/* Persona View Cards */}
        <div className="bg-[#111B2D] border border-[#253247] rounded-3xl p-8 shadow-card">
          {activePersona === 'freelancer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-brand-blue text-xs font-mono font-semibold">
                  Freelancer Experience
                </span>
                <h3 className="text-2xl font-bold text-white">Never Miss a Bill or Payment Deadline</h3>
                <p className="text-xs text-dark-sub leading-relaxed">
                  Freelancers often juggle multiple client contracts, subscriptions, and contractor bills. PayFlow AI keeps your cash flow clear without complex enterprise ERP overhead.
                </p>
                <ul className="space-y-2 text-xs text-dark-text">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Simple drag-and-drop receipt & invoice parsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Upcoming payment obligations & deadline calendar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>One-click PayPal checkout with verified capture history</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#080D18] border border-[#253247] space-y-3 font-mono text-xs">
                <div className="text-dark-sub text-[10px] uppercase">Freelancer Monthly Summary</div>
                <div className="text-xl font-bold text-white">$4,850.00 Outstanding</div>
                <div className="p-2.5 rounded-lg bg-[#111B2D] border border-[#253247] text-amber-400">
                  • Cloud Hosting: Due in 4 days ($450.00)
                </div>
                <div className="p-2.5 rounded-lg bg-[#111B2D] border border-[#253247] text-brand-success">
                  • Design Retainer: Settled via PayPal ($2,800.00)
                </div>
              </div>
            </div>
          )}

          {activePersona === 'business' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-violet-500/10 text-brand-violet text-xs font-mono font-semibold">
                  Small Business Suite
                </span>
                <h3 className="text-2xl font-bold text-white">Vendor Governance & Cash Flow Optimization</h3>
                <p className="text-xs text-dark-sub leading-relaxed">
                  Manage commercial obligations across cloud providers, SaaS tools, and external contractors with multi-vendor policy checks, Indian GST returns, and payment batch scheduling.
                </p>
                <ul className="space-y-2 text-xs text-dark-text">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Duplicate detection and unusual transaction size flags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Smart cash flow optimizer ranking payments by budget & rebate capture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>ReportLab PDF audit reports compiled on demand</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#080D18] border border-[#253247] space-y-3 font-mono text-xs">
                <div className="text-dark-sub text-[10px] uppercase">Treasury Reserves & Routing</div>
                <div className="text-xl font-bold text-brand-success">$1,250,000.00 Liquid Reserves</div>
                <div className="p-2.5 rounded-lg bg-[#111B2D] border border-blue-500/30 text-brand-blue">
                  • Tier 1 Critical: AWS ($54.2k) Scheduled
                </div>
                <div className="p-2.5 rounded-lg bg-[#111B2D] border border-violet-500/30 text-brand-violet">
                  • Tier 2 Yield: Apex Tech +$480 Rebate Capture
                </div>
              </div>
            </div>
          )}

          {activePersona === 'accountant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-brand-success text-xs font-mono font-semibold">
                  Accountant & Auditor Console
                </span>
                <h3 className="text-2xl font-bold text-white">Audit Trails & Ground-Truth Verification</h3>
                <p className="text-xs text-dark-sub leading-relaxed">
                  Accountants demand immutability and complete audit history. PayFlow AI preserves original raw OCR extraction while tracking every single manual field correction with timestamp and user attribution.
                </p>
                <ul className="space-y-2 text-xs text-dark-text">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Side-by-side original OCR vs corrected value comparison</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Itemized CGST, SGST, IGST, and HSN/SAC code breakdown</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Clean JSON export & printable ReportLab PDF tax packages</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#080D18] border border-[#253247] space-y-3 font-mono text-xs">
                <div className="text-dark-sub text-[10px] uppercase">Field Revision Audit History</div>
                <div className="text-sm font-bold text-white">INV-2026-NL-441 Audit Trail</div>
                <div className="p-2.5 rounded-lg bg-[#111B2D] border border-[#253247] text-dark-sub text-[11px]">
                  • Original OCR: <span className="text-red-400 line-through">Notion Lab Incorp</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111B2D] border border-[#253247] text-dark-sub text-[11px]">
                  • Corrected: <span className="text-brand-success">Notion Labs Inc.</span> (Reason: Typo)
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#0B1220]/60 border-y border-[#253247] px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-brand-success uppercase tracking-wider">
              Autonomous Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How PayFlow AI Works
            </h2>
            <p className="text-xs sm:text-sm text-dark-sub">
              Three intelligent phases connecting documents to verified payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-3 shadow-card relative">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-brand-blue flex items-center justify-center font-bold font-mono text-xs mb-2">
                01
              </div>
              <h3 className="text-base font-bold text-white">1. Ingest & OCR Extract</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Drop PDF, TIFF, or scanned images. The engine cleans noise, corrects skew, and extracts line items, GSTIN, PAN, and totals with bounding tags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-3 shadow-card relative">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-brand-violet flex items-center justify-center font-bold font-mono text-xs mb-2">
                02
              </div>
              <h3 className="text-base font-bold text-white">2. Audit & Prioritize</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                Deterministic algorithms check for duplicate numbers, arithmetic errors, and suspicious routing. The payment decision agent allocates your budget.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-3 shadow-card relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-brand-success flex items-center justify-center font-bold font-mono text-xs mb-2">
                03
              </div>
              <h3 className="text-base font-bold text-white">3. Approve & Settle</h3>
              <p className="text-xs text-dark-sub leading-relaxed">
                You explicitly review and approve payments. Backend captures order through PayPal Sandbox and logs an immutable cryptographically sealed receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trust & Transparency Section */}
      <section id="trust" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold text-brand-blue uppercase tracking-wider">
            Enterprise Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Trust & Financial Transparency
          </h2>
          <p className="text-xs sm:text-sm text-dark-sub">
            Built from the ground up for compliance, human accountability, and zero phantom ledger updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-2">
            <Lock className="w-5 h-5 text-brand-blue" />
            <h4 className="text-sm font-bold text-white">Human Approval First</h4>
            <p className="text-xs text-dark-sub leading-relaxed">
              AI never authorizes disbursements autonomously. Payments require your explicit sign-off.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-2">
            <ShieldCheck className="w-5 h-5 text-brand-success" />
            <h4 className="text-sm font-bold text-white">Verified Server Capture</h4>
            <p className="text-xs text-dark-sub leading-relaxed">
              Status changes to Paid only after verified server-side PayPal capture confirmation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-2">
            <Scale className="w-5 h-5 text-brand-warning" />
            <h4 className="text-sm font-bold text-white">Transparent Explanations</h4>
            <p className="text-xs text-dark-sub leading-relaxed">
              Every risk score breaks down individual rule checks with clear mathematical evidence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111B2D] border border-[#253247] space-y-2">
            <Layers className="w-5 h-5 text-brand-violet" />
            <h4 className="text-sm font-bold text-white">Immutable Raw OCR</h4>
            <p className="text-xs text-dark-sub leading-relaxed">
              Original document extractions are kept separately and never overwritten by user edits.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-16 px-6 sm:px-12 bg-gradient-to-r from-blue-900/20 via-[#111B2D] to-violet-900/20 border-t border-[#253247]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Take Control of Your Invoice Workflow?
          </h2>
          <p className="text-xs sm:text-sm text-dark-sub max-w-xl mx-auto">
            Test pre-configured invoice scenarios, analyze duplicate fraud risks, and experience verified PayPal Sandbox checkout today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleQuickDemo}
              className="px-8 py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-sm font-bold shadow-glow transition-all active:scale-95"
            >
              Start Free Demo Workspace
            </button>
            <Link
              to="/pricing"
              className="px-8 py-3.5 rounded-xl bg-[#172338] hover:bg-[#253247] border border-[#253247] text-white text-sm font-semibold transition-all"
            >
              View Pricing Tiers
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#253247] text-center text-xs text-dark-sub font-mono">
        PayFlow AI · PayPal AI Hackathon 2026 Submission · Built with PayPal Sandbox REST API & Gemini
      </footer>
    </div>
  )
}
