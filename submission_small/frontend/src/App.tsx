import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/hooks/useAuth'
import AppLayout from '@/layouts/AppLayout'
import LandingPage from '@/pages/LandingPage'
import PricingPage from '@/pages/PricingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import InvoicesPage from '@/pages/InvoicesPage'
import UploadPage from '@/pages/UploadPage'
import RiskAnalysisPage from '@/pages/RiskAnalysisPage'
import PlannerPage from '@/pages/PlannerPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import PaymentsPage from '@/pages/PaymentsPage'
import CheckoutPage from '@/pages/CheckoutPage'
import ReportsPage from '@/pages/ReportsPage'
import AssistantPage from '@/pages/AssistantPage'
import AdminPage from '@/pages/AdminPage'
import SettingsPage from '@/pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={isAuthenticated() ? <Navigate to="/plans" replace /> : <PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/upload" element={<UploadPage />} />
        <Route path="risk-analysis" element={<RiskAnalysisPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="plans" element={<PricingPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
