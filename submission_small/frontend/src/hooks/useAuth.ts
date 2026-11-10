import { User } from '@/types';

export function getToken(): string | null {
  return localStorage.getItem('payflow_token');
}

export function getUser(): User | null {
  try {
    const u = localStorage.getItem('payflow_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function isDemo(): boolean {
  return localStorage.getItem('payflow_demo') === 'true';
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'admin';
}

export function setAuth(user: User, token: string, demo = false) {
  localStorage.setItem('payflow_user', JSON.stringify(user));
  localStorage.setItem('payflow_token', token);
  localStorage.setItem('payflow_demo', String(demo));
}

export function clearAuth() {
  localStorage.removeItem('payflow_user');
  localStorage.removeItem('payflow_token');
  localStorage.removeItem('payflow_demo');
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() && getUser());
}
