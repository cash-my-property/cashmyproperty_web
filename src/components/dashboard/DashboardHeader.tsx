"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, User, Search, Globe, ChevronDown, LogOut, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useState } from "react";

export default function DashboardHeader() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.header;
  const router = useRouter();
  const { user, logout, fetchProfile } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

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

  const handleSwitchRole = async () => {
    try {
      setIsSwitching(true);
      const currentRole = typeof user?.role === 'string' ? user.role : (user?.role as any)?.main || "buyer";
      const targetRole = currentRole.toLowerCase() === "buyer" ? "seller" : "buyer";
      
      const baseUrl = api.defaults.baseURL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
      
      await api.put('/switch/toggleRole', { newRole: targetRole }, {
        baseURL: baseUrl
      });
      
      if (fetchProfile) {
        await fetchProfile();
      }
      
      router.refresh();
    } catch (error) {
      console.error("Failed to switch role", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-[#102418] border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors">
      
      {/* Search Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-[#102418]/50 rounded-xl w-80 border border-transparent focus-within:border-[#5CD284]/50 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
        <Search className="w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search properties, offers..."
          className="w-full bg-transparent border-none outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-6">
        
        {/* Actions */}
        <div className="flex items-center gap-4 border-e border-gray-200 dark:border-[#1A3626] pe-6">
          <Link href={`/${locale}`} className="text-[13px] font-semibold text-gray-500 hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">
            {content.backToSite}
          </Link>

          {/* Language Selector */}
          <div className="relative group cursor-pointer ml-1">
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#102418] text-gray-600 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-all">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-semibold text-[12px] tracking-wide uppercase">{locale}</span>
              <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute top-[120%] ltr:right-0 rtl:left-0 mt-2 w-32 bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform ltr:origin-top-right rtl:origin-top-left group-hover:scale-100 scale-95 overflow-hidden">
              <div className="p-1 flex flex-col gap-0.5">
                <button onClick={() => switchLanguage('en')} className={`w-full text-start px-3 py-2 rounded-lg text-[12px] font-bold tracking-wide transition-colors ${locale === 'en' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50/80 dark:bg-[#163321]/80' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#163321]'}`}>English</button>
                <button onClick={() => switchLanguage('ar')} className={`w-full text-start px-3 py-2 rounded-lg text-[12px] font-bold tracking-wide transition-colors ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50/80 dark:bg-[#163321]/80' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#163321]'}`}>العربية</button>
              </div>
            </div>
          </div>

          <ThemeToggle />

          <button className="relative w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#102418] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-none capitalize">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "User"}
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize">
                {typeof user?.role === 'string' ? user.role : (user?.role as any)?.main || "Buyer"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1A3626]/10 dark:bg-[#c9a14b]/20 border border-[#1A3626]/20 dark:border-[#c9a14b]/30 flex items-center justify-center text-[#1A3626] dark:text-[#c9a14b] group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
          </div>
          
          {/* Dropdown menu */}
          <div className="absolute top-[120%] ltr:right-0 rtl:left-0 mt-2 w-48 bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform ltr:origin-top-right rtl:origin-top-left group-hover:scale-100 scale-95 overflow-hidden">
            <div className="p-1 flex flex-col gap-0.5">
              <Link href={`/${locale}/dashboard/settings`} className="w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#c9a14b] hover:bg-gray-50 dark:hover:bg-[#163321] flex items-center gap-2">
                <User className="w-4 h-4" /> Profile Settings
              </Link>
              
              <button 
                onClick={handleSwitchRole}
                disabled={isSwitching}
                className="w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#c9a14b] hover:bg-gray-50 dark:hover:bg-[#163321] flex items-center gap-2 disabled:opacity-50"
              >
                {isSwitching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
                Switch to {(() => {
                  const currentRole = typeof user?.role === 'string' ? user.role : (user?.role as any)?.main || "buyer";
                  return currentRole.toLowerCase() === 'buyer' ? 'Seller' : 'Buyer';
                })()}
              </button>

              <div className="h-px bg-gray-100 dark:bg-[#163321] my-1" />
              <button 
                onClick={() => logout()}
                className="w-full text-start px-3 py-2.5 rounded-lg text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
