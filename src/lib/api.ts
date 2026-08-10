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

// Response interceptor to handle token expiry / unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // Do not redirect to login if we are actively trying to logout,
      // because logout handles its own redirect
      if (typeof window !== 'undefined' && error.config?.url !== '/logout') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
