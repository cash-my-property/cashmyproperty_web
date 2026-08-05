"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useDictionary } from "@/components/DictionaryProvider";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function Footer() {
  const { dict } = useDictionary();
  return (
    <footer className="relative bg-gradient-to-b from-[#1B3A2D] to-[#0A1C12] text-gray-300 pt-20 lg:pt-28 pb-8 px-6 sm:px-12 lg:px-24 overflow-hidden border-t border-[#5CD284]/10">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5CD284]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
        
        {/* Brand Info (Spans 4 cols on Desktop) */}
        <div className="lg:col-span-4 lg:pr-8 flex flex-col items-start">
          <Image src="/logo.png" alt={siteConfig.name} width={150} height={42} style={{ width: "auto", height: "auto" }} className="mb-6 object-contain brightness-0 invert opacity-100 transition-opacity" />
          <p className="text-green-100/60 text-[15px] leading-relaxed mb-8">
            {siteConfig.description}
          </p>
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-[#5CD284]/20 rounded-full bg-[#5CD284]/10 shadow-[0_0_15px_rgba(92,210,132,0.05)]">
            <ShieldCheck className="w-4 h-4 text-[#5CD284]" />
            <span className="text-[#5CD284] font-bold text-[11px] uppercase tracking-widest">
              Verified by DLD
            </span>
          </div>
        </div>
        
        {/* Quick Links (Spans 2 cols) */}
        <div className="lg:col-span-2">
          <h4 className="font-bold text-white text-[12px] tracking-[0.2em] uppercase mb-8 opacity-80">{dict.footer.quickLinksTitle}</h4>
          <ul className="space-y-4">
            {dict.footer.quickLinks.map((link, idx) => (
              <li key={idx}>
                <Link href={link.href} className="group inline-flex items-center text-[14px] text-green-100/60 hover:text-[#5CD284] transition-colors">
                  <span className="w-0 h-px bg-[#5CD284] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal (Spans 2 cols) */}
        <div className="lg:col-span-2">
          <h4 className="font-bold text-white text-[12px] tracking-[0.2em] uppercase mb-8 opacity-80">{dict.footer.legalLinksTitle}</h4>
          <ul className="space-y-4">
            {dict.footer.legalLinks.map((link, idx) => (
              <li key={idx}>
                <Link href={link.href} className="group inline-flex items-center text-[14px] text-green-100/60 hover:text-[#5CD284] transition-colors">
                  <span className="w-0 h-px bg-[#5CD284] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact (Spans 4 cols) */}
        <div className="lg:col-span-4 lg:pl-8">
          <h4 className="font-bold text-white text-[12px] tracking-[0.2em] uppercase mb-8 opacity-80">{dict.footer.contactTitle}</h4>
          <ul className="space-y-5">
            <li className="flex items-start gap-4 text-green-100/60 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#5CD284]/20 group-hover:text-[#5CD284] transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="leading-relaxed text-[14px] mt-2" dangerouslySetInnerHTML={{ __html: dict.footer.address.replace(', ', ',<br/>') }}></span>
            </li>
            <li className="flex items-center gap-4 text-green-100/60 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#5CD284]/20 group-hover:text-[#5CD284] transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[14px]">{dict.footer.phone}</span>
            </li>
            <li className="flex items-center gap-4 text-green-100/60 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#5CD284]/20 group-hover:text-[#5CD284] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[14px]">{dict.footer.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Social & Copyright */}
      <div className="relative z-10 max-w-[1300px] mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
        <p className="text-green-100/50 text-[13px] mb-6 md:mb-0">
          {dict.footer.copyright}
        </p>
        
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="flex items-center gap-3">
            <Link href={siteConfig.footer.socials.facebook} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-green-100/60 hover:bg-[#5CD284] hover:text-[#1B3A2D] transition-colors hover:-translate-y-1 transform duration-300">
              <FacebookIcon className="w-4 h-4" />
            </Link>
            <Link href={siteConfig.footer.socials.instagram} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-green-100/60 hover:bg-[#5CD284] hover:text-[#1B3A2D] transition-colors hover:-translate-y-1 transform duration-300">
              <InstagramIcon className="w-4 h-4" />
            </Link>
            <Link href={siteConfig.footer.socials.twitter} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-green-100/60 hover:bg-[#5CD284] hover:text-[#1B3A2D] transition-colors hover:-translate-y-1 transform duration-300">
              <TwitterIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-green-100/50 font-medium">
            <Link href="#" className="hover:text-[#5CD284] transition-colors">Sitemap</Link>
            <Link href="#" className="hover:text-[#5CD284] transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
