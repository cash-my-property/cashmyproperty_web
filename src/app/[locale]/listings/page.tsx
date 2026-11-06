"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Bed, Bath, Square, ChevronDown, Loader2, Building, LayoutGrid, List } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import Dirham from "@/components/Dirham";
import HeroSearchWidget from "@/components/search/HeroSearchWidget";
import HeroBackground from "@/components/search/HeroBackground";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import PropertyListCard from "@/components/listings/PropertyListCard";
import connectPublicService, { PublicListingCard, PublicFilterCounts } from "@/services/connectPublicService";

export default function ListingsPage() {
  const { dict, locale } = useDictionary();
  const searchParams = useSearchParams();

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [properties, setProperties] = useState<PublicListingCard[]>([]);
  const [filterCounts, setFilterCounts] = useState<PublicFilterCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const latestRequestRef = useRef(0);

  const fetchProperties = async (pageNum: number = 1, append: boolean = false) => {
    const requestId = append ? latestRequestRef.current : ++latestRequestRef.current;
    try {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }

      const paramLocation = searchParams?.get('location') || searchParams?.get('propertyLocation');
      const paramSearch = searchParams?.get('search');
      const paramPurpose = searchParams?.get('purpose') || searchParams?.get('listingPurpose');
      const paramSortBy = searchParams?.get('sort') || searchParams?.get('sortBy');
      const paramCategory = searchParams?.get('category') || searchParams?.get('propertyCategory');
      const paramType = searchParams?.get('type') || searchParams?.get('propertyType');
      const paramPlan = searchParams?.get('plan') || searchParams?.get('propertyPlan');
      const paramMinPrice = searchParams?.get('priceMin') || searchParams?.get('minPrice');
      const paramMaxPrice = searchParams?.get('priceMax') || searchParams?.get('maxPrice');
      const paramMinArea = searchParams?.get('areaMin') || searchParams?.get('minArea');
      const paramMaxArea = searchParams?.get('areaMax') || searchParams?.get('maxArea');
      const paramFurnishing = searchParams?.get('furnishing');
      const paramRentalPeriod = searchParams?.get('rentalPeriod');
      const paramBeds = searchParams?.get('beds');
      const paramBaths = searchParams?.get('baths');
      const paramAmenities = searchParams?.get('amenities');
      const paramAgencyId = searchParams?.get('agencyId');
      const paramDeveloperId = searchParams?.get('developerId');
      const paramAgentId = searchParams?.get('agentId');

      const apiParams: Record<string, any> = {
        page: pageNum,
        limit: 12,
      };

      if (paramLocation) apiParams.location = paramLocation;
      if (paramSearch) apiParams.search = paramSearch;

      if (paramPurpose) {
        const u = paramPurpose.toUpperCase();
        apiParams.purpose = u === 'BUY' ? 'SALE' : u;
      }
      if (paramCategory) apiParams.category = paramCategory.toUpperCase();
      if (paramPlan) apiParams.plan = paramPlan.toUpperCase();
      if (paramFurnishing) apiParams.furnishing = paramFurnishing.toUpperCase();
      if (paramRentalPeriod) apiParams.rentalPeriod = paramRentalPeriod.toUpperCase();
      if (paramBeds) apiParams.beds = paramBeds;
      if (paramBaths) apiParams.baths = paramBaths;
      if (paramMinPrice) apiParams.priceMin = paramMinPrice;
      if (paramMaxPrice) apiParams.priceMax = paramMaxPrice;
      if (paramMinArea) apiParams.areaMin = paramMinArea;
      if (paramMaxArea) apiParams.areaMax = paramMaxArea;
      if (paramAmenities) apiParams.amenities = paramAmenities;
      if (paramAgencyId) apiParams.agencyId = paramAgencyId;
      if (paramDeveloperId) apiParams.developerId = paramDeveloperId;
      if (paramAgentId) apiParams.agentId = paramAgentId;

      // Quick filter pill override
      if (activeType && activeType !== 'All') {
        if (activeType === 'Commercial') {
          apiParams.category = 'COMMERCIAL';
        } else if (activeType === 'Office' || activeType === 'Office Space') {
          apiParams.category = 'COMMERCIAL';
          apiParams.type = 'OFFICES';
        } else if (activeType === 'Retail') {
          apiParams.category = 'COMMERCIAL';
          apiParams.type = 'RETAIL';
        } else if (activeType === 'Warehouse') {
          apiParams.category = 'COMMERCIAL';
          apiParams.type = 'WAREHOUSE';
        } else if (activeType === 'Building') {
          apiParams.category = 'COMMERCIAL';
          apiParams.type = 'BUILDING';
        } else if (activeType === 'Land') {
          apiParams.category = 'RESIDENTIAL';
          apiParams.type = 'LAND';
        } else {
          apiParams.type = activeType.toUpperCase().replace(/\s+/g, '_');
        }
      } else if (paramType) {
        apiParams.type = paramType.toUpperCase();
      }

      if (selectedType && selectedType !== 'all') {
        if (selectedType === 'land') {
          apiParams.type = 'LAND';
        } else {
          apiParams.category = selectedType.toUpperCase();
        }
      }

      if (priceSort) {
        apiParams.sort = priceSort === 'asc' ? 'price_asc' : 'price_desc';
      } else if (paramSortBy) {
        if (paramSortBy === 'priceLow') apiParams.sort = 'price_asc';
        else if (paramSortBy === 'priceHigh') apiParams.sort = 'price_desc';
        else apiParams.sort = paramSortBy;
      } else {
        apiParams.sort = 'newest';
      }

      // Fetch both listings and filter counts in parallel on first page
      const [listingsRes, countsRes] = await Promise.all([
        connectPublicService.getListings(apiParams),
        pageNum === 1 ? connectPublicService.getFilterCounts(apiParams).catch(() => null) : Promise.resolve(null),
      ]);

      if (requestId !== latestRequestRef.current) return;

      const newItems = listingsRes.data || [];
      const pagination = listingsRes.pagination || { total: newItems.length, page: pageNum, pages: 1 };

      setTotalPages(pagination.pages || 1);
      setTotalCount(pagination.total || 0);
      setPage(pageNum);
      setHasMore(pageNum < (pagination.pages || 1));

      if (countsRes) {
        setFilterCounts(countsRes);
      }

      if (append) {
        setProperties(prev => [
          ...prev,
          ...newItems.filter(item => !prev.some(p => (p.ref || p.id) === (item.ref || item.id)))
        ]);
      } else {
        setProperties(newItems);
      }
    } catch (err) {
      console.error("Error fetching public listings", err);
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
  }, [authLoading, activeType, selectedType, priceSort, searchParams?.toString()]);

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
        <HeroBackground />

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
          <span className="text-[#5CD284] font-bold tracking-widest text-[12px] sm:text-[13px] uppercase mb-3 bg-[#5CD284]/15 px-4 py-1.5 rounded-full border border-[#5CD284]/30 backdrop-blur-md">
            Direct &amp; Verified Real Estate
          </span>
          <h1 
            className="text-white text-3xl sm:text-5xl lg:text-[54px] font-bold mb-4 leading-tight tracking-tight drop-shadow-md"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {(dict.listings as any)?.heroTitle || dict.listings?.hero?.title || "UAE Property Marketplace"}
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed drop-shadow">
            {(dict.listings as any)?.heroSubtitle || dict.listings?.hero?.description || "Browse authentic residential & commercial properties directly listed by licensed agents across the UAE."}
          </p>

          <HeroSearchWidget />
        </div>
      </section>

      {/* FILTER & LISTINGS SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Results Header: Count & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-[#1A3626]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {totalCount > 0 ? `${totalCount.toLocaleString()} Properties Found` : "All Listings"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {filterCounts?.total !== undefined ? `${filterCounts.total} matching current filters` : "Showing live verified properties"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Price Sort */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#102418] rounded-xl p-1 border border-gray-200 dark:border-[#1A3626] text-xs">
              <span className="text-gray-400 px-2 font-medium">Price:</span>
              <button
                type="button"
                onClick={() => setPriceSort(priceSort === "asc" ? null : "asc")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  priceSort === "asc"
                    ? "bg-[#5CD284] text-[#0A1C12]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                Low to High
              </button>
              <button
                type="button"
                onClick={() => setPriceSort(priceSort === "desc" ? null : "desc")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  priceSort === "desc"
                    ? "bg-[#5CD284] text-[#0A1C12]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                High to Low
              </button>
            </div>

            {/* View Mode */}
            <div className="hidden sm:flex items-center bg-white dark:bg-[#102418] p-1 rounded-xl border border-gray-200 dark:border-[#1A3626]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { label: "All Properties", value: "All" },
            { label: "Apartment", value: "Apartment" },
            { label: "Villa", value: "Villa" },
            { label: "Townhouse", value: "Townhouse" },
            { label: "Penthouse", value: "Penthouse" },
            { label: "Commercial", value: "Commercial" },
            { label: "Office Space", value: "Office Space" },
            { label: "Retail", value: "Retail" },
            { label: "Warehouse", value: "Warehouse" },
            { label: "Land", value: "Land" },
          ].map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setActiveType(value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeType === value
                  ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12] shadow-sm"
                  : "bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] border border-gray-200 dark:border-[#1A3626]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Listings Container */}
        {isLoading ? (
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
        ) : properties.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
            <Building className="w-12 h-12 text-gray-300 dark:text-[#1A3626] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              We couldn&apos;t find any properties matching your current search criteria. Try adjusting your filters.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((item, idx) => (
              <PropertyGridCard
                key={item.ref || item.id || idx}
                item={item}
                locale={locale}
                priority={idx < 3}
                href={`/${locale}/listings/${item.ref || item.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
            {properties.map((item, idx) => (
              <PropertyListCard
                key={item.ref || item.id || idx}
                item={item}
                locale={locale}
                priority={idx < 3}
                href={`/${locale}/listings/${item.ref || item.id}`}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex flex-col items-center justify-center my-12 gap-3">
            <button
              onClick={loadNextPage}
              disabled={isFetchingMore}
              className="px-8 py-3.5 rounded-2xl bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading More Listings...</span>
                </>
              ) : (
                <>
                  <span>Load More Listings</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Showing page {page} of {totalPages}
            </span>
          </div>
        )}
      </section>

    </main>
  );
}
