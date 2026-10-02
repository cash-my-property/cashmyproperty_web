"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { Sparkles, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface RecommendedPropertiesProps {
  currentPropertyId: string;
  category?: string;
  propertyType?: string;
  location?: string | any;
  price?: number | string;
  isAuction?: boolean;
  locale: string;
}

export default function RecommendedProperties({
  currentPropertyId,
  category,
  propertyType,
  location,
  price,
  isAuction = false,
  locale,
}: RecommendedPropertiesProps) {
  const { dict } = useDictionary();
  const { isAuthenticated, isBuyer } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel scroll ref and state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll capability
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState, properties]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Scroll by visible width
    const scrollAmount = el.clientWidth * 0.95;
    el.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchSmartRecommendations() {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/auth", "") || "https://testapi.cmpdubai.com/api";

      try {
        // Extract location string or search keyword
        const rawLocationStr =
          typeof location === "string"
            ? location
            : location?.city || location?.address || "";
        
        // Extract primary area keyword (e.g. "Downtown", "Marina", "Palm", "Business Bay")
        const areaKeyword = rawLocationStr.split(/[,-]/)[0]?.trim() || "";

        let allFetched: any[] = [];

        if (isAuction) {
          // 1. Fetch targeted auction properties
          const queryParams = new URLSearchParams({ limit: "15" });
          if (category) queryParams.append("category", category);
          if (propertyType) queryParams.append("propertyType", propertyType);
          if (areaKeyword && areaKeyword.length > 2) queryParams.append("search", areaKeyword);

          let res;
          if (isAuthenticated && isBuyer) {
            try {
              res = await api.get(`/buyer/live-listings?${queryParams.toString()}`);
            } catch {
              res = await axios.get(`${API_URL}/public/live-properties?${queryParams.toString()}`);
            }
          } else {
            res = await axios.get(`${API_URL}/public/live-properties?${queryParams.toString()}`);
          }

          const rawData = res.data?.data;
          const targetItems = Array.isArray(rawData) ? rawData : rawData?.data || [];
          allFetched = [...targetItems];

          // 2. If fewer than 6 items, fetch general live properties
          if (allFetched.length < 6) {
            const fallbackRes = await axios.get(`${API_URL}/public/live-properties?limit=15`);
            const fallbackData = fallbackRes.data?.data;
            const fallbackItems = Array.isArray(fallbackData) ? fallbackData : fallbackData?.data || [];
            allFetched = [...allFetched, ...fallbackItems];
          }
        } else {
          // 1. Fetch targeted simple listings
          const queryParams = new URLSearchParams({ limit: "15" });
          if (category) queryParams.append("propertyCategory", category);
          if (propertyType) queryParams.append("propertyType", propertyType);
          if (areaKeyword && areaKeyword.length > 2) queryParams.append("search", areaKeyword);

          let res;
          if (isAuthenticated && isBuyer) {
            try {
              res = await api.get(`/buyer/simpleLiveListings?${queryParams.toString()}`);
            } catch {
              res = await axios.get(`${API_URL}/public/simple-live-properties?${queryParams.toString()}`);
            }
          } else {
            res = await axios.get(`${API_URL}/public/simple-live-properties?${queryParams.toString()}`);
          }

          const rawData = res.data?.data;
          const targetItems = Array.isArray(rawData) ? rawData : rawData?.data || [];
          allFetched = [...targetItems];

          // 2. Fallback to general simple listings if fewer than 6 items
          if (allFetched.length < 6) {
            const fallbackRes = await axios.get(`${API_URL}/public/simple-live-properties?limit=15`);
            const fallbackData = fallbackRes.data?.data;
            const fallbackItems = Array.isArray(fallbackData) ? fallbackData : fallbackData?.data || [];
            allFetched = [...allFetched, ...fallbackItems];
          }
        }

        // Deduplicate and filter current property
        const seenIds = new Set<string>();
        const uniqueItems: any[] = [];

        for (const item of allFetched) {
          const itemId = String(item._id || item.id || "");
          if (itemId && itemId !== String(currentPropertyId) && !seenIds.has(itemId)) {
            seenIds.add(itemId);

            // Calculate relevance score
            let score = 0;
            const itemDetails = item.propertyDetails || item || {};
            const itemLocation = String(itemDetails.propertyLocation || itemDetails.location || item.location || "").toLowerCase();
            const itemType = String(itemDetails.propertyType || item.propertyType || "").toUpperCase();
            const itemCat = String(itemDetails.propertyCategory || item.propertyCategory || "").toUpperCase();

            if (areaKeyword && itemLocation.includes(areaKeyword.toLowerCase())) {
              score += 30; // Location match
            }
            if (propertyType && itemType === propertyType.toUpperCase()) {
              score += 20; // Type match
            }
            if (category && itemCat === category.toUpperCase()) {
              score += 10; // Category match
            }

            uniqueItems.push({ item, score });
          }
        }

        // Sort by smart relevance score descending
        uniqueItems.sort((a, b) => b.score - a.score);

        if (isMounted) {
          setProperties(uniqueItems.slice(0, 9).map((u) => u.item));
        }
      } catch (err) {
        console.error("Failed to load smart recommended properties:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSmartRecommendations();

    return () => {
      isMounted = false;
    };
  }, [currentPropertyId, category, propertyType, location, price, isAuction, isAuthenticated, isBuyer]);

  if (!isLoading && properties.length === 0) {
    return null;
  }

  const recDict = (dict as any).recommendations || {};

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-16 pt-12 border-t border-gray-200 dark:border-[#1A3626] relative">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3626]/5 dark:bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{recDict.badge || "Smart Recommendations"}</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {recDict.title || "Recommended Properties"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {recDict.subtitle || "Explore similar properties matched by location, type, and preferences"}
          </p>
        </div>

        {/* Right Header Navigation */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={isAuction ? `/${locale}/auctions` : `/${locale}/listings`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1A3626] dark:text-[#5CD284] hover:underline group mr-2"
          >
            <span>
              {recDict.viewAll || (isAuction ? "View All Realtime Offers" : "View All Listings")}
            </span>
            {locale === "ar" ? (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>

          {/* Navigation Arrows (Header Top Right - Best UX, no card overlap) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous properties"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-200 hover:bg-[#1A3626] hover:text-white dark:hover:bg-[#5CD284] dark:hover:text-[#0A1C12] shadow-sm hover:scale-105 active:scale-95"
                  : "bg-gray-100/70 dark:bg-[#102418]/40 border-gray-200/50 dark:border-[#1A3626]/50 text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next properties"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                canScrollRight
                  ? "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-200 hover:bg-[#1A3626] hover:text-white dark:hover:bg-[#5CD284] dark:hover:text-[#0A1C12] shadow-sm hover:scale-105 active:scale-95"
                  : "bg-gray-100/70 dark:bg-[#102418]/40 border-gray-200/50 dark:border-[#1A3626]/50 text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Card Carousel Container */}
      <div className="relative">

        {/* Horizontal Smooth Scroll Track (Exactly 3 cards per row on desktop) */}
        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 h-[390px] bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="w-full h-52 bg-gray-200 dark:bg-[#1A3626]/60 rounded-2xl" />
                <div className="space-y-2.5 mt-4">
                  <div className="h-4 bg-gray-200 dark:bg-[#1A3626]/60 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-[#1A3626]/40 rounded w-1/2" />
                </div>
                <div className="h-7 bg-gray-200 dark:bg-[#1A3626]/60 rounded w-1/3 mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-1 -mx-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {properties.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start transition-transform duration-300"
              >
                <PropertyGridCard
                  item={item}
                  locale={locale}
                  isAuction={isAuction}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
