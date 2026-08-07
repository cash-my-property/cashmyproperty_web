import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://testapi.cmpdubai.com/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // If we are on the client, redirect to login
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
