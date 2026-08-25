"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Bell, ShieldCheck, CheckCircle2, Tag, X, FileText, AlertTriangle, Building } from 'lucide-react';

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
  timestamp: string;
  read: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'info', icon?: React.ReactNode) => void;
  notifications: NotificationItem[];
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { isAuthenticated, user, isSeller, isLoading: authLoading, fetchProfile } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  // Helper to fetch notifications from the backend
  const fetchNotifications = async () => {
    if (!isAuthenticated || authLoading) return;
    try {
      const res = await api.get("/notifications?limit=50");
      const mapped = (res.data?.data?.notifications || res.data?.data || []).map((n: any) => ({
        id: n._id,
        title: n.title,
        message: n.body,
        type: n.type?.toLowerCase().includes('decline') || n.type?.toLowerCase().includes('reject') || n.type?.toLowerCase().includes('restrict') || n.type?.toLowerCase().includes('outbid') ? 'warning' : 
              n.type?.toLowerCase().includes('approve') || n.type?.toLowerCase().includes('verify') || n.type?.toLowerCase().includes('won') || n.type?.toLowerCase().includes('live') || n.type?.toLowerCase().includes('placed') ? 'success' : 
              'info',
        timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        read: n.isRead
      }));
      
      setNotifications((prev) => {
        // Keep any local notifications (whose IDs start with 'local-') that are not already present in the backend list
        const localNotifs = prev.filter(n => n.id.startsWith('local-'));
        const uniqueLocal = localNotifs.filter(ln => !mapped.some((mn: any) => mn.title === ln.title && mn.message === ln.message));
        const combined = [...uniqueLocal, ...mapped].slice(0, 50);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cmp_notifications', JSON.stringify(combined));
        }
        return combined;
      });
    } catch (err) {
      console.error("Failed to fetch notifications from backend:", err);
    }
  };

  // Load initial notifications from localStorage on mount (hybrid offline-first pattern)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cmp_notifications');
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse notifications from localStorage", e);
        }
      }
    }
  }, []);

  // Fetch latest notifications on authentication change
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchNotifications();
    } else if (!authLoading && !isAuthenticated) {
      setNotifications([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cmp_notifications');
      }
    }
  }, [isAuthenticated, authLoading]);

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

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info' = 'info',
    icon?: React.ReactNode
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Choose fallback icons based on type if none provided
    let finalIcon = icon;
    if (!finalIcon) {
      if (type === 'success') finalIcon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
      else if (type === 'warning') finalIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
      else finalIcon = <Bell className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />;
    }

    setToasts((prev) => [...prev, { id, title, message, type, icon: finalIcon }]);
    playChime();
    
    // Remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    let socketInstance: any = null;
    let isSubscribed = true;

    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        if (!isSubscribed) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
        const socketUrl = API_URL.replace(/\/api\/?$/, '');
        const token = Cookies.get('token');

        console.log("📡 Initializing Socket.io connection dynamically to:", socketUrl);
        socketInstance = io(socketUrl, {
          auth: {
            token: (token && token !== 'dummy-token-because-httponly') ? token : undefined
          },
          transports: ['websocket', 'polling'],
          withCredentials: true
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('📡 Socket connected successfully! ID:', socketInstance.id);
          setIsConnected(true);
          
          // 1. Join user-specific room
          socketInstance.emit('join_room', `user_${user._id}`);

          // 2. Join seller specific rooms if seller
          if (isSeller) {
            socketInstance.emit('join_room', `seller_live_auctions_${user._id}`);
          }

          // 3. Join global room for real-time listings/bids updates
          socketInstance.emit('join_room', 'global_auctions');
        });

        socketInstance.on('disconnect', () => {
          console.log('📡 Socket disconnected.');
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (err: any) => {
          console.warn('📡 Socket connection error:', err.message);
          setIsConnected(false);
          if (err.message.includes('token') || err.message.includes('expired') || err.message.includes('Authentication error')) {
            // Trigger profile fetch to refresh HttpOnly cookie, then reconnect
            fetchProfile().then(() => {
              console.log("📡 Retrying socket connection after token refresh...");
              socketInstance?.connect();
            }).catch((e) => console.error("Socket reconnect profile refresh failed", e));
          }
        });

        // Setup listeners for push notifications
        socketInstance.on('outbid_notification', (data: any) => {
          console.log("📡 [Socket Event] Received outbid_notification:", data);
          const msg = `You have been outoffered on "${data.propertyTitle || 'Property'}". New highest offer is AED ${Number(data.bidAmount || data.newPrice || 0).toLocaleString()}.`;
          addToast(
            "Higher Offer Alert!", 
            msg,
            'warning',
            <Tag className="w-5 h-5 text-rose-500 animate-bounce" />
          );
          fetchNotifications();
        });

        socketInstance.on('new_bid_on_property', (data: any) => {
          console.log("📡 [Socket Event] Received new_bid_on_property:", data);
          const msg = `A new offer of AED ${Number(data.bidAmount).toLocaleString()} was placed on your property "${data.propertyTitle}".`;
          addToast(
            "New Offer Received!", 
            msg,
            'success',
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          );
          fetchNotifications();
        });

        socketInstance.on('property_approved', (data: any) => {
          console.log("📡 [Socket Event] Received property_approved:", data);
          const msg = `Your property "${data.propertyTitle || 'Property'}" has been approved by admin.`;
          addToast(
            "Property Approved!", 
            msg,
            'success',
            <ShieldCheck className="w-5 h-5 text-[#5CD284]" />
          );
          fetchNotifications();
        });

        socketInstance.on('account_verified', (data: any) => {
          console.log("📡 [Socket Event] Received account_verified:", data);
          const msg = "Your broker/agency profile has been successfully verified by admin.";
          addToast(
            "Account Verified!", 
            msg,
            'success',
            <ShieldCheck className="w-5 h-5 text-[#5CD284]" />
          );
          fetchNotifications();
        });

        // ── BUYER SPECIFIC EVENTS ──
        socketInstance.on('contract_approved', (data: any) => {
          console.log("📡 [Socket Event] Received contract_approved:", data);
          const msg = `Your signed contract has been approved by admin! You can now place offers!`;
          addToast(
            "Contract Approved!", 
            msg,
            'success',
            <FileText className="w-5 h-5 text-green-500" />
          );
          fetchNotifications();
        });

        socketInstance.on('contract_rejected', (data: any) => {
          console.log("📡 [Socket Event] Received contract_rejected:", data);
          const msg = `Your signed contract has been rejected by admin. Please review the reasons on your dashboard.`;
          addToast(
            "Contract Rejected!", 
            msg,
            'warning',
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          );
          fetchNotifications();
        });

        // ── GLOBAL BROADCAST EVENTS ──
        socketInstance.on('new_auction_live', (data: any) => {
          console.log("📡 [Socket Event] Received new_auction_live globally:", data);
          if (!data || !data._id) return;
          const title = data.propertyId?.propertyTitle || data.propertyDetails?.propertyTitle || "New Property";
          const price = data.currentHighestBid ? data.currentHighestBid.toLocaleString() : (data.propertyDetails?.propertyPrice?.amount || "N/A");
           const msg = `"${title}" is now active with a starting price of AED ${price}!`;
          
          addToast(
            "New Offer Live!", 
            msg,
            'success',
            <Building className="w-5 h-5 text-green-500 animate-bounce" />
          );

          // Construct a local NotificationItem and prepend it to the list
          const localNotif: NotificationItem = {
            id: `local-${data._id}-${Date.now()}`,
            title: "New Offer Live!",
            message: msg,
            type: 'success',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            read: false
          };

          setNotifications((prev) => {
            const updated = [localNotif, ...prev].slice(0, 50);
            if (typeof window !== 'undefined') {
              localStorage.setItem('cmp_notifications', JSON.stringify(updated));
            }
            return updated;
          });
        });
      } catch (err) {
        console.error("Failed to dynamically initialize Socket.io client:", err);
      }
    };

    initSocket();

    return () => {
      isSubscribed = false;
      if (socketInstance) {
        console.log("📡 Disconnecting Socket...");
        socketInstance.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, user, isSeller, authLoading]);

  const joinRoom = (roomId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_room', roomId);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        if (typeof window !== 'undefined') {
          localStorage.setItem('cmp_notifications', JSON.stringify(updated));
        }
        return updated;
      });
      await api.patch("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cmp_notifications');
      }
      await api.delete("/notifications/clear-all");
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
      fetchNotifications();
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) => {
        const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cmp_notifications', JSON.stringify(updated));
        }
        return updated;
      });
      if (!id.startsWith('local-')) {
        await api.patch(`/notifications/${id}/read`);
      }
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cmp_notifications', JSON.stringify(updated));
        }
        return updated;
      });
      if (!id.startsWith('local-')) {
        await api.delete(`/notifications/${id}`);
      }
    } catch (err) {
      console.error(`Failed to delete notification ${id}:`, err);
      fetchNotifications();
    }
  };

  const pathname = usePathname();

  // Browser tab title count synchronization effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unreadCount = notifications.filter(n => !n.read).length;
    const cleanTitle = document.title.replace(/^\(\d+\)\s*/, '');
    
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${cleanTitle}`;
    } else {
      document.title = cleanTitle;
    }
  }, [notifications, pathname]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom, leaveRoom, addToast, notifications, markAllAsRead, clearAllNotifications, fetchNotifications, markAsRead, deleteNotification }}>
      {children}
      
      {/* Toast Notifications Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto w-full bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-4 flex gap-3.5 animate-in slide-in-from-right-4 duration-300 transform transition-all duration-300 relative group overflow-hidden"
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.icon}
            </div>
            
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">
                {toast.title}
              </span>
              <span className="text-[12.5px] text-gray-500 dark:text-gray-400 font-medium leading-normal">
                {toast.message}
              </span>
            </div>

            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            {/* Color Accent Indicator Strip */}
            <div className={`absolute top-0 bottom-0 left-0 w-[5px] ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              'bg-[#1A3626] dark:bg-[#c9a14b]'
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
