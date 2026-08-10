"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Filter, Bed, Bath, Square, ChevronDown, ArrowRight, Building } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ListingsPage() {
  const { dict, locale } = useDictionary();
  const content = dict.home;

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-6 lg:px-12 flex flex-col items-center justify-center overflow-hidden bg-[#1B3A2D] dark:bg-[#0A1612]">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5CD284]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#5CD284]/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center mt-8">
            {/* placeholder for tagline */}
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

          {/* Search Bar - Inline Filters */}
          <div className="w-full max-w-4xl bg-white dark:bg-[#102418] p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-gray-100 dark:border-[#1A3626]">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#102418]/50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder={content.hero.searchPlaceholder}
                className="w-full bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              />
            </div>
            
            <div className="relative hidden md:block">
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#102418]/50 rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#102418] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              >
                <Building className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors" />
                <span className="text-[14px] text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap min-w-[80px]">
                  {selectedType || content.hero.filters.type}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
              </div>
              
              {activeDropdown === 'type' && (
                <div className="absolute top-full mt-2 w-[200px] right-0 bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                  {Object.entries(dict.home.hero.filters.types).map(([key, value]) => (
                    <div 
                      key={key} 
                      className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedType === value ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#c9a14b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                      onClick={() => { setSelectedType(value as string); setActiveDropdown(null); }}
                    >
                      {value as string}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#102418]/50 rounded-xl cursor-pointer group">
              <span className="text-[14px] text-gray-600 dark:text-gray-300 font-medium">{content.hero.filters.price}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors" />
            </div>

            <button className="bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] px-8 py-3 rounded-xl font-bold text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              {content.hero.searchButton}
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <section className="border-b border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#091711]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex gap-3 overflow-x-auto global-green-scrollbar">
          {["All", "Villa", "Apartment", "Penthouse", "Townhouse", "Commercial"].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeType === type ? 'bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#102418] dark:text-gray-300 dark:hover:bg-[#163321]'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS GRID */}
      <section className="py-16 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-200 dark:border-[#1A3626] shadow-sm mt-8">
          <div className="w-20 h-20 bg-green-50 dark:bg-[#102418] rounded-full flex items-center justify-center mb-6">
            <Building className="w-10 h-10 text-[#1A3626] dark:text-[#c9a14b]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Coming Soon</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-[15px] leading-relaxed">
            Our standard property listings are currently under development. Stay tuned for an exclusive selection of premium properties available for direct purchase.
          </p>
        </div>
      </section>

    </main>
  );
}
