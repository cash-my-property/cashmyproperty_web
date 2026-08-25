import axios from 'axios';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = (envApiUrl ? envApiUrl.replace(/\/auth\/?$/, '') : 'https://testapi.cmpdubai.com/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // authToken + refreshToken cookies automatically sent by browser
});



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
      // Avoid refreshing token if the failed request was an auth action (login, signup, refresh, verify, reset, forgot)
      if (
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
