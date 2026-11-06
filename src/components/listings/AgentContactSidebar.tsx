"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, ShieldCheck, Building, Video, Compass, FileText, Loader2, ExternalLink } from "lucide-react";
import connectPublicService from "@/services/connectPublicService";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.07-2.023-.483-1.697-.704-2.779-2.434-2.863-2.547-.084-.112-.682-.907-.682-1.729 0-.822.43-1.228.583-1.396.153-.169.333-.211.444-.211.112 0 .223.001.32.006.102.005.239-.039.373.284.144.348.49 1.196.533 1.284.043.088.072.19.014.303-.058.113-.087.184-.173.285-.086.101-.182.226-.26.303-.087.086-.178.18-.077.354.101.174.45 1.002.966 1.462.664.592 1.224.776 1.397.862.173.086.275.072.376-.044.102-.115.433-.505.549-.679.116-.173.231-.144.39-.086s1.01.477 1.184.563c.173.087.289.13.332.203.044.072.044.419-.1.824z" />
    </svg>
  );
}

interface AgentContactSidebarProps {
  listingRef: string;
  agent?: {
    id?: string;
    name?: string;
    photo?: string | null;
    position?: string | null;
    languages?: string[];
    brn?: string | null;
    brnVerified?: boolean | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  } | null;
  company?: {
    id?: string;
    name?: string;
    logo?: string | null;
    orn?: string | null;
    type?: string;
  } | null;
  permitNumber?: string | null;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  floorPlan?: { url?: string; label?: string } | null;
  locale?: string;
}

export default function AgentContactSidebar({
  listingRef,
  agent,
  company,
  permitNumber,
  videoUrl,
  virtualTourUrl,
  floorPlan,
  locale = "en",
}: AgentContactSidebarProps) {
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null);

  const handleContact = async (channel: "CALL" | "WHATSAPP" | "EMAIL") => {
    try {
      setLoadingChannel(channel);
      const res = await connectPublicService.contactListing(listingRef, channel);
      if (channel === "WHATSAPP") {
        if (res?.whatsappUrl) {
          window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
        } else if (res?.whatsapp) {
          window.open(`https://wa.me/${res.whatsapp.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer");
        }
      } else if (channel === "CALL") {
        const tel = res?.phone || agent?.phone;
        if (tel) window.location.href = `tel:${tel.replace(/[^0-9+]/g, "")}`;
      } else if (channel === "EMAIL") {
        const mail = res?.email || agent?.email;
        if (mail) {
          const subject = encodeURIComponent(res?.emailSubject || `Enquiry regarding listing ${listingRef}`);
          window.location.href = `mailto:${mail}?subject=${subject}`;
        }
      }
    } catch (err) {
      console.error("Contact error:", err);
      // Fallback to direct props if contact endpoint fails
      if (channel === "WHATSAPP" && agent?.whatsapp) {
        window.open(`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer");
      } else if (channel === "CALL" && agent?.phone) {
        window.location.href = `tel:${agent.phone.replace(/[^0-9+]/g, "")}`;
      } else if (channel === "EMAIL" && agent?.email) {
        window.location.href = `mailto:${agent.email}`;
      }
    } finally {
      setLoadingChannel(null);
    }
  };

  const agentName = agent?.name || "CMP Verified Broker";
  const agentPosition = agent?.position || "Property Consultant";
  const companyName = company?.name || "CMP Verified Agency";

  return (
    <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 dark:border-[#1A3626] space-y-6">
      
      {/* Agent & Agency Info Card */}
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#163321] shrink-0 border border-gray-200 dark:border-[#1A3626]">
          {agent?.photo ? (
            <Image
              src={agent.photo}
              alt={agentName}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#1A3626] dark:text-[#5CD284]">
              {agentName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
              {agentName}
            </h3>
            {agent?.brnVerified && (
              <span title="DLD BRN Verified">
                <ShieldCheck className="w-4 h-4 text-[#5CD284] shrink-0" />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {agentPosition}
          </p>

          {/* Company */}
          {company && (
            <Link
              href={`/${locale}/${company.type === "DEVELOPER" ? "developers" : "agencies"}/${company.id || ""}`}
              className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#1A3626] dark:text-[#5CD284] hover:underline truncate"
            >
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{companyName}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Agent details badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        {agent?.brn && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-[#163321] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626]">
            BRN: <strong className="font-mono">{agent.brn}</strong>
          </span>
        )}
        {company?.orn && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-[#163321] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626]">
            ORN: <strong className="font-mono">{company.orn}</strong>
          </span>
        )}
        {agent?.languages && agent.languages.length > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-[#163321] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626]">
            {agent.languages.join(", ")}
          </span>
        )}
      </div>

      {/* Contact CTAs */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-[#1A3626]">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => handleContact("WHATSAPP")}
          disabled={loadingChannel !== null}
          className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
        >
          {loadingChannel === "WHATSAPP" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <WhatsAppIcon className="w-4 h-4" />
          )}
          <span>WhatsApp Agent</span>
        </button>

        {/* Call */}
        <button
          type="button"
          onClick={() => handleContact("CALL")}
          disabled={loadingChannel !== null}
          className="w-full py-3 px-4 rounded-xl bg-[#1A3626] hover:bg-[#12261b] dark:bg-[#5CD284] dark:hover:bg-[#4cb870] text-white dark:text-[#0A1C12] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
        >
          {loadingChannel === "CALL" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
          <span>Call Agent</span>
        </button>

        {/* Email */}
        <button
          type="button"
          onClick={() => handleContact("EMAIL")}
          disabled={loadingChannel !== null}
          className="w-full py-3 px-4 rounded-xl bg-gray-100 dark:bg-[#163321] hover:bg-gray-200 dark:hover:bg-[#1f422b] text-gray-800 dark:text-gray-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {loadingChannel === "EMAIL" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          <span>Send Email</span>
        </button>
      </div>

      {/* Media Links (Video, Tour, Floorplan) */}
      {(videoUrl || virtualTourUrl || floorPlan?.url) && (
        <div className="pt-3 border-t border-gray-100 dark:border-[#1A3626] space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Property Media & Plans
          </p>
          <div className="flex flex-col gap-2">
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] hover:bg-gray-100 dark:hover:bg-[#1A3626] text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#5CD284]" />
                  Watch Video Tour
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            )}
            {virtualTourUrl && (
              <a
                href={virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] hover:bg-gray-100 dark:hover:bg-[#1A3626] text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#5CD284]" />
                  360° Virtual Viewing
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            )}
            {floorPlan?.url && (
              <a
                href={floorPlan.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] hover:bg-gray-100 dark:hover:bg-[#1A3626] text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5CD284]" />
                  {floorPlan.label || "View Floor Plan"}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* DLD Regulatory Notice */}
      {permitNumber && (
        <div className="p-3 rounded-2xl bg-emerald-500/5 dark:bg-[#163321]/50 border border-emerald-500/15 text-center text-xs">
          <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-0.5">DLD Permit Number</p>
          <p className="font-mono font-bold text-gray-800 dark:text-gray-200">{permitNumber}</p>
        </div>
      )}

    </div>
  );
}

