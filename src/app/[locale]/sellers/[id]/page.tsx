"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  MapPin, 
  Building, 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  Globe, 
  Share2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2, 
  Bed, 
  Bath, 
  Maximize2, 
  ArrowRight,
  Award,
  Check,
  Send,
  FileText,
  Tag
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";

// TypeScript Interfaces matching exact backend response
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
  counts?: {
    forSale: number;
    forRent: number;
    total: number;
  };
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
  dealDate?: string;
  propertyType: string;
  bedrooms: string;
  price: number;
  currency: string;
  status: string;
  thumbnail?: string;
}

export default function SellerDetailPage() {
  const { locale } = useDictionary();
  const params = useParams();
  const agentId = params.id as string;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"PROPERTIES" | "TRACK_RECORD" | "ABOUT">("PROPERTIES");

  // Agent Payload State
  const [agent, setAgent] = useState<Agent | null>(null);
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState<boolean>(true);

  // Listings Tab State
  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState<boolean>(false);
  const [listingPurpose, setListingPurpose] = useState<"ALL" | "SALE" | "RENT">("ALL");
  const [listingCategory, setListingCategory] = useState<"ALL" | "RESIDENTIAL" | "COMMERCIAL">("ALL");
  const [listingsPage, setListingsPage] = useState<number>(1);
  const [listingsPagination, setListingsPagination] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });

  // Track Record Tab State
  const [trackRecords, setTrackRecords] = useState<AgentTrackRecord[]>([]);
  const [isTrackRecordLoading, setIsTrackRecordLoading] = useState<boolean>(false);
  const [trackDealType, setTrackDealType] = useState<string>("ALL");
  const [trackSearch, setTrackSearch] = useState<string>("");
  const [trackPage, setTrackPage] = useState<number>(1);
  const [trackPagination, setTrackPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Contact Form State
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper for Formatting Prices & Volume
  const formatVolume = (val?: number, curr = "AED") => {
    if (val === undefined || val === null) return "N/A";
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)}M ${curr}`;
    }
    return `${val.toLocaleString()} ${curr}`;
  };

  // Helper for Formatting Bedrooms string
  const formatBedrooms = (beds?: string) => {
    if (!beds) return "N/A";
    if (beds.toUpperCase() === "STUDIO") return "Studio";
    return `${beds} Beds`;
  };

  // 1. Fetch Agent Profile & Initial Payload
  const fetchAgentProfile = useCallback(async () => {
    if (!agentId) return;
    setIsAgentLoading(true);
    try {
      const res = await api.get(`/buyer/agents/${agentId}`);
      if (res.data?.data) {
        setAgent(res.data.data.agent || null);
        setSummary(res.data.data.summary || null);
        if (res.data.data.properties) {
          setProperties(res.data.data.properties);
          setListingsPagination(prev => ({
            ...prev,
            total: res.data.data.properties.length,
            totalPages: Math.ceil(res.data.data.properties.length / 9) || 1
          }));
        }
        if (res.data.data.trackRecord) {
          setTrackRecords(res.data.data.trackRecord);
          setTrackPagination(prev => ({
            ...prev,
            total: res.data.data.trackRecord.length,
            totalPages: Math.ceil(res.data.data.trackRecord.length / 10) || 1
          }));
        }
      }
    } catch (error) {
      console.error("Error loading seller details:", error);
    } finally {
      setIsAgentLoading(false);
    }
  }, [agentId]);

  // 2. Fetch Agent Active Listings (Paginated on tab change or filter change)
  const fetchAgentListings = useCallback(async (
    purposeOverride?: "ALL" | "SALE" | "RENT",
    categoryOverride?: "ALL" | "RESIDENTIAL" | "COMMERCIAL",
    pageOverride?: number
  ) => {
    if (!agentId) return;
    setIsListingsLoading(true);

    const purpose = purposeOverride !== undefined ? purposeOverride : listingPurpose;
    const category = categoryOverride !== undefined ? categoryOverride : listingCategory;
    const page = pageOverride !== undefined ? pageOverride : listingsPage;

    try {
      const queryParams: Record<string, any> = {
        page,
        limit: 9
      };
      if (purpose !== "ALL") queryParams.listingPurpose = purpose;
      if (category !== "ALL") queryParams.propertyCategory = category;

      const res = await api.get(`/buyer/agents/${agentId}/listings`, { params: queryParams });
      if (res.data?.success) {
        setProperties(res.data.data || []);
        if (res.data.pagination) {
          setListingsPagination(res.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching agent listings:", error);
    } finally {
      setIsListingsLoading(false);
    }
  }, [agentId, listingPurpose, listingCategory, listingsPage]);

  // 3. Fetch Agent Track Record (Paginated)
  const fetchAgentTrackRecord = useCallback(async (
    dealTypeOverride?: string,
    searchOverride?: string,
    pageOverride?: number
  ) => {
    if (!agentId) return;
    setIsTrackRecordLoading(true);

    const dealType = dealTypeOverride !== undefined ? dealTypeOverride : trackDealType;
    const search = searchOverride !== undefined ? searchOverride : trackSearch;
    const page = pageOverride !== undefined ? pageOverride : trackPage;

    try {
      const queryParams: Record<string, any> = {
        page,
        limit: 10
      };
      if (dealType !== "ALL") queryParams.dealType = dealType;
      if (search.trim()) queryParams.search = search.trim();

      const res = await api.get(`/buyer/agents/${agentId}/track-record`, { params: queryParams });
      if (res.data?.success) {
        setTrackRecords(res.data.data || []);
        if (res.data.pagination) {
          setTrackPagination(res.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching track record:", error);
    } finally {
      setIsTrackRecordLoading(false);
    }
  }, [agentId, trackDealType, trackSearch, trackPage]);

  useEffect(() => {
    fetchAgentProfile();
  }, [fetchAgentProfile]);

  const handlePurposeChange = (purpose: "ALL" | "SALE" | "RENT") => {
    setListingPurpose(purpose);
    setListingsPage(1);
    fetchAgentListings(purpose, listingCategory, 1);
  };

  const handleCategoryChange = (cat: "ALL" | "RESIDENTIAL" | "COMMERCIAL") => {
    setListingCategory(cat);
    setListingsPage(1);
    fetchAgentListings(listingPurpose, cat, 1);
  };

  // Handle Share Profile Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Handle Send Direct Inquiry
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;
    setIsSendingInquiry(true);
    setTimeout(() => {
      setIsSendingInquiry(false);
      setInquirySent(true);
      setInquiryMessage("");
      setTimeout(() => setInquirySent(false), 5000);
    }, 1000);
  };

  if (isAgentLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#091711] flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#1A3626] dark:text-[#c9a14b] animate-spin" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Loading seller profile...</p>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#091711] flex items-center justify-center py-24 px-6">
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-10 text-center max-w-md border border-gray-200 dark:border-[#1A3626] shadow-xl">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seller Profile Not Found</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            The seller profile you are looking for may have been removed or does not exist.
          </p>
          <Link
            href={`/${locale}/sellers`}
            className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] rounded-full font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Back to Sellers Directory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen pb-20">
      
      {/* 1. HERO HEADER BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 lg:pt-44 pb-12 px-6 lg:px-12 overflow-hidden bg-gradient-to-b from-[#1B3A2D] via-[#102418] to-[#091711] dark:from-[#091711] dark:via-[#0c2016] dark:to-[#091711]">
        
        {/* Glow Accents */}
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-[#5CD284]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#c9a14b]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Unified Immersive Seller Profile & Metrics Main Card */}
          <div className="bg-white/10 dark:bg-[#102418]/80 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 lg:p-10 border border-white/20 dark:border-[#1A3626] shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.5)] flex flex-col gap-8 relative overflow-hidden group">
            
            {/* Card Accent Glow Line at Top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A3626] via-[#5CD284] to-[#c9a14b]" />

            {/* Ambient Background Glow inside Card */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5CD284]/10 rounded-full blur-3xl pointer-events-none" />

            {/* TOP SECTION: Avatar, Name, Info & Action Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              
              {/* Left: Avatar, Name, Office & Credentials */}
              <div className="flex items-start sm:items-center gap-5 sm:gap-7">
                {/* Avatar Image */}
                <div className="relative shrink-0">
                  <img 
                    src={agent.thumbnail || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} 
                    alt={agent.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover border-2 border-[#5CD284] dark:border-[#c9a14b] shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  {agent.isVerified && (
                    <span className="absolute -bottom-2 -right-2 p-1.5 bg-[#1A3626] dark:bg-[#c9a14b] text-[#5CD284] dark:text-[#1A3626] rounded-full shadow-lg border border-white/20" title="Verified RERA Broker">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                      {agent.name}
                    </h1>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-[#5CD284] border border-emerald-500/30 shadow-sm">
                      Verified Seller
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white/80">
                    {agent.designation || "Licensed Real Estate Seller"}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-white/70 font-medium">
                    <span className="flex items-center gap-1 text-[#c9a14b]">
                      <Building className="w-3.5 h-3.5" />
                      {agent.officeName || "Direct Property Seller"}
                    </span>
                    {agent.brokerNumber && (
                      <>
                        <span>•</span>
                        <span className="bg-white/10 px-2.5 py-0.5 rounded-md font-bold text-white text-[11px]">
                          BRN #{agent.brokerNumber}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Spoken Languages, Phone & Email Info */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-1 text-xs text-white/80 font-medium">
                    {agent.languages && agent.languages.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                        <Globe className="w-3.5 h-3.5 text-[#5CD284]" />
                        <span>Speaks: {agent.languages.join(", ")}</span>
                      </div>
                    )}

                    {agent.phone && (
                      <a href={`tel:${agent.phone}`} className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10 hover:border-[#c9a14b] transition-colors text-white">
                        <PhoneCall className="w-3.5 h-3.5 text-[#c9a14b]" />
                        <span>{agent.phone}</span>
                      </a>
                    )}

                    {agent.email && (
                      <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10 hover:border-[#5CD284] transition-colors text-white">
                        <Mail className="w-3.5 h-3.5 text-[#5CD284]" />
                        <span className="truncate max-w-[200px]">{agent.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Contact & Share Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                {/* WhatsApp Direct Button */}
                {agent.phone && (
                  <a
                    href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Call SIM Phone Button */}
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="px-4 py-2.5 rounded-2xl bg-[#c9a14b] hover:bg-[#b58f3e] text-[#1A3626] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call {agent.phone}</span>
                  </a>
                )}

                {/* Email Direct Button */}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:scale-105 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-[#5CD284]" />
                    <span>Email</span>
                  </a>
                )}

                {/* Share Profile Button */}
                <button
                  onClick={handleShare}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-105"
                  title="Share Profile"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#5CD284]" /> : <Share2 className="w-4 h-4" />}
                  <span className="text-xs font-bold">{copiedLink ? "Copied!" : "Share"}</span>
                </button>
              </div>

            </div>

            {/* DIVIDER LINE INSIDE CARD */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent relative z-10" />

            {/* BOTTOM SECTION: KEY METRICS COUNTERS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/15 dark:border-white/10 text-center shadow-inner hover:border-[#5CD284]/50 transition-colors">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#5CD284] block">
                  {summary?.totalDeals ?? (agent.counts?.total || 0)}
                </span>
                <span className="text-[11px] font-semibold text-white/70 block uppercase tracking-wider mt-0.5">Total Deals</span>
              </div>

              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/15 dark:border-white/10 text-center shadow-inner hover:border-[#c9a14b]/50 transition-colors">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#c9a14b] block">
                  {summary?.closedDealsCount ?? 0}
                </span>
                <span className="text-[11px] font-semibold text-white/70 block uppercase tracking-wider mt-0.5">Closed Deals</span>
              </div>

              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/15 dark:border-white/10 text-center shadow-inner hover:border-white/40 transition-colors">
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                  {summary?.forSaleCount ?? (agent.counts?.forSale || 0)}
                </span>
                <span className="text-[11px] font-semibold text-white/70 block uppercase tracking-wider mt-0.5">Active For Sale</span>
              </div>

              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/15 dark:border-white/10 text-center shadow-inner hover:border-white/40 transition-colors">
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                  {summary?.forRentCount ?? (agent.counts?.forRent || 0)}
                </span>
                <span className="text-[11px] font-semibold text-white/70 block uppercase tracking-wider mt-0.5">Active For Rent</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/15 dark:border-white/10 text-center shadow-inner hover:border-[#5CD284]/50 transition-colors">
                <span className="text-xl sm:text-2xl font-extrabold text-[#5CD284] block truncate">
                  {formatVolume(summary?.totalDealsValue, summary?.currency)}
                </span>
                <span className="text-[11px] font-semibold text-white/70 block uppercase tracking-wider mt-0.5">Total Volume</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. MAIN PAGE LAYOUT GRID */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto w-full pt-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: TABBED CONTENT */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* PropertyFinder Style Navigation Tabs Bar */}
            <div className="bg-white dark:bg-[#102418] rounded-2xl p-1.5 border border-gray-200 dark:border-[#1A3626] shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("PROPERTIES")}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === "PROPERTIES"
                    ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Active Listings ({listingsPagination.total || properties.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("TRACK_RECORD")}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === "TRACK_RECORD"
                    ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Track Record ({summary?.closedDealsCount || trackRecords.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("ABOUT")}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === "ABOUT"
                    ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>About & License</span>
              </button>
            </div>

            {/* TAB 1: PROPERTIES (ACTIVE LISTINGS) */}
            {activeTab === "PROPERTIES" && (
              <div className="flex flex-col gap-6">
                
                {/* Listings Filter Bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-[#102418] p-4 rounded-2xl border border-gray-200 dark:border-[#1A3626] shadow-sm">
                  {/* Purpose Tabs */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: "All", value: "ALL" },
                      { label: "For Sale", value: "SALE" },
                      { label: "For Rent", value: "RENT" },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => handlePurposeChange(tab.value as any)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          listingPurpose === tab.value
                            ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626]"
                            : "bg-gray-100 dark:bg-[#091711] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Category Tabs */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: "All Categories", value: "ALL" },
                      { label: "Residential", value: "RESIDENTIAL" },
                      { label: "Commercial", value: "COMMERCIAL" },
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryChange(cat.value as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          listingCategory === cat.value
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listings Grid */}
                {isListingsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white dark:bg-[#102418] rounded-3xl h-72 animate-pulse border border-gray-200 dark:border-[#1A3626]" />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 text-center border border-gray-200 dark:border-[#1A3626]">
                    <Building className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Active Listings</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      This agent currently has no active listings under the selected filter criteria.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((prop) => (
                      <div
                        key={prop._id}
                        className="bg-white dark:bg-[#102418] rounded-3xl overflow-hidden border border-gray-200 dark:border-[#1A3626] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                      >
                        {/* Property Image Container */}
                        <div className="relative h-48 w-full bg-gray-200 dark:bg-[#091711] overflow-hidden">
                          <img
                            src={prop.propertyImages?.[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                            alt={prop.propertyTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              prop.listingPurpose === 'SALE'
                                ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626]"
                                : "bg-emerald-500 text-white"
                            }`}>
                              {prop.listingPurpose === 'SALE' ? 'For Sale' : 'For Rent'}
                            </span>

                            {prop.listingId && (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-black/60 backdrop-blur-md text-white">
                                {prop.listingId}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-[#1A3626] dark:text-[#c9a14b] uppercase tracking-wider">
                                {prop.propertyType || "Apartment"}
                              </span>
                              {prop.propertyPrice && (
                                <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                                  {prop.propertyPrice.amount.toLocaleString()} <span className="text-xs font-semibold text-gray-500">{prop.propertyPrice.currency || 'AED'}{prop.rentalPeriod === 'PER_YEAR' ? '/yr' : prop.rentalPeriod === 'PER_MONTH' ? '/mo' : ''}</span>
                                </span>
                              )}
                            </div>

                            <Link href={`/${locale}/simple-listings/${prop._id}`}>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 mb-1.5 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors cursor-pointer">
                                {prop.propertyTitle}
                              </h4>
                            </Link>

                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 line-clamp-1 mb-4" title={prop.propertyLocation}>
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{prop.propertyLocation}</span>
                            </p>
                          </div>

                          {/* Property Features Line */}
                          <div className="pt-3 border-t border-gray-100 dark:border-[#1A3626] flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-medium">
                            <div className="flex items-center gap-3">
                              {prop.propertyBedrooms && (
                                <span className="flex items-center gap-1">
                                  <Bed className="w-3.5 h-3.5 text-gray-400" />
                                  {formatBedrooms(prop.propertyBedrooms)}
                                </span>
                              )}
                              {prop.propertyBathrooms && (
                                <span className="flex items-center gap-1">
                                  <Bath className="w-3.5 h-3.5 text-gray-400" />
                                  {prop.propertyBathrooms} Bath
                                </span>
                              )}
                              {prop.propertyArea && (
                                <span className="flex items-center gap-1">
                                  <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                                  {prop.propertyArea.value} {prop.propertyArea.unit}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/${locale}/simple-listings/${prop._id}`}
                              className="text-xs font-bold text-[#1A3626] dark:text-[#c9a14b] flex items-center gap-1 hover:underline"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Listings Pagination */}
                {listingsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      disabled={listingsPage === 1}
                      onClick={() => {
                        const newPage = Math.max(listingsPage - 1, 1);
                        setListingsPage(newPage);
                        fetchAgentListings(listingPurpose, listingCategory, newPage);
                      }}
                      className="p-2 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 px-3">
                      Page {listingsPage} of {listingsPagination.totalPages}
                    </span>
                    <button
                      disabled={listingsPage === listingsPagination.totalPages}
                      onClick={() => {
                        const newPage = Math.min(listingsPage + 1, listingsPagination.totalPages);
                        setListingsPage(newPage);
                        fetchAgentListings(listingPurpose, listingCategory, newPage);
                      }}
                      className="p-2 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: TRACK RECORD (HISTORICAL DEALS TABLE) */}
            {activeTab === "TRACK_RECORD" && (
              <div className="flex flex-col gap-6">
                
                {/* Track Record Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#102418] p-4 rounded-2xl border border-gray-200 dark:border-[#1A3626] shadow-sm">
                  {/* Search Bar */}
                  <div className="flex items-center bg-gray-50 dark:bg-[#091711] rounded-xl px-3.5 py-2 w-full sm:w-64 border border-gray-200 dark:border-[#1A3626]">
                    <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search building / location..."
                      value={trackSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTrackSearch(val);
                        setTrackPage(1);
                        fetchAgentTrackRecord(trackDealType, val, 1);
                      }}
                      className="w-full bg-transparent border-none outline-none text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Deal Type Filters */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                    {[
                      { label: "All Deals", value: "ALL" },
                      { label: "Sales", value: "Sale" },
                      { label: "Rentals", value: "Rent" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setTrackDealType(type.value);
                          setTrackPage(1);
                          fetchAgentTrackRecord(type.value, trackSearch, 1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          trackDealType === type.value
                            ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626]"
                            : "bg-gray-100 dark:bg-[#091711] text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track Record Table */}
                {isTrackRecordLoading ? (
                  <div className="p-12 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-200 dark:border-[#1A3626]">
                    <Loader2 className="w-8 h-8 text-[#1A3626] dark:text-[#c9a14b] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading agent transaction history...</p>
                  </div>
                ) : trackRecords.length === 0 ? (
                  <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 text-center border border-gray-200 dark:border-[#1A3626]">
                    <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Track Record Found</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      No transaction history matches your search or deal filter.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#102418] rounded-3xl overflow-hidden border border-gray-200 dark:border-[#1A3626] shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#091711] border-b border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                            <th className="py-4 px-5">Property & Location</th>
                            <th className="py-4 px-5">Deal Type</th>
                            <th className="py-4 px-5">Property Type</th>
                            <th className="py-4 px-5">Beds</th>
                            <th className="py-4 px-5">Price</th>
                            <th className="py-4 px-5">Status</th>
                            <th className="py-4 px-5">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626] font-medium text-gray-800 dark:text-gray-200">
                          {trackRecords.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-[#163321]/30 transition-colors">
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  {item.thumbnail && (
                                    <img 
                                      src={item.thumbnail} 
                                      alt={item.propertyTitle} 
                                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-[#1A3626]"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{item.propertyTitle || item.locationName}</div>
                                    <div className="text-[11px] text-gray-400 truncate max-w-xs" title={item.location}>{item.locationName || item.location}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  item.dealType?.toLowerCase() === 'sale'
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                }`}>
                                  {item.dealType}
                                </span>
                              </td>
                              <td className="py-4 px-5 font-semibold">{item.propertyType}</td>
                              <td className="py-4 px-5">{item.bedrooms || "Studio"}</td>
                              <td className="py-4 px-5 font-bold text-gray-900 dark:text-white">
                                {item.price ? `${item.price.toLocaleString()} ${item.currency || 'AED'}` : "N/A"}
                              </td>
                              <td className="py-4 px-5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status?.toLowerCase() === 'active'
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-[#163321] dark:text-gray-400"
                                }`}>
                                  {item.status || "Completed"}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-gray-400 font-medium whitespace-nowrap">{item.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Track Record Pagination */}
                {trackPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      disabled={trackPage === 1}
                      onClick={() => {
                        const newPage = Math.max(trackPage - 1, 1);
                        setTrackPage(newPage);
                        fetchAgentTrackRecord(trackDealType, trackSearch, newPage);
                      }}
                      className="p-2 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 px-3">
                      Page {trackPage} of {trackPagination.totalPages}
                    </span>
                    <button
                      disabled={trackPage === trackPagination.totalPages}
                      onClick={() => {
                        const newPage = Math.min(trackPage + 1, trackPagination.totalPages);
                        setTrackPage(newPage);
                        fetchAgentTrackRecord(trackDealType, trackSearch, newPage);
                      }}
                      className="p-2 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: ABOUT & LICENSE DETAILS */}
            {activeTab === "ABOUT" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-[#1A3626] shadow-sm flex flex-col gap-6">
                  
                  {/* Overview */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                      Agent Overview & Licensing
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {agent.name} is a verified seller on Cash My Property, managing active property listings and transactions across residential and commercial sectors.
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#091711] border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">RERA / License Number</span>
                      <span className="text-sm font-extrabold text-[#1A3626] dark:text-[#c9a14b]">
                        {agent.brokerNumber ? `BRN #${agent.brokerNumber}` : "Registered Broker"}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#091711] border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Brokerage Office</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {agent.officeName || "Direct Property Seller"}
                      </span>
                    </div>

                    {agent.email && (
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#091711] border border-gray-100 dark:border-[#1A3626]">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate block">
                          {agent.email}
                        </span>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#091711] border border-gray-100 dark:border-[#1A3626]">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Verification Status</span>
                      <span className="text-sm font-extrabold text-[#5CD284] flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Verified Seller
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* RIGHT STICKY SIDEBAR: TRUST & SAFETY CARDS */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
            
            {/* Card 1: Platform Verified & Trust Banner */}
            <div className="bg-[#1A3626] dark:bg-[#102418] text-white rounded-3xl p-6 border border-white/10 dark:border-[#1A3626] shadow-xl flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5CD284]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-3 rounded-2xl bg-white/10 dark:bg-[#c9a14b]/15 text-[#5CD284] dark:text-[#c9a14b] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Platform Verified Seller</h3>
                  <span className="text-[11px] text-white/70">Verified RERA Licensing & Identity</span>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex flex-col gap-3.5 relative z-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#5CD284] shrink-0 mt-0.5" />
                  <div className="text-xs text-white/90 font-medium">
                    <strong className="block text-white font-bold">RERA Licensing Guaranteed</strong>
                    Government-registered real estate broker/seller.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#5CD284] shrink-0 mt-0.5" />
                  <div className="text-xs text-white/90 font-medium">
                    <strong className="block text-white font-bold">CMP Legal Undertaking</strong>
                    Official digital contracts and buyer transaction protection.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#5CD284] shrink-0 mt-0.5" />
                  <div className="text-xs text-white/90 font-medium">
                    <strong className="block text-white font-bold">Verified Properties Only</strong>
                    Active properties checked for valid location and specifications.
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Safe Deal Guidelines */}
            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-200 dark:border-[#1A3626] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Safe Deal Guidelines</h4>
              </div>

              <ul className="flex flex-col gap-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] mt-1.5 shrink-0" />
                  <span>Always schedule property physical or virtual inspections via CMP platform.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] mt-1.5 shrink-0" />
                  <span>Verify property permit numbers (`permitNumber`) prior to placing bids or deposits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] mt-1.5 shrink-0" />
                  <span>Execute final tenancy or sale contracts strictly through official CMP digital workflows.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}
