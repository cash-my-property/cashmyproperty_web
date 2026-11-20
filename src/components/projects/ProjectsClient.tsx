"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import HeroBackground from "@/components/search/HeroBackground";
import ProjectCard from "@/components/projects/ProjectCard";
import { formatPropertyType } from "@/utils/formatters";
import connectPublicService, {
  type PublicPagination,
  type PublicProjectCard,
  type PublicProjectOptions,
  type PublicProjectQuery,
} from "@/services/connectPublicService";

// CMP Connect GET /projects (+ /projects/options). Saare filters URL mein (share / back button).
const PAGE_SIZE = 12;
type FilterKey = "q" | "stage" | "type" | "beds" | "priceMin" | "priceMax" | "developerId" | "sort";
const BEDS = ["0", "1", "2", "3", "4", "5"];

export default function ProjectsClient() {
  const { dict, locale } = useDictionary();
  const t = dict.projectsPage;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const get = (k: FilterKey) => (searchParams.get(k) || "").trim();

  const q = get("q"), stage = get("stage"), type = get("type"), beds = get("beds");
  const priceMin = get("priceMin"), priceMax = get("priceMax"), developerId = get("developerId");
  const sort = (get("sort") || "featured") as NonNullable<PublicProjectQuery["sort"]>;

  const [query, setQuery] = useState(q);
  const [minDraft, setMinDraft] = useState(priceMin);
  const [maxDraft, setMaxDraft] = useState(priceMax);
  const [options, setOptions] = useState<PublicProjectOptions | null>(null);
  const [items, setItems] = useState<PublicProjectCard[]>([]);
  const [pagination, setPagination] = useState<PublicPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    connectPublicService.getProjectOptions().then(setOptions).catch(() => setOptions(null));
  }, []);

  const setUrl = (next: Partial<Record<FilterKey, string>>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "sort" && v === "featured")) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const params = useCallback(
    (page: number): PublicProjectQuery => ({
      ...(q && { q }),
      ...(stage && { stage }),
      ...(type && { type }),
      ...(beds !== "" && { beds }),
      ...(priceMin && { priceMin }),
      ...(priceMax && { priceMax }),
      ...(developerId && { developerId }),
      sort,
      page,
      limit: PAGE_SIZE,
    }),
    [q, stage, type, beds, priceMin, priceMax, developerId, sort]
  );

  const load = useCallback(async () => {
    setError(false);
    setIsLoading(true);
    try {
      const res = await connectPublicService.getProjects(params(1));
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
      const res = await connectPublicService.getProjects(params(pagination.page + 1));
      setItems((prev) => [...prev, ...(res.data || []).filter((d) => !prev.some((p) => p.id === d.id))]);
      setPagination(res.pagination);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const stages = ["ALL", ...(options?.stages || ["Off-plan", "Under Construction", "Ready"])];
  const kinds = options?.unitKinds || ["Apartment", "Townhouse", "Villa", "Penthouse", "Duplex", "Plot"];
  const hasFilters = !!(q || stage || type || beds || priceMin || priceMax || developerId);
  const selectCls =
    "w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-sm font-semibold text-gray-800 dark:text-gray-100 outline-none focus:border-[#5CD284] cursor-pointer";

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors">
      <section className="relative z-30 w-full pt-32 sm:pt-40 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-x-clip">
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
              setUrl({ q: query.trim() });
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
                <button type="button" aria-label="Clear" onClick={() => { setQuery(""); setUrl({ q: "" }); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
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

      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
        {/* Stage tabs + count + filters toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label={t.title} className="flex items-center gap-2 overflow-x-auto scrollbar-none min-w-0">
            {stages.map((s) => {
              const active = (s === "ALL" && !stage) || s === stage;
              return (
                <button
                  key={s}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setUrl({ stage: s === "ALL" ? "" : s })}
                  className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    active
                      ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626]"
                      : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-[#1A3626] hover:bg-gray-100 dark:hover:bg-[#163321]"
                  }`}
                >
                  {(t.stages as Record<string, string>)[s] || s}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            {pagination && <p className="text-sm font-semibold text-gray-500">{t.found.replace("{count}", String(pagination.total))}</p>}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-sm font-bold text-gray-800 dark:text-gray-100 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" /> {t.sort} &amp; {t.type}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 bg-white dark:bg-[#102418] p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626]">
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 min-w-0">
              {t.type}
              <select value={type} onChange={(e) => setUrl({ type: e.target.value })} className={selectCls}>
                <option value="">{t.anyType}</option>
                {kinds.map((k) => <option key={k} value={k}>{formatPropertyType(k.toUpperCase(), locale)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 min-w-0">
              {t.beds}
              <select value={beds} onChange={(e) => setUrl({ beds: e.target.value })} className={selectCls}>
                <option value="">{t.anyBeds}</option>
                {BEDS.map((b) => <option key={b} value={b}>{b === "0" ? t.studio : b}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 min-w-0">
              {t.developer}
              <select value={developerId} onChange={(e) => setUrl({ developerId: e.target.value })} className={selectCls}>
                <option value="">{t.anyDeveloper}</option>
                {(options?.developers || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 min-w-0">
              {t.sort}
              <select value={sort} onChange={(e) => setUrl({ sort: e.target.value })} className={selectCls}>
                {(options?.sorts?.map((s) => s.value) || ["featured", "price_asc", "price_desc", "handover"]).map((s) => (
                  <option key={s} value={s}>{(t.sorts as Record<string, string>)[s] || s}</option>
                ))}
              </select>
            </label>
            <form
              className="col-span-2 flex items-end gap-2 min-w-0"
              onSubmit={(e) => {
                e.preventDefault();
                setUrl({ priceMin: minDraft.replace(/\D/g, ""), priceMax: maxDraft.replace(/\D/g, "") });
              }}
            >
              <label className="flex-1 flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 min-w-0">
                {t.priceMin}
                <input inputMode="numeric" value={minDraft} onChange={(e) => setMinDraft(e.target.value)} className={selectCls} />
              </label>
              <label className="flex-1 flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 min-w-0">
                {t.priceMax}
                <input inputMode="numeric" value={maxDraft} onChange={(e) => setMaxDraft(e.target.value)} className={selectCls} />
              </label>
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] text-sm font-bold cursor-pointer">
                {t.apply}
              </button>
            </form>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery(""); setMinDraft(""); setMaxDraft("");
                  router.replace(pathname, { scroll: false });
                }}
                className="col-span-2 lg:col-span-6 justify-self-start text-sm font-bold text-rose-500 hover:underline cursor-pointer"
              >
                {t.clear}
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[400px] bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] animate-pulse" />
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
            {items.map((p, i) => <ProjectCard key={p.id} project={p} priority={i === 0} />)}
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
