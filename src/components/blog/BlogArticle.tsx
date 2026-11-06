"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Tag } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { BlogCard, formatBlogDay } from "@/components/blog/BlogList";
import type { PublicBlogDetail } from "@/services/connectPublicService";
import { getOptimizedImageUrl } from "@/utils/imageUrl";

const BlogContent = dynamic(() => import("@/components/blog/BlogContent"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 rounded bg-gray-200 dark:bg-[#163321]" />)}
    </div>
  ),
});

// GET /blogs/:slug (backend 3a443ea). Data server page se aata hai (SEO); yahan sirf render.
export default function BlogArticle({ blog }: { blog: PublicBlogDetail | null }) {
  const { dict, locale } = useDictionary();
  const t = dict.blogPage;

  if (!blog) {
    return (
      <main className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 px-6 pt-32 pb-16 bg-[#F4F5F7] dark:bg-[#091711]">
        <BookOpen className="w-12 h-12 text-gray-300" />
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{t.notFound}</p>
        <Link href={`/${locale}/blog`} className="text-sm font-bold text-[#1A3626] dark:text-[#c9a14b] underline">{t.back}</Link>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] min-h-screen pt-28 sm:pt-32 pb-20 transition-colors">
      <article className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] mb-6">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t.back}
        </Link>

        {blog.category && (
          <span className="inline-block px-3 py-1 rounded-full bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] text-xs font-bold uppercase tracking-wider mb-4">{blog.category}</span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>{blog.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {formatBlogDay(blog.publishedAt, locale)}
          {blog.author && <> · {t.by} <span className="font-semibold text-gray-700 dark:text-gray-200">{blog.author}</span></>}
        </p>

        {blog.coverImage && (
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-10 bg-gray-100 dark:bg-[#163321]">
            <Image src={getOptimizedImageUrl(blog.coverImage)} alt={blog.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-[#1A3626] shadow-sm">
          {blog.excerpt && <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-medium">{blog.excerpt}</p>}
          <BlogContent html={blog.content || ""} />
          {blog.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              {blog.tags.map((tag) => (
                <Link key={tag} href={`/${locale}/blog?search=${encodeURIComponent(tag)}`} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#163321] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>

      {blog.related?.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.related}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blog.related.map((b) => <BlogCard key={b.slug} blog={b} locale={locale} readMore={t.readMore} />)}
          </div>
        </section>
      )}
    </main>
  );
}
