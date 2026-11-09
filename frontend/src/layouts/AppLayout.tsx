import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Upload, CreditCard, Brain,
  MessageSquare, Settings, LogOut, Menu, X, Zap,
  Search, Bell, ChevronRight, ShieldCheck, ShieldAlert,
  TrendingUp, FileSpreadsheet, Users, Check, AlertCircle,
  ExternalLink, Clock, Sparkles
} from 'lucide-react'
import { getUser, isDemo, isAdmin, clearAuth } from '@/hooks/useAuth'
import { notificationAPI } from '@/services/api'
import { NotificationItem } from '@/types'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/invoices/upload', icon: Upload, label: 'Invoice Extraction' },
  { to: '/invoices', icon: FileText, label: 'Invoice Management' },
  { to: '/risk-analysis', icon: ShieldAlert, label: 'Risk Analysis' },
  { to: '/planner', icon: Brain, label: 'Payment Planner' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/payments', icon: CreditCard, label: 'Transactions' },
  { to: '/reports', icon: FileSpreadsheet, label: 'Reports' },
  { to: '/plans', icon: Sparkles, label: 'Plans & Pricing' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/admin', icon: Users, label: 'Administration' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const notifRef = useRef<HTMLDivElement>(null)
  const user = getUser()
  const demo = isDemo()
  const admin = isAdmin() || user?.email === 'admin@payflow.ai'
  const navigate = useNavigate()

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationAPI.list(),
        notificationAPI.unreadCount()
      ])
      setNotifications(listRes.data || [])
      setUnreadCount(countRes.data?.unread_count || 0)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close notifications if click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function logout() {
    clearAuth()
    navigate('/login')
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/invoices?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {
      // ignore
    }
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.is_read) {
        await notificationAPI.markRead(notif.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      }
      setNotificationsOpen(false)
      if (notif.link) navigate(notif.link)
    } catch {
      // ignore
    }
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#101820] border-r border-[#263640] select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#263640]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-glow">
          <Zap className="w-5 h-5 text-white fill-white/20" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
            PayFlow <span className="text-brand-blue">AI</span>
          </span>
          <span className="text-[10px] text-dark-sub font-medium tracking-wider uppercase">
            Enterprise Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="px-4 py-3">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-dark-sub/70">
          Platform Suite
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#1B2933] text-white shadow-sm border border-[#263640]'
                  : 'text-dark-sub hover:bg-[#151F29] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-blue rounded-r-full shadow-glow" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-brand-blue' : 'text-dark-sub group-hover:text-white'}`} />
                <span className="truncate">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-brand-blue/70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Environment Badge */}
      <div className="px-4 py-3 border-t border-[#263640]">
        <div className="p-3 rounded-xl bg-[#151F29] border border-[#263640] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-white tracking-wide">PayPal Sandbox</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-brand-blue border border-emerald-500/20">
            TESTNET
          </span>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-[#263640]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#151F29] border border-[#263640]/70">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Demo User'}</p>
              {admin && (
                <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-brand-success border border-emerald-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-[10px] text-dark-sub truncate">{user?.email || 'demo@payflow.ai'}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-dark-sub hover:text-brand-danger hover:bg-red-500/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0B0F14] text-dark-text overflow-hidden">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 flex flex-col bg-[#101820] z-50 h-full border-r border-[#263640]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-dark-sub hover:text-white rounded-lg bg-[#151F29]"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0B0F14]">
        {/* Top Navigation Bar */}
        <header className="h-16 flex-shrink-0 bg-[#101820] border-b border-[#263640] px-6 flex items-center justify-between gap-4 z-10">
          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-dark-sub hover:text-white rounded-lg bg-[#151F29] border border-[#263640]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">PayFlow AI</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-dark-sub absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search invoices, GSTIN, vendors, or amounts..."
              className="w-full pl-9 pr-12 py-2 bg-[#151F29] border border-[#263640] rounded-xl text-xs text-white placeholder-dark-sub focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
            />
            <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-dark-sub bg-[#1B2933] border border-[#263640] rounded">
              ↵
            </kbd>
          </form>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 ml-auto relative">
            {/* Sandbox Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#151F29] border border-[#263640]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-white">PayPal Sandbox Active</span>
            </div>

            {demo && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-brand-warning">
                DEMO MODE
              </span>
            )}

            {/* Notification Bell with Badge */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-dark-sub hover:text-white rounded-xl bg-[#151F29] border border-[#263640] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-danger text-white rounded-full text-[9px] font-bold font-mono flex items-center justify-center ring-2 ring-[#101820]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#151F29] border border-[#263640] shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-3.5 border-b border-[#263640] flex items-center justify-between bg-[#1B2933]/60">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-blue" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-brand-blue text-[10px] font-mono">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-brand-blue hover:underline font-mono"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#263640]/60">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-dark-sub">
                        No notifications currently.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 hover:bg-[#1B2933]/60 cursor-pointer transition-colors flex items-start gap-3 ${
                            !n.is_read ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-white">{n.title}</p>
                            <p className="text-[11px] text-dark-sub mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-dark-sub/60 font-mono mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-[#151F29] border border-[#263640] cursor-pointer hover:border-brand-blue/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-white max-w-[100px] truncate">
                {user?.name || 'Demo User'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F14]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
