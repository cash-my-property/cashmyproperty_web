"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useDictionary } from "@/components/DictionaryProvider";
import { Search, ArrowUp, AlertCircle, FileText, ChevronRight, Menu, X, ArrowLeft } from "lucide-react";

interface TermItem {
  type: "heading" | "paragraph";
  text: string;
}

interface TermSection {
  number: number;
  title: string;
  items: TermItem[];
}

export default function TermsPage() {
  const { dict, locale } = useDictionary();
  const isRtl = locale === "ar";

  // Safe cast since terms was added to dictionary
  const terms = (dict.terms || {}) as Record<string, any>;

  const companyHeading = terms.companyHeading || "CASH MY PROPERTY L.L.C – TERMS & CONDITIONS";
  const intro = terms.intro || "";

  // Parse sections dynamically from local translation dictionaries
  const sections = useMemo(() => {
    const list: TermSection[] = [];
    const keys = Object.keys(terms);
    
    // Group keys by section number
    const sectionMap = new Map<number, { title: string; items: TermItem[] }>();
    
    for (const key of keys) {
      const match = key.match(/^s(\d+)(Title|[ph]\d+)/);
      if (match) {
        const secNum = parseInt(match[1], 10);
        const typeCode = match[2];
        const val = terms[key] as string;
        
        if (!sectionMap.has(secNum)) {
          sectionMap.set(secNum, { title: "", items: [] });
        }
        
        const sec = sectionMap.get(secNum)!;
        
        if (typeCode === "Title") {
          sec.title = val;
        } else if (typeCode.startsWith("h")) {
          sec.items.push({ type: "heading", text: val });
        } else if (typeCode.startsWith("p")) {
          sec.items.push({ type: "paragraph", text: val });
        }
      }
    }
    
    // Convert map to sorted array
    const sortedSecNums = Array.from(sectionMap.keys()).sort((a, b) => a - b);
    for (const num of sortedSecNums) {
      const sec = sectionMap.get(num)!;
      list.push({
        number: num,
        title: sec.title || `Section ${num}`,
        items: sec.items
      });
    }
    
    return list;
  }, [terms]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<number>(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search filtering
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    
    return sections.filter(sec => {
      if (sec.title.toLowerCase().includes(query)) return true;
      if (sec.number.toString().includes(query)) return true;
      return sec.items.some(item => item.text.toLowerCase().includes(query));
    });
  }, [sections, searchQuery]);

  // ScrollSpy observer
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const match = id.match(/^section-(\d+)$/);
            if (match) {
              setActiveSection(parseInt(match[1], 10));
            }
          }
        });
      },
      {
        rootMargin: "-100px 0px -70% 0px", // Trigger when section is in top half of screen
        threshold: 0
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(`section-${sec.number}`);
      if (el) observer.observe(el);
    });

    // Handle floating scroll to top visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  const scrollToSection = (secNum: number) => {
    setMobileMenuOpen(false);
    setActiveSection(secNum);
    const element = document.getElementById(`section-${secNum}`);
    if (element) {
      const offset = 90; // Account for sticky headers
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const renderText = (text: string, key: string) => {
    // Check if paragraph is actually a list bullet
    if (text.startsWith("•") || text.startsWith("o") || text.startsWith("-")) {
      const cleanText = text.replace(/^[•o\-]\s*/, "");
      return (
        <li key={key} className={`list-none relative text-gray-600 dark:text-gray-300 my-3 leading-relaxed text-[15px] ${isRtl ? "pr-6" : "pl-6"}`}>
          <span className={`absolute text-[#1A3626] dark:text-[#c9a14b] font-bold ${isRtl ? "right-1" : "left-1"}`}>
            •
          </span>
          {cleanText}
        </li>
      );
    }
    return (
      <p key={key} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[15px]">
        {text}
      </p>
    );
  };

  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-[#091711] transition-colors min-h-screen text-gray-800 dark:text-gray-200">
      
      {/* 1. PREMIUM HEADER BANNER */}
      <section className="relative w-full py-16 sm:py-24 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/95 via-[#0a1a13]/90 to-[#091711] dark:from-[#091711]/98 dark:via-[#091711]/95 dark:to-[#091711]" />

        {/* Brand Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-[#5CD284]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-[#c9a14b]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.2em] text-[10px] sm:text-[12px] mb-4 uppercase bg-white/10 dark:bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
            {terms.legalCenter}
          </span>
          <h1 className="text-white text-[32px] sm:text-[48px] lg:text-[54px] font-bold mb-4 leading-tight tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {terms.title}
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[14px] sm:text-[16px] max-w-xl font-light">
            {terms.subtitle}
          </p>
        </div>
      </section>

      {/* 2. DISCLOSURE/INTRO BANNER */}
      {intro && (
        <section className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30 py-6 px-6 lg:px-12 w-full transition-colors">
          <div className="max-w-7xl mx-auto flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-[14px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                {terms.languageNoticeTitle}
              </h4>
              <p className="text-[13px] text-amber-800/90 dark:text-amber-400/90 leading-relaxed font-medium">
                {intro}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. MAIN INTERACTIVE SECTION */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Mobile Index Trigger Bar */}
        <div className="lg:hidden sticky top-[72px] z-20 bg-white dark:bg-[#091711] py-3 px-4 rounded-xl border border-gray-100 dark:border-[#1A3626] shadow-sm mb-6 flex justify-between items-center transition-colors">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-[14px] font-semibold text-[#1A3626] dark:text-[#5CD284] hover:opacity-80"
          >
            <Menu className="w-5 h-5" />
            {terms.tableOfContents}
          </button>
          <span className="text-[12px] bg-gray-100 dark:bg-[#102418] px-2.5 py-1 rounded-md text-gray-500 dark:text-gray-400 font-medium">
            {terms.sectionLabel} {activeSection}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* A. STICKY SIDEBAR INDEX (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 space-y-6 max-h-[calc(100vh-140px)] flex flex-col">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRtl ? "right-3.5" : "left-3.5"}`} />
                <input
                  type="text"
                  placeholder={terms.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-2 px-4 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-gray-50 dark:bg-[#102418]/60 text-gray-800 dark:text-gray-200 text-[14px] outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] focus:ring-1 focus:ring-[#5CD284]/20 transition-all ${isRtl ? "pr-10" : "pl-10"}`}
                />
              </div>

              {/* Scrollable list of sections */}
              <div className="flex-1 overflow-y-auto border border-gray-100 dark:border-[#1A3626]/50 rounded-2xl p-4 bg-gray-50/50 dark:bg-[#102418]/30 space-y-1 custom-scrollbar">
                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
                  {terms.sectionsTitle}
                </h4>
                {filteredSections.map((sec) => (
                  <button
                    key={sec.number}
                    onClick={() => scrollToSection(sec.number)}
                    className={`w-full text-left flex items-start gap-2.5 p-2 rounded-xl text-[13.5px] transition-all ${
                      activeSection === sec.number
                        ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white font-semibold shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418] hover:text-gray-900 dark:hover:text-white"
                    } ${isRtl ? "text-right flex-row-reverse" : ""}`}
                  >
                    <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${activeSection === sec.number ? "text-white" : "text-gray-400"}`} />
                    <span className="truncate">{sec.title}</span>
                  </button>
                ))}
                {filteredSections.length === 0 && (
                  <p className="text-[13px] text-gray-400 px-3 py-4 italic">
                    {terms.noMatchingResults}
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* B. MAIN TERMS CONTENT */}
          <article className="flex-1 min-w-0">
            
            {/* Document Header */}
            <div className="border-b border-gray-100 dark:border-[#1A3626]/50 pb-8 mb-8">
              <h2 className="text-[22px] sm:text-[28px] font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {companyHeading}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-400 font-medium">
                <span>{terms.regionLabel}</span>
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span>{terms.licenseLabel}</span>
              </div>
            </div>

            {/* Dynamic Sections Render */}
            <div className="space-y-12">
              {filteredSections.map((sec) => (
                <div
                  key={sec.number}
                  id={`section-${sec.number}`}
                  className="scroll-mt-24 group p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-[#1A3626]/40 bg-white dark:bg-[#102418]/25 hover:border-green-200 dark:hover:border-green-950/40 hover:shadow-md transition-all duration-300"
                >
                  <h3 
                    className="text-[19px] sm:text-[21px] font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 border-b border-gray-50 dark:border-[#1A3626]/20 pb-4 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold text-[18px]">
                      §
                    </span>
                    {sec.title}
                  </h3>

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {sec.items.map((item, idx) => {
                      const itemKey = `${sec.number}-${item.type}-${idx}`;
                      if (item.type === "heading") {
                        return (
                          <h4 key={itemKey} className="text-[16px] font-bold text-[#1A3626] dark:text-[#c9a14b] mt-6 mb-3 leading-snug">
                            {item.text}
                          </h4>
                        );
                      }
                      return renderText(item.text, itemKey);
                    })}
                  </div>
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#102418]/10 rounded-3xl border border-dashed border-gray-200 dark:border-[#1A3626]">
                  <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-[18px] font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {terms.noResultsTitle}
                  </h3>
                  <p className="text-gray-400 text-[14px]">
                    {terms.noResultsDesc}
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      {/* 4. MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`relative flex flex-col w-full max-w-xs bg-white dark:bg-[#091711] h-full p-6 shadow-2xl transition-transform duration-300 ${isRtl ? "mr-auto flex-row-reverse" : "ml-auto"}`}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[16px] font-bold text-gray-900 dark:text-white">
                {terms.browseSections}
              </h4>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#102418] text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="relative mb-5">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRtl ? "right-3.5" : "left-3.5"}`} />
              <input
                type="text"
                placeholder={terms.searchPlaceholderMobile}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 px-4 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-gray-50 dark:bg-[#102418]/60 text-gray-800 dark:text-gray-200 text-[13px] outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] focus:ring-1 focus:ring-[#5CD284]/20 transition-all ${isRtl ? "pr-10" : "pl-10"}`}
              />
            </div>

            {/* Mobile scrollable index */}
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {filteredSections.map((sec) => (
                <button
                  key={sec.number}
                  onClick={() => scrollToSection(sec.number)}
                  className={`w-full text-left flex items-start gap-2 p-2.5 rounded-xl text-[13px] transition-all ${
                    activeSection === sec.number
                      ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white font-semibold shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]"
                  } ${isRtl ? "text-right flex-row-reverse" : ""}`}
                >
                  <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${activeSection === sec.number ? "text-white" : "text-gray-400"}`} />
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 z-40 p-3.5 rounded-full bg-[#1A3626] hover:bg-[#254d37] dark:bg-[#c9a14b] dark:hover:bg-[#d6af5d] text-white shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 ${
            isRtl ? "left-8" : "right-8"
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </main>
  );
}
