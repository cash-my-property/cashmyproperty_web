"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { content } from "@/config/content";

export default function BlogPage() {
  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full py-24 sm:py-32 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: 'url("/hero-bg.svg")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/90 via-[#0a1a13]/85 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#c9a14b]/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.2em] text-[11px] sm:text-[12px] mb-6 uppercase bg-white/10 dark:bg-white/5 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm">
            {content.blog.hero.tagline}
          </span>
          <h1 className="text-white text-[38px] sm:text-[56px] lg:text-[62px] font-bold mb-6 leading-[1.15] tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.blog.hero.title.replace('\n', ' ')}
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light">
            {content.blog.hero.description}
          </p>
        </div>
      </section>

      {/* BLOG CONTENT SECTION */}
      <section className="py-16 sm:py-24 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-widest text-[12px] mb-3 uppercase">
              {content.blog.main.label}
            </p>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {content.blog.main.heading}
            </h2>
          </div>
        </div>

        {/* POSTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.blog.main.posts.map((post) => (
            <Link key={post.id} href="#" className="group flex flex-col bg-white dark:bg-[#102418] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] hover:-translate-y-1 transition-all duration-300">
              {/* Fake image placeholder for the blog card */}
              <div className="w-full h-[240px] bg-gray-200 dark:bg-[#163321] relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url("/property-placeholder.svg")`
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#1A3626] dark:text-white bg-white/90 dark:bg-[#c9a14b] backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4 text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                
                <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors leading-snug" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {post.title}
                </h3>
                
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#1A3626] dark:text-[#c9a14b] group-hover:gap-3 transition-all mt-auto pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                  {content.blog.main.readMore} <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
    </main>
  );
}
