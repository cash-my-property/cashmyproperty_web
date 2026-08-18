"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { Bell, ShieldCheck, CheckCircle2, Gavel, X, FileText, AlertTriangle } from 'lucide-react';

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
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'info', icon?: React.ReactNode) => void;
  notifications: NotificationItem[];
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { isAuthenticated, user, isSeller, isLoading: authLoading, fetchProfile } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  // Load notifications from localStorage on client-side mount
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

  const addNotification = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info' = 'info'
  ) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 50); // Keep max 50 items
      if (typeof window !== 'undefined') {
        localStorage.setItem('cmp_notifications', JSON.stringify(updated));
      }
      return updated;
    });
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
      else if (type === 'warning') finalIcon = <Gavel className="w-5 h-5 text-amber-500" />;
      else finalIcon = <Bell className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />;
    }

    setToasts((prev) => [...prev, { id, title, message, type, icon: finalIcon }]);
    
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
    // Derive Socket URL from API URL (replace /api with empty string to get server root URL)
    const socketUrl = API_URL.replace(/\/api\/?$/, '');

    // Get current access token (could be the dummy token or the actual token if logged in via OAuth/Google)
    const token = Cookies.get('token');

    console.log("📡 Initializing Socket.io connection to:", socketUrl);
    const socketInstance = io(socketUrl, {
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
      
      // 1. Join user-specific room
      socketInstance.emit('join_room', `user_${user._id}`);

      // 2. Join seller specific rooms if seller
      if (isSeller) {
        socketInstance.emit('join_room', `seller_live_auctions_${user._id}`);
      }

      // 3. Join global room for real-time listings/bids updates
      socketInstance.emit('join_room', 'global_auctions');
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('📡 Socket connection error:', err.message);
      if (err.message.includes('token') || err.message.includes('expired') || err.message.includes('Authentication error')) {
        // Trigger profile fetch to refresh HttpOnly cookie, then reconnect
        fetchProfile().then(() => {
          console.log("📡 Retrying socket connection after token refresh...");
          socketInstance.connect();
        }).catch((e) => console.error("Socket reconnect profile refresh failed", e));
      }
    });

    // Setup listeners for push notifications
    socketInstance.on('outbid_notification', (data: any) => {
      console.log("📡 [Socket Event] Received outbid_notification:", data);
      const msg = `You have been outbid on "${data.propertyTitle || 'Property'}". New highest bid is Ð ${Number(data.bidAmount || data.newPrice || 0).toLocaleString()}.`;
      addToast(
        "Outbid Alert!", 
        msg,
        'warning',
        <Gavel className="w-5 h-5 text-rose-500 animate-bounce" />
      );
      addNotification("Outbid Alert!", msg, 'warning');
    });

    socketInstance.on('new_bid_on_property', (data: any) => {
      console.log("📡 [Socket Event] Received new_bid_on_property:", data);
      const msg = `A new bid of Ð ${Number(data.bidAmount).toLocaleString()} was placed on your property "${data.propertyTitle}".`;
      addToast(
        "New Bid Received!", 
        msg,
        'success',
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      );
      addNotification("New Bid Received!", msg, 'success');
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
      addNotification("Property Approved!", msg, 'success');
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
      addNotification("Account Verified!", msg, 'success');
    });

    // ── BUYER SPECIFIC EVENTS ──
    socketInstance.on('contract_approved', (data: any) => {
      console.log("📡 [Socket Event] Received contract_approved:", data);
      const msg = `Your signed contract for auction has been approved by admin! You can now place bids!`;
      addToast(
        "Contract Approved!", 
        msg,
        'success',
        <FileText className="w-5 h-5 text-green-500" />
      );
      addNotification("Contract Approved!", msg, 'success');
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
      addNotification("Contract Rejected!", msg, 'warning');
    });

    return () => {
      console.log("📡 Disconnecting Socket...");
      socketInstance.disconnect();
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

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('cmp_notifications', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cmp_notifications');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinRoom, leaveRoom, addToast, notifications, markAllAsRead, clearAllNotifications }}>
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
