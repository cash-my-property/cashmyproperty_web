"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, X, ArrowRight, ShieldCheck, RefreshCw, Zap, Building } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";

export default function FloatingGuideWidget() {
  const { locale } = useDictionary();
  const { isSeller } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Guide Popup Modal */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white dark:bg-[#102418] rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-[#1A3626] animate-in fade-in slide-in-from-bottom-5 duration-300 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1A3626] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 flex items-center justify-center text-[#1A3626] dark:text-[#c9a14b]">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Quick Platform Help</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Cash My Property Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#142e1d] text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {isSeller ? (
              <>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <Building className="w-4 h-4 text-[#5CD284] shrink-0 mt-0.5" />
                  <span><strong>Seller Mode:</strong> Add Simple listings or launch Live Distress Auctions from your Seller Dashboard.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <RefreshCw className="w-4 h-4 text-[#c9a14b] shrink-0 mt-0.5" />
                  <span><strong>Need to Browse?</strong> Click &quot;Switch Role&quot; in the Navbar to switch to Buyer Mode.</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <Zap className="w-4 h-4 text-[#5CD284] shrink-0 mt-0.5" />
                  <span><strong>Live Auctions:</strong> Sign your digital MOA Undertaking Letter before placing live bids.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-[#c9a14b] shrink-0 mt-0.5" />
                  <span><strong>Simple Listings:</strong> Contact verified agents directly via WhatsApp, Call, or Email.</span>
                </div>
              </>
            )}
          </div>

          <Link
            href={`/${locale}/guide`}
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Open Full Platform Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-extrabold text-xs shadow-xl border border-white/20 dark:border-[#1A3626] hover:scale-105 transition-all cursor-pointer group"
      >
        <HelpCircle className="w-4.5 h-4.5 text-[#5CD284] dark:text-[#1A3626] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">How to Use?</span>
      </button>
    </div>
  );
}
