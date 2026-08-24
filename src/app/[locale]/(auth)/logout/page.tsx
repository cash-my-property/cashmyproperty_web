"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function LogoutPage() {
  const { dict } = useDictionary();
  const content = dict;
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 pt-32 sm:pt-36 transition-colors">
      <div className="w-full max-w-[1000px] bg-white dark:bg-[#102418] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[500px] transition-colors">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[45%] relative bg-[#1B3A2D] overflow-hidden flex-col items-center justify-center p-12 text-center">
          {/* Background Image / Overlay */}
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'url("/hero-bg.svg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Circular Graphic Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-[320px] h-[320px] border border-white/10 rounded-full flex items-center justify-center">
                <div className="w-[280px] h-[280px] border border-white/10 rounded-full relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                     <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                   </div>
                   <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                     <span className="w-2 h-[2px] bg-white"></span>
                     <span className="w-2 h-[2px] bg-white absolute rotate-90"></span>
                   </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[#5CD284] font-bold tracking-[0.15em] text-xs mb-8 uppercase">{content.auth.hero.tagline}</p>
            <h2 className="text-white text-[42px] font-bold mb-6 leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.auth.hero.title.replace('\n', '<br/>') }}>
            </h2>
            <p className="text-white/70 text-[15px] max-w-[280px] leading-relaxed">
              {content.auth.hero.description}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - LOGOUT CONTENT */}
        <div className="w-full lg:w-[55%] p-8 sm:p-14 lg:p-16 flex flex-col justify-center items-center text-center">
          <div
            className="w-full max-w-[380px] transition-all duration-700 ease-out"
            style={{
              opacity: animateIn ? 1 : 0,
              transform: animateIn ? "translateY(0)" : "translateY(18px)",
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div
                className="w-[80px] h-[80px] rounded-full flex items-center justify-center"
                style={{ background: "radial-gradient(circle, rgba(187,247,208,0.55) 0%, rgba(187,247,208,0.12) 100%)" }}
              >
                <div
                  className="w-[58px] h-[58px] rounded-full flex items-center justify-center"
                  style={{ background: "radial-gradient(circle, rgba(134,239,172,0.65) 0%, rgba(134,239,172,0.22) 100%)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1
              className="text-[32px] font-bold text-gray-900 dark:text-white leading-[1.2] tracking-tight mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
              dangerouslySetInnerHTML={{ __html: content.auth.logout.heading.replace('\n', '<br />') }}
            >
            </h1>

            {/* Description */}
            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
              {content.auth.logout.description}
            </p>

            {/* Buttons */}
            <div className="space-y-4 w-full">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-lg text-white dark:text-[#1A3626] text-[15px] font-semibold transition-colors shadow-sm bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f]"
              >
                {content.auth.logout.reloginButton} <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-lg text-gray-700 dark:text-gray-300 text-[15px] font-semibold transition-colors bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#163321]"
              >
                <Home className="w-4 h-4" />
                {content.auth.logout.homeButton}
              </Link>
            </div>

            {/* Security note */}
            <div
              className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-50/50 dark:bg-green-900/10 border border-green-600/10 dark:border-green-500/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600 dark:text-green-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                {content.auth.logout.securityNote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
