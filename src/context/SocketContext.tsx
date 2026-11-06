"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import FcmListener from '@/components/notifications/FcmListener';
import { useAuth } from '@/context/AuthContext';
import connectPublicService, { type PublicNotification } from '@/services/connectPublicService';

/**
 * App-wide toasts + in-app notifications.
 *
 * Notifications: CMP Connect /me/notifications (backend 3a443ea / 7d83c9b) — login ke baad list,
 * har 60 s unread-count (tab visible ho to), FCM push aane pe list taaza. Read / delete / clear
 * server pe save hote hain (optimistic UI). Deep link: data.url → website route (href).
 * Naam (`useSocket`) compatibility ke liye wahi hai — purana legacy socket.io ab nahi hai.
 */

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  icon: React.ReactNode;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  /** Padhne layak waqt ("5m ago") */
  timestamp: string;
  read: boolean;
  /** Click pe kahan jana hai (locale ke saath) */
  href?: string;
}

interface SocketContextType {
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'info', icon?: React.ReactNode) => void;
  notifications: NotificationItem[];
  /** FCM foreground message aaya → server se list taaza karo */
  pushNotification: (n: { title: string; message: string; type?: NotificationItem['type'] }) => void;
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const newId = () => Math.random().toString(36).substring(2, 9);

const localeOf = (pathname: string | null) => (pathname?.split('/')[1] === 'ar' ? 'ar' : 'en');

// Backend data.url (e.g. /real-time-offers/:id, /listings/:ref) → website route
export function notificationHref(n: PublicNotification, locale: string): string | undefined {
  const raw = typeof n.data?.url === 'string' ? n.data.url : undefined;
  const path = raw
    || (n.data?.auctionId ? `/real-time-offers/${n.data.auctionId}` : undefined)
    || (n.data?.listingRef ? `/listings/${n.data.listingRef}` : undefined);
  if (!path || !path.startsWith('/') || path.startsWith('//')) return undefined;
  const mapped = path.replace(/^\/real-time-offers\//, '/auctions/');
  return /^\/(en|ar)(\/|$)/.test(mapped) ? mapped : `/${locale}${mapped}`;
}

function timeAgo(iso: string, locale: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', { numeric: 'auto', style: 'short' });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-AE', { dateStyle: 'medium', timeZone: 'Asia/Dubai' });
}

const toItem = (n: PublicNotification, locale: string): NotificationItem => ({
  id: n.id,
  title: n.title,
  message: n.body,
  type: /SUCCESS|WON|APPROVED/i.test(n.type) ? 'success' : /WARN|REJECT|OUTBID|LOST/i.test(n.type) ? 'warning' : 'info',
  timestamp: timeAgo(n.at, locale),
  read: n.read,
  href: notificationHref(n, locale),
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const lastUnread = useRef<number | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await connectPublicService.getNotifications({ limit: 30 });
      const items = (res.data || []).map((n) => toItem(n, locale));
      setNotifications(items);
      const unread = items.filter((n) => !n.read).length;
      setUnreadCount(unread);
      lastUnread.current = unread;
    } catch {
      /* bell khaali rahe — page na toote */
    }
  }, [isAuthenticated, locale]);

  // Login hote hi list; logout pe saaf
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      lastUnread.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- logout pe list saaf
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    refreshNotifications();
  }, [authLoading, isAuthenticated, refreshNotifications]);

  // Har 60 s unread-count (tab visible ho to). Count badhe to poori list taaza.
  useEffect(() => {
    if (!isAuthenticated) return;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const n = await connectPublicService.getUnreadNotificationCount();
        if (lastUnread.current !== null && n > lastUnread.current) await refreshNotifications();
        else setUnreadCount(n);
        lastUnread.current = Math.max(n, 0);
      } catch {
        /* agla tick */
      }
    };
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [isAuthenticated, refreshNotifications]);

  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // High-pitched sine wave double chime (soft, alert-style)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, now); // E6
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760.00, now + 0.1); // A6
      gain2.gain.setValueAtTime(0.06, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio Context playback failed or blocked by browser:", e);
    }
  };


  const addToast = useCallback((
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info' = 'info',
    icon?: React.ReactNode
  ) => {
    const id = newId();
    const finalIcon = icon
      ?? (type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" />
        : type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" />
        : <Bell className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />);

    setToasts((prev) => [...prev, { id, title, message, type, icon: finalIcon }]);
    playChime();
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  // FCM foreground push → server list taaza (push ka record backend mein hai)
  const pushNotification = useCallback(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    lastUnread.current = 0;
    connectPublicService.markAllNotificationsRead().catch(() => refreshNotifications());
  }, [refreshNotifications]);
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    lastUnread.current = 0;
    connectPublicService.clearNotifications().catch(() => refreshNotifications());
  }, [refreshNotifications]);
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    if (lastUnread.current) lastUnread.current -= 1;
    try { await connectPublicService.markNotificationRead(id); } catch { refreshNotifications(); }
  }, [refreshNotifications]);
  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try { await connectPublicService.deleteNotification(id); } catch { refreshNotifications(); }
  }, [refreshNotifications]);

  // Unread count tab title mein: "(2) Page title"
  useEffect(() => {
    const cleanTitle = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = unreadCount > 0 ? `(${unreadCount}) ${cleanTitle}` : cleanTitle;
  }, [unreadCount, pathname]);

  return (
    <SocketContext.Provider value={{ addToast, notifications, pushNotification, unreadCount, refreshNotifications, markAllAsRead, clearAllNotifications, markAsRead, deleteNotification }}>
      <FcmListener />
      {children}

      {/* Toast Notifications Overlay Container */}
      <div className="fixed bottom-6 end-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto w-full bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-4 flex gap-3.5 animate-in slide-in-from-right-4 duration-300 transform transition-all relative group overflow-hidden"
          >
            <div className="flex-shrink-0 mt-0.5">{toast.icon}</div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">{toast.title}</span>
              <span className="text-[12.5px] text-gray-500 dark:text-gray-400 font-medium leading-normal">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Dismiss"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className={`absolute top-0 bottom-0 start-0 w-[5px] ${
              toast.type === 'success' ? 'bg-green-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-[#1A3626] dark:bg-[#c9a14b]'
            }`} />
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
