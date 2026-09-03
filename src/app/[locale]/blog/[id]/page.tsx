"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Link2,
  ArrowRight
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { content as staticContent } from "@/config/content";

export default function BlogDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const resolvedParams = use(params);
  const { locale } = useDictionary();

  const paramVal = resolvedParams.id;

  // Find post by keyword slug OR numeric id with safe fallback
  const blogPosts = staticContent.blog.main.posts;
  const currentPost = blogPosts.find(p => (p as any).slug === paramVal || String(p.id) === paramVal) || blogPosts[0];

  // Extended mock data for rich article rendering
  const articleData = {
    ...currentPost,
    author: {
      name: "Tariq Al-Mansoor",
      role: "Senior Real Estate Market Analyst",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      bio: "Tariq specializes in Dubai prop-tech innovations, RERA compliance regulations, and UAE institutional real estate investment strategies."
    },
    readTime: "5 min read",
    views: "2,420 views",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
    quote: "The integration of real-time verified buyer offers and instant digital valuation is not just optimizing property transactions in Dubai — it is setting a worldwide benchmark for speed and trust.",
    keyTakeaways: [
      "Real-time offer mechanisms reduce standard closing negotiation times by up to 60%.",
      "RERA-certified broker verification creates a secure, fraud-free ecosystem for buyers and sellers.",
      "Digital undertaking documentation streamlines legal compliance and escrow deposits.",
      "Transparent pricing feeds provide immediate valuation signals across high-demand Dubai districts."
    ]
  };

  const relatedPosts = blogPosts.filter(p => p.id !== currentPost.id);

  // Schema.org BlogPosting JSON-LD for Google Crawler Search Engine Optimization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": currentPost.title,
    "description": currentPost.excerpt,
    "image": [articleData.heroImage],
    "datePublished": currentPost.date,
    "author": {
      "@type": "Person",
      "name": articleData.author.name,
      "jobTitle": articleData.author.role
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
      "@id": `https://cashmyproperty.com/${locale}/blog/${(currentPost as any).slug || currentPost.id}`
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen pt-20 sm:pt-24">
      
      {/* GOOGLE CRAWLER SCHEMA.ORG JSON-LD FOR SEARCH ENGINE OPTIMIZATION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO ARTICLE HEADER */}
      <section className="pt-10 pb-8 px-6 lg:px-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-6">
          
          {/* Category Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b] border border-[#1A3626]/20 dark:border-[#c9a14b]/30">
              {currentPost.category}
            </span>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {articleData.readTime}
            </span>
          </div>

          {/* Article H1 Title (Primary SEO Heading) */}
          <h1 
            className="text-[32px] sm:text-[46px] lg:text-[54px] font-bold text-gray-900 dark:text-white leading-[1.15] tracking-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {currentPost.title}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed">
            {currentPost.excerpt}
          </p>

          {/* Author & Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200/80 dark:border-[#1A3626]">
            
            <div className="flex items-center gap-3">
              <img 
                src={articleData.author.avatar} 
                alt={articleData.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#1A3626] dark:border-[#c9a14b]"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{articleData.author.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{articleData.author.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                {currentPost.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                {articleData.views}
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 2. FEATURED COVER GRAPHIC BANNER */}
      <section className="px-6 lg:px-12 max-w-6xl mx-auto w-full mb-12">
        <div className="relative h-[300px] sm:h-[450px] lg:h-[520px] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-[#1A3626] group">
          <Image 
            src={articleData.heroImage} 
            alt={currentPost.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-medium flex items-center justify-between">
            <span className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              Dubai Real Estate & Prop-Tech Insights
            </span>
          </div>
        </div>
      </section>

      {/* 3. MAIN ARTICLE CONTENT & SIDEBAR (Structured HTML5 <article> & <aside>) */}
      <section className="px-6 lg:px-12 max-w-6xl mx-auto w-full pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Article Body (8 Cols) */}
          <article className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Intro Paragraph */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
              <p>
                The Dubai real estate ecosystem has undergone a remarkable evolution over the past decade. What was once a market reliant heavily on manual listings, protracted negotiations, and fragmented broker communications is now rapidly transitioning towards structured, transparent, and technology-driven transaction platforms.
              </p>
              
              <p className="mt-4">
                At the forefront of this digital shift is Cash My Property (CMP) — a dedicated platform engineered specifically for RERA-certified brokers, buyers, and sellers looking for speed, security, and verified market valuation.
              </p>
            </div>

            {/* Featured Quote Callout Box */}
            <blockquote className="bg-gradient-to-r from-green-50/80 to-amber-50/50 dark:from-[#163321]/60 dark:to-[#091711] p-6 sm:p-8 rounded-3xl border-l-4 border-[#1A3626] dark:border-[#c9a14b] shadow-md my-2">
              <div className="flex items-start gap-4">
                <Sparkles className="w-8 h-8 text-[#1A3626] dark:text-[#c9a14b] shrink-0 mt-1" />
                <div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white italic leading-relaxed" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    "{articleData.quote}"
                  </p>
                  <cite className="block mt-3 text-xs font-bold uppercase tracking-wider text-[#1A3626] dark:text-[#5CD284] not-italic">
                    — {articleData.author.name}, {articleData.author.role}
                  </cite>
                </div>
              </div>
            </blockquote>

            {/* Section 2: Key Takeaways Card */}
            <div className="bg-white dark:bg-[#102418] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-[#1A3626] shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-[#1A3626] dark:text-[#5CD284]" />
                <span>Key Takeaways & Industry Impact</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {articleData.keyTakeaways.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-[#091711] rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                    <span className="w-6 h-6 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Deep Dive Content */}
            <div className="flex flex-col gap-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Why Verification & RERA Compliance Matter More Than Ever
              </h2>

              <p>
                In high-velocity real estate hubs like Dubai, transaction integrity is non-negotiable. Traditional offline offer processes often suffer from unverified bids, phantom buyers, or delayed paperwork. By mandating Broker Registration Number (BRN) verification and structured undertaking documentation, property sellers gain absolute clarity on every inquiry.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                {[
                  { label: "Average Deal Time", val: "< 48 Hours", desc: "For live buyer offers" },
                  { label: "Verified Brokers", val: "100% RERA", desc: "Strict onboarding policy" },
                  { label: "Transaction Safety", val: "Bank-grade", desc: "Escrow & legal documentation" },
                ].map((stat, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] text-center shadow-xs">
                    <span className="text-2xl font-extrabold text-[#1A3626] dark:text-[#c9a14b] block mb-1">{stat.val}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">{stat.label}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 block mt-0.5">{stat.desc}</span>
                  </div>
                ))}
              </div>

              <p>
                As we move into the second half of 2026, the demand for digital offers and real-time fixed price listings will continue to surge. Agents who leverage integrated digital tools will remain steps ahead of traditional brokerages.
              </p>
            </div>

            {/* Social Share Bar */}
            <div className="pt-6 border-t border-gray-200 dark:border-[#1A3626] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Share Article</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="px-4 py-2.5 rounded-full bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-200 hover:bg-[#1A3626] hover:text-white dark:hover:bg-[#c9a14b] dark:hover:text-[#1A3626] transition-all cursor-pointer shadow-xs text-xs font-bold flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Copy Article Link</span>
                </button>
              </div>
            </div>

          </article>

          {/* Sidebar Widgets (4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Author Profile Card */}
            <div className="bg-white dark:bg-[#102418] p-6 rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={articleData.author.avatar} 
                  alt={articleData.author.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#1A3626] dark:border-[#c9a14b]"
                />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{articleData.author.name}</h3>
                  <span className="text-xs text-[#1A3626] dark:text-[#5CD284] font-semibold">{articleData.author.role}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {articleData.author.bio}
              </p>
            </div>

            {/* Newsletter CTA Widget */}
            <div className="bg-gradient-to-br from-[#1A3626] to-[#091711] dark:from-[#102418] dark:to-[#091711] p-6 rounded-3xl border border-gray-100 dark:border-[#1A3626] text-white shadow-xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 dark:bg-[#c9a14b]/20 flex items-center justify-center text-[#5CD284] dark:text-[#c9a14b]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Stay Ahead in Dubai Real Estate
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Subscribe to receive weekly market intelligence and verified listing updates directly to your inbox.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-xs outline-none focus:border-[#5CD284]"
                />
                <button className="w-full py-2.5 bg-[#5CD284] dark:bg-[#c9a14b] text-[#1A3626] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md">
                  Subscribe Now
                </button>
              </div>
            </div>

            {/* Related Articles Widget */}
            <div className="bg-white dark:bg-[#102418] p-6 rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-[#1A3626]">
                Related Articles
              </h3>

              <div className="flex flex-col gap-4">
                {relatedPosts.map((post) => (
                  <Link 
                    key={post.id}
                    href={`/${locale}/blog/${(post as any).slug || post.id}`}
                    className="flex flex-col gap-1 group"
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1A3626] dark:text-[#c9a14b]">
                      {post.category}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {post.date}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </section>

      {/* 4. BOTTOM MORE ARTICLES CAROUSEL/GRID */}
      <section className="py-16 px-6 lg:px-12 bg-white dark:bg-[#102418] border-t border-gray-100 dark:border-[#1A3626]">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A3626] dark:text-[#c9a14b]">Keep Reading</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
                More Insights from CMP Blog
              </h2>
            </div>

            <Link 
              href={`/${locale}/blog`}
              className="text-xs font-bold text-[#1A3626] dark:text-[#c9a14b] flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              <span>View All Posts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/${locale}/blog/${(post as any).slug || post.id}`} 
                className="group flex flex-col bg-gray-50 dark:bg-[#091711] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-[#1A3626] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />
                    <span>{post.date}</span>
                  </div>
                  
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors leading-snug line-clamp-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {post.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A3626] dark:text-[#c9a14b] group-hover:gap-2.5 transition-all mt-auto">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}
