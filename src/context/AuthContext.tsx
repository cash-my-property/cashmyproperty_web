"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | any;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to extract the main role string regardless of format
function getUserMainRole(user: User | null): string {
  if (!user) return '';
  const role = user.role;
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role !== null && role.main) return role.main.toLowerCase();
  return '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mainRole = getUserMainRole(user);
  const isBuyer = mainRole === 'buyer';
  const isSeller = mainRole === 'seller';

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/my-profile');
      setUser(response.data.user || response.data.data || response.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      Cookies.remove('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call backend logout
      await api.post('/auth/logout', {
        deviceInformation: {
          deviceId: "DEVICE_ID_1234"
        }
      });
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      Cookies.remove('token');
      // Redirect to the logout success page first
      // We don't call setUser(null) here because the dashboard layout will instantly catch it 
      // and redirect to /login before the window.location.href can execute, causing a race condition.
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/logout`;
      } else {
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isBuyer, isSeller, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
