import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";

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
  return (
    <footer className="bg-white dark:bg-[#1E293B] pt-16 pb-8 px-6 sm:px-12 lg:px-24 transition-colors">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
        {/* Brand Info */}
        <div className="lg:pr-8">
          <Image src="/logo.png" alt={siteConfig.name} width={120} height={40} className="mb-6 object-contain dark:brightness-200" />
          <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed">
            {siteConfig.description}
          </p>
        </div>
        
        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-[13px] tracking-widest mb-6">QUICK LINKS</h4>
          <ul className="space-y-3.5 text-[14px] text-gray-500 dark:text-gray-400">
            {siteConfig.footer.quickLinks.map((link, idx) => (
              <li key={idx}><Link href={link.href} className="hover:text-gray-900 dark:hover:text-white transition-colors">{link.title}</Link></li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-[13px] tracking-widest mb-6">LEGAL</h4>
          <ul className="space-y-3.5 text-[14px] text-gray-500 dark:text-gray-400">
            {siteConfig.footer.legalLinks.map((link, idx) => (
              <li key={idx}><Link href={link.href} className="hover:text-gray-900 dark:hover:text-white transition-colors">{link.title}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-[13px] tracking-widest mb-6">CONTACT US</h4>
          <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400">
            <li className="flex items-start gap-3.5">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: siteConfig.footer.contact.address.replace(', ', ',<br/>') }}></span>
            </li>
            <li className="flex items-center gap-3.5">
              <Phone className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
              <span>{siteConfig.footer.contact.phone}</span>
            </li>
            <li className="flex items-center gap-3.5">
              <Mail className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
              <span>{siteConfig.footer.contact.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Social & Copyright */}
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 dark:border-slate-800">
        <p className="text-gray-400 dark:text-gray-500 text-[13px] mb-6 md:mb-0">
          {siteConfig.footer.copyright}
        </p>
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex items-center gap-3">
            <Link href={siteConfig.footer.socials.facebook} className="w-9 h-9 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <FacebookIcon className="w-4 h-4" />
            </Link>
            <Link href={siteConfig.footer.socials.instagram} className="w-9 h-9 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <InstagramIcon className="w-4 h-4" />
            </Link>
            <Link href={siteConfig.footer.socials.twitter} className="w-9 h-9 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <TwitterIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-5 text-[13px] text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200/50 dark:border-green-900/30 rounded-full text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 font-semibold text-[11px] uppercase tracking-wider">
              <span className="w-3 h-3 flex items-center justify-center text-green-600 dark:text-green-400">🛡️</span> Verified by DLD
            </span>
            <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Sitemap</Link>
            <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
