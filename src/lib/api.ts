import axios from 'axios';
import Cookies from 'js-cookie';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = (envApiUrl ? envApiUrl.replace(/\/auth\/?$/, '') : 'https://testapi.cmpdubai.com/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // authToken + refreshToken cookies automatically sent by browser
});

// Request interceptor to attach Bearer token to every authenticated request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token && token.startsWith('eyJ') && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token expiry / unauthenticated
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error status is 401 and the request has not been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid refreshing token for public endpoints or auth actions
      if (
        originalRequest.url?.includes('/public/') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/signup') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/verify') ||
        originalRequest.url?.includes('/auth/reset-password') ||
        originalRequest.url?.includes('/auth/forgot-password')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newToken = refreshResponse.data?.token || refreshResponse.data?.accessToken;

        if (newToken) {
          Cookies.set('token', newToken, { expires: 7 });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        isRefreshing = false;
        processQueue(null, newToken || null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        if (typeof window !== 'undefined' && originalRequest.url !== '/auth/logout') {
          Cookies.remove('token');
          localStorage.removeItem('token');
          const isDashboardRoute = window.location.pathname.includes('/dashboard');
          if (isDashboardRoute) {
            const locale = window.location.pathname.split('/')[1] || 'en';
            window.location.href = `/${locale}/login`;
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
