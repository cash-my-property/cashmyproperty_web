"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Globe, ChevronDown, RefreshCw, Menu, Check, Trash2, Sparkles, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useState } from "react";
import RoleSwitchModal from "@/components/modals/RoleSwitchModal";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { locale } = useDictionary();
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, markAllAsRead, clearAllNotifications, markAsRead, deleteNotification } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    
    const segments = window.location.pathname.split('/');
    if (segments[1] === locale) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    const newPath = segments.join('/') || '/';
    
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(newPath);
    router.refresh();
  };

  const currentRole = typeof user?.role === 'string' ? user.role.toUpperCase() : (user?.role as any)?.main?.toUpperCase() || "BUYER";
  const currentType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';
  const isSeller = currentRole === "SELLER";

  const typeLabel = currentType === 'REGULAR' ? 'Realtime' : 'Simple';
  const roleLabel = isSeller ? 'Seller' : 'Buyer';
  const currentModeLabel = `${typeLabel} ${roleLabel}`;

  const userName = user ? (user.fullName || `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.name || "User") : "User";
  const firstName = userName.split(' ')[0] || "User";

  return (
    <>
      <header className="h-16 sm:h-20 bg-white/95 dark:bg-[#102418]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-40 transition-colors gap-2">
        
        {/* 1. LEFT ZONE: Mobile Drawer Toggle & User Greeting */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 max-w-[50%] sm:max-w-none">
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
              <span className="truncate">Welcome back, {firstName}</span>
              <span className="hidden sm:inline">👋</span>
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              <LayoutDashboard className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#5CD284]" />
              <span>Dashboard Control Panel</span>
            </div>
          </div>
        </div>

        {/* 2. CENTER ZONE: Fills Empty Space on Laptop / Desktop Screens gracefully */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
          <div className="w-full bg-gray-50/90 dark:bg-[#163321]/50 border border-gray-200/80 dark:border-[#1A3626] rounded-full px-4 py-2 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5CD284] animate-pulse" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Mode:</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{currentModeLabel}</span>
            </div>
            
            <button
              onClick={() => setRoleModalOpen(true)}
              className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Switch</span>
            </button>
          </div>
        </div>

        {/* 3. RIGHT ZONE: Action Controls (Optimized for Mobile & Laptop) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Mobile Mode Switch Button (Visible on Mobile only when Center Zone is hidden) */}
          <button
            onClick={() => setRoleModalOpen(true)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold text-[11px] bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b] border border-[#1A3626]/20 dark:border-[#c9a14b]/30 hover:bg-[#1A3626]/20 transition-all cursor-pointer shrink-0"
            title="Switch Mode"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[75px] xs:max-w-[100px]">{currentModeLabel}</span>
          </button>

          {/* Theme Toggle */}
          <div className="scale-85 sm:scale-90 shrink-0">
            <ThemeToggle />
          </div>

          {/* Language Selector */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#163321] text-gray-700 dark:text-gray-300 transition-colors text-xs font-bold">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="uppercase text-[11px] sm:text-xs">{locale}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </div>
            <div className="absolute top-[120%] ltr:right-0 rtl:left-0 mt-1 w-32 bg-white dark:bg-[#102418] rounded-xl shadow-lg border border-gray-100 dark:border-[#1A3626] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform ltr:origin-top-right rtl:origin-top-left group-hover:scale-100 scale-95 overflow-hidden p-1 z-50">
              <button onClick={() => switchLanguage('en')} className={`w-full text-start px-3 py-2 rounded-lg text-xs font-semibold ${locale === 'en' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50 dark:bg-[#163321]' : 'text-gray-600 dark:text-gray-400'}`}>English</button>
              <button onClick={() => switchLanguage('ar')} className={`w-full text-start px-3 py-2 rounded-lg text-xs font-semibold ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50 dark:bg-[#163321]' : 'text-gray-600 dark:text-gray-400'}`}>العربية</button>
            </div>
          </div>

          {/* Notifications Center */}
          <div className="relative flex items-center shrink-0">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-xl transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 ltr:right-1 rtl:left-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute top-[135%] ltr:right-0 rtl:left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#102418] rounded-2xl shadow-[0_10px_45px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_45px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-40 transform ltr:origin-top-right rtl:origin-top-left scale-100 transition-all overflow-hidden flex flex-col max-h-[420px]">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-[#1A3626] flex items-center justify-between bg-gray-50/50 dark:bg-[#102418]/50">
                    <span className="text-[13px] font-bold text-gray-900 dark:text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <div className="flex gap-2.5 items-center">
                        {notifications.some(n => !n.read) && (
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-bold text-[#5CD284] hover:text-[#4ab872] transition-colors cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                        <span className="text-gray-300 dark:text-[#1A3626] text-[10px]">|</span>
                        <button 
                          onClick={() => {
                            clearAllNotifications();
                            setShowNotifications(false);
                          }}
                          className="text-[11px] font-bold text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-[#1A3626] max-h-[320px] custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 flex flex-col items-center justify-center text-center">
                        <Bell className="w-8 h-8 text-gray-300 dark:text-[#1A3626] mb-2" />
                        <p className="text-[12px] text-gray-400 font-medium">You don't have any notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (!notif.read) {
                              markAsRead(notif.id);
                            }
                          }}
                          className={`p-4 flex gap-3 hover:bg-gray-50/40 dark:hover:bg-[#163321]/30 transition-colors group/item relative cursor-pointer ${!notif.read ? 'bg-green-50/10 dark:bg-[#163321]/10' : ''}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === 'success' ? 'bg-green-500' :
                            notif.type === 'warning' ? 'bg-amber-500' :
                            'bg-[#1A3626] dark:bg-[#c9a14b]'
                          }`} />
                          <div className="flex-1 flex flex-col gap-0.5 pr-8">
                            <span className={`text-[12.5px] font-bold text-gray-900 dark:text-white leading-tight ${notif.read ? 'opacity-60' : ''}`}>
                              {notif.title}
                            </span>
                            <span className={`text-[11.5px] text-gray-500 dark:text-gray-400 font-medium leading-normal ${notif.read ? 'opacity-60' : ''}`}>
                              {notif.message}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                              {notif.timestamp}
                            </span>
                          </div>
                          <div className="absolute right-3 top-3.5 flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            {!notif.read && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#163321] text-green-600 border border-gray-200/50 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#163321] text-rose-500 border border-gray-200/50 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Role Switch Confirmation Modal */}
      <RoleSwitchModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />
    </>
  );
}
