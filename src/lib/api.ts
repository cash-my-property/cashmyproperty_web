import axios from 'axios';
import Cookies from 'js-cookie';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = (envApiUrl ? envApiUrl.replace(/\/auth\/?$/, '') : 'https://testapi.cmpdubai.com/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    // Only set Authorization header if we have a real token (e.g. from a different auth flow)
    // The dummy token is just a flag for the frontend context
    if (token && token !== 'dummy-token-because-httponly') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

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
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid looping if the refresh request itself fails with 401/403
      if (originalRequest.url?.includes('/auth/refresh')) {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          const locale = window.location.pathname.split('/')[1] || 'en';
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        
        Cookies.remove('token');
        if (typeof window !== 'undefined' && originalRequest.url !== '/logout') {
          const locale = window.location.pathname.split('/')[1] || 'en';
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
