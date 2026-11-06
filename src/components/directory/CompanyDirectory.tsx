"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Loader2, MapPin, RefreshCw, Search, Users, X } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import DirectoryTabs from "@/components/directory/DirectoryTabs";
import connectPublicService, { type PublicCompanyCard, type PublicPagination } from "@/services/connectPublicService";
import { getOptimizedImageUrl } from "@/utils/imageUrl";

// GET /agencies aur GET /developers (backend 4728f57). Search + sort URL mein (shareable).
const SORTS = ["mostListings", "nameAsc", "newest"] as const;
type Sort = (typeof SORTS)[number];
const PAGE_SIZE = 12;

export default function CompanyDirectory({ type }: { type: "AGENCY" | "DEVELOPER" }) {
  const { dict, locale } = useDictionary();
  const t = dict.directory;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") || "").trim();
  const urlSort = searchParams.get("sort") as Sort | null;
  const sort: Sort = urlSort && SORTS.includes(urlSort) ? urlSort : "mostListings";

  const [query, setQuery] = useState(search);
  const [items, setItems] = useState<PublicCompanyCard[]>([]);
  const [pagination, setPagination] = useState<PublicPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(false);

  const setUrl = (next: { search?: string; sort?: Sort }) => {
    const params = new URLSearchParams(searchParams.toString());
    if ("search" in next) (next.search ? params.set("search", next.search) : params.delete("search"));
    if ("sort" in next) (next.sort && next.sort !== "mostListings" ? params.set("sort", next.sort) : params.delete("sort"));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const load = useCallback(async () => {
    setError(false);
    setIsLoading(true);
    try {
      const res = await connectPublicService.getCompanies(type, { search: search || undefined, sort, page: 1, limit: PAGE_SIZE });
      setItems(res.data || []);
      setPagination(res.pagination);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [type, search, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- search/sort badalne pe data fetch
    load();
  }, [load]);

  const loadMore = async () => {
    if (!pagination || pagination.page >= pagination.pages || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const res = await connectPublicService.getCompanies(type, { search: search || undefined, sort, page: pagination.page + 1, limit: PAGE_SIZE });
      setItems((prev) => [...prev, ...(res.data || []).filter((c) => !prev.some((p) => p.id === c.id))]);
      setPagination(res.pagination);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const isAgency = type === "AGENCY";
  const detailBase = `/${locale}/${isAgency ? "agencies" : "developers"}`;

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors">
      <section className="relative w-full pt-32 sm:pt-36 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A3626] to-[#0A1C12] text-white overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#5CD284]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <DirectoryTabs />
          <h1 className="text-white text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {isAgency ? t.agenciesTitle : t.developersTitle}
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-xl mb-8 font-light">{isAgency ? t.agenciesSubtitle : t.developersSubtitle}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUrl({ search: query.trim() });
            }}
            className="w-full max-w-2xl bg-white dark:bg-[#102418] rounded-2xl p-2 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex items-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
              />
              {query && (
                <button type="button" aria-label="Clear" onClick={() => { setQuery(""); setUrl({ search: "" }); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="px-6 py-3 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold text-sm rounded-xl cursor-pointer">
              {t.search}
            </button>
          </form>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {pagination ? t.found.replace("{count}", String(pagination.total)) : " "}
          </h2>
          <select
            value={sort}
            onChange={(e) => setUrl({ sort: e.target.value as Sort })}
            aria-label="Sort"
            className="bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-2.5 text-[13px] font-bold text-gray-800 dark:text-gray-100 cursor-pointer outline-none focus:border-[#5CD284]"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>{t.sort[s]}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[210px] bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] animate-pulse" />
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
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`${detailBase}/${c.id}`}
                className="group bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626] shadow-sm hover:shadow-md hover:border-[#5CD284]/40 transition-all flex flex-col"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border border-gray-100 dark:border-[#1A3626] shrink-0">
                    {c.logo ? (
                      <Image src={getOptimizedImageUrl(c.logo)} alt={c.name} fill sizes="64px" className="object-contain p-1.5" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#1A3626]">{c.name.slice(0, 2).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-[#5CD284] transition-colors">{c.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      {c.emirate && (<><MapPin className="w-3 h-3 text-[#5CD284]" /> {c.emirate}</>)}
                      {c.orn && <span className="ms-2 font-mono">{t.orn}: {c.orn}</span>}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] text-center border border-gray-100 dark:border-[#1A3626] mb-4">
                  {[
                    { v: c.listings?.total ?? 0, l: t.listings, cls: "text-gray-900 dark:text-white" },
                    { v: c.listings?.forSale ?? 0, l: t.forSale, cls: "text-[#1A3626] dark:text-[#5CD284]" },
                    { v: c.listings?.forRent ?? 0, l: t.forRent, cls: "text-[#1A3626] dark:text-[#c9a14b]" },
                  ].map((s, i) => (
                    <div key={s.l} className={i ? "border-s border-gray-200 dark:border-[#1A3626]" : ""}>
                      <span className={`block text-sm font-extrabold ${s.cls}`}>{s.v}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">{s.l}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-semibold">
                    <Users className="w-4 h-4" /> {c.agents} {t.agents}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#1A3626] dark:text-[#5CD284]">
                    {t.viewProfile} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            ))}
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
