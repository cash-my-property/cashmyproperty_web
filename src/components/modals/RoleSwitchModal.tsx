"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, Tag, Check, ArrowRight, Loader2, Sparkles, ShoppingBag, Store, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleSwitchModal({ isOpen, onClose }: RoleSwitchModalProps) {
  const router = useRouter();
  const { locale } = useDictionary();
  const { user, fetchProfile } = useAuth();
  const { addToast } = useSocket();

  const currentRole = user ? (typeof user.role === 'string' ? user.role.toUpperCase() : (user.role as any)?.main?.toUpperCase()) : 'BUYER';
  const currentType = user ? (typeof user.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR') : 'REGULAR';

  const [activeTab, setActiveTab] = useState<"BUYER" | "SELLER">(currentRole === "SELLER" ? "SELLER" : "BUYER");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const roleUpper = typeof user.role === 'string' ? user.role.toUpperCase() : (user.role as any)?.main?.toUpperCase();
      setActiveTab(roleUpper === 'SELLER' ? 'SELLER' : 'BUYER');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSelectMode = async (targetRole: "BUYER" | "SELLER", targetType: "REGULAR" | "SIMPLE") => {
    const key = `${targetRole}_${targetType}`;
    try {
      setLoadingKey(key);

      // Check if already active
      if (currentRole === targetRole && currentType === targetType) {
        onClose();
        return;
      }

      // API call to switch role and type directly in backend
      await api.put('/switch/toggleRole', { 
        main: targetRole, 
        type: targetType 
      });

      if (fetchProfile) {
        await fetchProfile();
      }

      const roleLabel = targetRole === 'BUYER' ? 'Buyer' : 'Seller';
      const typeLabel = targetType === 'REGULAR' ? 'Realtime' : 'Simple Listing';

      addToast(
        "Mode Switched", 
        `You are now in ${typeLabel} ${roleLabel} mode.`, 
        "success"
      );

      onClose();

      // Redirect user to relevant page based on new role
      if (targetRole === 'BUYER') {
        if (targetType === 'REGULAR') {
          router.push(`/${locale}/auctions`);
        } else {
          router.push(`/${locale}/listings`);
        }
      } else {
        if (targetType === 'REGULAR') {
          router.push(`/${locale}/dashboard/seller/properties`);
        } else {
          router.push(`/${locale}/dashboard/seller/simple-listings`);
        }
      }

      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (err: any) {
      console.error("Failed to switch mode:", err);
      const errorMsg = err?.response?.data?.message || "Failed to switch mode. Please try again.";
      addToast("Error", errorMsg, "warning");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-gray-100 dark:border-[#1A3626] relative bg-gradient-to-br from-green-50/50 via-transparent to-amber-50/20 dark:from-[#163321]/40 dark:to-[#091711]">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Account Mode Selector
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Switch Account Mode
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Select your preferred role and trading preference in one click.
          </p>

          {/* Role Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-white/80 dark:bg-[#091711]/80 p-1.5 rounded-2xl border border-gray-200/60 dark:border-[#1A3626]">
            <button
              onClick={() => setActiveTab("BUYER")}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "BUYER"
                  ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer Modes</span>
              {currentRole === "BUYER" && (
                <span className="w-2 h-2 rounded-full bg-[#5CD284] animate-pulse ml-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("SELLER")}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "SELLER"
                  ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321]"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Seller Modes</span>
              {currentRole === "SELLER" && (
                <span className="w-2 h-2 rounded-full bg-[#5CD284] animate-pulse ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-7 flex flex-col gap-4 bg-gray-50/50 dark:bg-[#091711]/50">
          
          {/* Realtime Mode Card */}
          <div 
            onClick={() => handleSelectMode(activeTab, "REGULAR")}
            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              currentRole === activeTab && currentType === 'REGULAR'
                ? "bg-green-50/80 dark:bg-[#163321]/60 border-[#5CD284] shadow-md"
                : "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] hover:border-[#1A3626] dark:hover:border-[#c9a14b] hover:shadow-lg"
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#c9a14b] transition-colors">
                    {activeTab === 'BUYER' ? 'Realtime Buyer' : 'Realtime Seller'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Realtime Offers
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {activeTab === 'BUYER' 
                    ? "Explore realtime property offers, submit counter-offers in real time, and access direct deals."
                    : "List properties for realtime buyer offers, receive live counter-offers, and close deals fast."}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
              {loadingKey === `${activeTab}_REGULAR` ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
              ) : currentRole === activeTab && currentType === 'REGULAR' ? (
                <span className="px-3 py-1.5 rounded-xl bg-green-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 group-hover:bg-[#1A3626] dark:group-hover:bg-[#c9a14b] group-hover:text-white dark:group-hover:text-[#1A3626] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Simple Listing Mode Card */}
          <div 
            onClick={() => handleSelectMode(activeTab, "SIMPLE")}
            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              currentRole === activeTab && currentType === 'SIMPLE'
                ? "bg-amber-50/80 dark:bg-[#163321]/60 border-[#c9a14b] shadow-md"
                : "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] hover:border-[#1A3626] dark:hover:border-[#c9a14b] hover:shadow-lg"
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-[#c9a14b]/20 text-amber-600 dark:text-[#c9a14b] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#c9a14b] transition-colors">
                    {activeTab === 'BUYER' ? 'Simple Listing Buyer' : 'Simple Listing Seller'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Fixed Price / Rent
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {activeTab === 'BUYER' 
                    ? "Browse direct sale and rental properties, view fixed asking prices, and download undertaking letters."
                    : "List properties with fixed asking price or rental terms for direct buyer inquiries and standard transactions."}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
              {loadingKey === `${activeTab}_SIMPLE` ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              ) : currentRole === activeTab && currentType === 'SIMPLE' ? (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 group-hover:bg-[#1A3626] dark:group-hover:bg-[#c9a14b] group-hover:text-white dark:group-hover:text-[#1A3626] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#102418] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Switch directly between any mode at any time.</span>
          </div>
          <button 
            onClick={onClose}
            className="font-bold hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
