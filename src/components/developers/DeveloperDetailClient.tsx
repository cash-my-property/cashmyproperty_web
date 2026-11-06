"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building, 
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
  UserCheck,
  Sparkles
} from "lucide-react";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import connectPublicService, { 
  PublicCompanyDetail, 
  PublicListingCard, 
  PublicPagination 
} from "@/services/connectPublicService";

interface DeveloperDetailClientProps {
  id: string;
  initialData?: PublicCompanyDetail | null;
  locale: string;
}

export default function DeveloperDetailClient({ id, initialData, locale }: DeveloperDetailClientProps) {
  const [developer, setDeveloper] = useState<PublicCompanyDetail | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [activeTab, setActiveTab] = useState<"projects" | "team">("projects");

  // Listings / Projects State
  const [listings, setListings] = useState<PublicListingCard[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState<boolean>(false);
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PublicPagination>({ total: 0, page: 1, limit: 12, pages: 1 });

  // Fetch Developer Profile if not passed
  useEffect(() => {
    if (initialData) {
      setDeveloper(initialData);
      setIsLoading(false);
      return;
    }

    const fetchDeveloper = async () => {
      try {
        setIsLoading(true);
        const data = await connectPublicService.getDeveloper(id);
        if (data) {
          setDeveloper(data);
        }
      } catch (err) {
        console.error("Error loading developer details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeveloper();
  }, [id, initialData]);

  // Fetch Developer Listings / Projects
  const fetchListings = useCallback(async () => {
    setIsListingsLoading(true);
    try {
      const paramsObj: Record<string, any> = {
        developerId: id,
        page,
        limit: 12,
      };
      if (planFilter !== "ALL") {
        paramsObj.plan = planFilter;
      }
      const res = await connectPublicService.getListings(paramsObj);
      if (res && res.data) {
        setListings(res.data);
        setPagination(res.pagination || { total: res.data.length, page: 1, limit: 12, pages: 1 });
      }
    } catch (err) {
      console.error("Error fetching developer listings:", err);
      setListings([]);
    } finally {
      setIsListingsLoading(false);
    }
  }, [id, planFilter, page]);

  useEffect(() => {
    if (activeTab === "projects") {
      fetchListings();
    }
  }, [fetchListings, activeTab]);

  if (isLoading && !developer) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
      </main>
    );
  }

  if (!developer) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] pt-32 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Developer Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">This property developer could not be found or is not verified.</p>
        <Link href={`/${locale}/agents`} className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] font-bold rounded-xl text-sm">
          Browse Verified Partners
        </Link>
      </main>
    );
  }

  const teamList = (developer.agents || []).filter((ag): ag is NonNullable<typeof ag> => Boolean(ag && ag.id));

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors pt-28 sm:pt-32 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/agents`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Partners & Agents
          </Link>
        </div>

        {/* Developer Profile Header Card */}
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-[#1A3626] shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#163321] shrink-0 border border-gray-200 dark:border-[#1A3626] flex items-center justify-center p-2">
                {developer.logo ? (
                  <Image src={developer.logo} alt={developer.name} fill className="object-contain p-2" sizes="112px" />
                ) : (
                  <Building className="w-10 h-10 text-[#1A3626] dark:text-[#5CD284]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {developer.name}
                  </h1>
                  <span title="DLD Verified Developer">
                    <ShieldCheck className="w-5 h-5 text-[#5CD284] shrink-0" />
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#5CD284]/15 dark:text-[#5CD284]">
                    Master Developer
                  </span>
                  {developer.emirate && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {developer.emirate}
                    </span>
                  )}
                </div>

                {developer.address && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-xl">
                    {developer.address}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] text-center min-w-[120px]">
                <span className="block text-2xl font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                  {developer.liveListings ?? listings.length ?? 0}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Active Developments</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] text-center min-w-[120px]">
                <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
                  {teamList.length}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Sales Representatives</span>
              </div>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center gap-4 text-xs font-semibold">
            {developer.phone && (
              <a
                href={`tel:${developer.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {developer.phone}
              </a>
            )}
            {developer.email && (
              <a
                href={`mailto:${developer.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> {developer.email}
              </a>
            )}
            {developer.website && (
              <a
                href={developer.website.startsWith("http") ? developer.website : `https://${developer.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-200 dark:border-[#1A3626] text-[#1A3626] dark:text-[#5CD284] hover:underline"
              >
                <Globe className="w-3.5 h-3.5" /> Official Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#1A3626] pb-3 mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === "projects"
                  ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Projects ({developer.liveListings ?? listings.length ?? 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === "team"
                  ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Developer Team ({teamList.length})</span>
            </button>
          </div>

          {/* Plan Filter for Projects (Ready vs Off-Plan) */}
          {activeTab === "projects" && (
            <div className="flex items-center gap-1.5">
              {(["ALL", "READY", "OFF_PLAN"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlanFilter(p);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    planFilter === p
                      ? "bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#102418]"
                      : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626] hover:bg-gray-100"
                  }`}
                >
                  {p === "ALL" ? "All Projects" : p === "READY" ? "Ready" : "Off-Plan"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1 Content: Active Projects */}
        {activeTab === "projects" && (
          <div>
            {isListingsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
                <p className="text-xs font-semibold text-gray-500">Loading developments...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white dark:bg-[#102418] rounded-2xl p-12 text-center border border-gray-100 dark:border-[#1A3626]">
                <Building className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No active developments listed yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  New project releases from {developer.name} will be displayed here once launched.
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

        {/* Tab 2 Content: Developer Representatives */}
        {activeTab === "team" && (
          <div>
            {teamList.length === 0 ? (
              <div className="bg-white dark:bg-[#102418] rounded-2xl p-12 text-center border border-gray-100 dark:border-[#1A3626]">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No sales representatives listed currently
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Contact the developer directly using the details above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamList.map((ag) => (
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
                      {ag.position || "Sales Representative"}
                    </p>

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
