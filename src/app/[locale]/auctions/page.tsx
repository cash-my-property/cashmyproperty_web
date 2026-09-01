"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  Bed, 
  Bath, 
  Square, 
  ChevronDown, 
  ArrowRight, 
  Building, 
  Share2, 
  Maximize, 
  Home, 
  Key, 
  Loader2 
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import Dirham from "@/components/Dirham";

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
  const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';

  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

  // Fetch Auctions with Pagination support
  const fetchAuctions = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }

      if (isAuthenticated && isSeller) {
        setLiveAuctions([]);
        setUpcomingAuctions([]);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';

      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '10');

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

      const liveRaw = liveRes.data.data;
      const upcomingRaw = upcomingRes.data.data;
      const paginationObj = liveRes.data.pagination || liveRes.data.data?.pagination || (typeof liveRaw === 'object' && !Array.isArray(liveRaw) ? liveRaw : null);

      const newLiveItems = Array.isArray(liveRaw) ? liveRaw : (liveRaw?.data || []);
      const newUpcomingItems = Array.isArray(upcomingRaw) ? upcomingRaw : (upcomingRaw?.data || []);

      const calculatedTotalPages = paginationObj?.totalPages 
        ? Number(paginationObj.totalPages) 
        : paginationObj?.total 
        ? Math.ceil(Number(paginationObj.total) / 10) 
        : typeof liveRaw === 'object' && !Array.isArray(liveRaw) && liveRaw?.totalPages 
        ? Number(liveRaw.totalPages) 
        : 1;

      setTotalPages(calculatedTotalPages);
      setPage(pageNum);
      setHasMore(pageNum < calculatedTotalPages);

      if (append) {
        setLiveAuctions(prev => [
          ...prev, 
          ...newLiveItems.filter((item: any) => !prev.some(p => p._id === item._id))
        ]);
        setUpcomingAuctions(prev => [
          ...prev, 
          ...newUpcomingItems.filter((item: any) => !prev.some(p => p._id === item._id))
        ]);
      } else {
        setLiveAuctions(newLiveItems);
        setUpcomingAuctions(newUpcomingItems);
      }
    } catch (err) {
      console.error("Error fetching live bids:", err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    setPage(1);
    fetchAuctions(1, false);
  }, [authLoading, isAuthenticated, buyerType, isSeller, appliedSearch, activeType, selectedType, priceSort]);

  const loadNextPage = () => {
    if (isFetchingMore || isLoading || !hasMore) return;
    fetchAuctions(page + 1, true);
  };

  // Scroll listener for Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingMore || isLoading || !hasMore) return;
      const scrollHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;
      if (currentScroll >= scrollHeight - 600) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, isFetchingMore, isLoading]);

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">

      {/* HERO BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-6 lg:px-12 flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: 'url("/hero-bg.svg")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/90 via-[#0a1a13]/85 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#c9a14b]/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center mt-8">
          <div className="flex items-center gap-2 mb-6">
          </div>
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

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
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {Object.entries(dict.home.hero.filters.types).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedType === key ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#c9a14b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                        onClick={() => {
                          setSelectedType(selectedType === key ? null : key);
                          setActiveDropdown(null);
                        }}
                      >
                        {value as string}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative w-[160px] shrink-0">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#1A3626] transition-colors border border-gray-100 dark:border-[#1A3626] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors shrink-0" />
                    <span className="text-[13.5px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                      {selectedStatus === "All" ? "All Status" : selectedStatus}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all shrink-0 ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                </div>
                
                {activeDropdown === 'status' && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {["All", "LIVE", "UPCOMING"].map((status) => (
                      <div 
                        key={status} 
                        className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedStatus === status ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#c9a14b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                        onClick={() => {
                          setSelectedStatus(status);
                          setActiveDropdown(null);
                        }}
                      >
                        {status === "All" ? "All Status" : status}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sorting Pills */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#102418] p-1 rounded-xl border border-gray-100 dark:border-[#1A3626] shrink-0">
                <button 
                  onClick={() => setPriceSort(priceSort === 'asc' ? null : 'asc')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${priceSort === 'asc' ? 'bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Price: Low to High
                </button>
                <button 
                  onClick={() => setPriceSort(priceSort === 'desc' ? null : 'desc')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${priceSort === 'desc' ? 'bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Price: High to Low
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SELLER RESTRICTION BANNER */}
      {isAuthenticated && isSeller && (
        <section className="w-full max-w-7xl mx-auto px-6 py-12">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 text-center flex flex-col items-center max-w-lg mx-auto">
            <Building className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seller Mode Active</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              You are currently logged in as a Seller. Buyer listings and real-time offer bidding are reserved exclusively for buyers.
            </p>
            <Link
              href={`/${locale}/dashboard/seller/properties`}
              className="px-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold rounded-xl text-sm"
            >
              Go to My Listings
            </Link>
          </div>
        </section>
      )}

      {/* REALTIME OFFERS GRID */}
      {(!isAuthenticated || !isSeller) && (
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5CD284] animate-pulse"></span>
              <span className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-[0.2em] text-[12px] uppercase">
                Active & Upcoming Live Offers
              </span>
            </div>
            <h2 className="text-gray-900 dark:text-white text-[32px] sm:text-[40px] font-bold leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Realtime Offers
            </h2>
          </div>

          {/* Property Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {["All", "Apartment", "Villa", "Commercial"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeType === type
                    ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md scale-105"
                    : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] border border-gray-100 dark:border-[#1A3626]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-[#102418] rounded-[24px] p-2 border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col gap-4">
                <div className="h-[240px] bg-gray-200 dark:bg-[#163321] rounded-[20px] w-full" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2" />
                  <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded-xl w-full mt-2" />
                </div>
              </div>
            ))
          ) : liveAuctions.length === 0 && upcomingAuctions.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
              <Building className="w-12 h-12 text-gray-300 dark:text-[#1A3626] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Realtime Offers Available</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                No active or upcoming live offers match your selected criteria. Try adjusting your search filters.
              </p>
            </div>
          ) : (
            (() => {
              const allItems = [...liveAuctions, ...upcomingAuctions];
              const filteredItems = selectedStatus === "All" 
                ? allItems 
                : allItems.filter((i: any) => (i.status || 'LIVE') === selectedStatus);

              return filteredItems.map((item: any) => {
                const details = item.propertyDetails || {};
                const title = details.propertyTitle || "Untitled Property";
                const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai, UAE");
                const image = details.propertyImages?.[0]?.url || "/property-placeholder.svg";
                const beds = details.propertyBedrooms || 0;
                const baths = details.propertyWashrooms || details.propertyBathrooms || 0;
                
                const getAreaVal = (a: any) => typeof a === 'object' ? a.value : (a || 0);
                const area = `${getAreaVal(details.propertyArea)} sqft`;
                
                const type = details.propertyType || "APARTMENT";
                const highestBid = item.currentHighestBid || (typeof item.currentHighestOffer === 'object' ? item.currentHighestOffer?.amount : item.currentHighestOffer);
                const fallbackPrice = details.propertyPrice?.amount || details.propertyPrice || 0;

                const now = new Date().getTime();
                const endDate = new Date(item.endTime || Date.now() + 86400000 * 7);
                const startDate = new Date(item.startTime || Date.now());

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
                <Link href={`/${locale}/auctions/${item._id}`} key={item._id} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group block cursor-pointer">
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
              );
              })
            })()
          )}
        </div>

        {/* PAGINATION / INFINITE SCROLL LOADER */}
        {hasMore && (
          <div className="flex flex-col items-center justify-center my-12 gap-3">
            <button
              onClick={loadNextPage}
              disabled={isFetchingMore}
              className="px-8 py-3.5 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading More Offers...</span>
                </>
              ) : (
                <>
                  <span>Load More Offers</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 font-medium">Showing page {page} of {totalPages}</span>
          </div>
        )}
      </section>
      )}

    </main>
  );
}
