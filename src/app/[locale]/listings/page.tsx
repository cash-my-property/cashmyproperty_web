"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Bed, Bath, Square, ChevronDown, Loader2, Building, LayoutGrid, List } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Dirham from "@/components/Dirham";
import HeroSearchWidget from "@/components/search/HeroSearchWidget";
import PropertyCardImageCarousel from "@/components/listings/PropertyCardImageCarousel";
import PropertySellerCardStrip from "@/components/listings/PropertySellerCardStrip";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import PropertyListCard from "@/components/listings/PropertyListCard";
import { extractPropertyImages } from "@/utils/imageUrl";

export default function ListingsPage() {
  const { dict, locale } = useDictionary();
  const searchParams = useSearchParams();
  const content = dict.home;

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller, fetchProfile } = useAuth();
  const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';

  useEffect(() => {
    if (isAuthenticated && isBuyer && buyerType !== 'SIMPLE') {
      api.put('/switch/toggleRole', { type: 'SIMPLE' })
        .then(() => {
          if (fetchProfile) fetchProfile();
        })
        .catch((err) => console.error("Auto switch in listings page failed", err));
    }
  }, [isAuthenticated, isBuyer, buyerType]);

  // Only the latest non-append request may update the list (filters can change faster than the API answers)
  const latestRequestRef = useRef(0);

  const fetchProperties = async (pageNum: number = 1, append: boolean = false) => {
    const requestId = append ? latestRequestRef.current : ++latestRequestRef.current;
    try {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }

      // Sellers are fully blocked from viewing buyer-facing simple listings
      if (isAuthenticated && isSeller) {
        setProperties([]);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';

      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '10');

      // Add URL params if present
      // Everything comes from the URL, so removing a search / location from it also removes it from the results
      const paramLocation = searchParams.get('location') || searchParams.get('propertyLocation');
      const paramSearch = searchParams.get('search');
      const paramPurpose = searchParams.get('listingPurpose') || searchParams.get('purpose');
      const paramSortBy = searchParams.get('sortBy') || searchParams.get('sort');
      const paramCategory = searchParams.get('propertyCategory') || searchParams.get('category');
      const paramType = searchParams.get('propertyType');
      const paramMinPrice = searchParams.get('minPrice');
      const paramMaxPrice = searchParams.get('maxPrice');
      const paramPlan = searchParams.get('propertyPlan');

      if (paramLocation) queryParams.append('location', paramLocation);
      if (paramSearch) queryParams.append('search', paramSearch);
      if (paramPurpose) {
        const upperPurpose = paramPurpose.toUpperCase();
        queryParams.append('listingPurpose', upperPurpose === 'BUY' ? 'SALE' : upperPurpose);
      }
      if (paramCategory) queryParams.append('propertyCategory', paramCategory);
      if (paramPlan) queryParams.append('propertyPlan', paramPlan);
      if (paramMinPrice) queryParams.append('minPrice', paramMinPrice);
      if (paramMaxPrice) queryParams.append('maxPrice', paramMaxPrice);

      // Filters from the search widget that the list endpoints understand as-is (comma separated for multi values)
      ['beds', 'baths', 'minArea', 'maxArea', 'amenities', 'furnishing', 'rentalPeriod'].forEach((key) => {
        const value = searchParams.get(key);
        if (value) queryParams.append(key, value);
      });

      // The quick pills below the hero win over the widget's category / property type (set, not append, to avoid duplicates)
      if (activeType && activeType !== 'All') {
        if (activeType === 'Commercial') {
          queryParams.set('propertyCategory', 'COMMERCIAL');
          queryParams.delete('propertyType');
        } else if (activeType === 'Office' || activeType === 'Office Space') {
          queryParams.set('propertyCategory', 'COMMERCIAL');
          queryParams.set('propertyType', 'OFFICES');
        } else if (activeType === 'Retail') {
          queryParams.set('propertyCategory', 'COMMERCIAL');
          queryParams.set('propertyType', 'RETAIL');
        } else if (activeType === 'Warehouse') {
          queryParams.set('propertyCategory', 'COMMERCIAL');
          queryParams.set('propertyType', 'WAREHOUSE');
        } else if (activeType === 'Building') {
          queryParams.set('propertyCategory', 'COMMERCIAL');
          queryParams.set('propertyType', 'BUILDING');
        } else if (activeType === 'Land') {
          queryParams.set('propertyCategory', 'RESIDENTIAL');
          queryParams.set('propertyType', 'LAND');
        } else {
          queryParams.set('propertyType', activeType.toUpperCase().replace(/\s+/g, '_'));
        }
      } else if (paramType) {
        queryParams.set('propertyType', paramType.toUpperCase());
      }

      if (selectedType && selectedType !== 'all') {
        if (selectedType === 'land') {
          queryParams.set('propertyType', 'LAND');
        } else {
          queryParams.set('propertyCategory', selectedType.toUpperCase());
        }
      }
      if (priceSort) {
        queryParams.append('sortBy', priceSort === 'asc' ? 'priceLow' : 'priceHigh');
      } else if (paramSortBy) {
        queryParams.append('sortBy', paramSortBy);
      }

      const queryString = queryParams.toString();

      let res;
      if (isAuthenticated && isBuyer) {
        try {
          res = await api.get(`/buyer/simpleLiveListings?${queryString}`);
        } catch (buyerErr: any) {
          if (buyerErr?.response?.status === 401 || buyerErr?.response?.status === 403) {
            res = await axios.get(`${API_URL}/public/simple-live-properties?${queryString}`);
          } else {
            throw buyerErr;
          }
        }
      } else {
        res = await axios.get(`${API_URL}/public/simple-live-properties?${queryString}`);
      }

      if (requestId !== latestRequestRef.current) return;

      const rawData = res.data.data;
      const paginationObj = res.data.pagination || res.data.data?.pagination || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : null);

      const newItems = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      
      const calculatedTotalPages = paginationObj?.totalPages 
        ? Number(paginationObj.totalPages) 
        : paginationObj?.total 
        ? Math.ceil(Number(paginationObj.total) / 10) 
        : typeof rawData === 'object' && !Array.isArray(rawData) && rawData?.totalPages 
        ? Number(rawData.totalPages) 
        : 1;

      setTotalPages(calculatedTotalPages);
      setPage(pageNum);
      setHasMore(pageNum < calculatedTotalPages);

      if (append) {
        setProperties(prev => [
          ...prev,
          ...newItems.filter((item: any) => !prev.some(p => (p._id || p.id) === (item._id || item.id)))
        ]);
      } else {
        setProperties(newItems);
      }
    } catch (err) {
      console.error("Error fetching properties", err);
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;
    setPage(1);
    fetchProperties(1, false);
  }, [authLoading, isAuthenticated, buyerType, isSeller, activeType, selectedType, priceSort, searchParams?.toString()]);

  const loadNextPage = () => {
    if (isFetchingMore || isLoading || !hasMore) return;
    fetchProperties(page + 1, true);
  };

  // Scroll Listener for Infinite Scroll
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
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden">
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
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

          {/* Upgraded Hero Search Bar Widget */}
          <HeroSearchWidget 
            initialTab={(searchParams?.get("tab") as any) || (searchParams?.get("listingPurpose") === "RENT" ? "RENT" : "BUY")}
            showTabs={true}
          />
        </div>
      </section>

      {/* SELLER RESTRICTION BANNER */}
      {isAuthenticated && isSeller && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 text-center flex flex-col items-center max-w-lg mx-auto">
            <Building className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seller Mode Active</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              You are currently logged in as a Seller. Buyer simple listings are reserved exclusively for buyers.
            </p>
            <Link
              href={`/${locale}/dashboard/seller/simple-listings`}
              className="px-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold rounded-xl text-sm"
            >
              Go to My Simple Listings
            </Link>
          </div>
        </section>
      )}

      {/* SIMPLE LISTINGS GRID */}
      {(!isAuthenticated || !isSeller) && (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Header Block */}
        <div className="mb-8">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Listings
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore direct properties for rent or purchase with verified details and direct agent contact.
          </p>
        </div>

        {/* Filter & View Controls Bar */}
        <div className="flex items-center justify-between mb-10 gap-4">
          {/* Property Category Pills (Left Side) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
            {["All", "Apartment", "Villa", "Townhouse", "Penthouse", "Land", "Commercial", "Office", "Retail", "Warehouse"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeType === type
                    ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md scale-105"
                    : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] border border-gray-100 dark:border-[#1A3626]"
                }`}
              >
                {type}
              </button>
            ))}
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
          const filteredProperties = properties;

          if (filteredProperties.length === 0) {
            return (
              <div className="text-center py-12 text-gray-500">
                No properties match the selected filters.
              </div>
            );
          }

          if (viewMode === "grid") {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((item, idx) => (
                  <PropertyGridCard
                    key={item._id || item.id || idx}
                    item={item}
                    locale={locale}
                    priority={idx < 3}
                  />
                ))}
              </div>
            );
          }

          return (
            <>
              {/* Mobile View (< md): Always renders default Grid style */}
              <div className="grid grid-cols-1 gap-8 md:hidden">
                {filteredProperties.map((item, idx) => (
                  <PropertyGridCard
                    key={`mob-${item._id || item.id || idx}`}
                    item={item}
                    locale={locale}
                    priority={idx < 3}
                  />
                ))}
              </div>

              {/* Laptop/Desktop View (md+): Renders List style */}
              <div className="hidden md:flex flex-col gap-5 max-w-4xl mx-auto w-full">
                {filteredProperties.map((item, idx) => (
                  <PropertyListCard
                    key={`desk-${item._id || item.id || idx}`}
                    item={item}
                    locale={locale}
                    priority={idx < 3}
                  />
                ))}
              </div>
            </>
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
                  <span>Loading More Properties...</span>
                </>
              ) : (
                <>
                  <span>Load More Properties</span>
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
