"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ArrowRight, Loader2, Sparkles, ShoppingBag, Store, ShieldCheck } from "lucide-react";
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

  const [loadingRole, setLoadingRole] = useState<"BUYER" | "SELLER" | null>(null);

  if (!isOpen) return null;

  const handleSwitchRole = async (targetRole: "BUYER" | "SELLER") => {
    try {
      setLoadingRole(targetRole);

      // Check if already active
      if (currentRole === targetRole) {
        onClose();
        return;
      }

      // API call to switch role while preserving current type (SIMPLE / REGULAR)
      await api.put('/switch/toggleRole', { 
        main: targetRole, 
        type: currentType 
      });

      if (fetchProfile) {
        await fetchProfile();
      }

      const roleLabel = targetRole === 'BUYER' ? 'Buyer Mode' : 'Seller Mode';

      addToast(
        "Role Switched", 
        `You have successfully switched to ${roleLabel}.`, 
        "success"
      );

      onClose();

      // Redirect user to relevant dashboard page
      if (targetRole === 'BUYER') {
        if (currentType === 'SIMPLE') {
          router.push(`/${locale}/listings`);
        } else {
          router.push(`/${locale}/auctions`);
        }
      } else {
        if (currentType === 'SIMPLE') {
          router.push(`/${locale}/dashboard/seller/simple-listings`);
        } else {
          router.push(`/${locale}/dashboard/seller/properties`);
        }
      }

      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (err: any) {
      console.error("Failed to switch role:", err);
      const errorMsg = err?.response?.data?.message || "Failed to switch role. Please try again.";
      addToast("Error", errorMsg, "warning");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col animate-in zoom-in-95 duration-200 relative"
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
            Role Switcher
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Switch Active Role
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Switch between Buyer and Seller modes to manage listings or browse deals.
          </p>
        </div>

        {/* Role Options */}
        <div className="p-6 sm:p-7 flex flex-col gap-4 bg-gray-50/50 dark:bg-[#091711]/50">
          
          {/* Buyer Role Card */}
          <div 
            onClick={() => handleSwitchRole("BUYER")}
            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${
              currentRole === 'BUYER'
                ? "bg-green-50/80 dark:bg-[#163321]/60 border-[#5CD284] shadow-md"
                : "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] hover:border-[#1A3626] dark:hover:border-[#c9a14b] hover:shadow-lg"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#c9a14b] transition-colors">
                    Buyer Mode
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Browse property listings, save favorites, and manage your buyer activity.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {loadingRole === "BUYER" ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
              ) : currentRole === 'BUYER' ? (
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

          {/* Seller Role Card */}
          <div 
            onClick={() => handleSwitchRole("SELLER")}
            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${
              currentRole === 'SELLER'
                ? "bg-amber-50/80 dark:bg-[#163321]/60 border-[#c9a14b] shadow-md"
                : "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] hover:border-[#1A3626] dark:hover:border-[#c9a14b] hover:shadow-lg"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-[#c9a14b]/20 text-amber-600 dark:text-[#c9a14b] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#c9a14b] transition-colors">
                    Seller Mode
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  List your properties, track verification status, and view buyer inquiries.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {loadingRole === "SELLER" ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              ) : currentRole === 'SELLER' ? (
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
            <span>Switch role anytime from your Dashboard.</span>
          </div>
          <button 
            onClick={onClose}
            className="font-bold hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

