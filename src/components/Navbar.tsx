"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, X, Globe, ChevronDown, User, Bell, CheckCircle2, AlertTriangle, FileText, ShieldCheck, Check, Trash2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, dict } = useDictionary();
  const { isAuthenticated, user, isBuyer, isSeller, fetchProfile } = useAuth();
  const { notifications, markAllAsRead, clearAllNotifications, markAsRead, deleteNotification } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuth = mounted && isAuthenticated;

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/' || pathname === '';
  const isAuctionsActive = pathname.includes('/auctions') || pathname.includes('/property/') || pathname.includes('/public-property/');
  const isListingsActive = (pathname.includes('/listings') || pathname.includes('/simple-listings') || pathname.includes('/simple-property') || pathname.includes('/public-simple-property/')) && !isAuctionsActive;
  const showRealtimeNav = isAuctionsActive;
  const showListingsNav = !isAuctionsActive;

  const handleToggleType = async (targetType: "SIMPLE" | "REGULAR", targetUrl: string) => {
    if (isAuthenticated && user) {
      try {
        await api.put('/switch/toggleRole', { type: targetType });
        if (fetchProfile) await fetchProfile();
      } catch (err) {
        console.error("Failed to switch type:", err);
      }
    }
    router.push(targetUrl);
  };

  const currentPurpose = searchParams.get('listingPurpose') || searchParams.get('purpose');
  const currentSort = searchParams.get('sortBy') || searchParams.get('sort');
  const currentPropertyType = searchParams.get('propertyType')?.toUpperCase();


  const getNavLinks = () => {
    const rawLinks = dict?.navbar?.links || [
      { title: "Home", href: "/" },
      { title: "Find Agents", href: "/sellers" },
      { title: "About Us", href: "/about" },
      { title: "Blog", href: "/blog" },
      { title: "Contact", href: "/contact" }
    ];

    const baseLinks = rawLinks.filter((l: any) => l.href !== '/');

    if (!isAuth || !user) {
      return dict.navbar.links;
    }

    const findAgentsLink = baseLinks.find((l: any) => l.href === '/sellers') || { title: "Find Agents", href: "/sellers" };

    return [findAgentsLink];
  };

  const navLinks = getNavLinks();

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
    router.refresh();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-[#091711]/90 backdrop-blur-xl shadow-xs border-b border-gray-200/70 dark:border-[#1A3626]/70 py-1.5 sm:py-2"
            : "bg-white/95 dark:bg-[#091711]/95 backdrop-blur-md border-b border-gray-200/50 dark:border-[#1A3626]/50 py-2 sm:py-2.5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Logo & Centered Platform Toggle */}
          <div className="flex items-center flex-1 min-w-0">
            <Link href="/" className="flex items-center group shrink-0">
              <Image
                src="/cmpfavicon-removebg-preview.png"
                alt="Cash My Property"
                width={100}
                height={28}
                style={{ width: "auto", height: "auto" }}
                className="object-contain max-h-5 sm:max-h-[27px] w-auto group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>

            {/* Platform Toggle Pill (Listings vs Real Time Offer) - Centered between Logo and Buy */}
            <div className="flex-1 flex justify-center px-1 sm:px-4">
              <div className="flex items-center shrink-0 bg-[#102418] dark:bg-[#142e1d] p-0.5 sm:p-1 rounded-full border border-[#1A3626] shadow-inner transition-colors duration-300">
                <button
                  type="button"
                  onClick={() => handleToggleType("SIMPLE", `/${locale}/listings`)}
                  className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11.5px] font-bold transition-all duration-300 ease-out flex items-center gap-1 cursor-pointer active:scale-95 ${
                    isListingsActive && !isHomePage
                      ? "bg-[#5CD284] text-[#0A1C12] shadow-xs"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>Listings</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleType("REGULAR", `/${locale}/auctions`)}
                  className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11.5px] font-bold transition-all duration-300 ease-out flex items-center gap-1 cursor-pointer active:scale-95 ${
                    isAuctionsActive && !isHomePage
                      ? "bg-[#5CD284] text-[#0A1C12] shadow-xs"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>Real Time Offer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center justify-center shrink-0 mx-2 lg:mx-4">
            {showListingsNav ? (
              <nav className="flex items-center gap-7 lg:gap-8 xl:gap-10 text-[14px] lg:text-[15px] font-semibold text-gray-700 dark:text-gray-200">
                <Link
                  href={`/${locale}/listings?listingPurpose=SALE`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                    !isHomePage && (currentPurpose === 'SALE' || currentPurpose === 'BUY') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  Buy
                </Link>
                <Link
                  href={`/${locale}/listings?listingPurpose=RENT`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                    !isHomePage && currentPurpose === 'RENT' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  Rent
                </Link>
                <Link
                  href={`/${locale}/listings?sortBy=newest`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                    !isHomePage && currentSort === 'newest' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  New Projects
                </Link>
                <Link
                  href={`/${locale}/sellers`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                    pathname.includes('/sellers') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  {dict?.navbar?.links?.find((l: any) => l.href === '/sellers')?.title || "Find Agents"}
                </Link>
              </nav>
            ) : showRealtimeNav ? (
              <nav className="flex items-center gap-6 lg:gap-8 xl:gap-9 text-[14px] lg:text-[15px] font-semibold text-gray-700 dark:text-gray-200">
                <Link
                  href={`/${locale}/auctions`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                    isAuctionsActive && !currentPropertyType && !pathname.includes('/sellers') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  All Offers
                </Link>
                <Link
                  href={`/${locale}/auctions?propertyType=APARTMENT`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                    currentPropertyType === 'APARTMENT' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  Apartments
                </Link>
                <Link
                  href={`/${locale}/auctions?propertyType=VILLA`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                    currentPropertyType === 'VILLA' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  Villas
                </Link>
                <Link
                  href={`/${locale}/auctions?propertyType=COMMERCIAL`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                    currentPropertyType === 'COMMERCIAL' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  Commercial
                </Link>
                <Link
                  href={`/${locale}/sellers`}
                  className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                    pathname.includes('/sellers') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                  }`}
                >
                  {dict?.navbar?.links?.find((l: any) => l.href === '/sellers')?.title || "Find Agents"}
                </Link>
              </nav>
            ) : (
              <nav className="flex items-center gap-6 lg:gap-8 text-[14px] lg:text-[15px] font-semibold text-gray-700 dark:text-gray-200">
                {navLinks.map((item, index) => (
                  <Link
                    key={index}
                    href={`/${locale}${item.href === "/" ? "" : item.href}`}
                    className="relative px-3.5 py-1.5 font-semibold text-[14px] tracking-wide text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-[#5CD284] rounded-full hover:bg-gray-100 dark:hover:bg-[#163321]/80 transition-all duration-300"
                    style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right Side Actions & Mobile Trigger */}
          <div className="flex items-center justify-end flex-1 shrink-0 gap-2">
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1 border-r border-gray-200 dark:border-[#1A3626] pr-4">
                <div className="scale-90">
                  <ThemeToggle />
                </div>

                {/* Language Selector */}
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-[#102418] text-gray-700 dark:text-gray-300 transition-all">
                    <Globe className="w-4 h-4" />
                    <span className="font-semibold text-[12px] tracking-wide uppercase">{locale}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute top-[120%] right-0 mt-2 w-36 bg-white/95 dark:bg-[#102418]/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:scale-100 scale-95 overflow-hidden p-1.5">
                    <button onClick={() => switchLanguage('en')} className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-colors ${locale === 'en' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50/80 dark:bg-[#163321]/80' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#163321]'}`}>English</button>
                    <button onClick={() => switchLanguage('ar')} className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-colors ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50/80 dark:bg-[#163321]/80' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#163321]'}`}>العربية</button>
                  </div>
                </div>
              </div>

              {isAuth ? (
                <div className="flex items-center gap-3">
                  {/* Notifications Center */}
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                      }}
                      className="relative w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#102418] transition-colors cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      {notifications.some((n: any) => !n.read) && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                      )}
                    </button>

                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setShowNotifications(false)}
                        />
                        <div className="absolute top-[135%] right-0 mt-2 w-80 bg-white dark:bg-[#102418] rounded-2xl shadow-[0_10px_45px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_45px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-40 transform origin-top-right scale-100 transition-all overflow-hidden flex flex-col max-h-[420px]">
                          <div className="px-4 py-3 border-b border-gray-50 dark:border-[#1A3626] flex items-center justify-between bg-gray-50/50 dark:bg-[#102418]/50">
                            <span className="text-[13px] font-bold text-gray-900 dark:text-white">Notifications</span>
                            {notifications.length > 0 && (
                              <div className="flex gap-2.5 items-center">
                                {notifications.some((n: any) => !n.read) && (
                                  <button 
                                    onClick={() => {
                                      markAllAsRead();
                                    }}
                                    className="text-[11px] font-bold text-[#5CD284] hover:text-[#4ab872] transition-colors cursor-pointer"
                                  >
                                    Mark all as read
                                  </button>
                                )}
                                <span className="text-gray-300 dark:text-[#1A3626] text-[10px]">|</span>
                                <button 
                                  onClick={() => {
                                    clearAllNotifications();
                                    setShowNotifications(false);
                                  }}
                                  className="text-[11px] font-bold text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                  Clear All
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-[#1A3626] max-h-[320px] custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-8 flex flex-col items-center justify-center text-center">
                                <Bell className="w-8 h-8 text-gray-300 dark:text-[#1A3626] mb-2" />
                                <p className="text-[12px] text-gray-400 font-medium">You don't have any notifications yet</p>
                              </div>
                            ) : (
                              notifications.map((notif: any) => (
                                <div 
                                  key={notif.id} 
                                  onClick={() => {
                                    if (!notif.read) {
                                      markAsRead(notif.id);
                                    }
                                  }}
                                  className={`p-4 flex gap-3 hover:bg-gray-50/40 dark:hover:bg-[#163321]/30 transition-colors group/item relative cursor-pointer ${!notif.read ? 'bg-green-50/10 dark:bg-[#163321]/10' : ''}`}
                                >
                                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    notif.type === 'success' ? 'bg-green-500' :
                                    notif.type === 'warning' ? 'bg-amber-500' :
                                    'bg-[#1A3626] dark:bg-[#c9a14b]'
                                  }`} />
                                  <div className="flex-1 flex flex-col gap-0.5 pr-8">
                                    <span className={`text-[12.5px] font-bold text-gray-900 dark:text-white leading-tight ${notif.read ? 'opacity-60' : ''}`}>
                                      {notif.title}
                                    </span>
                                    <span className={`text-[11.5px] text-gray-500 dark:text-gray-400 font-medium leading-normal ${notif.read ? 'opacity-60' : ''}`}>
                                      {notif.message}
                                    </span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                                      {notif.timestamp}
                                    </span>
                                  </div>
                                  {/* Hover Action Buttons */}
                                  <div className="absolute right-3 top-3.5 flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    {!notif.read && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notif.id);
                                        }}
                                        className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#163321] dark:hover:bg-[#204930] text-green-600 dark:text-green-400 border border-gray-200/50 dark:border-[#1A3626] cursor-pointer"
                                        title="Mark as Read"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif.id);
                                      }}
                                      className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#163321] dark:hover:bg-[#204930] text-rose-500 dark:text-rose-400 border border-gray-200/50 dark:border-[#1A3626] cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/${locale}/dashboard`}
                    className="relative group overflow-hidden bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] px-5 py-2.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-[0_8px_20px_rgba(26,54,38,0.2)] dark:hover:shadow-[0_8px_20px_rgba(201,161,75,0.3)] hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 w-full h-full bg-white/20 dark:bg-black/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full skew-x-12"></div>
                    <span className="relative flex items-center gap-2"><User className="w-4 h-4" /> Dashboard</span>
                  </Link>
                </div>
              ) : isLoginPage ? (
                <Link
                  href={`/${locale}/signup`}
                  className="relative group overflow-hidden bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] px-6 py-2.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-[0_8px_20px_rgba(26,54,38,0.2)] dark:hover:shadow-[0_8px_20px_rgba(201,161,75,0.3)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 dark:bg-black/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full skew-x-12"></div>
                  <span className="relative flex items-center gap-2"><User className="w-4 h-4" /> Join Now</span>
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="relative group overflow-hidden bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] px-6 py-2.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-[0_8px_20px_rgba(26,54,38,0.2)] dark:hover:shadow-[0_8px_20px_rgba(201,161,75,0.3)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 dark:bg-black/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full skew-x-12"></div>
                  <span className="relative flex items-center gap-2"><User className="w-4 h-4" /> Login</span>
                </Link>
              )}
            </div>

          {/* Mobile Menu Toggle & Notifications */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuth && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                  }}
                  className="relative p-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#102418]/50 rounded-full transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some((n: any) => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-35" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute top-[135%] right-0 mt-2 w-[280px] bg-white dark:bg-[#102418] rounded-2xl shadow-[0_10px_45px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_45px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-40 overflow-hidden flex flex-col max-h-[350px]">
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-[#1A3626] flex items-center justify-between bg-gray-50/50 dark:bg-[#102418]/50">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">Notifications</span>
                        {notifications.length > 0 && (
                          <div className="flex gap-2.5 items-center">
                            {notifications.some((n: any) => !n.read) && (
                              <button 
                                onClick={() => {
                                  markAllAsRead();
                                }}
                                className="text-[11px] font-bold text-[#5CD284] hover:text-[#4ab872] transition-colors cursor-pointer"
                              >
                                Mark all as read
                              </button>
                            )}
                            <span className="text-gray-300 dark:text-[#1A3626] text-[10px]">|</span>
                            <button 
                              onClick={() => {
                                clearAllNotifications();
                                setShowNotifications(false);
                              }}
                              className="text-[11px] font-bold text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-[#1A3626] max-h-[250px] custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 flex flex-col items-center justify-center text-center">
                            <Bell className="w-8 h-8 text-gray-300 dark:text-[#1A3626] mb-2" />
                            <p className="text-[12px] text-gray-400 font-medium">You don't have any notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif: any) => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                if (!notif.read) {
                                  markAsRead(notif.id);
                                }
                              }}
                              className={`p-3 flex gap-2 hover:bg-gray-50/40 dark:hover:bg-[#163321]/30 transition-colors relative group/item cursor-pointer ${!notif.read ? 'bg-green-50/10 dark:bg-[#163321]/10' : ''}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                notif.type === 'success' ? 'bg-green-500' :
                                notif.type === 'warning' ? 'bg-amber-500' :
                                'bg-[#1A3626] dark:bg-[#c9a14b]'
                              }`} />
                              <div className="flex-1 flex flex-col gap-0.5 pr-12">
                                <span className={`text-[11.5px] font-bold text-gray-900 dark:text-white leading-tight animate-in fade-in ${notif.read ? 'opacity-60' : ''}`}>
                                  {notif.title}
                                </span>
                                <span className={`text-[10.5px] text-gray-500 dark:text-gray-400 font-medium leading-normal ${notif.read ? 'opacity-60' : ''}`}>
                                  {notif.message}
                                </span>
                                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                                  {notif.timestamp}
                                </span>
                              </div>
                              {/* Action Buttons for Mobile */}
                              <div className="absolute right-2 top-2.5 flex items-center gap-1">
                                {!notif.read && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                    }}
                                    className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#163321] text-green-600 dark:text-green-400 border border-gray-200/40 dark:border-[#1A3626] cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#163321] text-rose-500 dark:text-rose-400 border border-gray-200/40 dark:border-[#1A3626] cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <button
              className="p-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#102418] rounded-full transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 w-full bg-white/98 dark:bg-[#091711]/98 backdrop-blur-2xl border-b border-gray-200/80 dark:border-[#1A3626] shadow-2xl transition-all duration-300 origin-top overflow-hidden pointer-events-auto ${
            mobileMenuOpen ? "opacity-100 scale-y-100 max-h-[85vh] overflow-y-auto" : "opacity-0 scale-y-0 max-h-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col px-6 py-6 gap-4 w-full">
            <nav className="flex flex-col gap-4 font-semibold text-[16px] text-gray-800 dark:text-gray-200">
              {showListingsNav ? (
                <>
                  <Link
                    href={`/${locale}/listings?listingPurpose=SALE`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                      !isHomePage && (currentPurpose === 'SALE' || currentPurpose === 'BUY') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Buy
                  </Link>
                  <Link
                    href={`/${locale}/listings?listingPurpose=RENT`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                      !isHomePage && currentPurpose === 'RENT' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Rent
                  </Link>
                  <Link
                    href={`/${locale}/listings?sortBy=newest`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                      !isHomePage && currentSort === 'newest' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    New Projects
                  </Link>
                  <Link
                    href={`/${locale}/sellers`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                      pathname.includes('/sellers') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {dict?.navbar?.links?.find((l: any) => l.href === '/sellers')?.title || "Find Agents"}
                  </Link>
                </>
              ) : showRealtimeNav ? (
                <>
                  <Link
                    href={`/${locale}/auctions`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                      isAuctionsActive && !currentPropertyType && !pathname.includes('/sellers') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Offers
                  </Link>
                  <Link
                    href={`/${locale}/auctions?propertyType=APARTMENT`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                      currentPropertyType === 'APARTMENT' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Apartments
                  </Link>
                  <Link
                    href={`/${locale}/auctions?propertyType=VILLA`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                      currentPropertyType === 'VILLA' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Villas
                  </Link>
                  <Link
                    href={`/${locale}/auctions?propertyType=COMMERCIAL`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors py-1 ${
                      currentPropertyType === 'COMMERCIAL' ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Commercial
                  </Link>
                  <Link
                    href={`/${locale}/sellers`}
                    className={`hover:text-[#5CD284] dark:hover:text-[#5CD284] transition-colors whitespace-nowrap py-1 ${
                      pathname.includes('/sellers') ? 'text-[#5CD284] dark:text-[#5CD284] font-bold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {dict?.navbar?.links?.find((l: any) => l.href === '/sellers')?.title || "Find Agents"}
                  </Link>
                </>
              ) : (
                navLinks.map((item, index) => (
                  <Link
                    key={index}
                    href={`/${locale}${item.href === "/" ? "" : item.href}`}
                    className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors tracking-wide py-1"
                    style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))
              )}



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
                  <button onClick={() => switchLanguage('en')} className={`px-2 py-1 rounded-full transition-colors ${locale === 'en' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50 dark:bg-[#102418]' : 'text-gray-400 dark:text-gray-500'}`}>EN</button>
                  <button onClick={() => switchLanguage('ar')} className={`px-2 py-1 rounded-full transition-colors ${locale === 'ar' ? 'text-[#1A3626] dark:text-[#c9a14b] bg-green-50 dark:bg-[#102418]' : 'text-gray-400 dark:text-gray-500'}`}>عربي</button>
                </div>
              </div>
            </nav>

            <div className="mt-2 pt-4 border-t border-gray-200 dark:border-[#1A3626]">
              {isAuth ? (
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center justify-center gap-2 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] w-full py-4 rounded-full font-bold uppercase tracking-widest text-[13px] shadow-md hover:bg-[#12261a] dark:hover:bg-[#b38d3f] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Dashboard
                </Link>
              ) : isLoginPage ? (
                <Link
                  href={`/${locale}/signup`}
                  className="flex items-center justify-center gap-2 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] w-full py-4 rounded-full font-bold uppercase tracking-widest text-[13px] shadow-md hover:bg-[#12261a] dark:hover:bg-[#b38d3f] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Join Now
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="flex items-center justify-center gap-2 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] w-full py-4 rounded-full font-bold uppercase tracking-widest text-[13px] shadow-md hover:bg-[#12261a] dark:hover:bg-[#b38d3f] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

    </>
  );
}
