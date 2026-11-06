"use client";

import { useState, useEffect, useCallback, use } from "react";
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
  X,
  Award,
  UserCheck
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import connectPublicService, { PublicAgent, PublicPagination } from "@/services/connectPublicService";
import AgentContactButtons from "@/components/agents/AgentContactButtons";
import DirectoryTabs from "@/components/directory/DirectoryTabs";

export default function FindAgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const searchParams = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [selectedPurpose, setSelectedPurpose] = useState<string>("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("mostListings");
  const [page, setPage] = useState<number>(1);

  // Sync from URL
  useEffect(() => {
    const s = searchParams?.get("search") || searchParams?.get("q") || "";
    const p = searchParams?.get("purpose") || "ALL";
    const l = searchParams?.get("language") || "";
    if (s) setSearchQuery(s);
    if (p) setSelectedPurpose(p.toUpperCase());
    if (l) setSelectedLanguage(l);
  }, [searchParams]);

  // Data State
  const [agents, setAgents] = useState<PublicAgent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PublicPagination>({ total: 0, page: 1, limit: 12, pages: 1 });

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiParams: Record<string, any> = {
        page,
        limit: 12,
        sort: selectedSortBy,
      };

      if (debouncedSearch.trim()) {
        apiParams.search = debouncedSearch.trim();
      }
      if (selectedPurpose !== "ALL") {
        apiParams.purpose = selectedPurpose;
      }
      if (selectedLanguage) {
        apiParams.language = selectedLanguage;
      }

      const res = await connectPublicService.getAgents(apiParams);
      if (res) {
        setAgents(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedPurpose, selectedLanguage, selectedSortBy, page]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAgents();
  };

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors">
      
      {/* Header Banner */}
      <section className="relative w-full pt-32 sm:pt-36 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A3626] to-[#0A1C12] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#5CD284]/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <DirectoryTabs />
          <span className="text-[#5CD284] font-bold tracking-widest text-[12px] uppercase mb-3 bg-[#5CD284]/15 px-4 py-1.5 rounded-full border border-[#5CD284]/30">
            CMP Verified Broker Network
          </span>
          <h1 
            className="text-white text-3xl sm:text-5xl font-bold mb-4 tracking-tight drop-shadow-sm" 
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Find a Verified Real Estate Agent
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-xl mb-8 font-light">
            Connect with licensed, RERA-compliant property consultants and brokers across Dubai and UAE.
          </p>

          {/* Search bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-2xl bg-white dark:bg-[#102418] rounded-2xl p-2 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex items-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 flex-1">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agent by name, BRN or company..."
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-[#1A3626]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {pagination.total > 0 ? `${pagination.total} Agents Found` : "All Agents"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active licensed brokers with verified track records
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Purpose Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#102418] rounded-xl p-1 border border-gray-200 dark:border-[#1A3626] text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setSelectedPurpose("ALL"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPurpose === "ALL" ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => { setSelectedPurpose("SALE"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPurpose === "SALE" ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                For Sale
              </button>
              <button
                type="button"
                onClick={() => { setSelectedPurpose("RENT"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPurpose === "RENT" ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                For Rent
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={selectedSortBy}
              onChange={(e) => { setSelectedSortBy(e.target.value); setPage(1); }}
              className="bg-white dark:bg-[#102418] text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 dark:border-[#1A3626] outline-none cursor-pointer"
            >
              <option value="mostListings">Most Listings</option>
              <option value="forSale">Most For Sale</option>
              <option value="forRent">Most For Rent</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="newest">Newest Joined</option>
            </select>
          </div>
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-[#163321] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-[#163321] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded-xl" />
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
            <UserCheck className="w-12 h-12 text-gray-300 dark:text-[#1A3626] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Agents Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              We couldn&apos;t find any agents matching your search. Try adjusting the name, purpose, or filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626] hover:border-[#5CD284]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#163321] shrink-0 border border-gray-200 dark:border-[#1A3626]">
                      {agent.photo ? (
                        <Image
                          src={agent.photo}
                          alt={agent.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#1A3626] dark:text-[#5CD284]">
                          {agent.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate group-hover:text-[#5CD284] transition-colors">
                          {agent.name}
                        </h3>
                        {agent.brnVerified && (
                          <span title="DLD BRN Verified">
                            <ShieldCheck className="w-4 h-4 text-[#5CD284] shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {agent.position || "Real Estate Broker"}
                      </p>

                      {agent.company?.name && (
                        <p className="text-xs font-semibold text-[#1A3626] dark:text-[#5CD284] truncate mt-0.5 flex items-center gap-1">
                          <Building className="w-3 h-3 shrink-0" />
                          <span className="truncate">{agent.company.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges: BRN, Languages */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    {agent.brn && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#163321] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626]">
                        BRN: <strong className="font-mono">{agent.brn}</strong>
                      </span>
                    )}
                    {agent.languages && agent.languages.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#163321] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626]">
                        {agent.languages.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Listings stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] text-center mb-5 border border-gray-100 dark:border-[#1A3626]">
                    <div>
                      <span className="block text-sm font-extrabold text-gray-900 dark:text-white">
                        {agent.listings?.total || agent.liveListings || 0}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Listings</span>
                    </div>
                    <div className="border-l border-gray-200 dark:border-[#1A3626]">
                      <span className="block text-sm font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                        {agent.listings?.forSale || 0}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">For Sale</span>
                    </div>
                    <div className="border-l border-gray-200 dark:border-[#1A3626]">
                      <span className="block text-sm font-extrabold text-[#1A3626] dark:text-[#c9a14b]">
                        {agent.listings?.forRent || 0}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">For Rent</span>
                    </div>
                  </div>
                </div>

                {/* Contact (backend 4832d23) — Call / WhatsApp / Email, jo field null ho wo button nahi */}
                <div className="mb-2.5">
                  <AgentContactButtons contact={agent.contact} agentName={agent.name} />
                </div>

                {/* Card CTA */}
                <Link
                  href={`/${locale}/agents/${agent.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A3626] hover:bg-[#12261b] dark:bg-[#5CD284] dark:hover:bg-[#4cb870] text-white dark:text-[#0A1C12] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                >
                  <span>View Profile &amp; Deals</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-gray-500 font-medium px-2">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page >= pagination.pages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </section>

    </main>
  );
}

