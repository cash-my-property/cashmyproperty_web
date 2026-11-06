"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building, ChevronDown, LayoutGrid, List, Loader2, RefreshCw } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import HeroSearchWidget from "@/components/search/HeroSearchWidget";
import HeroBackground from "@/components/search/HeroBackground";
import PropertyGridCard from "@/components/listings/PropertyGridCard";
import PropertyListCard from "@/components/listings/PropertyListCard";
import { rtoService, rtoCardToGridItem, type RtoCard, type RtoSort } from "@/services/rtoService";

// Real Time Offers list — CMP Connect public RTO API (live / upcoming / results).
// Tab, search aur sort URL mein rehte hain (shareable, back button kaam karta hai).

type Tab = "live" | "upcoming" | "results";
const TABS: Tab[] = ["live", "upcoming", "results"];
const SORTS: RtoSort[] = ["ending_soon", "newest", "price_asc", "price_desc", "popular"];
const PAGE_SIZE = 12;

interface TabState {
  items: RtoCard[];
  page: number;
  pages: number;
  total: number;
  loaded: boolean;
}
const emptyTab = (): TabState => ({ items: [], page: 0, pages: 0, total: 0, loaded: false });

const fetchTab = (tab: Tab, params: { search?: string; sort?: RtoSort; page: number }) => {
  const q = { ...params, limit: PAGE_SIZE };
  return tab === "live" ? rtoService.getLive(q) : tab === "upcoming" ? rtoService.getUpcoming(q) : rtoService.getResults(q);
};

export default function AuctionsListingPage() {
  const { dict, locale } = useDictionary();
  const t = dict.rto;
  const content = dict.home;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") as Tab | null;
  const search = (searchParams.get("search") || "").trim();
  const urlSort = searchParams.get("sort") as RtoSort | null;
  const sort: RtoSort = urlSort && SORTS.includes(urlSort) ? urlSort : "ending_soon";
  const [tab, setTab] = useState<Tab>(urlTab && TABS.includes(urlTab) ? urlTab : "live");

  const [data, setData] = useState<Record<Tab, TabState>>({ live: emptyTab(), upcoming: emptyTab(), results: emptyTab() });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const autoPickedRef = useRef(false);

  const updateUrl = useCallback(
    (next: { tab?: Tab; search?: string; sort?: RtoSort }) => {
      const params = new URLSearchParams(searchParams.toString());
      const set = (k: string, v?: string, def?: string) => (v && v !== def ? params.set(k, v) : params.delete(k));
      if ("tab" in next) set("tab", next.tab, "live");
      if ("search" in next) set("search", next.search);
      if ("sort" in next) set("sort", next.sort, "ending_soon");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Search/sort badle to teeno tabs ka page 1 ek saath (counts tabs pe dikhte hain)
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const results = await Promise.all(TABS.map((tb) => fetchTab(tb, { search: search || undefined, sort, page: 1 })));
      const next = {} as Record<Tab, TabState>;
      TABS.forEach((tb, i) => {
        const { data: items, pagination } = results[i];
        next[tb] = { items, page: 1, pages: pagination?.pages || 1, total: pagination?.total ?? items.length, loaded: true };
      });
      setData(next);

      // Pehli baar (URL mein tab nahi) live khaali ho to jis tab mein data hai wahan le jao
      if (!autoPickedRef.current && !urlTab && next.live.total === 0) {
        const firstWithData = TABS.find((tb) => next[tb].total > 0);
        if (firstWithData) setTab(firstWithData);
      }
      autoPickedRef.current = true;
    } catch (err) {
      console.error("Failed to load Real Time Offers", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [search, sort, urlTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- search/sort badalne pe data fetch
    loadAll();
  }, [loadAll]);

  const loadMore = async () => {
    const current = data[tab];
    if (isFetchingMore || current.page >= current.pages) return;
    setIsFetchingMore(true);
    try {
      const { data: items, pagination } = await fetchTab(tab, { search: search || undefined, sort, page: current.page + 1 });
      setData((prev) => {
        const seen = new Set(prev[tab].items.map((i) => i.id));
        return {
          ...prev,
          [tab]: {
            ...prev[tab],
            items: [...prev[tab].items, ...items.filter((i) => !seen.has(i.id))],
            page: pagination?.page || current.page + 1,
            pages: pagination?.pages || current.pages,
          },
        };
      });
    } catch (err) {
      console.error("Failed to load more offers", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const selectTab = (tb: Tab) => {
    setTab(tb);
    updateUrl({ tab: tb });
  };

  const current = data[tab];
  const items = current.items.map(rtoCardToGridItem);
  const hasMore = current.page < current.pages;
  const emptyText = tab === "live" ? t.list.emptyLive : tab === "upcoming" ? t.list.emptyUpcoming : t.list.emptyResults;

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      {/* HERO BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-6 lg:px-12 flex flex-col items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 text-center w-full max-w-5xl mx-auto flex flex-col items-center mt-8">
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.hero.headline.split("\n").map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">{content.hero.subheadline}</p>

          <HeroSearchWidget
            initialTab="BUY"
            showTabs={false}
            onSearch={(filters) => updateUrl({ search: (filters.query || "").trim() })}
          />
        </div>
      </section>

      {/* REALTIME OFFERS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="mb-8">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {dict.auctions?.pageTitle || "Realtime Offers"}
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">
            {dict.auctions?.pageSubtitle || "Explore live competitive offers with transparent real-time updates and verified sellers."}
          </p>
        </div>

        {/* Tabs + sort + view */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div role="tablist" aria-label={dict.auctions?.pageTitle || "Realtime Offers"} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none min-w-0">
            {TABS.map((tb) => {
              const active = tab === tb;
              return (
                <button
                  key={tb}
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(tb)}
                  className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-2 ${
                    active
                      ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md"
                      : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321] border border-gray-100 dark:border-[#1A3626]"
                  }`}
                >
                  {tb === "live" && <span className={`w-2 h-2 rounded-full ${active ? "bg-[#5CD284]" : "bg-emerald-500"} animate-pulse`} />}
                  {t.tabs[tb]}
                  {data[tb].loaded && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-gray-100 dark:bg-[#163321]"}`}>{data[tb].total}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
              <span className="sr-only sm:not-sr-only">{t.sort.label}</span>
              <select
                value={sort}
                onChange={(e) => updateUrl({ sort: e.target.value as RtoSort })}
                className="bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-full px-4 py-2 text-[13px] font-bold text-gray-800 dark:text-gray-100 cursor-pointer outline-none focus:border-[#5CD284]"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>{t.sort[s]}</option>
                ))}
              </select>
            </label>

            <div className="hidden sm:flex items-center bg-white dark:bg-[#102418] p-1 rounded-full border border-gray-100 dark:border-[#1A3626] shadow-sm">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-label={mode === "grid" ? "Grid view" : "List view"}
                  aria-pressed={viewMode === mode}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    viewMode === mode ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {mode === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-[#102418] rounded-2xl p-1.5 border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse flex flex-col gap-4">
                <div className="bg-gray-200 dark:bg-[#163321] rounded-xl h-[240px] w-full" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
            <p className="text-gray-700 dark:text-gray-200 font-semibold mb-4">{t.list.loadError}</p>
            <button onClick={loadAll} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm cursor-pointer">
              <RefreshCw className="w-4 h-4" /> {t.list.retry}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] p-8">
            <Building className="w-12 h-12 text-gray-300 dark:text-[#1A3626] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{emptyText}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">{t.list.emptyHint}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, idx) => (
              <PropertyGridCard key={item.id} item={item} locale={locale} priority={idx === 0} isAuction href={`/${locale}/auctions/${item.id}`} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
            {items.map((item, idx) => (
              <PropertyListCard key={item.id} item={item} locale={locale} priority={idx === 0} isAuction href={`/${locale}/auctions/${item.id}`} />
            ))}
          </div>
        )}

        {!isLoading && !error && hasMore && (
          <div className="flex flex-col items-center justify-center my-12 gap-3">
            <button
              onClick={loadMore}
              disabled={isFetchingMore}
              className="px-8 py-3.5 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{dict.auctions?.loadingMore || "Loading More Offers..."}</span>
                </>
              ) : (
                <>
                  <span>{dict.auctions?.loadMore || "Load More Offers"}</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {(dict.auctions?.showingPage || "Showing page {page} of {totalPages}")
                .replace("{page}", String(current.page))
                .replace("{totalPages}", String(current.pages))}
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
