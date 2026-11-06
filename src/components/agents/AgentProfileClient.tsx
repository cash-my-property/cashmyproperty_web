"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Tag,
  Bed,
  Square
} from "lucide-react";
import Dirham from "@/components/Dirham";
import AgentContactButtons from "@/components/agents/AgentContactButtons";
import { useDictionary } from "@/components/DictionaryProvider";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import connectPublicService, { PublicAgent, PublicTrackRecord, PublicListingCard } from "@/services/connectPublicService";

interface AgentProfileClientProps {
  id: string;
  initialData?: PublicAgent | null;
  locale: string;
}

export default function AgentProfileClient({ id, initialData, locale }: AgentProfileClientProps) {
  const { dict } = useDictionary();
  const ac = dict.agentContact;
  const [agent, setAgent] = useState<PublicAgent | null>(initialData || null);
  const [activeTab, setActiveTab] = useState<"listings" | "trackRecord">("listings");
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  // Tab 1: Agent Active Listings
  const [listings, setListings] = useState<PublicListingCard[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState<boolean>(false);

  // Tab 2: Track Record
  const [trackRecord, setTrackRecord] = useState<PublicTrackRecord[]>([]);
  const [trackSummary, setTrackSummary] = useState<{ sold: number; rented: number; soldValue: number } | null>(null);
  const [isTrackLoading, setIsTrackLoading] = useState<boolean>(false);
  const [trackOutcome, setTrackOutcome] = useState<"ALL" | "SOLD" | "RENTED">("ALL");

  // Fetch Agent Info if not provided
  useEffect(() => {
    if (initialData) {
      setAgent(initialData);
      setIsLoading(false);
      return;
    }

    const fetchAgent = async () => {
      try {
        setIsLoading(true);
        const data = await connectPublicService.getAgent(id);
        if (data) {
          setAgent(data);
        }
      } catch (err) {
        console.error("Error loading agent:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgent();
  }, [id, initialData]);

  // Fetch Active Listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsListingsLoading(true);
        const res = await connectPublicService.getListings({ agentId: id, limit: 12 });
        setListings(res?.data || []);
      } catch (err) {
        console.error("Error loading agent listings:", err);
      } finally {
        setIsListingsLoading(false);
      }
    };
    fetchListings();
  }, [id]);

  // Fetch Track Record
  useEffect(() => {
    if (activeTab !== "trackRecord") return;
    const fetchTrack = async () => {
      try {
        setIsTrackLoading(true);
        const outcomeParam = trackOutcome === "ALL" ? undefined : trackOutcome;
        const res = await connectPublicService.getAgentTrackRecord(id, { outcome: outcomeParam, limit: 20 });
        if (res) {
          setTrackRecord(res.data || []);
          if (res.summary) setTrackSummary(res.summary);
        }
      } catch (err) {
        console.error("Error loading track record:", err);
      } finally {
        setIsTrackLoading(false);
      }
    };
    fetchTrack();
  }, [id, activeTab, trackOutcome]);

  if (isLoading && !agent) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" />
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] pt-32 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Agent Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">This agent profile could not be found or is no longer active.</p>
        <Link href={`/${locale}/agents`} className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] font-bold rounded-xl text-sm">
          Back to Agents Directory
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors pt-28 sm:pt-32 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/agents`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Agents Directory
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-[#1A3626] shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#163321] shrink-0 border border-gray-200 dark:border-[#1A3626]">
                {agent.photo ? (
                  <Image src={agent.photo} alt={agent.name} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[#1A3626] dark:text-[#5CD284]">
                    {agent.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {agent.name}
                  </h1>
                  {agent.brnVerified && (
                    <span title="DLD BRN Verified">
                      <ShieldCheck className="w-5 h-5 text-[#5CD284] shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {agent.position || "Licensed Property Broker"}
                </p>

                {agent.company && (
                  <Link
                    href={`/${locale}/${agent.company.type === "DEVELOPER" ? "developers" : "agencies"}/${agent.company.id || ""}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A3626] dark:text-[#5CD284] hover:underline"
                  >
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span>{agent.company.name}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Stats — backend 4832d23: listings { forSale, forRent } + deals { sold, rented, totalValue } */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              {[
                { label: ac.forSale, value: agent.listings?.forSale ?? agent.liveListings ?? 0, cls: "text-gray-900 dark:text-white" },
                { label: ac.forRent, value: agent.listings?.forRent ?? 0, cls: "text-gray-900 dark:text-white" },
                { label: ac.sold, value: agent.deals?.sold ?? agent.closedDeals ?? 0, cls: "text-[#1A3626] dark:text-[#5CD284]" },
                { label: ac.rented, value: agent.deals?.rented ?? 0, cls: "text-[#1A3626] dark:text-[#c9a14b]" },
              ].map((st) => (
                <div key={st.label} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] text-center min-w-[96px]">
                  <span className={`block text-xl font-extrabold ${st.cls}`}>{st.value}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">{st.label}</span>
                </div>
              ))}
              {agent.deals && agent.deals.totalValue > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#1A3626] text-white text-center col-span-2 sm:col-span-4">
                  <span className="block text-lg font-extrabold flex items-center justify-center gap-1">
                    <Dirham /> {agent.deals.totalValue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-white/70 font-semibold uppercase">{ac.dealsValue}</span>
                </div>
              )}
              {agent.brn && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] text-center col-span-2 sm:col-span-4">
                  <span className="block text-base font-extrabold font-mono text-gray-900 dark:text-white">{agent.brn}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">BRN Number</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact (backend 4832d23) — alag row taake mobile pe avatar ke saath overflow na ho */}
          {agent.contact && (agent.contact.phone || agent.contact.whatsapp || agent.contact.email) && (
            <div className="mt-6 max-w-xl">
              <AgentContactButtons contact={agent.contact} agentName={agent.name} size="lg" />
            </div>
          )}

          {/* Languages & Nationality row */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center gap-4 text-xs">
            {agent.languages && agent.languages.length > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="text-gray-400 font-semibold">Languages:</span>
                <span>{agent.languages.join(", ")}</span>
              </div>
            )}
            {agent.nationality && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="text-gray-400 font-semibold">Nationality:</span>
                <span>{agent.nationality}</span>
              </div>
            )}
            {agent.experienceSince && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="text-gray-400 font-semibold">Experience:</span>
                <span>Since {agent.experienceSince}</span>
              </div>
            )}
          </div>

          {agent.about && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {agent.about}
              </p>
            </div>
          )}
        </div>

        {/* Tabs: Active Listings vs Track Record */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-[#1A3626] pb-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "listings"
                ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>Active Listings ({listings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trackRecord")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "trackRecord"
                ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>Confirmed Track Record</span>
            {(agent.deals?.closed ?? agent.closedDeals) ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 dark:bg-black/20 font-mono">
                {agent.deals?.closed ?? agent.closedDeals}
              </span>
            ) : null}
          </button>
        </div>

        {/* Tab Content: Active Listings */}
        {activeTab === "listings" && (
          <div>
            {isListingsLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" />
              </div>
            ) : listings.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  This agent does not have any active live listings currently.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((item, idx) => (
                  <PropertyGridCard
                    key={item.ref || item.id || idx}
                    item={item}
                    locale={locale}
                    href={`/${locale}/listings/${item.ref || item.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Track Record */}
        {activeTab === "trackRecord" && (
          <div className="space-y-6">
            {/* Track Record Summary Strip */}
            {trackSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626]">
                <div className="text-center p-2">
                  <span className="block text-2xl font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                    {trackSummary.sold}
                  </span>
                  <span className="text-xs text-gray-500 font-medium uppercase">Properties Sold</span>
                </div>
                <div className="text-center p-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-[#1A3626]">
                  <span className="block text-2xl font-extrabold text-[#1A3626] dark:text-[#c9a14b]">
                    {trackSummary.rented}
                  </span>
                  <span className="text-xs text-gray-500 font-medium uppercase">Properties Rented</span>
                </div>
                <div className="text-center p-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-[#1A3626]">
                  <span className="block text-xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                    <Dirham /> {trackSummary.soldValue?.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium uppercase">Total Deal Volume</span>
                </div>
              </div>
            )}

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(["ALL", "SOLD", "RENTED"] as const).map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setTrackOutcome(outcome)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    trackOutcome === outcome
                      ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12]"
                      : "bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {outcome === "ALL" ? "All Deals" : outcome === "SOLD" ? "Sold" : "Rented"}
                </button>
              ))}
            </div>

            {/* Deals List */}
            {isTrackLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" />
              </div>
            ) : trackRecord.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No confirmed {trackOutcome.toLowerCase()} deals on record for this agent yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackRecord.map((record) => (
                  <div
                    key={record.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {record.property?.coverImage && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={record.property.coverImage}
                            alt={record.property.title || "Property"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              record.outcome === "SOLD"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {record.outcome}
                          </span>
                          {record.date && (
                            <span className="text-[11px] text-gray-400">
                              {new Date(record.date).toLocaleDateString(undefined, {
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {record.property?.title || "Property Deal"}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {record.property?.location || ""}
                        </p>
                      </div>
                    </div>

                    {record.price && (
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-extrabold text-[#1A3626] dark:text-[#5CD284] flex items-center justify-end gap-1">
                          <Dirham /> {record.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Closed Price</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

