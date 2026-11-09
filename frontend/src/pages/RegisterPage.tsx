import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, AlertCircle, ArrowRight } from 'lucide-react'
import { authAPI } from '@/services/api'
import { setAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.register(name, email, password)
      setAuth(res.data.user, res.data.access_token, false)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be registered.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080D18] flex items-center justify-center p-4 text-dark-text relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 rounded-2xl shadow-glow mb-4">
            <Zap className="w-7 h-7 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            PayFlow <span className="text-brand-blue">AI</span>
          </h1>
          <p className="text-xs text-dark-sub mt-1.5 font-medium">Create your freelancer financial copilot account</p>
        </div>

        <div className="bg-[#111B2D] border border-[#253247] rounded-3xl p-8 shadow-card">
          <h2 className="text-lg font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 text-xs text-brand-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-dark-sub mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#172338] border border-[#253247] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                placeholder="Jane Freelancer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-dark-sub mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#172338] border border-[#253247] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                placeholder="jane@consulting.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-dark-sub mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#172338] border border-[#253247] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:bg-blue-800 text-white rounded-xl font-semibold text-xs transition-all shadow-glow flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-center text-xs text-dark-sub mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
