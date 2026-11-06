"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import { useDictionary } from "@/components/DictionaryProvider";
import connectPublicService, { PublicListingCard } from "@/services/connectPublicService";

interface RecommendedPropertiesProps {
  currentPropertyId: string;
  category?: string;
  propertyType?: string;
  location?: string | any;
  price?: number | string;
  purpose?: string;
  initialSimilar?: any[];
  isAuction?: boolean;
  locale: string;
}

export default function RecommendedProperties({
  currentPropertyId,
  category,
  propertyType,
  location,
  price,
  purpose,
  initialSimilar,
  isAuction = false,
  locale,
}: RecommendedPropertiesProps) {
  const { dict } = useDictionary();

  // Initialize with initialSimilar if provided from backend detail endpoint (API 20)
  const [properties, setProperties] = useState<any[]>(() => {
    if (Array.isArray(initialSimilar) && initialSimilar.length > 0) {
      return initialSimilar.filter((item: any) => {
        if (!item) return false;
        const itemId = String(item.ref || item._id || item.id || "");
        return itemId && itemId !== String(currentPropertyId);
      });
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !(Array.isArray(initialSimilar) && initialSimilar.length > 0);
  });

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

  // Sync if initialSimilar updates from parent
  useEffect(() => {
    if (Array.isArray(initialSimilar) && initialSimilar.length > 0) {
      const filtered = initialSimilar.filter((item: any) => {
        if (!item) return false;
        const itemId = String(item.ref || item._id || item.id || "");
        return itemId && itemId !== String(currentPropertyId);
      });
      if (filtered.length > 0) {
        setProperties(filtered);
        setIsLoading(false);
      }
    }
  }, [initialSimilar, currentPropertyId]);

  // Section page ke neeche hai — viewport ke qareeb aane pe hi fetch karo
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setIsNearViewport(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Effect ko sirf primitive values pe depend karao. Pehle `location` (object), `price`
  // aur `initialSimilar` (har parent refetch pe naya reference) ki wajah se 3 sequential
  // requests har render pe dobara chalti thin.
  const rawLocationStr =
    typeof location === "string" ? location : location?.city || location?.address || "";
  // Primary area keyword (e.g. "Downtown", "Marina", "Palm", "Business Bay")
  const areaKeyword = rawLocationStr.split(/[,-]/)[0]?.trim() || "";
  const initialCount = Array.isArray(initialSimilar) ? initialSimilar.length : 0;
  const initialIdsKey = Array.isArray(initialSimilar)
    ? initialSimilar.map((i: any) => String(i?.ref || i?._id || i?.id || "")).join(",")
    : "";
  // Latest-value ref (effect mein update hota hai, render mein nahi) — fetch effect isse
  // padhta hai taake initialSimilar ka naya reference effect dobara na chalaye
  const initialSimilarRef = useRef(initialSimilar);
  useEffect(() => {
    initialSimilarRef.current = initialSimilar;
  });

  useEffect(() => {
    if (!isNearViewport) return;
    let isMounted = true;
    const initialSimilar = initialSimilarRef.current;

    async function fetchSmartRecommendations() {
      // If we already have 3 or more similar properties passed from backend, use them directly
      if (initialCount >= 3) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {

        const seenIds = new Set<string>();
        const candidates: any[] = [];

        const addUnique = (items: any[]) => {
          for (const item of items) {
            if (!item) continue;
            const itemId = String(item.ref || item._id || item.id || "");
            if (
              itemId &&
              itemId !== String(currentPropertyId) &&
              !seenIds.has(itemId) &&
              (item.title || item.propertyTitle)
            ) {
              seenIds.add(itemId);
              candidates.push(item);
            }
          }
        };

        // 1. First add any initial similar properties if available
        if (Array.isArray(initialSimilar) && initialSimilar.length > 0) {
          addUnique(initialSimilar);
        }

        // 2. Fetch targeted CMP Connect public listings (API 17)
        if (candidates.length < 6) {
          const queryParams: Record<string, any> = { limit: 12 };
          if (purpose) queryParams.purpose = purpose;
          if (category) queryParams.category = category;
          if (propertyType) queryParams.type = propertyType;
          if (areaKeyword && areaKeyword.length > 2) queryParams.location = areaKeyword;

          const res = await connectPublicService.getListings(queryParams).catch(() => null);
          if (res?.data && Array.isArray(res.data)) {
            addUnique(res.data);
          }
        }

        // 3. If fewer than 6 items, broaden query by purpose + category
        if (candidates.length < 6) {
          const broaderParams: Record<string, any> = { limit: 12 };
          if (purpose) broaderParams.purpose = purpose;
          if (category) broaderParams.category = category;

          const broaderRes = await connectPublicService.getListings(broaderParams).catch(() => null);
          if (broaderRes?.data && Array.isArray(broaderRes.data)) {
            addUnique(broaderRes.data);
          }
        }

        // 4. If still fewer than 4 items, fetch latest authentic CMP Connect listings
        if (candidates.length < 4) {
          const generalRes = await connectPublicService.getListings({ limit: 12 }).catch(() => null);
          if (generalRes?.data && Array.isArray(generalRes.data)) {
            addUnique(generalRes.data);
          }
        }

        if (isMounted) {
          setProperties(candidates.slice(0, 9));
        }
      } catch (err) {
        console.error("Failed to load CMP Connect recommended properties:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSmartRecommendations();

    return () => {
      isMounted = false;
    };
  }, [isNearViewport, currentPropertyId, category, propertyType, areaKeyword, purpose, initialCount, initialIdsKey]);

  if (!isLoading && properties.length === 0) {
    return null;
  }

  const recDict = (dict as any).recommendations || {};

  return (
    <section ref={sectionRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-16 pt-12 border-t border-gray-200 dark:border-[#1A3626] relative">
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
                key={item._id || item.id || item.ref || idx}
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
