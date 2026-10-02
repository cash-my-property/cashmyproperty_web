"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  ShieldCheck, 
  Building, 
  PhoneCall, 
  MessageSquare, 
  SlidersHorizontal, 
  ArrowRight,
  Globe,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";

interface AgentCounts {
  forSale: number;
  forRent: number;
  total: number;
}

interface Agent {
  _id: string;
  name: string;
  thumbnail?: string;
  officeName?: string | null;
  designation?: string | null;
  nationality?: string | null;
  languages?: string[];
  brokerNumber?: string;
  phone?: string;
  email?: string;
  isVerified?: boolean;
  counts?: AgentCounts;
  createdAt?: string;
}

interface AgentSummary {
  totalDeals: number;
  forSaleCount: number;
  forRentCount: number;
  activeDealsCount: number;
  closedDealsCount: number;
  totalDealsValue: number;
  currency: string;
}

interface AgentProperty {
  _id: string;
  sellerId?: string;
  listingId: string;
  listingPurpose: string;
  propertyCategory: string;
  propertyPlan?: string;
  propertyType: string;
  propertyTitle: string;
  whatsappNumber?: string;
  propertyLocation: string;
  propertyDescription?: string;
  propertyPrice?: { 
    amount: number; 
    downPayment?: number;
    currency: string 
  };
  propertyArea?: { value: number; unit: string };
  propertyBedrooms?: string;
  propertyBathrooms?: string;
  permitNumber?: string;
  rentalPeriod?: string;
  availability?: string;
  propertyImages?: { url: string; public_id?: string; _id?: string }[];
  isFavourited?: boolean;
  createdAt?: string;
}

interface AgentTrackRecord {
  _id: string;
  listingId: string;
  location: string;
  locationName: string;
  propertyTitle: string;
  dealType: string;
  date: string;
  propertyType: string;
  bedrooms: string;
  price: number;
  currency: string;
  status: string;
}

interface AgentDetailPayload {
  agent: Agent;
  summary?: AgentSummary;
  properties?: AgentProperty[];
  trackRecord?: AgentTrackRecord[];
}

export default function FindSellersPage() {
  const { locale } = useDictionary();
  const searchParams = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<"ALL" | "SALE" | "RENT">("ALL");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("mostListings");
  const [page, setPage] = useState<number>(1);

  // Sync URL Search Parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search") || searchParams.get("location") || "";
    const urlPurpose = searchParams.get("purpose") || searchParams.get("listingPurpose");
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlPurpose === "SALE" || urlPurpose === "RENT") {
      setSelectedPurpose(urlPurpose as "SALE" | "RENT");
    }
  }, [searchParams]);

  // Dynamic Data State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Modal State
  const [selectedSellerModal, setSelectedSellerModal] = useState<Agent | null>(null);
  const [modalDetails, setModalDetails] = useState<AgentDetailPayload | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  // Fetch Agents from Backend API
  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
        sortBy: selectedSortBy,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedPurpose !== "ALL") {
        params.purpose = selectedPurpose;
      }

      const res = await api.get("/public/agents", { params });
      if (res.data?.success) {
        setAgents(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching agents list:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedPurpose, selectedSortBy, page]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Open Modal & Fetch Agent Detail
  const handleOpenProfileModal = async (agent: Agent) => {
    setSelectedSellerModal(agent);
    setModalDetails(null);
    setIsModalLoading(true);

    try {
      const res = await api.get(`/public/agents/${agent._id}`);
      if (res.data?.data) {
        setModalDetails(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching agent profile details:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full py-20 sm:py-28 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1A3626] via-[#102418] to-[#091711] dark:from-[#091711] dark:via-[#0c2016] dark:to-[#091711]">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#5CD284]/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] font-bold tracking-[0.2em] text-[11px] sm:text-[12px] mb-4 uppercase bg-white/10 dark:bg-white/5 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5CD284]" />
            Verified Agents Directory
          </span>
          <h1 className="text-white text-[32px] sm:text-[48px] lg:text-[56px] font-bold mb-4 leading-[1.15] tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Find Verified Real Estate Agents
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[14px] sm:text-[17px] max-w-2xl leading-relaxed font-light">
            Connect directly with RERA-licensed agents and verified property specialists across Dubai for transparent real estate transactions.
          </p>
        </div>
      </section>

      {/* 2. SEARCH & FILTERS CONTROL BAR */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full -mt-8 relative z-20">
        <div className="bg-white dark:bg-[#102418] rounded-[28px] p-4 sm:p-5 shadow-xl border border-gray-100 dark:border-[#1A3626] flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main Search Input */}
          <div className="flex-1 flex items-center bg-gray-50 dark:bg-[#091711] rounded-2xl px-5 py-3 w-full border border-gray-200 dark:border-[#1A3626] focus-within:border-[#5CD284] transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search agent by name, agency, or BRN number..."
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
                className="p-1 hover:bg-gray-200 dark:hover:bg-[#163321] rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Listing Purpose Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
            {[
              { label: "All Agents", value: "ALL" },
              { label: "For Sale Listings", value: "SALE" },
              { label: "For Rent Listings", value: "RENT" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedPurpose(tab.value as any);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedPurpose === tab.value
                    ? "bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] shadow-sm"
                    : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626] hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 3. SELLERS CARDS DIRECTORY */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* Results Counter & Sort Selector */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Verified Agents Directory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] border border-[#5CD284]/30">
              {pagination.total} Available
            </span>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSortBy}
              onChange={(e) => {
                setSelectedSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none focus:border-[#5CD284] cursor-pointer"
            >
              <option value="mostListings">Most Active Listings</option>
              <option value="forSale">Most For Sale</option>
              <option value="forRent">Most For Rent</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* LOADING SKELETONS */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-200/90 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-[#163321]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-[#163321] rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-[#163321] rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded-2xl mb-5" />
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="h-14 bg-gray-200 dark:bg-[#163321] rounded-2xl" />
                    <div className="h-14 bg-gray-200 dark:bg-[#163321] rounded-2xl" />
                    <div className="h-14 bg-gray-200 dark:bg-[#163321] rounded-2xl" />
                  </div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded-2xl" />
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 text-center border border-gray-200 dark:border-[#1A3626] my-8 shadow-sm">
            <Building className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Verified Agents Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              No agent profiles match your search criteria. Try adjusting your search query or filter options.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedPurpose("ALL"); setSelectedSortBy("mostListings"); setPage(1); }}
              className="px-6 py-2.5 bg-[#5CD284] hover:bg-[#4cb870] text-[#0A1C12] font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          /* SELLERS CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-[#1A3626] shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-[#5CD284]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                
                {/* Card Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A3626] via-[#5CD284] to-[#1A3626]" />

                <div>
                  {/* Row 1: Profile Image, Name & Agency */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="relative shrink-0 w-16 h-16 sm:w-18 sm:h-18">
                        <Image 
                          src={agent.thumbnail || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} 
                          alt={agent.name}
                          width={72}
                          height={72}
                          loading="eager"
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#5CD284] group-hover:scale-105 transition-transform"
                        />
                        {agent.isVerified && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-[#5CD284] text-[#0A1C12] rounded-full shadow-md" title="Verified RERA Agent">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Name & Agency */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 
                            className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-[#5CD284] transition-colors" 
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                            title={agent.name}
                          >
                            {agent.name.split(/\s+/).length > 2 
                              ? `${agent.name.split(/\s+/).slice(0, 2).join(" ")}...` 
                              : agent.name}
                          </h3>
                        </div>

                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">
                          {agent.designation || "Licensed Real Estate Agent"}
                        </p>

                        <span className="text-[11px] font-bold text-[#5CD284] truncate mt-0.5">
                          {agent.officeName || "Independent Agent"} {agent.brokerNumber ? `(RERA #${agent.brokerNumber})` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Mode Pill Badge */}
                    <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] border border-[#5CD284]/30">
                      Verified Agent
                    </span>
                  </div>

                  {/* Languages & Nationality Bar */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-gray-50/80 dark:bg-[#091711]/60 rounded-2xl border border-gray-100 dark:border-[#1A3626] mb-5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Globe className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {agent.languages && agent.languages.length > 0 ? agent.languages.join(", ") : "English, Arabic"}
                      </span>
                    </div>

                    {agent.nationality && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#163321] text-[10px] font-bold text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-[#1A3626] shrink-0">
                        {agent.nationality}
                      </span>
                    )}
                  </div>

                  {/* Key Stats Grid (3 Columns) */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{agent.counts?.total || 0}</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block">Total Listings</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{agent.counts?.forSale || 0}</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block">For Sale</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{agent.counts?.forRent || 0}</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block">For Rent</span>
                    </div>
                  </div>

                </div>

                {/* Card Action Footer CTAs */}
                <div className="pt-4 border-t border-gray-100 dark:border-[#1A3626] flex items-center gap-3">
                  <Link
                    href={`/${locale}/sellers/${agent._id}`}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href={`/${locale}/sellers/${agent._id}`}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] hover:opacity-90 font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>View Listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  page === pNum
                    ? "bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] shadow-sm"
                    : "bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]"
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </section>

      {/* 4. SELLER PROFILE DETAIL MODAL */}
      {selectedSellerModal && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedSellerModal(null)}
        >
          <div 
            className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-[#1A3626] animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between bg-gray-50/50 dark:bg-[#091711]/50">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#5CD284]" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Agent Profile Details</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedSellerModal.brokerNumber ? `BRN #${selectedSellerModal.brokerNumber}` : "Licensed Agent"}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSellerModal(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#091711] rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                <Image 
                  src={selectedSellerModal.thumbnail || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} 
                  alt={selectedSellerModal.name} 
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#5CD284]"
                />
                <div className="flex flex-col min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedSellerModal.name}</h4>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{selectedSellerModal.designation || "Licensed Real Estate Agent"}</span>
                  <span className="text-xs font-bold text-[#5CD284] mt-0.5 truncate">{selectedSellerModal.officeName || "Independent Agent"}</span>
                </div>
              </div>

              {/* Dynamic Metrics (if loaded) */}
              {isModalLoading ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-[#5CD284] animate-spin" />
                  <span className="text-xs text-gray-500 font-semibold">Loading agent metrics...</span>
                </div>
              ) : (
                modalDetails?.summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{modalDetails.summary.totalDeals}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">Total Deals</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{modalDetails.summary.closedDealsCount}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">Deals Closed</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{modalDetails.summary.forSaleCount}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">For Sale</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#5CD284] block">{modalDetails.summary.forRentCount}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">For Rent</span>
                    </div>
                  </div>
                )
              )}

              {/* Spoken Languages & Nationality */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Spoken Languages & Info</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSellerModal.languages?.map((lang, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#163321] text-[#1A3626] dark:text-[#5CD284] font-bold text-xs border border-emerald-200/50 dark:border-[#1A3626]">
                      {lang}
                    </span>
                  ))}
                  {selectedSellerModal.nationality && (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#163321] text-[#1A3626] dark:text-[#5CD284] font-bold text-xs border border-emerald-200/50 dark:border-[#1A3626]">
                      Nationality: {selectedSellerModal.nationality}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Contact CTAs */}
              {(selectedSellerModal.phone || selectedSellerModal.email) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedSellerModal.phone && (
                    <a
                      href={`tel:${selectedSellerModal.phone}`}
                      className="py-3 px-4 rounded-xl bg-gray-100 dark:bg-[#163321] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1e462d] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4 text-[#5CD284]" />
                      <span>Call {selectedSellerModal.phone}</span>
                    </a>
                  )}

                  {selectedSellerModal.phone && (
                    <a
                      href={`https://wa.me/${selectedSellerModal.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#091711] flex justify-end">
              <button
                onClick={() => setSelectedSellerModal(null)}
                className="px-6 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
