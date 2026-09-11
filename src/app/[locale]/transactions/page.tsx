"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Building, 
  CheckCircle2, 
  SlidersHorizontal, 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpRight, 
  Sparkles, 
  X, 
  Bed, 
  Bath, 
  Square, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  FileText 
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";
import axios from "axios";
import Dirham from "@/components/Dirham";

interface TransactionItem {
  _id: string;
  listingId?: string;
  referenceNumber?: string;
  propertyTitle: string;
  propertyLocation: string;
  dealType: "SALE" | "RENT";
  status: string;
  propertyCategory: string;
  propertyType: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  area?: string | number;
  price: number;
  currency?: string;
  transactedDate: string;
  thumbnail?: string | null;
  agent?: {
    agentId?: string;
    name: string;
    thumbnail?: string | null;
    officeName?: string;
    brokerNumber?: string | null;
    isVerified?: boolean;
  };
}

export default function TransactionsPage() {
  const { locale } = useDictionary();
  const searchParams = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<"ALL" | "SALE" | "RENT">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("ALL");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("newest");
  const [page, setPage] = useState<number>(1);

  // Sync URL Search Parameters on Mount
  useEffect(() => {
    const urlLoc = searchParams.get("propertyLocation") || searchParams.get("location") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlPurpose = searchParams.get("listingPurpose") || searchParams.get("dealType") || searchParams.get("purpose");
    const urlType = searchParams.get("propertyType");
    const urlCategory = searchParams.get("propertyCategory");
    const urlMinPrice = searchParams.get("minPrice") || "";
    const urlMaxPrice = searchParams.get("maxPrice") || "";

    if (urlLoc) setPropertyLocation(urlLoc);
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlPurpose === "RENT" || urlPurpose === "SALE" || urlPurpose === "Rent" || urlPurpose === "Sale") {
      setSelectedPurpose(urlPurpose.toUpperCase() as any);
    }
    if (urlType) setSelectedPropertyType(urlType.toUpperCase());
    if (urlCategory) setSelectedCategory(urlCategory.toUpperCase());
    if (urlMinPrice) setMinPrice(urlMinPrice);
    if (urlMaxPrice) setMaxPrice(urlMaxPrice);
  }, [searchParams]);

  // Data State
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Fetch Transactions Data
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
        sortBy: selectedSortBy,
      };

      if (propertyLocation.trim()) params.propertyLocation = propertyLocation.trim();
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedPurpose !== "ALL") {
        params.listingPurpose = selectedPurpose;
        params.dealType = selectedPurpose;
      }
      if (selectedCategory !== "ALL") params.propertyCategory = selectedCategory;
      if (selectedPropertyType !== "ALL") params.propertyType = selectedPropertyType;
      if (minPrice.trim()) {
        const parsedMin = Number(minPrice.trim());
        if (!isNaN(parsedMin) && parsedMin >= 0) params.minPrice = parsedMin;
      }
      if (maxPrice.trim()) {
        const parsedMax = Number(maxPrice.trim());
        if (!isNaN(parsedMax) && parsedMax >= 0) params.maxPrice = parsedMax;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
      
      let res;
      try {
        res = await api.get("/public/transactions", { params });
      } catch (err) {
        // Fallback endpoint if needed
        res = await axios.get(`${API_URL}/public/simple-live-properties`, { params });
      }

      if (res.data?.success || res.data?.status === "success") {
        const rawData = res.data.data || res.data.properties || [];
        const rawItems = Array.isArray(rawData) ? rawData : (rawData?.data || []);

        const formatted = rawItems.map((item: any) => {
          const isRent = item.dealType?.toUpperCase() === "RENT" || item.listingPurpose === "RENT" || item.status?.toUpperCase() === "RENTED";
          const rawStatus = item.status ? item.status.toUpperCase() : (isRent ? "RENTED" : "SOLD");
          const dealStatus = rawStatus === "ACTIVE" ? (isRent ? "RENTED" : "SOLD") : rawStatus;

          const locationStr = item.location || item.locationName || (typeof item.propertyLocation === 'string' ? item.propertyLocation : (item.propertyLocation?.city || item.propertyLocation?.area || "Dubai, UAE"));

          return {
            _id: item._id || item.id,
            listingId: item.listingId,
            referenceNumber: item.referenceNumber,
            propertyTitle: item.propertyTitle || item.title || "Property Transaction",
            propertyLocation: locationStr,
            dealType: isRent ? "RENT" : "SALE",
            status: dealStatus,
            propertyCategory: item.propertyCategory || "RESIDENTIAL",
            propertyType: item.propertyType || "Apartment",
            bedrooms: item.bedrooms || (item.propertyBedrooms ? `${item.propertyBedrooms} Beds` : (item.specs?.beds ? `${item.specs.beds} Beds` : "-")),
            bathrooms: item.bathrooms || (item.propertyWashrooms || item.propertyBathrooms || item.specs?.washrooms || "-"),
            area: item.area || (item.propertyArea?.value ? `${item.propertyArea.value} sqft` : (item.propertyBuiltUpArea ? `${item.propertyBuiltUpArea} sqft` : "-")),
            price: typeof item.price === "number" ? item.price : (item.propertyPrice?.amount || item.price?.amount || item.propertyPrice || 0),
            currency: item.currency || "AED",
            transactedDate: item.dealDate || item.date || item.updatedAt || item.createdAt || new Date().toISOString(),
            thumbnail: item.thumbnail || item.images?.[0] || null,
            agent: {
              agentId: item.sellerInfo?.agentId || item.sellerId?._id,
              name: item.sellerInfo?.name || item.sellerId?.fullName || item.agent?.name || item.sellerName || "Verified Agent",
              thumbnail: item.sellerInfo?.thumbnail || item.sellerId?.picture || item.agent?.thumbnail || null,
              officeName: item.sellerInfo?.officeName || item.sellerId?.officeName || item.agent?.officeName || "",
              brokerNumber: item.sellerInfo?.brokerNumber || item.sellerId?.brokerNumber || null,
              isVerified: item.sellerInfo?.isVerified ?? item.sellerId?.isVerified ?? true
            }
          };
        });

        setTransactions(formatted);
        setPagination({
          total: res.data?.pagination?.total || res.data?.count || rawItems.length,
          page: res.data?.pagination?.page || page,
          limit: res.data?.pagination?.limit || 10,
          totalPages: res.data?.pagination?.totalPages || Math.ceil((res.data?.pagination?.total || rawItems.length) / 10) || 1
        });
      } else {
        setTransactions([]);
        setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, propertyLocation, selectedPurpose, selectedCategory, selectedPropertyType, minPrice, maxPrice, selectedSortBy, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/95 via-[#0a1a13]/90 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#5CD284]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[180px] sm:w-[250px] h-[180px] sm:h-[250px] bg-[#c9a14b]/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-[12px] mb-3 sm:mb-4 uppercase bg-white/10 dark:bg-white/5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm flex items-center gap-1.5 sm:gap-2">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5CD284] dark:text-[#c9a14b]" />
            Official Market Deals & Record Register
          </span>
          <h1 className="text-white text-[26px] sm:text-[44px] lg:text-[54px] font-bold mb-3 sm:mb-4 leading-[1.2] tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Real Estate Property Transactions & Closed Deals
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[13px] sm:text-[16px] lg:text-[18px] max-w-2xl leading-relaxed font-light">
            Search verified historical property sale and rent transactions, transacted prices, and official market records across Dubai & UAE.
          </p>
        </div>
      </section>

      {/* 2. SEARCH & FILTERS CONTROL BAR */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white dark:bg-[#102418] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-200/80 dark:border-[#1A3626] flex flex-col gap-4">
          
          {/* Top Row: Search Input & Deal Purpose Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-4">
            {/* Main Search Input */}
            <div className="flex-1 flex items-center bg-white dark:bg-[#091711] rounded-full px-4 py-3 sm:px-5 sm:py-3.5 w-full border border-gray-200 dark:border-[#1A3626] focus-within:border-[#1A3626] dark:focus-within:border-[#c9a14b] shadow-sm transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2.5 sm:mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search transaction by building name, community, area, or property title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-xs sm:text-sm font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }} 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full shrink-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Deal Purpose Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
              {[
                { label: "All Deals", value: "ALL" },
                { label: "Sold Deals", value: "SALE" },
                { label: "Rented Deals", value: "RENT" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setSelectedPurpose(tab.value as any);
                    setPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                    selectedPurpose === tab.value
                      ? "bg-gray-900 text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 dark:bg-[#091711] dark:text-gray-300 dark:border-[#1A3626] hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Simple White Property Type Filter Pills & Price Range */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#1A3626]">
            
            {/* Property Types */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Type:</span>
              {[
                { label: "All Types", value: "ALL" },
                { label: "Apartments", value: "APARTMENT" },
                { label: "Villas", value: "VILLA" },
                { label: "Townhouses", value: "TOWNHOUSE" },
                { label: "Offices", value: "OFFICE" },
                { label: "Land", value: "LAND" },
              ].map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => {
                    setSelectedPropertyType(pt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPropertyType === pt.value
                      ? "bg-[#1A3626] text-white dark:bg-white dark:text-[#1A3626] shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200/90 dark:bg-[#091711] dark:text-gray-400 dark:border-[#1A3626] hover:bg-gray-50"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Price Range Filter Inputs */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Price (AED):</span>
              <input
                type="number"
                min="0"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setMinPrice(val);
                    setPage(1);
                  }
                }}
                className="w-24 sm:w-28 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white outline-none focus:border-[#1A3626] shadow-xs"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setMaxPrice(val);
                    setPage(1);
                  }
                }}
                className="w-24 sm:w-28 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white outline-none focus:border-[#1A3626] shadow-xs"
              />
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setPage(1);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full shrink-0"
                  title="Clear price range"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 3. TRANSACTIONS SECTION */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full flex-1">
        
        {/* Results Counter & Simple White Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Verified Property Transactions
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700 border border-gray-200 dark:bg-[#102418] dark:text-[#c9a14b] dark:border-[#1A3626] shadow-xs">
              {pagination.total} Records
            </span>
          </div>

          {/* Simple White Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-gray-500 font-medium sm:hidden">Sort by:</span>
            <div className="flex items-center gap-2 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3.5 py-2 shadow-xs">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={selectedSortBy}
                onChange={(e) => {
                  setSelectedSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-[#102418] text-gray-900 dark:text-white border-none outline-none text-xs font-bold cursor-pointer"
              >
                <option value="newest" className="bg-white text-gray-900 dark:bg-[#102418] dark:text-white">Newest Deals First</option>
                <option value="priceHigh" className="bg-white text-gray-900 dark:bg-[#102418] dark:text-white">Price (High to Low)</option>
                <option value="priceLow" className="bg-white text-gray-900 dark:bg-[#102418] dark:text-white">Price (Low to High)</option>
                <option value="oldest" className="bg-white text-gray-900 dark:bg-[#102418] dark:text-white">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- MOBILE CARDS VIEW (Below MD) --- */}
        <div className="block md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-[#102418] p-4 rounded-2xl border border-gray-200 dark:border-[#1A3626] animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-[#163321] rounded w-1/2" />
                <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-full w-24" />
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="bg-white dark:bg-[#102418] rounded-2xl p-8 text-center border border-gray-200 dark:border-[#1A3626]">
              <Building className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-bold text-sm text-gray-900 dark:text-white">No transaction records match your filters.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedPurpose("ALL"); setSelectedCategory("ALL"); setSelectedPropertyType("ALL"); setPage(1); }}
                className="mt-3 px-4 py-1.5 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            transactions.map((tx) => (
              <div 
                key={tx._id} 
                className="bg-white dark:bg-[#102418] rounded-2xl p-4 border border-gray-200/90 dark:border-[#1A3626] shadow-sm flex flex-col gap-3"
              >
                {/* Header Row: Title + Deal Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b] flex items-center justify-center shrink-0 border border-[#1A3626]/15 dark:border-[#c9a14b]/30">
                      {tx.thumbnail ? (
                        <Image src={tx.thumbnail} alt={tx.propertyTitle} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <Building className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{tx.propertyTitle}</h3>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{tx.propertyCategory} • {tx.propertyType}</span>
                    </div>
                  </div>
                  {tx.dealType === "SALE" || tx.status === "SOLD" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-700 dark:text-[#5CD284] border border-emerald-500/20 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      SOLD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      RENTED
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />
                  <span className="truncate">{tx.propertyLocation}</span>
                </div>

                {/* Price & Specs */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                  <div className="font-extrabold text-base text-[#1A3626] dark:text-[#c9a14b] flex items-center gap-1">
                    <Dirham className="text-xs" /> {tx.price.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium bg-gray-50 dark:bg-[#091711] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1A3626]">
                    {[
                      tx.bedrooms && tx.bedrooms !== "-" ? tx.bedrooms : null,
                      tx.bathrooms && tx.bathrooms !== "-" ? `${tx.bathrooms} Baths` : null,
                      tx.area && tx.area !== "-" ? tx.area : null,
                    ].filter(Boolean).join(" • ") || "N/A"}
                  </span>
                </div>

                {/* Footer: Date & Broker */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    {tx.agent?.thumbnail ? (
                      <Image src={tx.agent.thumbnail} alt={tx.agent.name} width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
                    ) : null}
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{tx.agent?.name}</span>
                    {tx.agent?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatDate(tx.transactedDate)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP TABLE VIEW (MD and Above) --- */}
        <div className="hidden md:block bg-white dark:bg-[#102418] rounded-2xl border border-gray-200/90 dark:border-[#1A3626] shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[850px]">
              
              {/* Table Header */}
              <thead>
                <tr className="bg-white dark:bg-[#0d1f15] border-b border-gray-200 dark:border-[#1A3626] text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  <th className="py-4 px-6">Property / Building</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Deal Type</th>
                  <th className="py-4 px-4">Specs & Type</th>
                  <th className="py-4 px-4">Transacted Price</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-6">Broker / Agent</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626] text-xs bg-white dark:bg-[#102418]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-48" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-32" /></td>
                      <td className="py-4 px-4"><div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-full w-16" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-28" /></td>
                      <td className="py-4 px-4"><div className="h-5 bg-gray-200 dark:bg-[#163321] rounded w-24" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-32" /></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <Building className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="font-bold text-sm">No transaction records match your filters.</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setSelectedPurpose("ALL"); setSelectedCategory("ALL"); setSelectedPropertyType("ALL"); setPage(1); }}
                        className="mt-3 px-4 py-1.5 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr 
                      key={tx._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#163321]/50 transition-colors group cursor-pointer"
                    >
                      {/* Property Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b] flex items-center justify-center shrink-0 border border-[#1A3626]/15 dark:border-[#c9a14b]/30">
                            {tx.thumbnail ? (
                              <Image src={tx.thumbnail} alt={tx.propertyTitle} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors" title={tx.propertyTitle}>
                              {tx.propertyTitle}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {tx.propertyCategory}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />
                          <span className="truncate max-w-[180px]" title={tx.propertyLocation}>{tx.propertyLocation}</span>
                        </div>
                      </td>

                      {/* Deal Type Badge */}
                      <td className="py-4 px-4">
                        {tx.dealType === "SALE" || tx.status === "SOLD" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#5CD284] border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            SOLD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            RENTED
                          </span>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5 text-gray-700 dark:text-gray-300">
                          <span className="font-bold text-gray-900 dark:text-white uppercase">{tx.propertyType}</span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {[
                              tx.bedrooms && tx.bedrooms !== "-" ? `${tx.bedrooms} Beds` : null,
                              tx.bathrooms && tx.bathrooms !== "-" ? `${tx.bathrooms} Baths` : null,
                              tx.area && tx.area !== "-" ? tx.area : null,
                            ].filter(Boolean).join(" • ") || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-[#c9a14b] whitespace-nowrap flex items-center gap-1">
                          <Dirham className="text-xs" /> {tx.price.toLocaleString()}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(tx.transactedDate)}</span>
                        </div>
                      </td>

                      {/* Agent */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900 dark:text-white truncate">{tx.agent?.name}</span>
                            {tx.agent?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />}
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{tx.agent?.officeName}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>

        {/* 4. PAGINATION CONTROLS */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  page === pNum
                    ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                    : "bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]"
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
              className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </section>

    </main>
  );
}
