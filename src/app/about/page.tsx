"use client";

import Link from "next/link";
import { CheckCircle2, Building2, ShieldCheck, Users } from "lucide-react";
import { content } from "@/config/content";

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-[#0F172A] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full h-[350px] sm:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-[#1B3A2D]/85 dark:bg-[#0F172A]/90 mix-blend-multiply" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] font-bold tracking-[0.2em] text-[12px] mb-6 uppercase bg-white/10 px-5 py-2 rounded-full backdrop-blur-sm border border-white/10">
            {content.about.hero.tagline}
          </span>
          <h1 className="text-white text-[44px] sm:text-[64px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.about.hero.title.replace('\n', ' ')}
          </h1>
          <p className="text-white/80 text-[17px] sm:text-[19px] max-w-2xl leading-relaxed font-light">
            {content.about.hero.description}
          </p>
        </div>
      </section>

      {/* ABOUT CONTENT SECTION */}
      <section className="py-20 sm:py-28 px-6 lg:px-12 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Side: Images or Graphics */}
        <div className="w-full lg:w-[45%] relative">
          <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] aspect-[4/5] bg-gray-100 dark:bg-slate-800">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
            />
          </div>
          {/* Floating Stats Card */}
          <div className="absolute -bottom-10 -right-4 sm:-right-10 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-700 flex items-center gap-5 w-64">
             <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
               <Building2 className="w-6 h-6 text-[#1A3626] dark:text-[#5CD284]" />
             </div>
             <div>
               <h4 className="text-[24px] font-bold text-gray-900 dark:text-white leading-none mb-1">500+</h4>
               <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Properties Sold</p>
             </div>
          </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center pt-8 sm:pt-0 pl-0 sm:pl-8">
          <p className="text-[#1A3626] dark:text-[#5CD284] font-bold tracking-widest text-[12px] mb-4 uppercase flex items-center gap-2">
            <span className="w-8 h-px bg-[#1A3626] dark:bg-[#5CD284]" /> {content.about.main.label}
          </p>
          <h2 className="text-[36px] sm:text-[46px] font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.15]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.about.main.heading}
          </h2>
          
          <div className="space-y-6 text-[16px] sm:text-[17px] text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
            {content.about.main.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 bg-gray-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-gray-100 dark:border-slate-700/50">
            {content.about.main.features.map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#1A3626] dark:text-[#5CD284]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-[17px]">{feature.title}</h3>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/signup" className="bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#1A3626] px-8 py-4 rounded-xl font-bold hover:bg-[#12261a] dark:hover:bg-[#4ab872] transition-all duration-300 shadow-sm hover:shadow-md text-[15px]">
              {content.about.main.joinButton}
            </Link>
            <Link href="#" className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300 text-[15px]">
              {content.about.main.contactButton}
            </Link>
          </div>
        </div>

      </section>

      {/* ADDITIONAL VALUES SECTION */}
      <section className="py-20 px-6 lg:px-12 w-full bg-[#1A3626] dark:bg-slate-900 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-white mb-16 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <ShieldCheck className="w-8 h-8 text-[#5CD284]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">100% Secure</h3>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">Every transaction is fully encrypted, and every user is verified against DLD guidelines.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Building2 className="w-8 h-8 text-[#5CD284]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified Properties</h3>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">We ensure all listings are genuine and tied to a real BRN to eliminate market noise.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Users className="w-8 h-8 text-[#5CD284]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Expert Support</h3>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">Our dedicated team of professionals is available to assist you at every step of the process.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
