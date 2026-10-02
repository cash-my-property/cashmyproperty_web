"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  Check, 
  Copy, 
  BookOpen, 
  MessageCircle, 
  Loader2 
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";
import axios from "axios";
import { formatBlogDate } from "@/utils/formatters";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

interface BlogDetail {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: {
    url?: string | null;
    public_id?: string | null;
  } | null;
  category?: string | null;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string;
  readTimeMinutes?: number;
  viewsCount?: number;
  authorName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const resolvedParams = use(params);
  const { dict, locale } = useDictionary();
  const slug = resolvedParams.id;

  const blogDict = dict.blog || {};
  const mainDict = blogDict.main || {};

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';

  // Guard to ensure single fetch per slug
  const fetchedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedSlugRef.current === slug) return;
    fetchedSlugRef.current = slug;

    let isMounted = true;

    async function loadBlog() {
      setIsLoading(true);
      setIsNotFound(false);

      try {
        const res = await axios.get(`${API_URL}/public/blogs/${encodeURIComponent(slug)}`);
        const data: BlogDetail = res.data?.data;
        if (!data || !data._id) {
          if (isMounted) setIsNotFound(true);
          return;
        }

        if (isMounted) {
          setBlog(data);

          // Update dynamic document title if in browser
          if (typeof document !== 'undefined') {
            document.title = data.metaTitle || `${data.title} | Cash My Property`;
          }
        }
      } catch (err: any) {
        console.error("Failed to load blog detail:", err);
        if (isMounted) setIsNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBlog();

    return () => {
      isMounted = false;
    };
  }, [slug, API_URL]);

  // Handle Share Copy
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Social Share Handlers
  const handleSocialShare = (platform: "twitter" | "linkedin" | "facebook" | "whatsapp") => {
    if (typeof window === "undefined" || !blog) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog.title);

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] transition-colors min-h-screen pt-32 pb-24">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-full w-32" />
          <div className="h-12 bg-gray-200 dark:bg-[#163321] rounded-2xl w-4/5" />
          <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded w-2/3" />
          <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded-xl w-1/2" />
          <div className="w-full h-[380px] bg-gray-200 dark:bg-[#163321] rounded-3xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-3/4" />
          </div>
        </div>
      </main>
    );
  }

  // Not Found State (404)
  if (isNotFound || !blog) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#F4F5F7] dark:bg-[#091711] transition-colors min-h-[70vh] px-4 py-32">
        <div className="text-center bg-white dark:bg-[#102418] p-8 sm:p-12 rounded-3xl border border-gray-200 dark:border-[#1A3626] shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-[#5CD284]/15 text-[#5CD284] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {mainDict.notFoundTitle || "Article Not Found"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {mainDict.notFoundDesc || "The blog post you're looking for does not exist, has been unpublished, or is temporarily unavailable."}
          </p>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] font-bold text-sm rounded-xl hover:opacity-90 transition-opacity w-full shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{mainDict.backToBlogs || "Back to All Articles"}</span>
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = formatBlogDate(blog.publishedAt, locale);
  const readTimeStr = blog.readTimeMinutes 
    ? `${blog.readTimeMinutes} ${mainDict.minRead || "min read"}` 
    : `4 ${mainDict.minRead || "min read"}`;
  const isSuperAdmin = !blog.authorName || ["super admin", "admin"].includes(blog.authorName.trim().toLowerCase());
  const authorName: string = isSuperAdmin ? "CMP Editorial Team" : (blog.authorName || "CMP Editorial Team");
  const coverUrl = blog.coverImage?.url;

  // Schema.org BlogPosting JSON-LD for Google Crawler Search Engine Optimization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.metaDescription,
    "image": coverUrl ? [coverUrl] : [],
    "datePublished": blog.publishedAt,
    "dateModified": blog.updatedAt || blog.publishedAt,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Cash My Property",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cashmyproperty.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cashmyproperty.com/${locale}/blog/${blog.slug}`
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#F4F5F7] dark:bg-[#091711] transition-colors min-h-screen pt-28 sm:pt-32 pb-24">
      
      {/* Schema.org SEO */}
      <Script
        id="json-ld-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ARTICLE WRAPPER */}
      <article className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb Link */}
        <div className="mb-8">
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1A3626] dark:text-[#5CD284] hover:underline group"
          >
            {locale === "ar" ? (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            )}
            <span>{mainDict.backToBlogs || "Back to All Articles"}</span>
          </Link>
        </div>

        {/* 1. ARTICLE HEADER */}
        <header className="mb-8 space-y-5">
          {/* Category & Read Time Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {blog.category && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#5CD284]/15 dark:text-[#5CD284] border border-[#1A3626]/20 dark:border-[#5CD284]/30">
                {blog.category}
              </span>
            )}

            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5CD284]" />
                {readTimeStr}
              </span>
              {typeof blog.viewsCount === "number" && blog.viewsCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                  {blog.viewsCount} {mainDict.views || "views"}
                </span>
              )}
            </div>
          </div>

          {/* H1 Title */}
          <h1 
            className="text-[30px] sm:text-[44px] lg:text-[50px] font-extrabold text-gray-900 dark:text-white leading-[1.15] tracking-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {blog.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {blog.excerpt && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Author & Published Date Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 pb-2 border-t border-gray-200/80 dark:border-[#1A3626]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1A3626] to-[#5CD284] flex items-center justify-center text-white font-bold text-sm shadow-md">
                {authorName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{authorName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">CMP Market Research & Editorial</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-[#5CD284]" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </header>

        {/* 2. COVER / HERO IMAGE */}
        {coverUrl && (
          <div className="relative w-full aspect-[16/9] max-h-[460px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-[#1A3626] mb-10 bg-gray-900">
            <Image
              src={coverUrl}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* 3. RICH TEXT HTML CONTENT */}
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-gray-100 dark:border-[#1A3626] mb-10">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content || "<p>No content available for this article.</p>" }}
          />

          {/* Tags List */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {blog.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/${locale}/blog?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 hover:bg-[#1A3626] hover:text-white dark:hover:bg-[#5CD284] dark:hover:text-[#0A1C12] transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Social Share Bar */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              {mainDict.shareArticle || "Share this article"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSocialShare("whatsapp")}
                aria-label="Share on WhatsApp"
                className="w-9 h-9 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleSocialShare("twitter")}
                aria-label="Share on X (Twitter)"
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 hover:bg-black hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <TwitterIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSocialShare("linkedin")}
                aria-label="Share on LinkedIn"
                className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <LinkedinIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSocialShare("facebook")}
                aria-label="Share on Facebook"
                className="w-9 h-9 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <FacebookIcon className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyLink}
                aria-label="Copy link"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copied
                    ? "bg-[#5CD284] text-[#0A1C12]"
                    : "bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1A3626]"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>

      </article>

    </main>
  );
}
