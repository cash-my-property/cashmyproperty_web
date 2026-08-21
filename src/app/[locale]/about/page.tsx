"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  Zap, 
  Users, 
  ShieldCheck, 
  Bell, 
  ArrowRight, 
  Smartphone, 
  UserCheck, 
  Download, 
  Trash2, 
  HelpCircle, 
  ChevronDown, 
  Mail,
  Quote,
  Target,
  Eye,
  Info
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function AboutPage() {
  const { dict } = useDictionary();
  const content = dict;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Safe destructuring of sections with fallback data if needed
  const hero = content.about?.hero || {};
  const featuresSection = content.about?.featuresSection || { items: [] };
  const experience = content.about?.experience || { cards: [] };
  const founder = content.about?.founder || {};
  const cta = content.about?.cta || {};
  const howItWorks = content.about?.howItWorks || { steps: [] };
  const download = content.about?.download || {};
  const deleteAccount = content.about?.deleteAccount || { steps: [], importantPoints: [] };
  const faq = content.about?.faq || { questions: [] };

  // Feature Section Icon Mapper
  const getFeatureIcon = (index: number) => {
    switch (index) {
      case 0: return <Award className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />;
      case 1: return <Zap className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />;
      case 2: return <Users className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />;
      case 3: return <ShieldCheck className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />;
      case 4: return <Bell className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />;
      default: return <Award className="w-6 h-6 text-[#1A3626] dark:text-[#c9a14b]" />;
    }
  };

  // How It Works Icon Mapper
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <Download className="w-6 h-6 text-white" />;
      case 1: return <UserCheck className="w-6 h-6 text-white" />;
      case 2: return <Smartphone className="w-6 h-6 text-white" />;
      default: return <Download className="w-6 h-6 text-white" />;
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-[#091711] transition-colors min-h-screen text-gray-800 dark:text-gray-200">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full py-24 sm:py-32 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2D]/90 via-[#0a1a13]/85 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#c9a14b]/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.2em] text-[11px] sm:text-[12px] mb-6 uppercase bg-white/10 dark:bg-white/5 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm">
            {hero.tagline}
          </span>
          <h1 className="text-white text-[38px] sm:text-[56px] lg:text-[62px] font-bold mb-6 leading-[1.15] tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {hero.title}
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light">
            {hero.description}
          </p>
        </div>
      </section>

      {/* 2. EXPERIENCE SECTION */}
      <section className="py-20 sm:py-28 px-6 lg:px-12 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        {/* Left: Premium Image Layout */}
        <div className="w-full lg:w-[48%] relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] bg-gray-100 dark:bg-[#102418]">
            <div 
              className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-white dark:bg-[#102418] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-[#1A3626] flex items-center gap-5 w-64 transform hover:scale-105 transition-transform duration-300">
             <div className="w-14 h-14 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center shrink-0">
               <Award className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
             </div>
             <div>
               <h4 className="text-[20px] font-bold text-gray-900 dark:text-white leading-none mb-1">RERA Certified</h4>
               <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">100% Verified Agents</p>
             </div>
          </div>
        </div>

        {/* Right: Info and stats */}
        <div className="w-full lg:w-[52%] flex flex-col justify-center">
          <span className="text-[#1A3626] dark:text-[#c9a14b] font-semibold tracking-widest text-[11px] sm:text-[12px] mb-4 uppercase flex items-center gap-2">
            <span className="w-8 h-px bg-[#1A3626] dark:bg-[#c9a14b]" /> {experience.badge}
          </span>
          <h2 className="text-[34px] sm:text-[44px] font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.2]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {experience.title}
          </h2>
          <p className="text-[16px] sm:text-[17px] text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
            {experience.description}
          </p>

          <div className="space-y-6">
            {experience.cards.map((card: any, idx: number) => (
              <div 
                key={idx} 
                className="flex gap-5 p-6 bg-gray-50 dark:bg-[#102418]/45 rounded-2xl border border-gray-100 dark:border-[#1A3626]/40 hover:border-green-200 dark:hover:border-green-900/40 transition-all duration-300 group"
              >
                <div className="text-[28px] font-black text-gray-300 dark:text-gray-700 leading-none shrink-0 group-hover:text-[#5CD284] dark:group-hover:text-[#c9a14b] transition-colors">
                  {card.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-[17px] group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ADVANCED FEATURES SECTION */}
      <section className="py-24 px-6 lg:px-12 w-full bg-gray-50 dark:bg-[#0c1e15] border-y border-gray-100 dark:border-gray-900/30 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c9a14b]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[32px] sm:text-[42px] font-bold text-gray-900 dark:text-white mb-5 tracking-tight leading-[1.2]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {featuresSection.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed">
              {featuresSection.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresSection.items.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="flex flex-col bg-white dark:bg-[#102418] p-8 rounded-3xl border border-gray-100 dark:border-[#1A3626] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-green-50 dark:bg-green-950/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#5CD284] dark:group-hover:bg-[#c9a14b] transition-all duration-300">
                  <span className="group-hover:text-white dark:group-hover:text-[#102418] transition-colors">
                    {getFeatureIcon(idx)}
                  </span>
                </div>
                <h3 className="text-[19px] font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-24 px-6 lg:px-12 w-full max-w-7xl mx-auto text-center">
        <h2 className="text-[32px] sm:text-[42px] font-bold text-gray-900 dark:text-white mb-6 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {howItWorks.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 text-[16px] leading-relaxed">
          {howItWorks.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-green-100 via-green-300 to-green-150 dark:from-green-950/40 dark:via-green-900/50 dark:to-green-950/40 z-0" />
          
          {howItWorks.steps.map((step: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center relative z-10 group">
              <div className="w-20 h-20 bg-[#1A3626] dark:bg-[#c9a14b] rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                {getStepIcon(idx)}
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MEET THE FOUNDER SECTION */}
      <section className="py-24 px-6 lg:px-12 w-full bg-gray-50 dark:bg-[#0c1e15]/45 border-t border-gray-100 dark:border-gray-900/20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          {/* Quote Panel */}
          <div className="w-full lg:w-[50%] bg-[#1A3626] dark:bg-[#102418] text-white p-10 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-white/5 pointer-events-none">
              <Quote className="w-48 h-48" />
            </div>
            
            <span className="text-[#5CD284] dark:text-[#c9a14b] font-bold tracking-[0.15em] text-[11px] uppercase block mb-8">
              {founder.title}
            </span>
            
            <Quote className="w-10 h-10 text-[#5CD284] dark:text-[#c9a14b] mb-6 opacity-80" />
            <p className="text-[18px] sm:text-[21px] leading-relaxed italic mb-8 font-light text-gray-100">
              {founder.quote}
            </p>
            
            <div>
              <h4 className="text-[19px] font-bold text-white">{founder.name}</h4>
              <p className="text-[13px] text-gray-400 font-medium">Founder, Cash My Property</p>
            </div>
          </div>

          {/* Mission & Vision Panel */}
          <div className="w-full lg:w-[50%] flex flex-col gap-8">
            <div className="bg-white dark:bg-[#102418] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626]/80 flex gap-5 animate-fade-in">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-950/20 rounded-2xl flex items-center justify-center shrink-0">
                <Target className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-2">{founder.missionTitle}</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">{founder.missionText}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#102418] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626]/80 flex gap-5 animate-fade-in">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-950/20 rounded-2xl flex items-center justify-center shrink-0">
                <Eye className="w-7 h-7 text-[#1A3626] dark:text-[#c9a14b]" />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-2">{founder.visionTitle}</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">{founder.visionText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & APP DOWNLOAD */}
      <section className="py-24 px-6 lg:px-12 w-full bg-[#1B3A2D] dark:bg-[#102418] text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5CD284]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <h2 className="text-[28px] sm:text-[38px] font-bold mb-3 tracking-tight">
            {cta.line1}
          </h2>
          <h3 className="text-[26px] sm:text-[34px] font-medium text-[#5CD284] dark:text-[#c9a14b] mb-12 tracking-tight">
            {cta.line2}
          </h3>

          <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-white/10 shadow-xl flex flex-col items-center">
            <h4 className="text-[20px] sm:text-[23px] font-bold mb-3">{download.title}</h4>
            <p className="text-white/70 text-[14px] sm:text-[15px] mb-8 leading-relaxed max-w-md">
              {download.description}
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              <a 
                href="https://play.google.com/store/apps/details?id=com.cashmyproperty" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-900 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-md hover:scale-[1.03]"
              >
                <Smartphone className="w-5 h-5 text-gray-900" />
                <span className="text-[14px]">{download.googlePlay}</span>
              </a>
              <a 
                href="https://apps.apple.com/pk/app/cmp-cashmyproperty/id6762503025" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-transparent hover:bg-white/10 border border-white/40 text-white px-6 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-md hover:scale-[1.03]"
              >
                <Smartphone className="w-5 h-5 text-white" />
                <span className="text-[14px]">{download.appStore}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DELETE YOUR ACCOUNT SECTION */}
      <section className="py-24 px-6 lg:px-12 w-full max-w-5xl mx-auto">
        <div className="bg-red-50/20 dark:bg-red-950/5 border border-red-100 dark:border-red-950/25 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row gap-12">
          {/* Description & Steps */}
          <div className="w-full md:w-[60%]">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-7 h-7 text-red-600 dark:text-red-500 animate-pulse" />
              <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
                {deleteAccount.title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-8">
              {deleteAccount.description}
            </p>

            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-[16px]">
              {deleteAccount.howToDeleteTitle}
            </h3>
            <ul className="space-y-3.5">
              {deleteAccount.steps.map((step: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="w-5 h-5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-450 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Info & Help */}
          <div className="w-full md:w-[40%] flex flex-col gap-6 justify-between">
            <div className="bg-white dark:bg-[#102418] p-6 rounded-2xl border border-red-100/50 dark:border-red-950/10 shadow-xs">
              <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-400 font-semibold text-[14px]">
                <Info className="w-4.5 h-4.5" />
                <span>{deleteAccount.importantTitle}</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed list-disc pl-4">
                {deleteAccount.importantPoints.map((point: string, idx: number) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1A3626]/5 dark:bg-[#102418]/60 p-6 rounded-2xl border border-[#1A3626]/10 dark:border-[#1A3626]/20 flex flex-col gap-4">
              <h4 className="font-bold text-[15px] text-[#1A3626] dark:text-[#5CD284] flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5" />
                <span>{deleteAccount.helpTitle}</span>
              </h4>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {deleteAccount.helpText}
              </p>
              <a 
                href="mailto:info@cmpdubai.com" 
                className="w-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#102418] text-center py-3 rounded-xl font-bold text-[14px] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] transition-all duration-300 flex items-center justify-center gap-2 shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>{deleteAccount.contactButton}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE FAQ SECTION */}
      <section className="py-24 px-6 lg:px-12 w-full bg-gray-50 dark:bg-[#0c1e15]/20 border-t border-gray-100 dark:border-gray-900/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {faq.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed">
              {faq.description}
            </p>
          </div>

          <div className="space-y-4">
            {faq.questions.map((item: any, idx: number) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-[#102418] rounded-2xl border border-gray-100 dark:border-[#1A3626] overflow-hidden shadow-xs hover:border-green-200 dark:hover:border-green-900/30 transition-colors duration-300"
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 sm:p-8 text-left font-bold text-[16px] sm:text-[17px] text-gray-900 dark:text-white gap-4 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 text-gray-400 dark:text-gray-500 ${isOpen ? "transform rotate-180 text-[#5CD284] dark:text-[#c9a14b]" : ""}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[300px] border-t border-gray-50 dark:border-[#1A3626]/30" : "max-h-0"}`}
                  >
                    <p className="p-6 sm:p-8 text-[14px] sm:text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
