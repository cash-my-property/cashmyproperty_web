"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, User, Search, Globe, ChevronDown, LogOut, RefreshCw, Loader2, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import { useState } from "react";
import RoleSwitchModal from "@/components/modals/RoleSwitchModal";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.header;
  const router = useRouter();
  const { user, logout, fetchProfile } = useAuth();
  const { notifications, markAllAsRead, clearAllNotifications, markAsRead, deleteNotification } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalTarget, setRoleModalTarget] = useState<"BUYER" | "SELLER">("BUYER");

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

  const openRoleModal = (target: "BUYER" | "SELLER") => {
    setRoleModalTarget(target);
    setRoleModalOpen(true);
  };

  const currentRole = typeof user?.role === 'string' ? user.role : (user?.role as any)?.main || "buyer";
  const isSeller = currentRole.toLowerCase() === "seller";

  return (
    <>
      <header className="h-20 bg-white dark:bg-[#102418] border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors">
        
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#102418] rounded-lg transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={(content as any).searchPlaceholder || "Search properties..."}
              className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-gray-50 dark:bg-[#163321]/50 border border-gray-200 dark:border-[#1A3626] rounded-xl text-[13px] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ltr:ml-auto rtl:mr-auto">
          
          {/* Quick Become Role Button */}
          {isSeller ? (
            <button
              onClick={() => openRoleModal("BUYER")}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-[#5CD284] hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Become Buyer</span>
            </button>
          ) : (
            <button
              onClick={() => openRoleModal("SELLER")}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-[#c9a14b] hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Become Seller</span>
            </button>
          )}

          {/* Theme Toggle */}
          <div className="scale-90">
            <ThemeToggle />
          </div>

          {/* Language Selector */}
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#163321] text-gray-700 dark:text-gray-300 transition-colors">
              <Globe className="w-4 h-4" />
              <span className="font-semibold text-xs uppercase">{locale}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </div>
            <div className="absolute top-[120%] ltr:right-0 rtl:left-0 mt-1 w-32 bg-white dark:bg-[#102418] rounded-xl shadow-lg border border-gray-100 dark:border-[#1A3626] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform ltr:origin-top-right rtl:origin-top-left group-hover:scale-100 scale-95 overflow-hidden p-1 z-50">
              <button onClick={() => switchLanguage('en')} className={`w-full text-start px-3 py-2 rounded-lg text-xs font-semibold ${locale === 'en' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50 dark:bg-[#163321]' : 'text-gray-600 dark:text-gray-400'}`}>English</button>
              <button onClick={() => switchLanguage('ar')} className={`w-full text-start px-3 py-2 rounded-lg text-xs font-semibold ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50 dark:bg-[#163321]' : 'text-gray-600 dark:text-gray-400'}`}>العربية</button>
            </div>
          </div>

          {/* Notifications Center */}
          <div className="relative flex items-center">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 ltr:right-1.5 rtl:left-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute top-[135%] ltr:right-0 rtl:left-0 mt-2 w-80 bg-white dark:bg-[#102418] rounded-2xl shadow-[0_10px_45px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_45px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-40 transform ltr:origin-top-right rtl:origin-top-left scale-100 transition-all overflow-hidden flex flex-col max-h-[420px]">
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

          {/* Profile Dropdown */}
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-[#1A3626]">
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-none capitalize">
                  {user ? (user.fullName || `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.name || "User") : "User"}
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                  {(() => {
                    const currentType = (typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR');
                    const typeLabel = currentType === 'REGULAR' ? 'Realtime' : 'Simple Listing';
                    const roleLabel = isSeller ? 'Seller' : 'Buyer';
                    return `${typeLabel} ${roleLabel}`;
                  })()}
                </span>
              </div>
              {user?.picture ? (
                <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-[#1A3626]/20 dark:border-[#c9a14b]/30 group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1A3626]/10 dark:bg-[#c9a14b]/20 border border-[#1A3626]/20 dark:border-[#c9a14b]/30 flex items-center justify-center text-[#1A3626] dark:text-[#c9a14b] group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
            
            {/* Dropdown menu */}
            <div className="absolute top-[120%] ltr:right-0 rtl:left-0 mt-2 w-56 bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform ltr:origin-top-right rtl:origin-top-left group-hover:scale-100 scale-95 overflow-hidden">
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link href={`/${locale}/dashboard/settings`} className="w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#c9a14b] hover:bg-gray-50 dark:hover:bg-[#163321] flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile Settings
                </Link>
                
                <button 
                  onClick={() => openRoleModal(isSeller ? "BUYER" : "SELLER")}
                  className="w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#c9a14b] hover:bg-gray-50 dark:hover:bg-[#163321] flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> 
                  Switch to {isSeller ? "Buyer" : "Seller"} Mode
                </button>

                <div className="h-px bg-gray-100 dark:bg-[#163321] my-1" />

                <button 
                  onClick={logout}
                  className="w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> {(content as any).logout || "Logout"}
                </button>
              </div>
            </div>
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
