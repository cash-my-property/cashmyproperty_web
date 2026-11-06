"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { PUBLIC_API_PREFIX, refreshPublicSession } from '@/lib/api';
import { setAuthHint, clearAuthHint, hasAuthHint } from '@/lib/authHint';
import { unregisterPushToken } from '@/lib/pushToken';

export interface PublicAgentCompany {
  companyType: 'AGENCY' | 'DEVELOPER' | string;
  companyId: string;
  companyName: string | null;
  companyLogo: string | null;
}

export interface User {
  id: string;
  _id: string;
  code?: string;
  accountType: 'PUBLIC' | 'AGENT' | string;
  fullName: string;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string | null;
  phone: string;
  avatarUrl: string | null;
  picture: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
  signupSource: string | null;
  signupMethod?: 'EMAIL' | 'GOOGLE' | string;
  agent: PublicAgentCompany | null;
  role: { main: string; type: string } | string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  isAgent: boolean;
  /** Agency ka team member (DLD broker) — Real Time Offer mein contract/offer sirf yahi kar sakta hai */
  isBroker: boolean;
  login: (tokenOrUser: string | Partial<User>, maybeUser?: Partial<User>) => void;
  setUserData: (userData: Partial<User> | null) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function normalizePublicUser(raw: any): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const account = raw.account || raw.user || raw.data || raw;
  if (!account || (!account.id && !account._id && !account.email)) return null;

  const id = String(account.id || account._id || '');
  const fullName = String(
    account.fullName ||
      `${account.first_name || account.firstName || ''} ${account.last_name || account.lastName || ''}`.trim() ||
      account.email?.split('@')[0] ||
      'User'
  ).trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const mobile = account.mobile ?? account.phone ?? null;
  const avatarUrl = account.avatarUrl ?? account.picture ?? null;
  const accountType = account.accountType || 'PUBLIC';

  return {
    ...account,
    id,
    _id: id,
    accountType,
    fullName,
    first_name: firstName,
    last_name: lastName,
    firstName,
    lastName,
    email: account.email || '',
    mobile,
    phone: mobile || '',
    avatarUrl,
    picture: avatarUrl,
    emailVerified: account.emailVerified !== false,
    hasPassword: account.hasPassword !== false,
    signupSource: account.signupSource ?? null,
    signupMethod: account.signupMethod ?? 'EMAIL',
    agent: account.agent ?? null,
    // Buyer portal compatibility role
    role: { main: 'BUYER', type: 'SIMPLE' },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isBuyer = !!user;
  const isSeller = false;
  const isAgent = user?.accountType === 'AGENT';
  // Backend rule (e26dade): RTO offers sirf AGENT jiski company AGENCY ho; developer staff aur public sirf dekh sakte hain
  const isBroker = isAgent && user?.agent?.companyType === 'AGENCY';

  const refreshSession = useCallback(async (): Promise<boolean> => {
    return await refreshPublicSession();
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      // Guest (hint cookie nahi) ke liye 401 pe refresh mat try karo — pehle har guest page
      // load pe /auth/me 401 ke baad ek faltu /auth/refresh 401 bhi jaata tha.
      const response = await api.get(`${PUBLIC_API_PREFIX}/auth/me`, { skipAuthRefresh: !hasAuthHint() });
      const accountData = response.data?.data || response.data?.account || response.data;
      setUser(normalizePublicUser(accountData));
    } catch {
      // 401 = guest
      clearAuthHint();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On initial page load: always check GET /cmpConnect/public/auth/me (httpOnly cookies)
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Proxy ke optimistic dashboard guard ke liye hint cookie ko auth state se sync rakho
  useEffect(() => {
    if (isLoading) return;
    if (user) setAuthHint();
    else clearAuthHint();
  }, [user, isLoading]);

  // Proactive silent background refresh (every 10 minutes while logged in; access token TTL is 15m)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      await refreshPublicSession();
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  const setUserData = useCallback((userData: Partial<User> | null) => {
    if (!userData) {
      setUser(null);
      return;
    }
    setUser(normalizePublicUser(userData));
  }, []);

  const login = useCallback((tokenOrUser: string | Partial<User>, maybeUser?: Partial<User>) => {
    const rawUser = typeof tokenOrUser === 'string' ? maybeUser : tokenOrUser;
    const normalized = normalizePublicUser(rawUser);
    if (normalized) {
      setUser(normalized);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Is browser ki web push band — logout ke baad is device pe is account ki notifications na aayein
      await unregisterPushToken();
      await api.post(`${PUBLIC_API_PREFIX}/auth/logout`);
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      clearAuthHint();
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/logout`;
      } else {
        setUser(null);
      }
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      // Is browser ki web push band — logout ke baad is device pe is account ki notifications na aayein
      await unregisterPushToken();
      await api.post(`${PUBLIC_API_PREFIX}/auth/logout-all`);
    } catch (e) {
      console.error('Logout-all API failed', e);
    } finally {
      clearAuthHint();
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/logout`;
      } else {
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isBuyer,
        isSeller,
        isAgent,
        isBroker,
        login,
        setUserData,
        logout,
        logoutAll,
        fetchProfile,
        refreshSession,
      }}
    >
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
