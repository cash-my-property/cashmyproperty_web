"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Zap, HeartHandshake, ArrowRight, Bed, Bath, Maximize, MapPin, Building, Home, Key, Smartphone, Download, Loader2, Share2, Compass } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { rtoService, rtoCardToGridItem, type RtoCard } from "@/services/rtoService";
import Image from "next/image";
import Dirham from "@/components/Dirham";
import HeroSearchWidget from "@/components/search/HeroSearchWidget";
import HeroBackground from "@/components/search/HeroBackground";
import { features } from "@/config/features";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import connectPublicService, { PublicHomeData, PublicListingCard } from "@/services/connectPublicService";

export default function HomePage() {
  const { dict, locale } = useDictionary();
  const { home } = dict;

  const [liveProperties, setLiveProperties] = useState<any[]>([]);
  const [upcomingProperties, setUpcomingProperties] = useState<any[]>([]);
  const [homeData, setHomeData] = useState<PublicHomeData | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<PublicListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const fetchProperties = async () => {
      try {
        setIsLoading(true);

        const [publicHome, liveRes, upcomingRes] = await Promise.all([
          connectPublicService.getHome().catch(() => null),
          // Real Time Offers — CMP Connect public RTO API (legacy /public/*-properties ki jagah)
          features.realTimeOffers ? rtoService.getLive({ limit: 6 }).catch(() => ({ data: [] as RtoCard[] })) : { data: [] as RtoCard[] },
          features.realTimeOffers ? rtoService.getUpcoming({ limit: 6 }).catch(() => ({ data: [] as RtoCard[] })) : { data: [] as RtoCard[] }
        ]);

        if (publicHome) {
          setHomeData(publicHome);
          if (Array.isArray(publicHome.featured)) {
            setFeaturedProperties(publicHome.featured);
          }
        }

        setLiveProperties(liveRes.data.map(rtoCardToGridItem));
        setUpcomingProperties(upcomingRes.data.map(rtoCardToGridItem));
      } catch (err) {
        console.error("Error fetching homepage properties", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [authLoading]);

  return (
    <main className="flex-1 flex flex-col min-h-screen transition-colors bg-[#F4F5F7] dark:bg-[#091711]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[780px] lg:min-h-[860px] flex items-center justify-center pt-24 pb-16">
        <HeroBackground />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-4">
          <h1 className="text-white text-4xl sm:text-5xl lg:text-[60px] font-bold mb-6 leading-[1.15] tracking-tight max-w-4xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.hero.headline}
          </h1>
          <p className="text-gray-200 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10 font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            {home.hero.subheadline}
          </p>

          <HeroSearchWidget showTabs={true} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F4F5F7] dark:from-[#091711] to-transparent pointer-events-none" />
      </section>

      {/* PLATFORM STATS STRIP (From Home API totals) */}
      {homeData?.totals && (
        <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/95 dark:bg-[#102418]/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-[#1A3626]">
            <div className="text-center p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                {homeData.totals.live?.toLocaleString() || "0"}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Live Properties
              </span>
            </div>
            <div className="text-center p-3 border-l border-gray-200 dark:border-[#1A3626]">
              <span className="block text-2xl sm:text-3xl font-extrabold text-[#1A3626] dark:text-[#c9a14b]">
                {homeData.totals.forSale?.toLocaleString() || "0"}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                For Sale
              </span>
            </div>
            <div className="text-center p-3 border-l border-gray-200 dark:border-[#1A3626]">
              <span className="block text-2xl sm:text-3xl font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                {homeData.totals.forRent?.toLocaleString() || "0"}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                For Rent
              </span>
            </div>
            <div className="text-center p-3 border-l border-gray-200 dark:border-[#1A3626]">
              <span className="block text-2xl sm:text-3xl font-extrabold text-[#1A3626] dark:text-[#c9a14b]">
                {homeData.totals.agencies?.toLocaleString() || "0"}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Verified Agencies
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 2. REALTIME OFFERS (DISTRESS LISTINGS) — feature flag */}
      {features.realTimeOffers && (
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              {home.realtimebids.label}
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {home.realtimebids.heading}
            </h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
              {home.realtimebids.description}
            </p>
          </div>
          <Link href={`/${locale}/auctions`} className="group inline-flex items-center gap-2 font-semibold text-[#1A3626] dark:text-[#c9a14b] hover:opacity-80 transition-opacity">
            {home.realtimebids.viewAllText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#102418] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#1A3626] flex flex-col p-1.5 animate-pulse shadow-sm">
                <div className="relative h-[240px] rounded-xl bg-gray-200 dark:bg-[#163321] w-full" />
                <div className="p-4 pt-5 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-2/3" />
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                </div>
              </div>
            ))
          ) : [...liveProperties, ...upcomingProperties].length > 0 ? (
            [...liveProperties, ...upcomingProperties].slice(0, 6).map((item, idx) => (
              <PropertyGridCard
                key={item._id || idx}
                item={item}
                locale={locale}
                priority={idx === 0}
                isAuction={true}
                href={`/${locale}/auctions/${item.id}`}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
              No live auction properties available at the moment.
            </div>
          )}
        </div>
      </section>
      )}

      {/* 3. FEATURED PUBLIC LISTINGS (FROM /home API) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto border-t border-gray-200 dark:border-[#1A3626]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase">
              Featured Properties
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Explore Top Properties
            </h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
              Verified properties for sale and rent from licensed brokers and authentic agencies across the UAE.
            </p>
          </div>
          <Link href={`/${locale}/listings`} className="group inline-flex items-center gap-2 font-semibold text-[#1A3626] dark:text-[#c9a14b] hover:opacity-80 transition-opacity">
            View All Listings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#102418] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#1A3626] flex flex-col p-1.5 animate-pulse shadow-sm">
                <div className="relative h-[240px] rounded-xl bg-gray-200 dark:bg-[#163321] w-full" />
                <div className="p-4 pt-5 flex flex-col flex-1 gap-4">
                  <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                </div>
              </div>
            ))
          ) : featuredProperties.length > 0 ? (
            featuredProperties.slice(0, 6).map((item: any, idx) => (
              <PropertyGridCard
                key={item.ref || item.id || idx}
                item={item}
                locale={locale}
                priority={idx === 0}
                isAuction={false}
                href={`/${locale}/listings/${item.ref || item.id}`}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
              No featured listings available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* 4. POPULAR COMMUNITIES (FROM /home API) */}
      {homeData?.communities && homeData.communities.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto border-t border-gray-200 dark:border-[#1A3626]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#5CD284]" />
                Explore Neighborhoods
              </p>
              <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Popular Communities
              </h2>
              <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
                Discover vibrant neighborhoods and prime communities in Dubai with high-demand residential options.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeData.communities.map((c, idx) => (
              <Link
                key={c.name || idx}
                href={`/${locale}/listings?location=${encodeURIComponent(c.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-900 shadow-md hover:shadow-2xl transition-all duration-300 block"
              >
                {c.coverImage ? (
                  <Image
                    src={c.coverImage}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-95"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A3626] to-[#0A1C12]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[#5CD284] transition-colors">
                    {c.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span>{c.count} {c.count === 1 ? 'Property' : 'Properties'}</span>
                    <span>•</span>
                    <span>{c.forSale} For Sale</span>
                    <span>•</span>
                    <span>{c.forRent} For Rent</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-[#102418] border-y border-gray-200 dark:border-[#1A3626]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-widest text-[12px] mb-4 uppercase">
            {home.howItWorks.label}
          </p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-gray-900 dark:text-white mb-16 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.howItWorks.heading}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 relative">
             <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-100 dark:bg-[#163321]/50 -z-10" />

             {home.howItWorks.steps.map((step, idx) => (
               <div key={idx} className="relative flex flex-col items-center group">
                 <div className="w-24 h-24 rounded-full bg-[#F4F5F7] dark:bg-[#091711] border-[8px] border-white dark:border-[#102418] shadow-xl flex items-center justify-center mb-8 text-[#1A3626] dark:text-[#c9a14b] group-hover:scale-110 group-hover:bg-[#1A3626] group-hover:text-white dark:group-hover:bg-[#5CD284] dark:group-hover:text-[#091711] transition-all duration-300">
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

      {/* 6. APP DOWNLOAD BANNER */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="relative w-full bg-[#1A3626] dark:bg-[#091711] rounded-[32px] overflow-hidden shadow-2xl border border-[#5CD284]/10 dark:border-[#1A3626] flex flex-col md:flex-row items-center justify-between">
          
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#5CD284]/20 rounded-full blur-[100px] pointer-events-none" />

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
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a 
                href="https://apps.apple.com/pk/app/cmp-cashmyproperty/id6762503025" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto border border-white/10 hover:border-white/30 shadow-lg"
              >
                <Smartphone className="w-8 h-8" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider text-gray-300 font-medium">{home.appDownload.appStoreText}</span>
                  <span className="text-[18px] font-bold leading-none">{home.appDownload.appStore}</span>
                </div>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.cashmyproperty&pcampaignid=web_share" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto border border-white/10 hover:border-white/30 shadow-lg"
              >
                <Download className="w-8 h-8" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider text-gray-300 font-medium">{home.appDownload.playStoreText}</span>
                  <span className="text-[18px] font-bold leading-none">{home.appDownload.playStore}</span>
                </div>
              </a>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-2/5 flex justify-center md:justify-end pr-0 md:pr-12 lg:pr-20 pt-10 md:pt-0 overflow-hidden">
             <div className="relative w-[280px] h-[350px] md:h-[450px] overflow-visible">
               <Image 
                 src="/app-mockup.png" 
                 alt="CMP App Mockup" 
                 fill
                 sizes="(max-width: 768px) 280px, 450px"
                 className="absolute bottom-[-10%] md:bottom-[-5%] right-0 w-full h-[115%] object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] transform -rotate-6 translate-x-8"
               />
             </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-widest text-[12px] mb-4 uppercase">
            {home.whyChooseUs.label}
          </p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.whyChooseUs.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {home.whyChooseUs.features.map((feature, idx) => (
             <div key={idx} className="bg-white dark:bg-[#102418]/50 rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-[#1A3626] hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#1A3626]/5 dark:bg-[#c9a14b]/10 flex items-center justify-center mb-8">
                  {idx === 0 && <Zap className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />}
                  {idx === 1 && <ShieldCheck className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />}
                  {idx === 2 && <HeartHandshake className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />}
                </div>
                <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
             </div>
           ))}
        </div>
      </section>

      {/* 8. BOTTOM CTA */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="relative w-full bg-gradient-to-br from-[#1B3A2D] to-[#0A1C12] dark:from-[#102418] dark:to-[#091711] rounded-[40px] p-10 sm:p-16 lg:p-20 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 dark:bg-[#c9a14b]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 dark:bg-[#c9a14b]/5 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          {!isAuthenticated ? (
            <>
              <div className="relative z-10 flex-1 max-w-2xl">
                <h2 className="text-white text-[32px] sm:text-[40px] lg:text-[48px] font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {home.cta.heading}
                </h2>
                <p className="text-green-100/70 dark:text-gray-400 text-[16px] sm:text-[18px] max-w-xl leading-relaxed">
                  {home.cta.description}
                </p>
              </div>
              
              <div className="relative z-10">
                <Link href={`/${locale}/signup`} className="group inline-flex items-center justify-center gap-3 bg-white dark:bg-[#c9a14b] text-[#1A3626] dark:text-[#091711] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-wide hover:bg-gray-100 dark:hover:bg-[#b38d3f] transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] dark:shadow-[0_10px_30px_rgba(92,210,132,0.2)] hover:scale-105 whitespace-nowrap">
                  {home.cta.buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="relative z-10 flex-1 max-w-2xl">
                <h2 className="text-white text-[32px] sm:text-[40px] lg:text-[48px] font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Ready to discover your next home?
                </h2>
                <p className="text-green-100/70 dark:text-gray-400 text-[16px] sm:text-[18px] max-w-xl leading-relaxed">
                  Go to your buyer dashboard to track your live bids, view favorite properties, and explore direct simple deals.
                </p>
              </div>
              
              <div className="relative z-10">
                <Link href={`/${locale}/dashboard`} className="group inline-flex items-center justify-center gap-3 bg-white dark:bg-[#c9a14b] text-[#1A3626] dark:text-[#091711] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-wide hover:bg-gray-100 dark:hover:bg-[#b38d3f] transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] dark:shadow-[0_10px_30px_rgba(92,210,132,0.2)] hover:scale-105 whitespace-nowrap">
                  Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

    </main>
  );
}
