"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, ChevronDown, User } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, dict } = useDictionary();
  const { isAuthenticated, user } = useAuth();
  
  const isLoginPage = pathname === `/${locale}/login` || pathname === "/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect for glassmorphism enhancement on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/');
    if (segments[1] === locale) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    // Construct new path
    const newPath = segments.join('/') || '/';
    
    // Set cookie explicitly to help middleware
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(newPath);
    router.refresh(); // Refresh to ensure layout gets updated params
  };

  return (
    <header className="fixed top-2 sm:top-4 z-50 w-full px-4 sm:px-6 transition-all duration-300 pointer-events-none">
      <div 
        className={`max-w-[1400px] mx-auto flex items-center justify-between rounded-full transition-all duration-300 pointer-events-auto ${
          scrolled 
            ? "bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-700/50 py-0.5 px-4 lg:px-6" 
            : "bg-white/95 dark:bg-[#0F172A]/95 shadow-sm border border-gray-100 dark:border-slate-800/80 py-1 px-4 lg:px-6"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image 
            src="/logo.png" 
            alt="Cash My Property" 
            width={120} 
            height={34} 
            style={{ width: "auto", height: "auto" }} 
            className="object-contain w-[110px] sm:w-[120px] lg:w-[130px] group-hover:opacity-90 transition-opacity" 
            priority
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {dict.navbar.links.map((item, index) => (
            <Link 
              key={index} 
              href={`/${locale}${item.href === "/" ? "" : item.href}`} 
              className="relative group px-1 py-1 font-semibold text-[15px] tracking-wide text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {item.title}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#1A3626] dark:bg-[#5CD284] transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          ))}
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 border-r border-gray-200 dark:border-slate-700 pr-6">
            <ThemeToggle />
            
            {/* Language Selector */}
            <div className="relative group cursor-pointer ml-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-all">
                <Globe className="w-4 h-4" />
                <span className="font-semibold text-[13px] tracking-wide uppercase">{locale}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute top-[120%] right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:scale-100 scale-95 overflow-hidden">
                <div className="p-1.5 flex flex-col gap-1">
                  <button onClick={() => switchLanguage('en')} className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-colors ${locale === 'en' ? 'text-[#1A3626] dark:text-[#5CD284] bg-green-50/80 dark:bg-slate-700/80' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>English</button>
                  <button onClick={() => switchLanguage('ar')} className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-colors ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#5CD284] bg-green-50/80 dark:bg-slate-700/80' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>العربية</button>
                </div>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <Link 
              href={`/${locale}/dashboard`}
              className="flex items-center gap-2 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] px-6 py-2 rounded-full font-bold text-[14px] tracking-wide hover:bg-[#12261a] dark:hover:bg-[#4ab872] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <User className="w-4 h-4" /> Dashboard
            </Link>
          ) : isLoginPage ? (
            <Link 
              href={`/${locale}/signup`}
              className="flex items-center gap-2 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] px-6 py-2 rounded-full font-bold text-[14px] tracking-wide hover:bg-[#12261a] dark:hover:bg-[#4ab872] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <User className="w-4 h-4" /> Join Now
            </Link>
          ) : (
            <Link 
              href={`/${locale}/login`}
              className="flex items-center gap-2 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] px-6 py-2 rounded-full font-bold text-[14px] tracking-wide hover:bg-[#12261a] dark:hover:bg-[#4ab872] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <User className="w-4 h-4" /> Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`lg:hidden fixed inset-x-4 top-[70px] bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 origin-top overflow-hidden pointer-events-auto ${
          mobileMenuOpen ? "opacity-100 scale-y-100 max-h-[80vh]" : "opacity-0 scale-y-0 max-h-0"
        }`}
      >
        <div className="flex flex-col px-6 py-6 gap-4">
          <nav className="flex flex-col gap-4 font-semibold text-[16px] text-gray-800 dark:text-gray-200">
            {dict.navbar.links.map((item, index) => (
              <Link 
                key={index} 
                href={`/${locale}${item.href === "/" ? "" : item.href}`} 
                className="hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors tracking-wide" 
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            
            <div className="h-px bg-gray-200 dark:bg-slate-800 my-1" />
            
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[11px] font-bold">Theme</span>
              <ThemeToggle />
            </div>

            {/* Mobile Language Selector */}
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[11px] font-bold">
                <Globe className="w-3.5 h-3.5" /> Language
              </span>
              <div className="flex gap-1 text-[12px] font-bold">
                <button onClick={() => switchLanguage('en')} className={`px-2 py-1 rounded-full transition-colors ${locale === 'en' ? 'text-[#1A3626] dark:text-[#5CD284] bg-green-50 dark:bg-slate-800' : 'text-gray-400 dark:text-gray-500'}`}>EN</button>
                <button onClick={() => switchLanguage('ar')} className={`px-2 py-1 rounded-full transition-colors ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#5CD284] bg-green-50 dark:bg-slate-800' : 'text-gray-400 dark:text-gray-500'}`}>عربي</button>
              </div>
            </div>
          </nav>
          
          <div className="mt-4 pt-6 border-t border-gray-200 dark:border-slate-800">
            {isAuthenticated ? (
              <Link 
                href={`/${locale}/dashboard`}
                className="flex items-center justify-center gap-2 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] w-full py-4 rounded-full font-bold uppercase tracking-widest text-[13px] shadow-md hover:bg-[#12261a] dark:hover:bg-[#4ab872] transition-colors" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Dashboard
              </Link>
            ) : isLoginPage ? (
              <Link 
                href={`/${locale}/signup`}
                className="flex items-center justify-center gap-2 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] w-full py-4 rounded-full font-bold uppercase tracking-widest text-[13px] shadow-md hover:bg-[#12261a] dark:hover:bg-[#4ab872] transition-colors" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Join Now
              </Link>
            ) : (
              <Link 
                href={`/${locale}/login`}
                className="flex items-center justify-center gap-2 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] w-full py-4 rounded-full font-bold uppercase tracking-widest text-[13px] shadow-md hover:bg-[#12261a] dark:hover:bg-[#4ab872] transition-colors" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
