import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('payflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('payflow_token');
      localStorage.removeItem('payflow_user');
      localStorage.removeItem('payflow_demo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role?: string) =>
    api.post('/auth/register', { name, email, password, role }),
  me: () => api.get('/auth/me'),
  demo: () => api.post('/auth/demo'),
  demoAdmin: () => api.post('/auth/demo-admin'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.patch('/auth/profile', data),
};

export const invoiceAPI = {
  list: (params?: Record<string, unknown>) =>
    api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: unknown) => api.post('/invoices', data),
  upload: (formData: FormData) =>
    api.post('/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: unknown) => api.patch(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  getCorrections: (id: string) => api.get(`/invoices/${id}/corrections`),
  getRawOcr: (id: string) => api.get(`/invoices/${id}/raw-ocr`),
  exportJson: (id: string) => api.get(`/invoices/${id}/export-json`),
};

export const aiAPI = {
  analyzeInvoice: (invoiceId: string) =>
    api.post('/ai/analyze-invoice', { invoice_id: invoiceId }),
  riskAnalysis: (invoiceId: string) =>
    api.post('/ai/risk-analysis', { invoice_id: invoiceId }),
  paymentPlan: (budget: number, invoiceIds?: string[]) =>
    api.post('/ai/payment-plan', { budget, invoice_ids: invoiceIds }),
  chat: (message: string, history: unknown[]) =>
    api.post('/ai/chat', { message, history }),
};

export const paymentAPI = {
  createOrder: (invoiceId: string) =>
    api.post('/payments/create-order', { invoice_id: invoiceId }),
  captureOrder: (orderId: string, invoiceId: string) =>
    api.post('/payments/capture-order', { order_id: orderId, invoice_id: invoiceId }),
  list: (params?: Record<string, unknown>) =>
    api.get('/payments', { params }),
  get: (id: string) => api.get(`/payments/${id}`),
};

export const dashboardAPI = {
  summary: (params?: Record<string, unknown>) => api.get('/dashboard/summary', { params }),
  analytics: (period?: string) =>
    api.get('/dashboard/analytics', { params: { period } }),
};

export const reportAPI = {
  generate: (data: { report_type: string; title?: string; period?: string }) =>
    api.post('/reports/generate', data),
  list: () => api.get('/reports'),
  downloadUrl: (id: string) => `/api/reports/${id}/download`,
};

export const notificationAPI = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const adminAPI = {
  listUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  updateStatus: (userId: string, is_active: boolean) =>
    api.patch(`/admin/users/${userId}/status`, null, { params: { is_active } }),
  updateRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, null, { params: { role } }),
  getStats: () => api.get('/admin/stats'),
  getActivity: (params?: Record<string, unknown>) => api.get('/admin/activity', { params }),
};

export default api;
