"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, ShieldCheck, Zap, HeartHandshake, ArrowRight, Bed, Bath, Maximize, MapPin, Building, Home, Key, Smartphone, Download, ArrowDownUp, ChevronDown, Loader2, Share2 } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import Image from "next/image";
import Dirham from "@/components/Dirham";
import HeroSearchWidget from "@/components/search/HeroSearchWidget";

export default function HomePage() {
  const { dict, locale } = useDictionary();
  const { home } = dict;
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [liveProperties, setLiveProperties] = useState<any[]>([]);
  const [upcomingProperties, setUpcomingProperties] = useState<any[]>([]);
  const [simpleLiveProperties, setSimpleLiveProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller } = useAuth();
  const { socket, addToast } = useSocket();
  const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';

  // Listen to socket events for real-time price and auction updates
  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (data: any) => {
      console.log("📡 [Homepage Socket] Received listing_price_update:", data);
      const { auctionId, newPrice, newEndTime, bidCounter } = data;

      setLiveProperties(prev => prev.map(p => {
        if (p._id === auctionId) {
          return {
            ...p,
            currentHighestBid: newPrice,
            currentHighestOffer: newPrice, // fallback
            endTime: newEndTime || p.endTime,
            bidCounter: bidCounter || p.bidCounter,
            totalOffers: (p.totalOffers || 0) + 1
          };
        }
        return p;
      }));
    };

    const handleNewAuction = (fullCard: any) => {
      console.log("📡 [Homepage Socket] Received new_auction_live:", fullCard);
      if (!fullCard || !fullCard._id) return;

      setLiveProperties(prev => {
        if (prev.some(p => p._id === fullCard._id)) return prev;
        return [fullCard, ...prev].slice(0, 6);
      });
    };

    const handleAuctionEnded = (data: any) => {
      console.log("📡 [Homepage Socket] Received auction_ended_global:", data);
      const { auctionId, status } = data;

      setLiveProperties(prev => prev.map(p => {
        if (p._id === auctionId) {
          return {
            ...p,
            status: status || 'ENDED'
          };
        }
        return p;
      }));
    };

    socket.on("listing_price_update", handlePriceUpdate);
    socket.on("new_auction_live", handleNewAuction);
    socket.on("auction_ended_global", handleAuctionEnded);

    return () => {
      socket.off("listing_price_update", handlePriceUpdate);
      socket.off("new_auction_live", handleNewAuction);
      socket.off("auction_ended_global", handleAuctionEnded);
    };
  }, [socket]);

  useEffect(() => {
    if (authLoading) return;
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        if (isAuthenticated && isSeller) {
          // Seller Mode: Do NOT fetch any buyer listings — sellers have no business browsing properties
          setLiveProperties([]);
          setUpcomingProperties([]);
          setSimpleLiveProperties([]);
          return;
        }

        // 1. Live Properties (realtime campaigns) Query
        const liveParams = new URLSearchParams();
        liveParams.append('limit', '6');
        if (appliedSearch) {
          liveParams.append('search', appliedSearch);
        }
        if (selectedType && selectedType !== 'all') {
          if (selectedType === 'land') {
            liveParams.append('propertyType', 'LAND');
          } else {
            liveParams.append('category', selectedType.toUpperCase());
          }
        }
        if (selectedPrice && selectedPrice !== 'all') {
          if (selectedPrice === 'under1m') {
            liveParams.append('maxPrice', '1000000');
          } else if (selectedPrice === '1mTo5m') {
            liveParams.append('minPrice', '1000000');
            liveParams.append('maxPrice', '5000000');
          } else if (selectedPrice === 'over5m') {
            liveParams.append('minPrice', '5000000');
          }
        }
        if (selectedSort) {
          if (selectedSort === 'newest') {
            liveParams.append('sortBy', 'newest');
          } else if (selectedSort === 'priceAsc') {
            liveParams.append('sortBy', 'priceLow');
          } else if (selectedSort === 'priceDesc') {
            liveParams.append('sortBy', 'priceHigh');
          }
        }
        const liveQuery = liveParams.toString();

        // 2. Simple Listings Query
        const simpleParams = new URLSearchParams();
        simpleParams.append('limit', '6');
        if (appliedSearch) {
          simpleParams.append('search', appliedSearch);
        }
        if (selectedType && selectedType !== 'all') {
          if (selectedType === 'land') {
            simpleParams.append('propertyType', 'LAND');
          } else {
            simpleParams.append('propertyCategory', selectedType.toUpperCase());
          }
        }
        if (selectedPrice && selectedPrice !== 'all') {
          if (selectedPrice === 'under1m') {
            simpleParams.append('maxPrice', '1000000');
          } else if (selectedPrice === '1mTo5m') {
            simpleParams.append('minPrice', '1000000');
            simpleParams.append('maxPrice', '5000000');
          } else if (selectedPrice === 'over5m') {
            simpleParams.append('minPrice', '5000000');
          }
        }
        if (selectedSort) {
          if (selectedSort === 'newest') {
            simpleParams.append('sortBy', 'newest');
          } else if (selectedSort === 'priceAsc') {
            simpleParams.append('sortBy', 'priceLow');
          } else if (selectedSort === 'priceDesc') {
            simpleParams.append('sortBy', 'priceHigh');
          }
        }
        const simpleQuery = simpleParams.toString();

        if (isAuthenticated && isBuyer) {
          if (buyerType === 'REGULAR') {
            // Logged in Regular Buyer: Only hit regular buyer private routes
            const [liveRes, upcomingRes] = await Promise.all([
              api.get(`/buyer/live-listings?${liveQuery}`),
              api.get(`/buyer/upcoming-listings?${liveQuery}`)
            ]);

            const liveData = liveRes.data.data;
            const upcomingData = upcomingRes.data.data;

            setLiveProperties(Array.isArray(liveData) ? liveData : (liveData?.data || []));
            setUpcomingProperties(Array.isArray(upcomingData) ? upcomingData : (upcomingData?.data || []));
            setSimpleLiveProperties([]);
          } else if (buyerType === 'SIMPLE') {
            // Logged in Simple Buyer: Only hit simple buyer private routes
            const simpleLiveRes = await api.get(`/buyer/simpleLiveListings?${simpleQuery}`);
            const simpleLiveData = simpleLiveRes.data.data;

            setLiveProperties([]);
            setUpcomingProperties([]);
            setSimpleLiveProperties(Array.isArray(simpleLiveData) ? simpleLiveData : (simpleLiveData?.data || []));
          }
        } else {
          // Guest User: Fetch public routes only
          const [liveRes, upcomingRes, simpleLiveRes] = await Promise.all([
            api.get(`/public/live-properties?${liveQuery}`),
            api.get(`/public/upcoming-properties?${liveQuery}`),
            api.get(`/public/simple-live-properties?${simpleQuery}`)
          ]);

          const liveData = liveRes.data.data;
          const upcomingData = upcomingRes.data.data;
          const simpleLiveData = simpleLiveRes.data.data;

          setLiveProperties(Array.isArray(liveData) ? liveData : (liveData?.data || []));
          setUpcomingProperties(Array.isArray(upcomingData) ? upcomingData : (upcomingData?.data || []));
          setSimpleLiveProperties(Array.isArray(simpleLiveData) ? simpleLiveData : (simpleLiveData?.data || []));
        }
      } catch (err) {
        console.error("Error fetching properties", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [authLoading, isAuthenticated, buyerType, isBuyer, isSeller, appliedSearch, selectedType, selectedPrice, selectedSort]);

  return (
    <main className="flex-1 flex flex-col min-h-screen transition-colors bg-[#F4F5F7] dark:bg-[#091711]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[650px] lg:min-h-[700px] flex items-center justify-center pt-24 pb-16">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/hero-bg.svg"
            alt="Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%] pointer-events-none"
          />
          {/* Dark Green Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/90 via-[#0a1a13]/85 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Glow Effects */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#c9a14b]/10 rounded-full blur-[90px] pointer-events-none" />
        </div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center text-center mt-6">
          <h1 className="text-white text-4xl sm:text-5xl lg:text-[64px] font-bold mb-6 leading-[1.1] tracking-tight max-w-4xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.hero.headline}
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed mb-12 font-light">
            {home.hero.subheadline}
          </p>

          {/* Upgraded Hero Search Bar Widget */}
          <HeroSearchWidget 
            onSearch={(filters) => {
              setAppliedSearch(filters.query);
              if (filters.propertyType !== "ALL") {
                setSelectedType(filters.propertyType.toLowerCase());
              } else {
                setSelectedType(null);
              }
            }}
          />
        </div>

        {/* Bottom fade out to background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F5F7] dark:from-[#091711] to-transparent pointer-events-none" />
      </section>

      {/* SELLER CTA PANEL — Only shown when user is in Seller Mode */}
      {isAuthenticated && isSeller && (
        <section className="py-20 px-6 lg:px-12 w-full max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-[#1A3626] dark:bg-[#102418] p-10 sm:p-14 flex flex-col lg:flex-row items-center gap-10 shadow-2xl border border-[#2a4f38] dark:border-[#1A3626]">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#c9a14b]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Left: Icon Badge */}
            <div className="relative z-10 w-24 h-24 rounded-3xl bg-[#5CD284]/15 border border-[#5CD284]/30 flex items-center justify-center shrink-0">
              <Building className="w-12 h-12 text-[#5CD284]" />
            </div>

            {/* Center: Text */}
            <div className="relative z-10 flex-1 text-center lg:text-left">
              <span className="text-[#5CD284] font-bold tracking-[0.2em] text-[11px] uppercase block mb-3">
                Seller Mode Active
              </span>
              <h2 className="text-white text-[28px] sm:text-[36px] font-bold mb-4 leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                You&apos;re here to sell,<br className="hidden sm:block" /> not to browse.
              </h2>
              <p className="text-white/65 text-[15px] sm:text-[16px] leading-relaxed max-w-xl">
                As a seller, property listings and live offers are not accessible to you. Head to your dashboard to manage your listings, track offers, and monitor your activity.
              </p>
            </div>

            {/* Right: CTA Buttons */}
            <div className="relative z-10 flex flex-col gap-3 shrink-0">
              <Link
                href={`/${locale}/dashboard/seller/properties`}
                className="inline-flex items-center justify-center gap-2 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(92,210,132,0.4)] text-[15px] whitespace-nowrap"
              >
                <Key className="w-5 h-5" />
                My Listings
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-[15px] whitespace-nowrap"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. REALTIME OFFERS (DISTRESS LISTINGS) */}
      {!(isAuthenticated && isSeller) && !(isAuthenticated && isBuyer && buyerType === 'SIMPLE') && (
        <section className="py-20 px-6 lg:px-12 w-full max-w-7xl mx-auto">
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
              <div key={i} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden border border-gray-100 dark:border-[#1A3626] flex flex-col p-2 animate-pulse shadow-sm">
                <div className="relative h-[240px] rounded-[20px] bg-gray-200 dark:bg-[#163321] w-full" />
                <div className="p-4 pt-5 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-2/3" />
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                  <div className="flex gap-4">
                    <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded-md w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded-md w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded-md w-20" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1A3626] flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-24" />
                    <div className="h-8 bg-gray-200 dark:bg-[#163321] rounded-md w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : [...liveProperties, ...upcomingProperties].length > 0 ? (
            [...liveProperties, ...upcomingProperties].slice(0, 6).map((item) => {
              const details = item.propertyDetails || {};
              const title = details.propertyTitle || "Untitled Property";
              const location = details.propertyLocation?.city || "Dubai";
              const image = details.propertyImages?.[0]?.url || "/property-placeholder.svg";
              const beds = details.propertyBedrooms || 0;
              const baths = details.propertyWashrooms || 0;
              const getArea = (area: any) => {
                if (!area) return "N/A";
                if (typeof area === 'object' && area.value !== undefined) return `${area.value} ${area.unit || 'sqft'}`;
                return `${area} sqft`;
              };
              const area = getArea(details.propertyArea || details.propertyBuiltUpArea);
              const highestBid = item.currentHighestBid || (typeof item.currentHighestOffer === 'object' ? item.currentHighestOffer?.amount : item.currentHighestOffer);
              const fallbackPrice = details.propertyPrice?.amount || details.propertyPrice || 0;
              const price = highestBid ? `AED ${highestBid.toLocaleString()}` : `AED ${fallbackPrice.toLocaleString()}`;
              
              const endDate = new Date(item.endTime);
              const startDate = new Date(item.startTime);
              const now = new Date().getTime();
              
              let timeDisplay = "";
              if (item.status === 'UPCOMING') {
                timeDisplay = `Starts: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
              } else {
                const timeDiff = endDate.getTime() - now;
                if (timeDiff > 0) {
                  const d = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  const h = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const m = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                  timeDisplay = `${d}d ${h}h ${m}m`;
                } else {
                  timeDisplay = 'Ended';
                }
              }
              const priceValue = highestBid ? highestBid.toLocaleString() : fallbackPrice.toLocaleString();
              const type = details.propertyType || "Property";

              return (
              <Link href={`/${locale}/listings/${item._id}`} key={item._id} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group block cursor-pointer">
                <div className="relative h-[240px] overflow-hidden rounded-[20px] bg-gray-100 dark:bg-[#091711]">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#c9a14b] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                     <span className={`w-2 h-2 rounded-full ${item.status === 'UPCOMING' ? 'bg-orange-500' : 'bg-[#5CD284]'}`}></span> {item.status || 'ACTIVE'}
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#c9a14b] px-3 py-1.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 shadow-md whitespace-nowrap">
                     <Clock className="w-3.5 h-3.5 text-[#5CD284]" /> {timeDisplay}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#c9a14b] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase shadow-md">
                     PID-{item.PID || item._id.substring(0,8).toUpperCase()}
                  </div>

                  <div 
                    className="absolute bottom-4 right-4 w-10 h-10 bg-[#0A3622] dark:bg-[#c9a14b] rounded-full flex items-center justify-center text-white dark:text-[#0A3622] shadow-md hover:bg-[#124d31] dark:hover:bg-[#b38d3f] transition-colors"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      const shareUrl = `${window.location.origin}/${locale}/auctions/${item._id}`;
                      if (navigator.share) {
                        navigator.share({ title: title, url: shareUrl }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        addToast("Link Copied", "Property link copied to clipboard successfully!", "success");
                      }
                    }}
                  >
                     <Share2 className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="p-4 pt-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-[20px] text-gray-900 dark:text-white leading-tight line-clamp-1">{title}</h3>
                    <span className="font-bold text-[22px] text-gray-900 dark:text-[#c9a14b] leading-none whitespace-nowrap"><Dirham className="mr-1 text-[20px]" /> {priceValue}</span>
                  </div>
                  
                  <p className="text-[#1A3626] dark:text-[#c9a14b] text-[13px] font-medium flex items-center gap-1.5 mb-4">
                    <MapPin className="w-4 h-4" /> {location}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-5">
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bed className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" /> {beds}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bath className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" /> {baths}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Maximize className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {area}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-bold text-[14px] text-gray-900 dark:text-white">Total Offers {item.totalOffers || 0}</span>
                    <div className="px-5 py-2.5 bg-[#0A3622] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-lg font-bold text-[14px] hover:bg-[#124d31] dark:hover:bg-[#b38d3f] transition-colors inline-block text-center">
                      Make Offer
                    </div>
                  </div>

                  {/* Footer Grid */}
                  <div className="mt-auto bg-[#F4F5F7] dark:bg-[#091711] rounded-xl p-3 grid grid-cols-3 divide-x divide-gray-300 dark:divide-[#1A3626]">
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#c9a14b] text-[10px] font-bold uppercase tracking-wider mb-0.5">Category</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{details.propertyCategory || "Residential"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#c9a14b] text-[10px] font-bold uppercase tracking-wider mb-0.5">Type</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{type}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#c9a14b] text-[10px] font-bold uppercase tracking-wider mb-0.5">Status</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{item.status || "Ready"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )})
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
              No live properties available at the moment.
            </div>
          )}
        </div>
      </section>
      )}

      {/* 3. SIMPLE LISTINGS */}
      {!(isAuthenticated && isSeller) && !(isAuthenticated && isBuyer && buyerType === 'REGULAR') && (
        <section className="py-20 px-6 lg:px-12 w-full max-w-7xl mx-auto border-t border-gray-200/50 dark:border-[#1A3626]/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-widest text-[12px] mb-3 uppercase">
              {home.simpleListings.label}
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {home.simpleListings.heading}
            </h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
              {home.simpleListings.description}
            </p>
          </div>
          <Link href={`/${locale}/listings`} className="group inline-flex items-center gap-2 font-semibold text-[#1A3626] dark:text-[#c9a14b] hover:opacity-80 transition-opacity">
            {home.simpleListings.viewAll} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden border border-gray-100 dark:border-[#1A3626] flex flex-col p-2 animate-pulse shadow-sm">
                <div className="relative h-[240px] rounded-[20px] bg-gray-200 dark:bg-[#163321] w-full" />
                <div className="p-4 pt-5 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-2/3" />
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                </div>
              </div>
            ))
          ) : simpleLiveProperties.length > 0 ? (
            simpleLiveProperties.map((item) => {
              const details = item.propertyDetails || item || {};
              const title = item.title || details.propertyTitle || "Untitled Property";
              const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai");
              const image = item.image || details.propertyImages?.[0]?.url || "/property-placeholder.svg";
              const beds = item.specs?.beds || details.propertyBedrooms || 0;
              const baths = item.specs?.washrooms || details.propertyWashrooms || details.propertyBathrooms || 0;
              const area = item.area?.value ? `${item.area.value} ${item.area.unit || 'sqft'}` : (details.propertyArea?.value ? `${details.propertyArea.value} ${details.propertyArea.unit || 'sqft'}` : (details.propertyBuiltUpArea || 0) + ' sqft');
              const price = item.price?.amount || details.propertyPrice?.amount || details.propertyPrice || 0;
              const type = details.propertyType || "Property";

              return (
              <Link href={`/${locale}/simple-listings/${item._id || item.id}`} key={item._id || item.id} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group block cursor-pointer">
                <div className="relative h-[240px] overflow-hidden rounded-[20px] bg-gray-100 dark:bg-[#091711]">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#c9a14b] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                     <span className="w-2 h-2 rounded-full bg-[#5CD284]"></span> ACTIVE
                  </div>
                </div>
                
                <div className="p-4 pt-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-[20px] text-gray-900 dark:text-white leading-tight line-clamp-1">{title}</h3>
                    <span className="font-bold text-[22px] text-gray-900 dark:text-[#c9a14b] leading-none whitespace-nowrap"><Dirham className="mr-1 text-[20px]" /> {price.toLocaleString()}</span>
                  </div>
                  
                  <p className="text-[#1A3626] dark:text-[#c9a14b] text-[13px] font-medium flex items-center gap-1.5 mb-4">
                    <MapPin className="w-4 h-4" /> {location}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-5">
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bed className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" /> {beds}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bath className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" /> {baths}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Maximize className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {area}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-5">
                    <div className="px-5 py-2.5 w-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-lg font-bold text-[14px] hover:bg-[#124d31] dark:hover:bg-[#b38d3f] transition-colors inline-block text-center">
                      View Details
                    </div>
                  </div>

                  {/* Footer Grid */}
                  <div className="mt-auto bg-[#F4F5F7] dark:bg-[#091711] rounded-xl p-3 grid grid-cols-3 divide-x divide-gray-300 dark:divide-[#1A3626]">
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#c9a14b] text-[10px] font-bold uppercase tracking-wider mb-0.5">Category</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{details.propertyCategory || "Residential"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#c9a14b] text-[10px] font-bold uppercase tracking-wider mb-0.5">Type</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{type}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#c9a14b] text-[10px] font-bold uppercase tracking-wider mb-0.5">Status</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{item.status || "Ready"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )})
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">
              No simple listings available at the moment.
            </div>
          )}
        </div>
      </section>
      )}

      {/* 4. HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-[#102418] border-y border-gray-200 dark:border-[#1A3626]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-widest text-[12px] mb-4 uppercase">
            {home.howItWorks.label}
          </p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-gray-900 dark:text-white mb-16 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {home.howItWorks.heading}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 relative">
             {/* Connecting Line (Desktop Only) */}
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

      {/* 5. APP DOWNLOAD BANNER */}
      <section className="py-12 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="relative w-full bg-[#1A3626] dark:bg-[#091711] rounded-[32px] overflow-hidden shadow-2xl border border-[#5CD284]/10 dark:border-[#1A3626] flex flex-col md:flex-row items-center justify-between">
          
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
              <a 
                href="https://apps.apple.com/pk/app/cmp-cashmyproperty/id6762503025" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto border border-white/10 hover:border-white/30 shadow-lg"
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
                className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto border border-white/10 hover:border-white/30 shadow-lg"
              >
                <Download className="w-8 h-8" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider text-gray-300 font-medium">{home.appDownload.playStoreText}</span>
                  <span className="text-[18px] font-bold leading-none">{home.appDownload.playStore}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Phone Mockup Graphic */}
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

      {/* 6. WHY CHOOSE US */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
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

      {/* 7. BOTTOM CTA */}
      <section className="pb-24 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="relative w-full bg-gradient-to-br from-[#1B3A2D] to-[#0A1C12] dark:from-[#102418] dark:to-[#091711] rounded-[40px] p-10 sm:p-16 lg:p-20 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          
          {/* Decorative elements */}
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
          ) : (() => {
            const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";
            const isSeller = role === 'seller';
            
            const headingText = isSeller 
              ? "Manage Your Real Estate Portfolio"
              : "Ready to discover your next home?";
            
            const descText = isSeller
              ? "Access your seller command center to add verified properties, inspect real-time bidding logs, and accept offers."
              : "Go to your buyer dashboard to track your live bids, view favorite properties, and explore direct simple deals.";
            
            const btnLink = isSeller
              ? `/${locale}/dashboard/seller/properties`
              : `/${locale}/dashboard`;
            
            const btnText = isSeller
              ? "Manage Properties"
              : "Go to Dashboard";
            
            return (
              <>
                <div className="relative z-10 flex-1 max-w-2xl">
                  <h2 className="text-white text-[32px] sm:text-[40px] lg:text-[48px] font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {headingText}
                  </h2>
                  <p className="text-green-100/70 dark:text-gray-400 text-[16px] sm:text-[18px] max-w-xl leading-relaxed">
                    {descText}
                  </p>
                </div>
                
                <div className="relative z-10">
                  <Link href={btnLink} className="group inline-flex items-center justify-center gap-3 bg-white dark:bg-[#c9a14b] text-[#1A3626] dark:text-[#091711] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-wide hover:bg-gray-100 dark:hover:bg-[#b38d3f] transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] dark:shadow-[0_10px_30px_rgba(92,210,132,0.2)] hover:scale-105 whitespace-nowrap">
                    {btnText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      </section>

    </main>
  );
}
