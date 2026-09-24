"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { Phone, Mail, ShieldCheck, ArrowUpRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/imageUrl";

export interface SellerInfo {
  agentId?: string;
  name?: string;
  thumbnail?: string;
  isVerified?: boolean;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  officeName?: string | null;
  designation?: string | null;
}

interface PropertySellerCardStripProps {
  seller?: SellerInfo | null;
  propertyTitle?: string;
  variant?: "compact" | "cta";
}

// Brand-accurate WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.07-2.023-.483-1.697-.704-2.779-2.434-2.863-2.547-.084-.112-.682-.907-.682-1.729 0-.822.43-1.228.583-1.396.153-.169.333-.211.444-.211.112 0 .223.001.32.006.102.005.239-.039.373.284.144.348.49 1.196.533 1.284.043.088.072.19.014.303-.058.113-.087.184-.173.285-.086.101-.182.226-.26.303-.087.086-.178.18-.077.354.101.174.45 1.002.966 1.462.664.592 1.224.776 1.397.862.173.086.275.072.376-.044.102-.115.433-.505.549-.679.116-.173.231-.144.39-.086s1.01.477 1.184.563c.173.087.289.13.332.203.044.072.044.419-.1.824z" />
    </svg>
  );
}

export default function PropertySellerCardStrip({
  seller,
  propertyTitle = "this property",
  variant = "compact",
}: PropertySellerCardStripProps) {
  const router = useRouter();
  const { locale } = useDictionary();

  if (!seller || (!seller.name && !seller.phone && !seller.whatsappNumber && !seller.email)) {
    return null;
  }

  const rawWhatsapp = seller.whatsappNumber || seller.phone || "";
  const whatsappClean = rawWhatsapp.replace(/[^0-9]/g, "");
  const phoneClean = (seller.phone || seller.whatsappNumber || "").replace(/[^0-9+]/g, "");
  const hasWhatsapp = Boolean(whatsappClean);
  const hasPhone = Boolean(phoneClean);
  const hasEmail = Boolean(seller.email);

  const handleAgentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (seller.agentId) {
      router.push(`/${locale}/sellers/${seller.agentId}`);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (whatsappClean) {
      const text = encodeURIComponent(
        `Hi ${seller.name || ""}, I am interested in your property "${propertyTitle}" listed on Cash My Property.`
      );
      window.open(`https://wa.me/${whatsappClean}?text=${text}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phoneClean) {
      window.location.href = `tel:${phoneClean}`;
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (seller.email) {
      const subject = encodeURIComponent(`Inquiry about ${propertyTitle}`);
      window.location.href = `mailto:${seller.email}?subject=${subject}`;
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#1A3626] flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
      {/* Left: Agent Avatar & Info */}
      <div
        onClick={handleAgentClick}
        className={`flex items-center gap-2.5 min-w-0 flex-1 ${
          seller.agentId ? "cursor-pointer group/agent" : ""
        }`}
        title={seller.agentId ? "View Agent Profile" : undefined}
      >
        {/* Avatar with ShieldCheck verified badge */}
        <div className="relative w-10 h-10 rounded-full shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden border border-gray-200 dark:border-[#2a5438] bg-gray-100 dark:bg-[#091711] shadow-sm relative">
            {seller.thumbnail ? (
              <Image
                src={getOptimizedImageUrl(seller.thumbnail)}
                alt={seller.name || "Agent"}
                fill
                sizes="40px"
                className="object-cover group-hover/agent:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#1A3626] dark:text-[#c9a14b] bg-emerald-50 dark:bg-[#163321]">
                {(seller.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {seller.isVerified && (
            <span
              className="absolute -bottom-1 -right-1 p-0.5 bg-[#1A3626] dark:bg-[#c9a14b] text-[#5CD284] dark:text-[#1A3626] rounded-full shadow-md border border-white/20 flex items-center justify-center"
              title="Verified RERA Agent"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Text Details */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider leading-none mb-0.5">
            Listed by
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate group-hover/agent:text-[#5CD284] dark:group-hover/agent:text-[#c9a14b] transition-colors leading-tight">
              {seller.name || "Real Estate Agent"}
            </span>
            {seller.agentId && (
              <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover/agent:text-[#5CD284] dark:group-hover/agent:text-[#c9a14b] transition-colors shrink-0 opacity-0 group-hover/agent:opacity-100" />
            )}
          </div>
          {(seller.officeName || seller.isVerified) && (
            <span className="text-[11px] font-medium text-gray-500 dark:text-[#5CD284]/80 truncate leading-tight">
              {seller.officeName || "Verified Agent"}
            </span>
          )}
        </div>
      </div>

      {/* Right: Contact Action Buttons */}
      {variant === "cta" ? (
        <div className="flex items-center gap-2 shrink-0">
          {hasWhatsapp && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_12px_rgba(37,211,102,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}

          {hasPhone && (
            <button
              type="button"
              onClick={handleCall}
              className="px-3.5 py-1.5 rounded-xl bg-[#1A3626] hover:bg-[#142b1e] dark:bg-[#5CD284] dark:hover:bg-[#4bc273] text-white dark:text-[#0A1C12] text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              title={`Call: ${phoneClean}`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>
          )}

          {hasEmail && (
            <button
              type="button"
              onClick={handleEmail}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 dark:bg-[#163321] dark:hover:bg-[#1f452d] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#2a5438] text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              title={`Email: ${seller.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" />
              <span>Email</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          {hasWhatsapp && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 hover:border-[#25D366] flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 hover:shadow-[0_0_12px_rgba(37,211,102,0.4)] cursor-pointer"
              title="Chat on WhatsApp"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>
          )}

          {hasPhone && (
            <button
              type="button"
              onClick={handleCall}
              className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#5CD284] hover:bg-[#1A3626] hover:text-white dark:hover:bg-[#5CD284] dark:hover:text-[#0A1C12] border border-emerald-500/20 dark:border-[#5CD284]/30 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
              title={`Call: ${phoneClean}`}
              aria-label="Call"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}

          {hasEmail && (
            <button
              type="button"
              onClick={handleEmail}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#163321] text-gray-600 dark:text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-[#c9a14b] dark:hover:text-[#0A1C12] border border-gray-200 dark:border-[#1A3626] flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
              title={`Email: ${seller.email}`}
              aria-label="Email Agent"
            >
              <Mail className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
