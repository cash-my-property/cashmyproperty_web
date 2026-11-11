"use client";

import { useState, useEffect, useCallback } from "react";
import { safeExternalUrl } from "@/utils/safeUrl";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Users, 
  Home, 
  ArrowLeft, 
  Loader2, 
  ExternalLink,
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from "lucide-react";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import connectPublicService, { 
  PublicCompanyDetail, 
  PublicListingCard, 
  PublicPagination 
} from "@/services/connectPublicService";

interface AgencyDetailClientProps {
  id: string;
  initialData?: PublicCompanyDetail | null;
  locale: string;
}

export default function AgencyDetailClient({ id, initialData, locale }: AgencyDetailClientProps) {
  const [agency, setAgency] = useState<PublicCompanyDetail | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [activeTab, setActiveTab] = useState<"listings" | "agents">("listings");

  // Listings State
  const [listings, setListings] = useState<PublicListingCard[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState<boolean>(false);
  const [purposeFilter, setPurposeFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PublicPagination>({ total: 0, page: 1, limit: 12, pages: 1 });

  // Fetch Agency Profile if not passed
  useEffect(() => {
    if (initialData) {
      setAgency(initialData);
      setIsLoading(false);
      return;
    }

    const fetchAgency = async () => {
      try {
        setIsLoading(true);
        const data = await connectPublicService.getAgency(id);
        if (data) {
          setAgency(data);
        }
      } catch (err) {
        console.error("Error loading agency details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgency();
  }, [id, initialData]);

  // Fetch Agency Listings
  const fetchListings = useCallback(async () => {
    setIsListingsLoading(true);
    try {
      const paramsObj: Record<string, any> = {
        agencyId: id,
        page,
        limit: 12,
      };
      if (purposeFilter !== "ALL") {
        paramsObj.purpose = purposeFilter;
      }
      const res = await connectPublicService.getListings(paramsObj);
      if (res?.data) {
        setListings(res.data);
        setPagination(res.pagination || { total: res.data.length, page, limit: 12, pages: 1 });
      }
    } catch (err) {
      console.error("Error loading agency listings:", err);
    } finally {
      setIsListingsLoading(false);
    }
  }, [id, page, purposeFilter]);

  useEffect(() => {
    if (activeTab === "listings") {
      fetchListings();
    }
  }, [fetchListings, activeTab]);

  if (isLoading && !agency) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
      </main>
    );
  }

  if (!agency) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] pt-32 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Agency Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">This real estate agency profile could not be found or is not verified.</p>
        <Link href={`/${locale}/agents`} className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] font-bold rounded-xl text-sm">
          Browse Verified Agents
        </Link>
      </main>
    );
  }

  const agentsList = (agency.agents || []).filter((ag): ag is NonNullable<typeof ag> => Boolean(ag && ag.id));

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors pt-28 sm:pt-32 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/agents`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Agents & Partners
          </Link>
        </div>

        {/* Agency Profile Header Card */}
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-[#1A3626] shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#163321] shrink-0 border border-gray-200 dark:border-[#1A3626] flex items-center justify-center p-2">
                {agency.logo ? (
                  <Image src={agency.logo} alt={agency.name} fill className="object-contain p-2" sizes="112px" />
                ) : (
                  <Building2 className="w-10 h-10 text-[#1A3626] dark:text-[#5CD284]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {agency.name}
                  </h1>
                  <span title="DLD Verified Agency">
                    <ShieldCheck className="w-5 h-5 text-[#5CD284] shrink-0" />
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {agency.orn && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#5CD284]/15 dark:text-[#5CD284]">
                      ORN: {agency.orn}
                    </span>
                  )}
                  {agency.emirate && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {agency.emirate}
                    </span>
                  )}
                </div>

                {agency.address && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-xl">
                    {agency.address}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] text-center min-w-[120px]">
                <span className="block text-2xl font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                  {agency.liveListings ?? listings.length ?? 0}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Active Listings</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] text-center min-w-[120px]">
                <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
                  {agentsList.length}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Registered Agents</span>
              </div>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center gap-4 text-xs font-semibold">
            {agency.phone && (
              <a
                href={`tel:${agency.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {agency.phone}
              </a>
            )}
            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> {agency.email}
              </a>
            )}
            {safeExternalUrl(agency.website) && (
              <a
                href={safeExternalUrl(agency.website)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200 dark:border-[#1A3626] text-[#1A3626] dark:text-[#5CD284] hover:underline"
              >
                <Globe className="w-3.5 h-3.5" /> Visit Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#1A3626] pb-3 mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("listings")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === "listings"
                  ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Properties ({agency.liveListings ?? listings.length ?? 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("agents")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === "agents"
                  ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Agents Team ({agentsList.length})</span>
            </button>
          </div>

          {/* Purpose Filter for Listings */}
          {activeTab === "listings" && (
            <div className="flex items-center gap-1.5">
              {(["ALL", "SALE", "RENT"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPurposeFilter(p);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    purposeFilter === p
                      ? "bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#102418]"
                      : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626] hover:bg-gray-100"
                  }`}
                >
                  {p === "ALL" ? "All" : p === "SALE" ? "For Sale" : "For Rent"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1 Content: Active Listings */}
        {activeTab === "listings" && (
          <div>
            {isListingsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
                <p className="text-xs font-semibold text-gray-500">Loading properties...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white dark:bg-[#102418] rounded-2xl p-12 text-center border border-gray-100 dark:border-[#1A3626]">
                <Home className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No active listings currently available
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check back soon or explore properties from our other verified agencies.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((item) => (
                    <PropertyGridCard
                      key={item.ref || item.id}
                      item={item}
                      locale={locale}
                      href={`/${locale}/listings/${item.ref || item.id}`}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 px-3">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page >= pagination.pages}
                      className="p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2 Content: Agents Roster */}
        {activeTab === "agents" && (
          <div>
            {agentsList.length === 0 ? (
              <div className="bg-white dark:bg-[#102418] rounded-2xl p-12 text-center border border-gray-100 dark:border-[#1A3626]">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No agents listed currently
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Agent profiles for {agency.name} will be added here once registered.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agentsList.map((ag) => (
                  <Link
                    key={ag.id}
                    href={`/${locale}/agents/${ag.id}`}
                    className="group bg-white dark:bg-[#102418] rounded-2xl p-5 border border-gray-100 dark:border-[#1A3626] hover:border-[#1A3626] dark:hover:border-[#5CD284] transition-all hover:shadow-md flex flex-col items-center text-center"
                  >
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-[#163321] mb-3 border border-gray-200 dark:border-[#1A3626]">
                      {ag.photo ? (
                        <Image src={ag.photo} alt={ag.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#1A3626] dark:text-[#5CD284]">
                          {ag.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors">
                        {ag.name}
                      </h4>
                      {ag.brnVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400 mb-2">
                      {ag.position || "Property Broker"}
                    </p>

                    {ag.brn && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-50 dark:bg-[#163321] text-gray-600 dark:text-gray-300 font-bold mb-3">
                        BRN: {ag.brn}
                      </span>
                    )}

                    <span className="mt-auto text-xs font-bold text-[#1A3626] dark:text-[#5CD284] group-hover:underline inline-flex items-center gap-1">
                      View Profile <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
