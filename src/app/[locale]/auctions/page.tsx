"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  MapPin, 
  Clock, 
  Bed, 
  Bath, 
  Square, 
  ChevronDown, 
  Share2, 
  Loader2,
  Building,
  Maximize,
  LayoutGrid,
  List
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import Dirham from "@/components/Dirham";
import HeroSearchWidget from "@/components/search/HeroSearchWidget";
import PropertyCardImageCarousel from "@/components/listings/PropertyCardImageCarousel";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import PropertyListCard from "@/components/listings/PropertyListCard";
import { extractPropertyImages } from "@/utils/imageUrl";

export default function AuctionsListingPage() {
  const { dict, locale } = useDictionary();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller, fetchProfile } = useAuth();
  const content = dict.home;

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const buyerType = (user as any)?.sellerType?.toUpperCase() || (typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR');

  useEffect(() => {
    if (isAuthenticated && (!isBuyer || buyerType !== 'REGULAR')) {
      api.put('/switch/toggleRole', { main: 'BUYER', type: 'REGULAR' })
        .then(() => {
          if (fetchProfile) fetchProfile();
        })
        .catch((err) => console.error("Auto switch in auctions page failed", err));
    }
  }, [isAuthenticated, isBuyer, buyerType]);

  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { socket, addToast } = useSocket();

  // Read URL search params on mount or param change
  useEffect(() => {
    const urlLocation = searchParams.get("location");
    const urlSearch = searchParams.get("search");
    const urlType = searchParams.get("propertyType");
    if (urlLocation) setAppliedLocation(urlLocation);
    if (urlSearch) setAppliedSearch(urlSearch);
    if (urlType) {
      const formatted = urlType.charAt(0).toUpperCase() + urlType.slice(1).toLowerCase();
      setActiveType(formatted);
    } else if (urlType === null && activeType !== "All") {
      setActiveType("All");
    }
  }, [searchParams]);

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

      // Add URL params if present
      const paramLocation = searchParams.get('location') || appliedLocation;
      const paramSearch = searchParams.get('search') || appliedSearch;
      const paramCategory = searchParams.get('category') || searchParams.get('propertyCategory');
      const paramType = searchParams.get('propertyType');
      const paramMinPrice = searchParams.get('minPrice');
      const paramMaxPrice = searchParams.get('maxPrice');
      const paramPlan = searchParams.get('propertyPlan');

      if (paramLocation) queryParams.append('location', paramLocation);
      if (paramSearch) queryParams.append('search', paramSearch);
      if (paramCategory) queryParams.append('category', paramCategory);
      if (paramPlan) queryParams.append('propertyPlan', paramPlan);
      if (paramMinPrice) queryParams.append('minPrice', paramMinPrice);
      if (paramMaxPrice) queryParams.append('maxPrice', paramMaxPrice);

      if (activeType && activeType !== 'All') {
        if (activeType === 'Commercial') {
          queryParams.set('category', 'COMMERCIAL');
          queryParams.delete('propertyType');
        } else if (activeType === 'Office' || activeType === 'Office Space') {
          queryParams.set('category', 'COMMERCIAL');
          queryParams.set('propertyType', 'OFFICES');
        } else if (activeType === 'Retail') {
          queryParams.set('category', 'COMMERCIAL');
          queryParams.set('propertyType', 'RETAIL');
        } else if (activeType === 'Warehouse') {
          queryParams.set('category', 'COMMERCIAL');
          queryParams.set('propertyType', 'WAREHOUSE');
        } else if (activeType === 'Building') {
          queryParams.set('category', 'COMMERCIAL');
          queryParams.set('propertyType', 'BUILDING');
        } else if (activeType === 'Land') {
          queryParams.set('category', 'RESIDENTIAL');
          queryParams.set('propertyType', 'LAND');
        } else {
          queryParams.set('propertyType', activeType.toUpperCase().replace(/\s+/g, '_'));
        }
      } else if (paramType) {
        queryParams.set('propertyType', paramType.toUpperCase());
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
      if (isAuthenticated && isBuyer) {
        try {
          [liveRes, upcomingRes] = await Promise.all([
            api.get(`/buyer/live-listings?${queryString}`),
            api.get(`/buyer/upcoming-listings?${queryString}`)
          ]);
        } catch (buyerErr: any) {
          if (buyerErr?.response?.status === 401 || buyerErr?.response?.status === 403) {
            [liveRes, upcomingRes] = await Promise.all([
              axios.get(`${API_URL}/public/live-properties?${queryString}`),
              axios.get(`${API_URL}/public/upcoming-properties?${queryString}`)
            ]);
          } else {
            throw buyerErr;
          }
        }
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
        
        <div className="relative z-10 text-center w-full max-w-5xl mx-auto flex flex-col items-center mt-8">
          <div className="flex items-center gap-2 mb-6">
          </div>
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

          {/* Upgraded Hero Search Bar Widget */}
          <HeroSearchWidget 
            initialTab="BUY"
            showTabs={false}
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
      </section>

      {/* SELLER RESTRICTION BANNER */}
      {isAuthenticated && isSeller && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 text-center flex flex-col items-center max-w-lg mx-auto">
            <Building className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {dict.sellerModeBanner?.title || "Seller Mode Active"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              {dict.sellerModeBanner?.description || "You are currently logged in as a Seller. Buyer listings and real-time offer bidding are reserved exclusively for buyers."}
            </p>
            <Link
              href={`/${locale}/dashboard/seller/properties`}
              className="px-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold rounded-xl text-sm"
            >
              {dict.sellerModeBanner?.buttonText || "Go to My Listings"}
            </Link>
          </div>
        </section>
      )}

      {/* REALTIME OFFERS GRID */}
      {(!isAuthenticated || !isSeller) && (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Header Block */}
        <div className="mb-8">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {dict.auctions?.pageTitle || "Realtime Offers"}
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
            {dict.auctions?.pageSubtitle || "Explore live competitive offers with transparent real-time updates and verified sellers."}
          </p>
        </div>

        {/* Filter & View Controls Bar */}
        <div className="flex items-center justify-between mb-10 gap-4">
          {/* Property Category Pills (Left Side) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
            {[
              { key: "all", value: "All" },
              { key: "apartment", value: "Apartment" },
              { key: "villa", value: "Villa" },
              { key: "townhouse", value: "Townhouse" },
              { key: "penthouse", value: "Penthouse" },
              { key: "land", value: "Land" },
              { key: "commercial", value: "Commercial" },
              { key: "office", value: "Office" },
              { key: "retail", value: "Retail" },
              { key: "warehouse", value: "Warehouse" },
            ].map(({ key, value }) => {
              const label = dict.categories?.[key as keyof typeof dict.categories] || value;
              return (
                <button
                  key={key}
                  onClick={() => setActiveType(value)}
                  className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeType === value
                      ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md scale-105"
                      : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] border border-gray-100 dark:border-[#1A3626]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Grid / List (Right Side) */}
          <div className="hidden sm:flex items-center bg-white dark:bg-[#102418] p-1 rounded-full border border-gray-100 dark:border-[#1A3626] shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listings Grid / List Container */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#102418] rounded-2xl p-1.5 border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col gap-4"
                >
                  <div className="bg-gray-200 dark:bg-[#163321] rounded-xl h-[240px] w-full" />
                  <div className="p-4 flex flex-col gap-3 flex-1 justify-center">
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile Skeleton: Always Grid style */}
              <div className="grid grid-cols-1 gap-8 md:hidden">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`mob-skel-${idx}`}
                    className="bg-white dark:bg-[#102418] rounded-2xl p-1.5 border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col gap-4"
                  >
                    <div className="bg-gray-200 dark:bg-[#163321] rounded-xl h-[240px] w-full" />
                    <div className="p-4 flex flex-col gap-3 flex-1 justify-center">
                      <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Skeleton: List style */}
              <div className="hidden md:flex flex-col gap-5 max-w-4xl mx-auto w-full">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`desk-skel-${idx}`}
                    className="bg-white dark:bg-[#102418] rounded-2xl p-1.5 border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col md:flex-row gap-4 min-h-[200px]"
                  >
                    <div className="bg-gray-200 dark:bg-[#163321] rounded-xl w-full md:w-[280px] h-[200px] md:h-auto" />
                    <div className="p-4 flex flex-col gap-3 flex-1 justify-center">
                      <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (() => {
          const allItems = [...liveAuctions, ...upcomingAuctions];
          const filteredItems = selectedStatus === "All" 
            ? allItems 
            : allItems.filter((i: any) => (i.status || 'LIVE') === selectedStatus);

          if (filteredItems.length === 0) {
            return (
              <div className="col-span-full py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
                <Building className="w-12 h-12 text-gray-300 dark:text-[#1A3626] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {dict.auctions?.emptyTitle || "No Realtime Offers Available"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  {dict.auctions?.emptyDesc || "No active or upcoming realtime offers match your selected criteria. Try adjusting your search filters."}
                </p>
              </div>
            );
          }

          return viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item: any, idx: number) => (
                <PropertyGridCard
                  key={item._id || idx}
                  item={item}
                  locale={locale}
                  priority={idx === 0}
                  isAuction={true}
                  href={`/${locale}/auctions/${item._id}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
              {filteredItems.map((item: any, idx: number) => (
                <PropertyListCard
                  key={item._id || idx}
                  item={item}
                  locale={locale}
                  priority={idx === 0}
                  isAuction={true}
                  href={`/${locale}/auctions/${item._id}`}
                />
              ))}
            </div>
          );
        })()}

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
                  <span>{dict.auctions?.loadingMore || "Loading More Offers..."}</span>
                </>
              ) : (
                <>
                  <span>{dict.auctions?.loadMore || "Load More Offers"}</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {(dict.auctions?.showingPage || "Showing page {page} of {totalPages}")
                .replace("{page}", page.toString())
                .replace("{totalPages}", totalPages.toString())}
            </span>
          </div>
        )}
      </section>
      )}

    </main>
  );
}
