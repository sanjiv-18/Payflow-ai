import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { authAPI } from '@/services/api'
import { setAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login(email, password)
      setAuth(res.data.user, res.data.access_token, res.data.is_demo)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your email and password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemo() {
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.demo()
      setAuth(res.data.user, res.data.access_token, true)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not initialize demo account. Please ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoAdmin() {
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.demoAdmin()
      setAuth(res.data.user, res.data.access_token, false)
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not initialize administrator account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080D18] flex items-center justify-center p-4 text-dark-text relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 rounded-2xl shadow-glow mb-4">
            <Zap className="w-7 h-7 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            PayFlow <span className="text-brand-blue">AI</span>
          </h1>
          <p className="text-xs text-dark-sub mt-1.5 font-medium">
            Intelligent Invoice Parsing & PayPal Sandbox Payment Agent
          </p>
        </div>

        {/* Dark Login Card */}
        <div className="bg-[#111B2D] border border-[#253247] rounded-3xl p-8 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Sign In to Workspace</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-brand-blue">
              FINTECH SAAS
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 text-xs text-brand-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-dark-sub mb-1.5">
                Corporate Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#172338] border border-[#253247] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                placeholder="freelancer@company.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-dark-sub mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#172338] border border-[#253247] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-sub hover:text-white"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:bg-blue-800 text-white rounded-xl font-semibold text-xs transition-all shadow-glow flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating…' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#253247]" />
            </div>
            <div className="relative text-center">
              <span className="bg-[#111B2D] px-3 text-[10px] uppercase tracking-wider font-semibold text-dark-sub">
                Or Quick Access
              </span>
            </div>
          </div>

          {/* Quick Demo Access Button */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-brand-warning rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 mb-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Initializing Demo…' : 'Explore Demo Executive Mode'}
          </button>

          {/* Quick Admin Access Button */}
          <button
            onClick={handleDemoAdmin}
            disabled={loading}
            className="w-full py-3 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-brand-violet rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Authenticating Admin…' : 'Sign in as System Administrator (admin@payflow.ai)'}
          </button>

          <p className="text-center text-xs text-dark-sub mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-dark-sub/60 mt-6 font-mono">
          PayPal AI Hackathon 2026 Submission · Built with PayPal Sandbox & Gemini
        </p>
      </div>
    </div>
  )
}
