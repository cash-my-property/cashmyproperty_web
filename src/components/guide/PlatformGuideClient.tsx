"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  RefreshCw, 
  Home, 
  Zap, 
  Building, 
  Flame, 
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Shield, 
  Sparkles
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";

export default function PlatformGuideClient() {
  const { dict, locale } = useDictionary();
  const guide = dict.guide || {};
  const { isAuthenticated, user, isSeller } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("gettingStarted");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fallbacks if dictionary is loading
  const tabs = guide.tabs || {
    gettingStarted: "1. Account & Verification",
    roleSwitcher: "2. Roles & Permissions",
    buyerSimple: "3. Buyer - Simple Listings",
    buyerRealtime: "4. Buyer - Live Bidding",
    sellerSimple: "5. Seller - Simple Listings",
    sellerRealtime: "6. Seller - Live Auctions"
  };

  const getTabIcon = (key: string) => {
    switch (key) {
      case "gettingStarted": return <UserCheck className="w-4 h-4" />;
      case "roleSwitcher": return <RefreshCw className="w-4 h-4" />;
      case "buyerSimple": return <Home className="w-4 h-4" />;
      case "buyerRealtime": return <Zap className="w-4 h-4" />;
      case "sellerSimple": return <Building className="w-4 h-4" />;
      case "sellerRealtime": return <Flame className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Search filter across steps
  const filterSteps = (steps: any[]) => {
    if (!steps) return [];
    if (!isSearchActive) return steps;
    return steps.filter(
      (s: any) =>
        s.title?.toLowerCase().includes(normalizedQuery) ||
        s.desc?.toLowerCase().includes(normalizedQuery) ||
        s.tip?.toLowerCase().includes(normalizedQuery)
    );
  };

  // Search filter across FAQs
  const filteredFaqs = (guide.faqs?.list || []).filter(
    (item: any) =>
      !isSearchActive ||
      item.q?.toLowerCase().includes(normalizedQuery) ||
      item.a?.toLowerCase().includes(normalizedQuery)
  );

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-28 sm:pt-32 pb-20 transition-colors">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#1A3626] via-[#102418] to-[#091711] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-12 border-b border-[#1A3626]/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5CD284]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#c9a14b]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5CD284]/15 border border-[#5CD284]/30 text-[#5CD284] text-xs font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{guide.heroTag || "COMPREHENSIVE PLATFORM GUIDE"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {guide.title || "How to Use Cash My Property"}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            {guide.subtitle || "Your step-by-step master guide to buying, selling, live auctions, contract signing, and role permissions across the UAE's premier real estate portal."}
          </p>

          {/* Search Filter Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={guide.searchPlaceholder || "Search guides, bidding, BRN verification, role switching..."}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-[#1A3626] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CD284] transition-all shadow-lg"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs bg-white/10 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            {isSearchActive && (
              <p className="text-xs text-[#5CD284] font-medium mt-2">
                Filtering guides for: &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. PERSONA TOPIC TABS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 -mt-6 relative z-20">
        <div className="bg-white dark:bg-[#102418] p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/80 dark:border-[#1A3626] overflow-x-auto global-green-scrollbar">
          <div className="flex gap-2 min-w-max">
            {Object.keys(tabs).map((tabKey) => {
              const isActive = activeTab === tabKey && !isSearchActive;
              return (
                <button
                  key={tabKey}
                  onClick={() => {
                    setActiveTab(tabKey);
                    if (isSearchActive) setSearchQuery("");
                  }}
                  className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md scale-100"
                      : "bg-gray-50 dark:bg-[#142e1d] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A3626]"
                  }`}
                >
                  <span className={isActive ? "text-[#5CD284] dark:text-[#1A3626]" : "text-gray-400"}>
                    {getTabIcon(tabKey)}
                  </span>
                  <span>{tabs[tabKey as keyof typeof tabs]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC CONTENT SECTIONS */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 space-y-12">
        
        {/* TAB 1: GETTING STARTED & ACCOUNT SETUP */}
        {(activeTab === "gettingStarted" || isSearchActive) && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-[#1A3626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <UserCheck className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
                  {guide.gettingStarted?.title || "Account Setup & Verification"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {guide.gettingStarted?.subtitle}
                </p>
              </div>
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs hover:opacity-90 transition-opacity shrink-0 shadow-md"
              >
                <span>Go to Signup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSteps(guide.gettingStarted?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#102418] p-6 rounded-2xl border border-gray-200/80 dark:border-[#1A3626] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#1A3626]/20 dark:text-[#c9a14b]/30 font-mono">
                        {step.num}
                      </span>
                      <span className="p-2 rounded-xl bg-[#1A3626]/5 dark:bg-[#c9a14b]/10 text-[#1A3626] dark:text-[#c9a14b]">
                        <Shield className="w-4 h-4" />
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {step.tip && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1A3626] text-xs text-emerald-800 dark:text-[#5CD284] font-medium flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ROLE SWITCHER & PERMISSION MATRIX */}
        {(activeTab === "roleSwitcher" || isSearchActive) && (
          <div className="space-y-8">
            <div className="border-b border-gray-200 dark:border-[#1A3626] pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
                {guide.roleSwitcher?.title || "Role Switcher & Access Rights"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {guide.roleSwitcher?.subtitle}
              </p>
            </div>

            {/* Role Switching Cards */}
            <div className="bg-gradient-to-br from-[#1A3626] via-[#142e1d] to-[#091711] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
              <div className="max-w-3xl space-y-2">
                <h3 className="text-xl font-bold text-[#5CD284]">{guide.roleSwitcher?.switchStepsTitle}</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{guide.roleSwitcher?.intro}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {(guide.roleSwitcher?.steps || []).map((stepText: string, i: number) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#5CD284] text-[#091711] font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-200 leading-normal">{stepText}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FULL PERMISSION MATRIX TABLE */}
            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-[#1A3626] shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {guide.matrix?.title || "Platform Feature Access Matrix"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {guide.matrix?.subtitle}
                </p>
              </div>

              <div className="overflow-x-auto global-green-scrollbar">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#1A3626] bg-gray-50 dark:bg-[#142e1d] text-gray-900 dark:text-white">
                      <th className="py-3.5 px-4 font-bold rounded-l-xl">{guide.matrix?.headers?.feature || "Platform Feature"}</th>
                      <th className="py-3.5 px-4 font-bold text-center">{guide.matrix?.headers?.simpleBuyer || "Simple Buyer"}</th>
                      <th className="py-3.5 px-4 font-bold text-center">{guide.matrix?.headers?.realtimeBuyer || "Realtime Buyer"}</th>
                      <th className="py-3.5 px-4 font-bold text-center">{guide.matrix?.headers?.simpleSeller || "Simple Seller"}</th>
                      <th className="py-3.5 px-4 font-bold text-center rounded-r-xl">{guide.matrix?.headers?.realtimeSeller || "Realtime Seller"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626]/60">
                    {(guide.matrix?.rows || []).map((row: any, idx: number) => {
                      const isYes = (val: string) => val.toLowerCase().startsWith("yes") || val.toLowerCase().startsWith("نعم");
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-[#142e1d]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{row.feature}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              isYes(row.sb) 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-[#5CD284]" 
                                : "bg-rose-500/10 text-rose-500"
                            }`}>
                              {isYes(row.sb) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{row.sb}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              isYes(row.rb) 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-[#5CD284]" 
                                : "bg-rose-500/10 text-rose-500"
                            }`}>
                              {isYes(row.rb) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{row.rb}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              isYes(row.ss) 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-[#5CD284]" 
                                : "bg-rose-500/10 text-rose-500"
                            }`}>
                              {isYes(row.ss) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{row.ss}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              isYes(row.rs) 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-[#5CD284]" 
                                : "bg-rose-500/10 text-rose-500"
                            }`}>
                              {isYes(row.rs) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{row.rs}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUYER GUIDE - SIMPLE LISTINGS */}
        {(activeTab === "buyerSimple" || isSearchActive) && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-[#1A3626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <Home className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
                  {guide.buyerSimple?.title || "Buyer Guide - Simple Listings"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {guide.buyerSimple?.subtitle}
                </p>
              </div>
              <Link
                href={`/${locale}/simple-listings`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs hover:opacity-90 transition-opacity shrink-0 shadow-md"
              >
                <span>Browse Simple Listings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSteps(guide.buyerSimple?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#102418] p-6 rounded-2xl border border-gray-200/80 dark:border-[#1A3626] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#1A3626]/20 dark:text-[#c9a14b]/30 font-mono">
                        {step.num}
                      </span>
                      <span className="p-2 rounded-xl bg-[#1A3626]/5 dark:bg-[#c9a14b]/10 text-[#1A3626] dark:text-[#c9a14b]">
                        <Search className="w-4 h-4" />
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {step.tip && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1A3626] text-xs text-emerald-800 dark:text-[#5CD284] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BUYER GUIDE - REALTIME LIVE BIDDING */}
        {(activeTab === "buyerRealtime" || isSearchActive) && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-[#1A3626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <Zap className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
                  {guide.buyerRealtime?.title || "Buyer Guide - Live Bidding & Realtime Offers"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {guide.buyerRealtime?.subtitle}
                </p>
              </div>
              <Link
                href={`/${locale}/auctions`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs hover:opacity-90 transition-opacity shrink-0 shadow-md"
              >
                <span>Explore Live Auctions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSteps(guide.buyerRealtime?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#102418] p-6 rounded-2xl border border-gray-200/80 dark:border-[#1A3626] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#1A3626]/20 dark:text-[#c9a14b]/30 font-mono">
                        {step.num}
                      </span>
                      <span className="p-2 rounded-xl bg-[#1A3626]/5 dark:bg-[#c9a14b]/10 text-[#1A3626] dark:text-[#c9a14b]">
                        <Zap className="w-4 h-4" />
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {step.tip && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1A3626] text-xs text-emerald-800 dark:text-[#5CD284] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SELLER GUIDE - SIMPLE LISTINGS */}
        {(activeTab === "sellerSimple" || isSearchActive) && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-[#1A3626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <Building className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
                  {guide.sellerSimple?.title || "Seller Guide - Simple Listings"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {guide.sellerSimple?.subtitle}
                </p>
              </div>
              <Link
                href={`/${locale}/dashboard/seller/add-simple-property`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs hover:opacity-90 transition-opacity shrink-0 shadow-md"
              >
                <span>Add Simple Property</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSteps(guide.sellerSimple?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#102418] p-6 rounded-2xl border border-gray-200/80 dark:border-[#1A3626] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#1A3626]/20 dark:text-[#c9a14b]/30 font-mono">
                        {step.num}
                      </span>
                      <span className="p-2 rounded-xl bg-[#1A3626]/5 dark:bg-[#c9a14b]/10 text-[#1A3626] dark:text-[#c9a14b]">
                        <Building className="w-4 h-4" />
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {step.tip && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1A3626] text-xs text-emerald-800 dark:text-[#5CD284] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SELLER GUIDE - REALTIME LIVE AUCTIONS */}
        {(activeTab === "sellerRealtime" || isSearchActive) && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-[#1A3626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                  <Flame className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
                  {guide.sellerRealtime?.title || "Seller Guide - Live Auctions & Distress Offers"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {guide.sellerRealtime?.subtitle}
                </p>
              </div>
              <Link
                href={`/${locale}/dashboard/seller/add-property`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs hover:opacity-90 transition-opacity shrink-0 shadow-md"
              >
                <span>Create Realtime Auction</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSteps(guide.sellerRealtime?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#102418] p-6 rounded-2xl border border-gray-200/80 dark:border-[#1A3626] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#1A3626]/20 dark:text-[#c9a14b]/30 font-mono">
                        {step.num}
                      </span>
                      <span className="p-2 rounded-xl bg-[#1A3626]/5 dark:bg-[#c9a14b]/10 text-[#1A3626] dark:text-[#c9a14b]">
                        <Flame className="w-4 h-4" />
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {step.tip && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1A3626] text-xs text-emerald-800 dark:text-[#5CD284] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. EXPANDABLE FAQS SECTION */}
        <section className="pt-8 border-t border-gray-200 dark:border-[#1A3626] space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {guide.faqs?.title || "Frequently Asked Questions"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {guide.faqs?.subtitle || "Quick answers to common questions about Cash My Property."}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            {filteredFaqs.map((faq: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#102418] rounded-2xl border border-gray-200/80 dark:border-[#1A3626] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#142e1d]/50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#5CD284] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-[#1A3626]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. BOTTOM CALL TO ACTION BANNER */}
        <section className="rounded-3xl bg-gradient-to-r from-[#1A3626] via-[#142e1d] to-[#0A1C12] p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#5CD284]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-xl relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {guide.cta?.title || "Ready to Experience the Future of UAE Real Estate?"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              {guide.cta?.subtitle || "Join thousands of verified buyers, sellers, and real estate brokers on Cash My Property today."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0">
            <Link
              href={`/${locale}/auctions`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-extrabold text-xs sm:text-sm transition-all shadow-md text-center"
            >
              {guide.cta?.buyerButton || "Explore Live Auctions"}
            </Link>
            <Link
              href={`/${locale}/dashboard/seller/add-property`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm transition-all text-center"
            >
              {guide.cta?.sellerButton || "List a Property Now"}
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
