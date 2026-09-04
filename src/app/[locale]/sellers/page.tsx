"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Building, 
  PhoneCall, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink,
  Award,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Zap,
  Tag,
  X,
  ArrowRight,
  Globe,
  Mail,
  Loader2,
  ChevronLeft
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
  officeName?: string;
  designation?: string;
  nationality?: string;
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
  listingId: string;
  listingPurpose: string;
  propertyCategory: string;
  propertyType: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice?: { amount: number; currency: string };
  propertyArea?: { value: number; unit: string };
  propertyBedrooms?: string;
  propertyBathrooms?: string;
  propertyImages?: { url: string }[];
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<"ALL" | "SALE" | "RENT">("ALL");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("mostListings");
  const [page, setPage] = useState<number>(1);

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

      const res = await api.get("/buyer/agents", { params });
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
      const res = await api.get(`/buyer/agents/${agent._id}`);
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
      <section className="relative w-full py-20 sm:py-28 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/95 via-[#0a1a13]/90 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#5CD284]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#c9a14b]/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.2em] text-[11px] sm:text-[12px] mb-4 uppercase bg-white/10 dark:bg-white/5 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b]" />
            Verified Sellers Directory
          </span>
          <h1 className="text-white text-[34px] sm:text-[52px] lg:text-[58px] font-bold mb-4 leading-[1.15] tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Find Verified Real Estate Sellers & Brokers
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[15px] sm:text-[18px] max-w-2xl leading-relaxed font-light">
            Connect directly with RERA-licensed brokers and verified property owners across Dubai for direct property listings and transparent real estate deals.
          </p>
        </div>
      </section>

      {/* 2. SEARCH & FILTERS CONTROL BAR */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto w-full -mt-8 relative z-20">
        <div className="bg-white dark:bg-[#102418] rounded-[28px] p-4 sm:p-6 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main Search Input */}
          <div className="flex-1 flex items-center bg-gray-50 dark:bg-[#091711] rounded-full px-5 py-3.5 w-full border border-gray-200 dark:border-[#1A3626] focus-within:border-[#5CD284] transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search seller by name, brokerage name, or BRN number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm font-medium"
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
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
            {[
              { label: "All Sellers", value: "ALL" },
              { label: "For Sale Listings", value: "SALE" },
              { label: "For Rent Listings", value: "RENT" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedPurpose(tab.value as any);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedPurpose === tab.value
                    ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                    : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626] hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 3. SELLERS CARDS DIRECTORY */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto w-full flex-1">
        
        {/* Results Counter & Sort Selector */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Verified Sellers Directory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-7 border border-gray-200/90 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col justify-between">
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Verified Sellers Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              No seller profiles match your search criteria. Try adjusting your search query or filter options.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedPurpose("ALL"); setSelectedSortBy("mostListings"); setPage(1); }}
              className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs rounded-full hover:opacity-90 transition-opacity"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          /* SELLERS CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-7 border border-gray-200/90 dark:border-[#1A3626] shadow-[0_10px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.2)] hover:border-[#1A3626] dark:hover:border-[#c9a14b] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                
                {/* Card Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A3626] via-[#5CD284] to-[#c9a14b]" />

                <div>
                  {/* Row 1: Profile Image, Name & Agency */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img 
                          src={agent.thumbnail || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} 
                          alt={agent.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#1A3626]/20 dark:border-[#c9a14b]/30 group-hover:scale-105 transition-transform"
                        />
                        {agent.isVerified && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] rounded-full shadow-md" title="Verified RERA Broker">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Name & Agency */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 
                            className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors" 
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                            title={agent.name}
                          >
                            {agent.name.split(/\s+/).length > 2 
                              ? `${agent.name.split(/\s+/).slice(0, 2).join(" ")}...` 
                              : agent.name}
                          </h3>
                        </div>

                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">
                          {agent.designation || "Property Consultant"}
                        </p>

                        <span className="text-[11px] font-bold text-[#1A3626] dark:text-[#c9a14b] truncate mt-0.5">
                          {agent.officeName || "Independent Broker"} {agent.brokerNumber ? `(RERA #${agent.brokerNumber})` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Mode Pill Badge */}
                    <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Simple Seller
                    </span>
                  </div>

                  {/* Languages & Nationality Bar */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-gray-50/80 dark:bg-[#091711]/60 rounded-2xl border border-gray-100 dark:border-[#1A3626] mb-5">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {agent.languages && agent.languages.length > 0 ? agent.languages.join(", ") : "English, Arabic"}
                      </span>
                    </div>

                    {agent.nationality && (
                      <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-[#163321] text-[10px] font-bold text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-[#1A3626] shrink-0">
                        {agent.nationality}
                      </span>
                    )}
                  </div>

                  {/* Key Stats Grid (3 Columns) */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{agent.counts?.total || 0}</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block">Total Listings</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{agent.counts?.forSale || 0}</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block">For Sale</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{agent.counts?.forRent || 0}</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block">For Rent</span>
                    </div>
                  </div>

                </div>

                {/* Card Action Footer CTAs */}
                <div className="pt-4 border-t border-gray-100 dark:border-[#1A3626] flex items-center gap-3">
                  <button
                    onClick={() => handleOpenProfileModal(agent)}
                    className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View Profile</span>
                  </button>

                  <Link
                    href={`/${locale}/listings`}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] hover:opacity-90 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
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
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
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
                <ShieldCheck className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seller Profile Details</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedSellerModal.brokerNumber ? `BRN #${selectedSellerModal.brokerNumber}` : "Licensed Broker"}
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
                <img 
                  src={selectedSellerModal.thumbnail || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} 
                  alt={selectedSellerModal.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1A3626] dark:border-[#c9a14b]"
                />
                <div className="flex flex-col min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedSellerModal.name}</h4>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{selectedSellerModal.designation || "Property Consultant"}</span>
                  <span className="text-xs font-bold text-[#1A3626] dark:text-[#c9a14b] mt-0.5 truncate">{selectedSellerModal.officeName || "Independent Broker"}</span>
                </div>
              </div>

              {/* Dynamic Metrics (if loaded) */}
              {isModalLoading ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b] animate-spin" />
                  <span className="text-xs text-gray-500 font-semibold">Loading agent metrics...</span>
                </div>
              ) : (
                modalDetails?.summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{modalDetails.summary.totalDeals}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">Total Deals</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{modalDetails.summary.closedDealsCount}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">Deals Closed</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{modalDetails.summary.forSaleCount}</span>
                      <span className="text-[10px] font-semibold text-gray-500 block">For Sale</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#091711] text-center border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-lg font-extrabold text-[#1A3626] dark:text-[#c9a14b] block">{modalDetails.summary.forRentCount}</span>
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
                    <span key={i} className="px-3 py-1 rounded-full bg-green-50 dark:bg-[#163321] text-[#1A3626] dark:text-[#5CD284] font-bold text-xs border border-green-200/50 dark:border-[#1A3626]">
                      {lang}
                    </span>
                  ))}
                  {selectedSellerModal.nationality && (
                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-[#163321] text-amber-700 dark:text-[#c9a14b] font-bold text-xs border border-amber-200/50 dark:border-[#1A3626]">
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
                      className="py-3 px-4 rounded-2xl bg-gray-100 dark:bg-[#163321] text-gray-800 dark:text-gray-200 hover:bg-gray-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4 text-[#1A3626] dark:text-[#5CD284]" />
                      <span>Call {selectedSellerModal.phone}</span>
                    </a>
                  )}

                  {selectedSellerModal.phone && (
                    <a
                      href={`https://wa.me/${selectedSellerModal.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-2xl bg-[#5CD284] text-[#1A3626] font-extrabold text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-md"
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

