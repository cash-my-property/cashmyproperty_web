"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Clock, ShieldCheck, Zap, HeartHandshake, ArrowRight, Bed, Bath, Maximize, MapPin, Building, Home, Key, Smartphone, Download, ArrowDownUp, ChevronDown } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function HomePage() {
  const { dict } = useDictionary();
  const { home } = dict;
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);

  return (
    <main className="flex-1 flex flex-col min-h-screen transition-colors bg-[#F4F5F7] dark:bg-[#0A101C]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[650px] lg:min-h-[700px] flex items-center justify-center pt-24 pb-16">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
            backgroundPosition: 'center 40%'
          }}
        />
        {/* Dark Green Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A3626]/90 via-[#0A1C12]/80 to-[#0A1C12]/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center text-center mt-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-[#5CD284]/30 rounded-full bg-white/10 backdrop-blur-md shadow-lg mb-8">
            <ShieldCheck className="w-4 h-4 text-[#5CD284]" />
            <span className="text-[#5CD284] font-bold text-[12px] uppercase tracking-[0.15em]">
              Verified by DLD
            </span>
          </div>

          <h1 className="text-white text-4xl sm:text-5xl lg:text-[64px] font-bold mb-6 leading-[1.1] tracking-tight max-w-4xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.hero.headline}
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed mb-12 font-light">
            {home.hero.subheadline}
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-4xl bg-white/10 dark:bg-[#1E293B]/60 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 transition-all">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 flex items-center bg-white dark:bg-[#0F172A] rounded-full px-5 py-4 w-full border border-transparent focus-within:border-[#5CD284] transition-colors">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder={home.hero.searchPlaceholder}
                  className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-[15px]"
                />
              </div>
              <button className="w-full sm:w-auto px-10 py-4 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(92,210,132,0.3)] hover:shadow-[0_0_30px_rgba(92,210,132,0.5)] shrink-0">
                {home.hero.searchButton}
              </button>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Type Filter */}
                <div className="relative">
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                    className="bg-white/70 dark:bg-[#0F172A]/70 hover:bg-white dark:hover:bg-[#0F172A] transition-all duration-300 rounded-xl px-4 py-3.5 sm:py-3 flex items-center justify-between cursor-pointer border border-transparent hover:border-white/30 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                      <Building className={`w-4 h-4 opacity-60 transition-colors ${activeDropdown === 'type' || selectedType ? 'text-[#1A3626] dark:text-[#5CD284] opacity-100' : ''}`} />
                      <span className="text-[13.5px] font-semibold">{selectedType || home.hero.filters.type}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                  </div>
                  {activeDropdown === 'type' && (
                    <div className="absolute top-full mt-2 w-full sm:min-w-[200px] left-0 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-700 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200 max-h-[220px] overflow-y-auto">
                      {Object.entries(home.hero.filters.types).map(([key, value]) => (
                        <div 
                          key={key} 
                          className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedType === value ? 'bg-green-50/80 dark:bg-slate-700/80 text-[#1A3626] dark:text-[#5CD284]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                          onClick={() => { setSelectedType(value as string); setActiveDropdown(null); }}
                        >
                          {value as string}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Price Filter */}
                <div className="relative">
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                    className="bg-white/70 dark:bg-[#0F172A]/70 hover:bg-white dark:hover:bg-[#0F172A] transition-all duration-300 rounded-xl px-4 py-3.5 sm:py-3 flex items-center justify-between cursor-pointer border border-transparent hover:border-white/30 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                      <span className={`text-[14px] font-bold opacity-60 transition-colors ${activeDropdown === 'price' || selectedPrice ? 'text-[#1A3626] dark:text-[#5CD284] opacity-100' : ''}`}>د.إ</span>
                      <span className="text-[13.5px] font-semibold">{selectedPrice || home.hero.filters.price}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
                  </div>
                  {activeDropdown === 'price' && (
                    <div className="absolute top-full mt-2 w-full sm:min-w-[200px] left-0 sm:left-1/2 sm:-translate-x-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-700 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200 max-h-[220px] overflow-y-auto">
                      {Object.entries(home.hero.filters.prices).map(([key, value]) => (
                        <div 
                          key={key} 
                          className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedPrice === value ? 'bg-green-50/80 dark:bg-slate-700/80 text-[#1A3626] dark:text-[#5CD284]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                          onClick={() => { setSelectedPrice(value as string); setActiveDropdown(null); }}
                        >
                          {value as string}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Sort Filter */}
                <div className="relative">
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                    className="bg-white/70 dark:bg-[#0F172A]/70 hover:bg-white dark:hover:bg-[#0F172A] transition-all duration-300 rounded-xl px-4 py-3.5 sm:py-3 flex items-center justify-between cursor-pointer border border-transparent hover:border-white/30 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                      <ArrowDownUp className={`w-4 h-4 opacity-60 transition-colors ${activeDropdown === 'sort' || selectedSort ? 'text-[#1A3626] dark:text-[#5CD284] opacity-100' : ''}`} />
                      <span className="text-[13.5px] font-semibold">{selectedSort || home.hero.filters.sort}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
                  </div>
                  {activeDropdown === 'sort' && (
                    <div className="absolute top-full mt-2 w-full sm:min-w-[200px] left-0 sm:left-auto sm:right-0 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-700 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200 max-h-[220px] overflow-y-auto">
                      {Object.entries(home.hero.filters.sortOptions).map(([key, value]) => (
                        <div 
                          key={key} 
                          className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedSort === value ? 'bg-green-50/80 dark:bg-slate-700/80 text-[#1A3626] dark:text-[#5CD284]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                          onClick={() => { setSelectedSort(value as string); setActiveDropdown(null); }}
                        >
                          {value as string}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade out to background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F5F7] dark:from-[#0A101C] to-transparent pointer-events-none" />
      </section>

      {/* 2. REALTIME OFFERS (DISTRESS LISTINGS) */}
      <section className="py-20 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              {home.realtimeOffers.label}
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {home.realtimeOffers.heading}
            </h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
              {home.realtimeOffers.description}
            </p>
          </div>
          <Link href="/auctions" className="group inline-flex items-center gap-2 font-semibold text-[#1A3626] dark:text-[#5CD284] hover:opacity-80 transition-opacity">
            {home.realtimeOffers.viewAllText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {home.realtimeOffers.items.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-slate-800 transition-all duration-300">
              <div className="relative h-[240px] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                   <Clock className="w-3.5 h-3.5" /> 7-Day Auction
                </div>
                <div className="absolute bottom-4 right-4 bg-[#0A101C]/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-xl font-bold text-[14px] flex items-center gap-2">
                   <Clock className="w-4 h-4 text-[#5CD284]" /> {item.timeLeft}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-[18px] text-gray-900 dark:text-white mb-1 leading-tight group-hover:text-[#5CD284] transition-colors line-clamp-1">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-[13px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {item.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4 border-y border-gray-100 dark:border-slate-800/60 mb-4">
                   <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Bed className="w-4 h-4 text-gray-400" /> {item.beds}</div>
                   <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Bath className="w-4 h-4 text-gray-400" /> {item.baths}</div>
                   <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Maximize className="w-4 h-4 text-gray-400" /> {item.area}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Highest Bid</span>
                  <span className="text-[22px] font-bold text-[#1A3626] dark:text-white leading-none">{item.currentBid}</span>
                </div>
                <button className="w-full mt-6 py-3.5 bg-[#1A3626] dark:bg-[#5CD284] hover:bg-[#12261a] dark:hover:bg-[#4ab872] text-white dark:text-[#1A3626] rounded-xl font-bold text-[14px] transition-colors shadow-md">
                  Place Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SIMPLE LISTINGS */}
      <section className="py-20 px-6 lg:px-12 w-full max-w-7xl mx-auto border-t border-gray-200/50 dark:border-slate-800/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#1A3626] dark:text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase">
              {home.simpleListings.label}
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {home.simpleListings.heading}
            </h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
              {home.simpleListings.description}
            </p>
          </div>
          <Link href="#" className="group inline-flex items-center gap-2 font-semibold text-[#1A3626] dark:text-[#5CD284] hover:opacity-80 transition-opacity">
            {home.simpleListings.viewAllText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {home.simpleListings.items.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-slate-800 transition-all duration-300 flex flex-col">
              <div className="relative h-[220px] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#0A101C]/80 backdrop-blur-md text-gray-900 dark:text-white px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider shadow-sm">
                   For Sale
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-[18px] text-gray-900 dark:text-white mb-1 leading-tight group-hover:text-[#5CD284] transition-colors line-clamp-1">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[13px] flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5" /> {item.location}
                </p>
                <div className="flex items-center gap-4 py-3 border-t border-gray-100 dark:border-slate-800/60 mt-auto mb-4">
                   {item.type ? (
                     <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Building className="w-4 h-4 text-gray-400" /> {item.type}</div>
                   ) : (
                     <>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Bed className="w-4 h-4 text-gray-400" /> {item.beds}</div>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Bath className="w-4 h-4 text-gray-400" /> {item.baths}</div>
                     </>
                   )}
                   <div className="flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300"><Maximize className="w-4 h-4 text-gray-400" /> {item.area}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Asking Price</span>
                    <span className="text-[20px] font-bold text-[#1A3626] dark:text-white leading-none">{item.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-[#1E293B] border-y border-gray-200 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-[#1A3626] dark:text-[#5CD284] font-bold tracking-widest text-[12px] mb-4 uppercase">
            {home.howItWorks.label}
          </p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-gray-900 dark:text-white mb-16 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.howItWorks.heading}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 relative">
             {/* Connecting Line (Desktop Only) */}
             <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-100 dark:bg-slate-700/50 -z-10" />

             {home.howItWorks.steps.map((step, idx) => (
               <div key={idx} className="relative flex flex-col items-center group">
                 <div className="w-24 h-24 rounded-full bg-[#F4F5F7] dark:bg-[#0F172A] border-[8px] border-white dark:border-[#1E293B] shadow-xl flex items-center justify-center mb-8 text-[#1A3626] dark:text-[#5CD284] group-hover:scale-110 group-hover:bg-[#1A3626] group-hover:text-white dark:group-hover:bg-[#5CD284] dark:group-hover:text-[#0F172A] transition-all duration-300">
                    {idx === 0 && <ShieldCheck className="w-8 h-8" />}
                    {idx === 1 && <Home className="w-8 h-8" />}
                    {idx === 2 && <Key className="w-8 h-8" />}
                 </div>
                 <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                 <p className="text-[15px] text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed">
                   {step.description}
                 </p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 5. APP DOWNLOAD BANNER */}
      <section className="py-12 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="relative w-full bg-[#1A3626] dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-[#5CD284]/10 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between">
          
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#5CD284]/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Text Content */}
          <div className="relative z-10 w-full md:w-3/5 p-10 sm:p-14 lg:p-16 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-[#5CD284] font-bold tracking-widest text-[12px] mb-4 uppercase bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              {home.appDownload.tagline}
            </span>
            <h2 className="text-white text-[32px] sm:text-[40px] font-bold mb-5 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {home.appDownload.heading}
            </h2>
            <p className="text-white/70 text-[16px] max-w-lg leading-relaxed mb-10">
              {home.appDownload.description}
            </p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="#" className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto border border-white/10 hover:border-white/30 shadow-lg">
                <Smartphone className="w-8 h-8" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider text-gray-300 font-medium">{home.appDownload.appStoreText}</span>
                  <span className="text-[18px] font-bold leading-none">{home.appDownload.appStore}</span>
                </div>
              </Link>
              <Link href="#" className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto border border-white/10 hover:border-white/30 shadow-lg">
                <Download className="w-8 h-8" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider text-gray-300 font-medium">{home.appDownload.playStoreText}</span>
                  <span className="text-[18px] font-bold leading-none">{home.appDownload.playStore}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Phone Mockup Graphic */}
          <div className="relative z-10 w-full md:w-2/5 flex justify-center md:justify-end pr-0 md:pr-12 lg:pr-20 pt-10 md:pt-0 overflow-hidden">
             <div className="relative w-[280px] h-[350px] md:h-[450px]">
               <img 
                 src="https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                 alt="CMP App" 
                 className="absolute bottom-[-20%] md:bottom-[-10%] right-0 w-full h-[120%] object-cover object-top rounded-t-[40px] border-4 border-b-0 border-gray-900 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transform -rotate-12 translate-x-10"
               />
             </div>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-[#1A3626] dark:text-[#5CD284] font-bold tracking-widest text-[12px] mb-4 uppercase">
            {home.whyChooseUs.label}
          </p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.whyChooseUs.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {home.whyChooseUs.features.map((feature, idx) => (
             <div key={idx} className="bg-white dark:bg-[#1E293B]/50 rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#1A3626]/5 dark:bg-[#5CD284]/10 flex items-center justify-center mb-8">
                  {idx === 0 && <Zap className="w-6 h-6 text-[#1A3626] dark:text-[#5CD284]" />}
                  {idx === 1 && <ShieldCheck className="w-6 h-6 text-[#1A3626] dark:text-[#5CD284]" />}
                  {idx === 2 && <HeartHandshake className="w-6 h-6 text-[#1A3626] dark:text-[#5CD284]" />}
                </div>
                <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
             </div>
           ))}
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="pb-24 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="relative w-full bg-gradient-to-br from-[#1B3A2D] to-[#0A1C12] dark:from-[#1E293B] dark:to-[#0F172A] rounded-[40px] p-10 sm:p-16 lg:p-20 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 dark:bg-[#5CD284]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 dark:bg-[#5CD284]/5 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex-1 max-w-2xl">
            <h2 className="text-white text-[32px] sm:text-[40px] lg:text-[48px] font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {home.cta.heading}
            </h2>
            <p className="text-green-100/70 dark:text-gray-400 text-[16px] sm:text-[18px] max-w-xl leading-relaxed">
              {home.cta.description}
            </p>
          </div>
          
          <div className="relative z-10">
            <Link href="/signup" className="group inline-flex items-center justify-center gap-3 bg-white dark:bg-[#5CD284] text-[#1A3626] dark:text-[#0A101C] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-wide hover:bg-gray-100 dark:hover:bg-[#4ab872] transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] dark:shadow-[0_10px_30px_rgba(92,210,132,0.2)] hover:scale-105 whitespace-nowrap">
              {home.cta.buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
