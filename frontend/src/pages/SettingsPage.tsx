import { useState } from 'react'
import {
  Settings, Key, Shield, Server, CheckCircle2,
  AlertTriangle, Copy, Check, ExternalLink, Zap
} from 'lucide-react'
import { getUser, isDemo } from '@/hooks/useAuth'

export default function SettingsPage() {
  const user = getUser()
  const demo = isDemo()
  const [copied, setCopied] = useState<string | null>(null)

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in text-dark-text">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-brand-blue">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings</h1>
        </div>
        <p className="text-sm text-dark-sub">
          Manage your credentials, sandbox payment environment, and account preferences.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sub mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-blue" /> User Profile & Role
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-dark-elevated border border-dark-border">
            <p className="text-xs text-dark-sub">Authorized User</p>
            <p className="font-semibold text-white mt-1 text-base">{user?.name || 'Demo User'}</p>
            <p className="text-xs text-dark-sub font-mono mt-0.5">{user?.email || 'demo@payflow.ai'}</p>
          </div>
          <div className="p-4 rounded-xl bg-dark-elevated border border-dark-border">
            <p className="text-xs text-dark-sub">Security Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse" />
              <p className="font-semibold text-white">JWT Authenticated Session</p>
            </div>
            <p className="text-xs text-dark-sub mt-0.5">{demo ? 'Demo Sandbox Session' : 'Production Sandbox Session'}</p>
          </div>
        </div>
      </div>

      {/* PayPal Sandbox Environment */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0070BA]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sub">PayPal Developer Sandbox</h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-brand-warning">
            SANDBOX ACTIVE
          </span>
        </div>

        <p className="text-xs text-dark-sub leading-relaxed mb-4">
          PayFlow AI connects to PayPal's official sandbox endpoints (`api-m.sandbox.paypal.com`).
          To execute live test card payments, ensure your credentials in <code className="text-brand-blue bg-dark-elevated px-1.5 py-0.5 rounded font-mono">backend/.env</code> match your PayPal Developer Sandbox App.
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-elevated border border-dark-border">
            <div>
              <p className="font-semibold text-white">PayPal Base URL</p>
              <p className="text-dark-sub font-mono text-[11px] mt-0.5">https://api-m.sandbox.paypal.com</p>
            </div>
            <button
              onClick={() => copyText('url', 'https://api-m.sandbox.paypal.com')}
              className="p-1.5 text-dark-sub hover:text-white rounded-lg bg-dark-card border border-dark-border transition-colors"
            >
              {copied === 'url' ? <Check className="w-4 h-4 text-brand-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-elevated border border-dark-border">
            <div>
              <p className="font-semibold text-white">OAuth2 Token Endpoint</p>
              <p className="text-dark-sub font-mono text-[11px] mt-0.5">POST /v1/oauth2/token (client_credentials)</p>
            </div>
            <span className="text-brand-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand-blue hover:text-blue-400 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Open PayPal Developer Sandbox Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* AI Engine Status */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-sub mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-violet" /> AI Reasoning Model (Gemini)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-dark-elevated border border-dark-border">
            <p className="font-semibold text-white">Extraction Model</p>
            <p className="text-dark-sub mt-1">Google Gemini 1.5 Flash</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-violet-500/10 border border-violet-500/30 text-brand-violet font-semibold">
              Multimodal Ingestion
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-elevated border border-dark-border">
            <p className="font-semibold text-white">Deterministic Rule Engine</p>
            <p className="text-dark-sub mt-1">6-Point Collision & Integrity Engine</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-brand-success font-semibold">
              100% Deterministic Math
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
