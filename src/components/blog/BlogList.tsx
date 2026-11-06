"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Loader2, RefreshCw, Search, X } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import HeroBackground from "@/components/search/HeroBackground";
import connectPublicService, { type PublicBlogCard, type PublicPagination } from "@/services/connectPublicService";
import { getOptimizedImageUrl } from "@/utils/imageUrl";

// CMP Connect GET /blogs + /blogs/categories (backend 3a443ea). search + category URL mein.
const PAGE_SIZE = 12;

export const formatBlogDay = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeZone: "Asia/Dubai" });

export default function BlogList() {
  const { dict, locale } = useDictionary();
  const t = dict.blogPage;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") || "").trim();
  const category = (searchParams.get("category") || "").trim();

  const [query, setQuery] = useState(search);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [items, setItems] = useState<PublicBlogCard[]>([]);
  const [pagination, setPagination] = useState<PublicPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(false);

  const setUrl = (next: { search?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) (v ? params.set(k, v) : params.delete(k));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    connectPublicService.getBlogCategories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setError(false);
    setIsLoading(true);
    try {
      const res = await connectPublicService.getBlogs({ search: search || undefined, category: category || undefined, page: 1, limit: PAGE_SIZE });
      setItems(res.data || []);
      setPagination(res.pagination);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- search/category badalne pe data fetch
    load();
  }, [load]);

  const loadMore = async () => {
    if (!pagination || pagination.page >= pagination.pages || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const res = await connectPublicService.getBlogs({ search: search || undefined, category: category || undefined, page: pagination.page + 1, limit: PAGE_SIZE });
      setItems((prev) => [...prev, ...(res.data || []).filter((b) => !prev.some((p) => p.slug === b.slug))]);
      setPagination(res.pagination);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
      active
        ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626]"
        : "bg-white dark:bg-[#102418] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-[#1A3626] hover:bg-gray-100 dark:hover:bg-[#163321]"
    }`;

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen transition-colors">
      <section className="relative w-full pt-32 sm:pt-40 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <span className="text-[#5CD284] font-bold tracking-widest text-[12px] uppercase mb-3 bg-[#5CD284]/15 px-4 py-1.5 rounded-full border border-[#5CD284]/30 backdrop-blur-md">{t.badge}</span>
          <h1 className="text-white text-3xl sm:text-5xl font-bold mb-4 tracking-tight drop-shadow-md" style={{ fontFamily: "var(--font-playfair), serif" }}>{t.title}</h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-xl mb-8 font-light">{t.subtitle}</p>
          <form
            onSubmit={(e) => { e.preventDefault(); setUrl({ search: query.trim() }); }}
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
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button onClick={() => setUrl({ category: "" })} className={chip(!category)}>{t.all}</button>
            {categories.map((c) => (
              <button key={c.name} onClick={() => setUrl({ category: c.name })} className={chip(category.toLowerCase() === c.name.toLowerCase())}>
                {c.name} <span className="opacity-60">({c.count})</span>
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[360px] bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] animate-pulse" />
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
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((b) => (
              <BlogCard key={b.slug} blog={b} locale={locale} readMore={t.readMore} />
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

export function BlogCard({ blog, locale, readMore }: { blog: PublicBlogCard; locale: string; readMore: string }) {
  return (
    <Link
      href={`/${locale}/blog/${blog.slug}`}
      className="group bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm hover:shadow-md hover:border-[#5CD284]/40 transition-all overflow-hidden flex flex-col"
    >
      <div className="relative h-[190px] bg-gray-100 dark:bg-[#163321]">
        {blog.coverImage ? (
          <Image src={getOptimizedImageUrl(blog.coverImage)} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-300" /></div>
        )}
        {blog.category && (
          <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-black/55 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">{blog.category}</span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] font-semibold text-gray-400 mb-1.5">{formatBlogDay(blog.publishedAt, locale)}{blog.author ? ` · ${blog.author}` : ""}</p>
        <h3 className="font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-[#5CD284] transition-colors">{blog.title}</h3>
        {blog.excerpt && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{blog.excerpt}</p>}
        <span className="mt-auto text-xs font-bold text-[#1A3626] dark:text-[#5CD284] flex items-center gap-1">
          {readMore} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}
