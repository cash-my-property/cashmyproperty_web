"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Clock, Filter, Bed, Bath, Square, ChevronDown, ArrowRight, Building, Share2, Maximize, Home, Key } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";

export default function AuctionsListingPage() {
  const { dict, locale } = useDictionary();
  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller } = useAuth();
  const content = dict.home;
  const realtimeOffers = dict.home.realtimebids.items;

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);

  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, addToast } = useSocket();

  // Listen to socket events for real-time price and auction updates
  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (data: any) => {
      console.log("📡 [Auctions Socket] Received listing_price_update:", data);
      const { auctionId, newPrice, newEndTime, bidCounter } = data;

      setLiveAuctions(prev => prev.map(p => {
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
      console.log("📡 [Auctions Socket] Received new_auction_live:", fullCard);
      if (!fullCard || !fullCard._id) return;

      setLiveAuctions(prev => {
        if (prev.some(p => p._id === fullCard._id)) return prev;
        return [fullCard, ...prev];
      });
    };

    const handleAuctionEnded = (data: any) => {
      console.log("📡 [Auctions Socket] Received auction_ended_global:", data);
      const { auctionId, status } = data;

      setLiveAuctions(prev => prev.map(p => {
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
    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        // Sellers are blocked from viewing buyer-facing auction listings
        if (isAuthenticated && isSeller) {
          setLiveAuctions([]);
          setUpcomingAuctions([]);
          return;
        }
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';

        const queryParams = new URLSearchParams();
        if (appliedSearch) {
          queryParams.append('search', appliedSearch);
        }
        if (activeType && activeType !== 'All') {
          queryParams.append('propertyType', activeType.toUpperCase());
        }
        if (selectedType && selectedType !== 'all') {
          if (selectedType === 'land') {
            queryParams.append('propertyType', 'LAND');
          } else {
            queryParams.append('category', selectedType.toUpperCase());
          }
        }
        if (priceSort) {
          queryParams.append('sortBy', priceSort === 'asc' ? 'priceLow' : 'priceHigh');
        }

        const queryString = queryParams.toString();

        let liveRes, upcomingRes;
        const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';
        if (isAuthenticated && isBuyer && buyerType === 'REGULAR') {
          [liveRes, upcomingRes] = await Promise.all([
            api.get(`/buyer/live-listings?${queryString}`),
            api.get(`/buyer/upcoming-listings?${queryString}`)
          ]);
        } else {
          [liveRes, upcomingRes] = await Promise.all([
            axios.get(`${API_URL}/public/live-properties?${queryString}`),
            axios.get(`${API_URL}/public/upcoming-properties?${queryString}`)
          ]);
        }
        const liveData = liveRes.data.data;
        const upcomingData = upcomingRes.data.data;
        setLiveAuctions(Array.isArray(liveData) ? liveData : (liveData?.data || []));
        setUpcomingAuctions(Array.isArray(upcomingData) ? upcomingData : (upcomingData?.data || []));
      } catch (err) {
        console.error("Error fetching live bids:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, [authLoading, isAuthenticated, user, isSeller, appliedSearch, activeType, selectedType, priceSort]);

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">

      {/* HERO BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-6 lg:px-12 flex flex-col items-center justify-center bg-[#1B3A2D] dark:bg-[#0A1612]">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#5CD284]/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center mt-8">
          {/* Tagline removed as not present in home hero */}
          <div className="flex items-center gap-2 mb-6">
            {/* placeholder for tagline */}
          </div>
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

          {/* Search Bar - Inline Filters */}
          {/* Search Bar & Filters Container */}
          <div className="w-full max-w-4xl flex flex-col gap-4">
            {/* Row 1: Search Input & Search Button */}
            <div className="w-full bg-white dark:bg-[#102418] p-2 rounded-2xl shadow-2xl flex flex-row gap-2 border border-gray-100 dark:border-[#1A3626] items-center">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#091711]/50 rounded-xl">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder={content.hero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchQuery); }}
                  className="w-full bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                />
              </div>
              
              <button 
                onClick={() => setAppliedSearch(searchQuery)}
                className="bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] px-8 py-3.5 rounded-xl font-bold text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Filter className="w-4 h-4 shrink-0" />
                {content.hero.searchButton}
              </button>
            </div>

            {/* Row 2: Filter Dropdowns Grouped Together */}
            <div className="flex flex-wrap items-center justify-center gap-3 bg-white/5 dark:bg-[#102418]/20 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              {/* Type Dropdown */}
              <div className="relative w-[160px] shrink-0">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#1A3626] transition-colors border border-gray-100 dark:border-[#1A3626] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors shrink-0" />
                    <span className="text-[13.5px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                      {selectedType ? (dict.home.hero.filters.types as Record<string, string>)[selectedType] : content.hero.filters.type}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all shrink-0 ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                </div>
                
                {activeDropdown === 'type' && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#091711] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {Object.entries(dict.home.hero.filters.types).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedType === key ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#c9a14b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                        onClick={() => { setSelectedType(key); setActiveDropdown(null); }}
                      >
                        {value as string}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative w-[140px] shrink-0">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#1A3626] transition-colors border border-gray-100 dark:border-[#1A3626] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors shrink-0" />
                    <span className="text-[13.5px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                      {selectedStatus === "All" ? "Status" : selectedStatus}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all shrink-0 ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                </div>
                
                {activeDropdown === 'status' && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#091711] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {["All", "Active", "Upcoming"].map((statusValue) => (
                      <div 
                        key={statusValue} 
                        className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedStatus === statusValue ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#c9a14b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                        onClick={() => { setSelectedStatus(statusValue); setActiveDropdown(null); }}
                      >
                        {statusValue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Sort Dropdown */}
              <div className="relative w-[160px] shrink-0">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#1A3626] transition-colors border border-gray-100 dark:border-[#1A3626] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors shrink-0" />
                    <span className="text-[13.5px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                      {priceSort === 'asc' ? "Low to High" : priceSort === 'desc' ? "High to Low" : "Sort Price"}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all shrink-0 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
                </div>
                
                {activeDropdown === 'price' && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#091711] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div 
                      className="px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50"
                      onClick={() => { setPriceSort(null); setActiveDropdown(null); }}
                    >
                      Default
                    </div>
                    <div 
                      className="px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50"
                      onClick={() => { setPriceSort("asc"); setActiveDropdown(null); }}
                    >
                      Price: Low to High
                    </div>
                    <div 
                      className="px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50"
                      onClick={() => { setPriceSort("desc"); setActiveDropdown(null); }}
                    >
                      Price: High to Low
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SELLER CTA PANEL — fully blocks sellers from accessing auction listings */}
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
              <h2 className="text-white text-[28px] sm:text-[36px] font-bold mb-4 leading-tight">
                Live offers are for buyers only.
              </h2>
              <p className="text-white/65 text-[15px] sm:text-[16px] leading-relaxed max-w-xl">
                As a seller, you cannot participate in or view live offers. Head to your dashboard to manage your own property listings and track incoming offers on them.
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

      {/* CATEGORY CHIPS — hidden for sellers */}
      {!(isAuthenticated && isSeller) && (
      <section className="border-b border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#091711]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex gap-3 overflow-x-auto global-green-scrollbar">
          {["All", "Villa", "Apartment", "Penthouse", "Townhouse", "Commercial"].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeType === type ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#091711] dark:text-gray-300 dark:hover:bg-[#163321]'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>
      )}

      {/* AUCTIONS GRID — hidden for sellers */}
      {!(isAuthenticated && isSeller) && (
      <section className="py-16 px-6 lg:px-12 w-full max-w-7xl mx-auto">
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
          ) : (
            (() => {
              const combinedAuctions = [...liveAuctions, ...upcomingAuctions]
                .filter(item => {
                  if (selectedStatus === "All") return true;
                  if (selectedStatus === "Upcoming" && item.status === "UPCOMING") return true;
                  if (selectedStatus === "Active" && item.status !== "UPCOMING") return true;
                  return false;
                });
              
              if (combinedAuctions.length === 0) {
                return <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">No properties match the selected filters.</div>;
              }
              
              return combinedAuctions.map((item: any) => {
              const details = item.propertyDetails || {};
              const title = details.propertyTitle || "Untitled Property";
              const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai");
              const image = details.propertyImages?.[0]?.url || "/property-placeholder.svg";
              const beds = details.propertyBedrooms || 0;
              const baths = details.propertyWashrooms || details.propertyBathrooms || 0;
              const type = details.propertyType || "Property";
              const highestBid = item.currentHighestBid || (typeof item.currentHighestOffer === 'object' ? item.currentHighestOffer?.amount : item.currentHighestOffer);
              const fallbackPrice = details.propertyPrice?.amount || details.propertyPrice || 0;
              const price = highestBid ? `Ð ${highestBid.toLocaleString()}` : `Ð ${fallbackPrice.toLocaleString()}`;
              
              const getArea = (area: any) => {
                if (!area) return "N/A";
                if (typeof area === 'object' && area.value !== undefined) return `${area.value} ${area.unit || 'sqft'}`;
                return `${area} sqft`;
              };
              const area = getArea(details.propertyArea || details.propertyBuiltUpArea);
              
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
                    <span className="font-bold text-[22px] text-gray-900 dark:text-[#c9a14b] leading-none whitespace-nowrap">Ð {priceValue}</span>
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
            );
            })
            })()
          )}
        </div>
      </section>
      )}

    </main>
  );
}
