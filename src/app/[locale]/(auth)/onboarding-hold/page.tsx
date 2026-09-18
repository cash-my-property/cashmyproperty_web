"use client";

import Link from "next/link";
import { Clock, ShieldCheck, ArrowRight, Building2, Mail, Phone, Home } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function OnboardingHoldPage() {
  const { locale } = useDictionary();

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 pt-28 sm:pt-36 bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors">
      <div className="w-full max-w-xl bg-white dark:bg-[#102418] rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100 dark:border-[#1A3626] text-center relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5CD284]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Animated Onboarding Badge Icon */}
          <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-6 shadow-lg animate-pulse">
            <Clock className="w-10 h-10" />
          </div>

          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
            Agency Onboarding Pending
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Welcome Onboard!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-md mb-8">
            Thank you for registering with Cash My Property. Your account is currently on hold while your agency onboarding details are being verified by our admin team.
          </p>

          {/* Info Card Box */}
          <div className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200/80 dark:border-[#1A3626] text-left space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1A3626]/10 dark:bg-[#5CD284]/10 flex items-center justify-center text-[#1A3626] dark:text-[#5CD284] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Agency Verification In Progress</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">Our compliance team will review your submitted BRN and admin details.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-200/60 dark:border-[#1A3626]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Access Notification</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">Web seller dashboard access will be unlocked automatically upon approval.</p>
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href={`/${locale}`}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gray-100 dark:bg-[#163321] hover:bg-gray-200 dark:hover:bg-[#1A3626] text-gray-800 dark:text-gray-200 font-bold text-sm transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-[#1A3626]"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              href={`/${locale}/login`}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A1C12] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              Back to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
