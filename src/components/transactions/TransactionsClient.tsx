"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BedDouble, Building2, CalendarDays, Loader2, MapPin, ReceiptText, RefreshCw, Ruler, Search, X } from "lucide-react";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import HeroBackground from "@/components/search/HeroBackground";
import connectPublicService, { type PublicPagination, type PublicTrackRecord } from "@/services/connectPublicService";
import { getOptimizedImageUrl } from "@/utils/imageUrl";
import { formatPropertyType } from "@/utils/formatters";

// CMP Connect GET /transactions (backend 3a443ea): confirmed (CLAIMED) deals. outcome + location URL mein.
const OUTCOMES = ["ALL", "SOLD", "RENTED"] as const;
type Outcome = (typeof OUTCOMES)[number];
const PAGE_SIZE = 12;

export default function TransactionsClient() {
  const { dict, locale } = useDictionary();
  const t = dict.transactionsPage;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlOutcome = (searchParams.get("outcome") || "ALL").toUpperCase() as Outcome;
  const outcome: Outcome = OUTCOMES.includes(urlOutcome) ? urlOutcome : "ALL";
  const location = (searchParams.get("location") || "").trim();

  const [query, setQuery] = useState(location);
  const [items, setItems] = useState<PublicTrackRecord[]>([]);
  const [pagination, setPagination] = useState<PublicPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(false);

  const setUrl = (next: { outcome?: Outcome; location?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if ("outcome" in next) (next.outcome && next.outcome !== "ALL" ? params.set("outcome", next.outcome) : params.delete("outcome"));
    if ("location" in next) (next.location ? params.set("location", next.location) : params.delete("location"));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const params = useCallback(
    (page: number) => ({
      ...(outcome !== "ALL" && { outcome: outcome as "SOLD" | "RENTED" }),
      ...(location && { location }),
      page,
      limit: PAGE_SIZE,
    }),
    [outcome, location]
  );

  const load = useCallback(async () => {
    setError(false);
    setIsLoading(true);
    try {
      const res = await connectPublicService.getTransactions(params(1));
      setItems(res.data || []);
      setPagination(res.pagination);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- filters badalne pe data fetch
    load();
  }, [load]);

  const loadMore = async () => {
    if (!pagination || pagination.page >= pagination.pages || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const res = await connectPublicService.getTransactions(params(pagination.page + 1));
      setItems((prev) => [...prev, ...(res.data || []).filter((d) => !prev.some((p) => p.id === d.id))]);
      setPagination(res.pagination);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeZone: "Asia/Dubai" }) : "";

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors">
      <section className="relative w-full pt-32 sm:pt-40 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <span className="text-[#5CD284] font-bold tracking-widest text-[12px] uppercase mb-3 bg-[#5CD284]/15 px-4 py-1.5 rounded-full border border-[#5CD284]/30 backdrop-blur-md">
            {t.badge}
          </span>
          <h1 className="text-white text-3xl sm:text-5xl font-bold mb-4 tracking-tight drop-shadow-md" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {t.title}
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-xl mb-8 font-light">{t.subtitle}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUrl({ location: query.trim() });
            }}
            className="w-full max-w-2xl bg-white dark:bg-[#102418] rounded-2xl p-2 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex items-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.locationPlaceholder}
                aria-label={t.locationPlaceholder}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
              />
              {query && (
                <button type="button" aria-label="Clear" onClick={() => { setQuery(""); setUrl({ location: "" }); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="px-6 py-3 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer">
              <Search className="w-4 h-4" /> {t.search}
            </button>
          </form>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {OUTCOMES.map((o) => (
              <button
                key={o}
                role="tab"
                aria-selected={outcome === o}
                onClick={() => setUrl({ outcome: o })}
                className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  outcome === o
                    ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626]"
                    : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-[#1A3626] hover:bg-gray-100 dark:hover:bg-[#163321]"
                }`}
              >
                {t.tabs[o]}
              </button>
            ))}
          </div>
          {pagination && <p className="text-sm font-semibold text-gray-500">{t.found.replace("{count}", String(pagination.total))}</p>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[340px] bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626]">
            <p className="text-gray-700 dark:text-gray-200 font-semibold mb-4">{t.loadError}</p>
            <button onClick={load} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm cursor-pointer">
              <RefreshCw className="w-4 h-4" /> {t.retry}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626]">
            <ReceiptText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((d) => {
              const p = d.property || {};
              const sold = d.outcome === "SOLD";
              return (
                <article key={d.id} className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm overflow-hidden flex flex-col">
                  <div className="relative h-[180px] bg-gray-100 dark:bg-[#163321]">
                    {p.coverImage ? (
                      <Image src={getOptimizedImageUrl(p.coverImage)} alt={p.title || ""} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-300" /></div>
                    )}
                    <span className={`absolute top-3 start-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white ${sold ? "bg-[#1A3626]/90" : "bg-[#c9a14b]/95"}`}>
                      {sold ? t.sold : t.rented}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{p.title || p.typeLabel || "—"}</h3>
                      {d.price != null && (
                        <span className="font-extrabold text-[#1A3626] dark:text-[#c9a14b] whitespace-nowrap flex items-baseline gap-1">
                          <Dirham /> {d.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {p.location && (
                      <p title={p.location} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3 line-clamp-1">
                        <MapPin className="w-3 h-3 text-[#5CD284] shrink-0" /> <span className="truncate">{p.location}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      {(p.typeLabel || p.type) && <span>{formatPropertyType(p.type || p.typeLabel, locale)}</span>}
                      {p.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#5CD284]" /> {p.bedrooms}</span>}
                      {p.area != null && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-[#5CD284]" /> {p.area.toLocaleString()} {p.areaUnit || "sqft"}</span>}
                      {d.date && <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-[#5CD284]" /> {fmtDate(d.date)}</span>}
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-[#1A3626] flex items-center justify-between gap-2 text-xs">
                      <span className="text-gray-400 font-semibold">{t.closedBy}</span>
                      <span className="flex items-center gap-2 min-w-0">
                        {d.agent?.id ? (
                          <Link href={`/${locale}/agents/${d.agent.id}`} className="font-bold text-gray-800 dark:text-gray-100 hover:text-[#5CD284] truncate">{d.agent.name}</Link>
                        ) : null}
                        {d.company?.name && (
                          <span className="text-gray-500 dark:text-gray-400 truncate">· {d.company.name}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && !error && pagination && pagination.page < pagination.pages && (
          <div className="flex justify-center">
            <button onClick={loadMore} disabled={isFetchingMore} className="px-8 py-3.5 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer">
              {isFetchingMore && <Loader2 className="w-4 h-4 animate-spin" />} {t.loadMore}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
