"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  BookOpen, 
  Sparkles, 
  X,
  User
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { formatBlogDate } from "@/utils/formatters";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: {
    url?: string | null;
    public_id?: string | null;
  } | null;
  category?: string | null;
  tags?: string[];
  publishedAt?: string;
  readTimeMinutes?: number;
  viewsCount?: number;
  authorName?: string | null;
}

interface CategoryCount {
  category: string;
  count: number;
}

export default function BlogPage() {
  const { dict, locale } = useDictionary();
  const blogDict = dict.blog || {};
  const mainDict = blogDict.main || {};
  const heroDict = blogDict.hero || {};

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';

  // 1. Fetch Categories
  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const res = await axios.get(`${API_URL}/public/blogs/categories`);
        if (isMounted && res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load blog categories:", err);
      }
    }
    fetchCategories();
    return () => { isMounted = false; };
  }, [API_URL]);

  // 2. Fetch Blog Posts
  const fetchBlogs = useCallback(async (targetPage: number = 1) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(targetPage));
      queryParams.append("limit", "12");

      if (selectedCategory) {
        queryParams.append("category", selectedCategory);
      }
      if (activeSearch) {
        queryParams.append("search", activeSearch);
      }

      const res = await axios.get(`${API_URL}/public/blogs?${queryParams.toString()}`);
      const resData = res.data;
      const blogList: BlogItem[] = resData?.data || [];
      const pagination = resData?.pagination || {};

      setBlogs(blogList);
      setPage(pagination.page || targetPage);
      setTotalPages(pagination.totalPages || 1);
      setTotalBlogs(pagination.total || blogList.length);
    } catch (err) {
      console.error("Failed to fetch blogs list:", err);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, selectedCategory, activeSearch]);

  useEffect(() => {
    fetchBlogs(page);
  }, [fetchBlogs, page]);

  // Search Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
  };

  const handleSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory(null);
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
  };

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER SECTION (Aligned with Platform Theme) */}
      <section className="relative w-full pt-28 pb-16 sm:pt-36 sm:pb-20 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1A3626] via-[#102418] to-[#091711] dark:from-[#091711] dark:via-[#0c2016] dark:to-[#091711]">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[320px] sm:w-[450px] h-[320px] sm:h-[450px] bg-[#5CD284]/15 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] bg-[#c9a14b]/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.18em] text-[11px] sm:text-xs mb-5 uppercase bg-white/10 dark:bg-white/5 px-4 sm:px-5 py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
            <span>{heroDict.tagline || "Insights & News"}</span>
          </div>

          {/* Main Hero Heading */}
          <h1 
            className="text-white text-3xl sm:text-5xl lg:text-[56px] font-extrabold mb-4 sm:mb-6 leading-[1.14] tracking-tight max-w-3xl"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {heroDict.title?.replace('\n', ' ') || "Real Estate Trends & Market Insights"}
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-light mb-8 sm:mb-10 px-2">
            {heroDict.description || "Stay up-to-date with the latest market analysis, platform updates, and real estate news in the UAE."}
          </p>

          {/* Hero Search Bar (Full Mobile Responsive) */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl px-2">
            <div className="relative flex items-center bg-white/95 dark:bg-[#102418]/95 backdrop-blur-xl rounded-2xl p-1.5 sm:p-2 border border-white/20 dark:border-[#1A3626] shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
              <div className="pl-3 sm:pl-4 pr-2 text-gray-400">
                <Search className="w-4 sm:w-5 h-4 sm:h-5 text-[#1A3626] dark:text-[#5CD284]" />
              </div>
              
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={mainDict.searchPlaceholder || "Search articles by title, topic or tag..."}
                className="flex-1 bg-transparent py-2 sm:py-2.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none min-w-0"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#1A3626] hover:bg-[#163321] dark:bg-[#5CD284] dark:hover:bg-[#4ab872] text-white dark:text-[#0A1C12] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* BLOG MAIN CONTENT SECTION */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-12 w-full max-w-7xl mx-auto flex-1">
        
        {/* Category Horizontal Filter Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 px-1 mb-8 scrollbar-none overscroll-contain">
          {/* "All Topics" Pill */}
          <button
            onClick={() => handleSelectCategory(null)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 cursor-pointer ${
              selectedCategory === null
                ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12] shadow-md ring-2 ring-[#1A3626]/20 dark:ring-[#5CD284]/30"
                : "bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626] hover:border-[#5CD284]/50 hover:bg-gray-50 dark:hover:bg-[#163321]"
            }`}
          >
            {mainDict.allCategories || "All Topics"}
          </button>

          {/* Dynamic Categories Chips */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => handleSelectCategory(cat.category)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#0A1C12] shadow-md ring-2 ring-[#1A3626]/20 dark:ring-[#5CD284]/30"
                    : "bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626] hover:border-[#5CD284]/50 hover:bg-gray-50 dark:hover:bg-[#163321]"
                }`}
              >
                <span>{cat.category}</span>
                {cat.count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0A1C12]"
                        : "bg-gray-100 dark:bg-[#163321] text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filters Tag & Count Indicator */}
        {(selectedCategory || activeSearch) && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-3.5 sm:p-4 bg-white dark:bg-[#102418] rounded-2xl border border-gray-200 dark:border-[#1A3626]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Filtered by:</span>
              
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A3626]/10 dark:bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] text-xs font-bold rounded-lg border border-[#1A3626]/20 dark:border-[#5CD284]/30">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {activeSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A3626]/10 dark:bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] text-xs font-bold rounded-lg border border-[#1A3626]/20 dark:border-[#5CD284]/30">
                  Search: &quot;{activeSearch}&quot;
                  <button onClick={handleClearSearch} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-[#1A3626] dark:text-[#c9a14b] hover:underline cursor-pointer"
            >
              {mainDict.clearFilters || "Clear Filters"}
            </button>
          </div>
        )}

        {/* POSTS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col bg-white dark:bg-[#102418] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#1A3626] shadow-sm animate-pulse"
              >
                <div className="w-full h-52 sm:h-56 bg-gray-200 dark:bg-[#163321]" />
                <div className="p-6 sm:p-7 flex flex-col flex-1 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-1/3" />
                  <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded w-4/5" />
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-2/3" />
                  <div className="pt-4 border-t border-gray-100 dark:border-[#1A3626] flex justify-between items-center mt-auto">
                    <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white dark:bg-[#102418] rounded-3xl border border-gray-200/80 dark:border-[#1A3626] p-6 sm:p-10 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-[#5CD284]/15 text-[#5CD284] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {mainDict.noBlogsFound || "No articles found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {mainDict.noBlogsDesc || "We couldn't find any articles matching your search criteria. Try adjusting your filters or search terms."}
            </p>
            {(selectedCategory || activeSearch) && (
              <button
                onClick={handleClearAllFilters}
                className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                {mainDict.clearFilters || "Clear all filters"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogs.map((post) => {
              const coverUrl = post.coverImage?.url || "/property-placeholder.svg";
              const readTime = post.readTimeMinutes ? `${post.readTimeMinutes} ${mainDict.minRead || "min read"}` : `4 ${mainDict.minRead || "min read"}`;
              const formattedDate = formatBlogDate(post.publishedAt, locale);

              return (
                <Link
                  key={post._id || post.slug}
                  href={`/${locale}/blog/${post.slug || post._id}`}
                  className="group flex flex-col bg-white dark:bg-[#102418] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-gray-200/80 dark:border-[#1A3626] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:hover:border-[#5CD284]/40 transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="w-full h-52 sm:h-56 bg-gray-900 relative overflow-hidden">
                    <Image
                      src={coverUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {post.category && (
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="text-[10.5px] font-extrabold tracking-wider uppercase text-[#0A1C12] bg-[#5CD284] backdrop-blur-md px-3 py-1 rounded-full shadow-md">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Content Area */}
                  <div className="p-5 sm:p-7 flex flex-col flex-1">
                    {/* Metadata Row */}
                    <div className="flex items-center justify-between text-[11.5px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#5CD284]" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#5CD284]" />
                          {readTime}
                        </span>
                        {typeof post.viewsCount === 'number' && post.viewsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            {post.viewsCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 
                      className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors leading-snug line-clamp-2"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    {/* Bottom CTA Row */}
                    <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#1A3626] dark:text-[#5CD284] group-hover:gap-2.5 transition-all mt-auto pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                      <span className="flex items-center gap-1.5">
                        {mainDict.readMore || "Read Full Article"}
                        <ArrowRight className="w-3.5 h-3.5 text-[#5CD284]" />
                      </span>
                      {post.authorName && !["super admin", "admin"].includes(post.authorName.trim().toLowerCase()) && (
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.authorName}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-200 dark:border-[#1A3626] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Showing page <strong className="text-gray-900 dark:text-white">{page}</strong> of <strong className="text-gray-900 dark:text-white">{totalPages}</strong> ({totalBlogs} articles)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                disabled={page <= 1 || isLoading}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  if (
                    pNum === 1 ||
                    pNum === totalPages ||
                    (pNum >= page - 1 && pNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => {
                          setPage(pNum);
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          page === pNum
                            ? "bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12]"
                            : "bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  if (pNum === page - 2 || pNum === page + 2) {
                    return <span key={pNum} className="px-1 text-gray-400 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                disabled={page >= totalPages || isLoading}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#102418] text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </section>

    </main>
  );
}
