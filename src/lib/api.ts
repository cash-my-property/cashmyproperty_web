import axios from 'axios';
import { clearAuthHint } from '@/lib/authHint';

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://testapi.cmpdubai.com')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/auth$/i, '');

export const SERVER_BASE_URL = rawApiUrl.replace(/\/api$/i, '');
export const API_URL = `${SERVER_BASE_URL}/api`;
export const PUBLIC_API_PREFIX = '/cmpConnect/public';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Sends httpOnly cookies (cmpp_at, cmpp_rt) automatically
});

// Request interceptor: normalize URLs & ensure no localStorage/Bearer tokens on public portal endpoints
api.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.slice(4);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single shared refresh promise across concurrent 401s (and across tabs via navigator.locks)
let refreshPromise: Promise<boolean> | null = null;

export async function refreshPublicSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const runRefresh = async (): Promise<boolean> => {
    try {
      await api.post(`${PUBLIC_API_PREFIX}/auth/refresh`);
      return true;
    } catch {
      return false;
    }
  };

  refreshPromise = (async () => {
    try {
      if (typeof window !== 'undefined' && 'locks' in navigator && navigator.locks?.request) {
        return await navigator.locks.request('cmp_public_refresh_lock', async () => {
          return await runRefresh();
        });
      }
      return await runRefresh();
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/google',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Response interceptor to handle 401 token expiry via httpOnly cookie refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const reqUrl = String(originalRequest.url || '');
      // Public session refresh sirf CMP Connect public endpoints ke 401 ko theek kar sakta hai.
      // Legacy endpoints (/buyer/*, /seller/*, /switch/*) ka 401 refresh se kabhi theek nahi hota —
      // pehle har aise 401 pe faltu refresh + retry (2 extra requests) jaati thin.
      const isPublicSessionRequest = reqUrl.includes(PUBLIC_API_PREFIX);
      const shouldSkipRefresh =
        !isPublicSessionRequest ||
        originalRequest.skipAuthRefresh === true ||
        NO_REFRESH_PATHS.some((path) => reqUrl.includes(path));

      if (shouldSkipRefresh) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshed = await refreshPublicSession();
      if (refreshed) {
        return api(originalRequest);
      }

      // Refresh failed -> login hint hatao
      if (typeof window !== 'undefined') {
        clearAuthHint();

        // Do not hard-redirect on initial /auth/me check; DashboardLayout handles protected routes
        if (!reqUrl.includes('/auth/me') && window.location.pathname.includes('/dashboard')) {
          const locale = window.location.pathname.split('/')[1] || 'en';
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/${locale}/login?next=${next}`;
        }
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;

declare module 'axios' {
  interface AxiosRequestConfig {
    /** true = is request ke 401 pe public session refresh try mat karo */
    skipAuthRefresh?: boolean;
  }
}
