"use client";

import Image from "next/image";
import { ShieldCheck, Info, FileText, ExternalLink } from "lucide-react";
import { safeExternalUrl } from "@/utils/safeUrl";

/**
 * Regulatory Information — sirf CMP Connect listing API ka asli data:
 *   permitNumber (Trakheesi), referenceNumber, publishedAt, location,
 *   company.name / company.orn (ORN), agent.brn / agent.brnVerified (BRN), trakheesiDocument { url, label }.
 * Koi gadhi hui value nahi (pehle "19898" ORN, "CPM-REG-VERIFIED", "CPM Verified Agency" waghera dikhte the).
 * Jo field na ho uski row nahi; kuch bhi regulatory na ho to section hi nahi.
 */
interface PropertyRegulatoryInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyInfo?: any;
  className?: string;
  locale?: string;
}

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

function formatListed(iso: string, locale: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeZone: "Asia/Dubai" });
}

export default function PropertyRegulatoryInfo({ propertyInfo = {}, className = "", locale = "en" }: PropertyRegulatoryInfoProps) {
  const p = propertyInfo || {};
  const company = p.company || {};
  const agent = p.agent || {};

  const permit = text(p.permitNumber);
  const reference = text(p.referenceNumber);
  const listedAt = text(p.publishedAt) ? formatListed(p.publishedAt, locale) : "";
  const orn = text(company.orn);
  const agencyName = text(company.name);
  const zone = text(p.location);
  const brn = text(agent.brn);
  const brnVerified = agent.brnVerified === true && !!brn;

  const docUrl = safeExternalUrl(p.trakheesiDocument?.url);
  const docLabel = text(p.trakheesiDocument?.label) || "DLD permit";
  const docIsImage = !!docUrl && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(docUrl);

  // Kuch bhi regulatory nahi → section nahi (sirf zone / date ke liye "Regulatory Information" nahi)
  if (!permit && !reference && !orn && !brn && !docUrl) return null;

  const rows: Array<{ label: string; value: string; hint?: string; mono?: boolean }> = [
    { label: "Permit number", value: permit, hint: "Trakheesi / DLD advertising permit", mono: true },
    { label: "Reference", value: reference, mono: true },
    { label: "Listed", value: listedAt },
    { label: "Broker license", value: orn, hint: "DLD Office Registration Number (ORN)", mono: true },
    { label: "Agency name", value: agencyName },
    { label: "Zone name", value: zone },
    { label: "Agent license", value: brn, hint: "DLD Broker Registration Number (BRN)", mono: true },
  ].filter((r) => r.value);

  return (
    <div className={`space-y-4 pt-6 border-t border-gray-100 dark:border-[#1A3626] ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5CD284]" />
          <span>Regulatory Information</span>
        </h3>
        {/* Badge sirf jab backend ne agent ka BRN verify kiya ho */}
        {brnVerified && (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] border border-[#5CD284]/20 flex items-center gap-1.5 shadow-xs whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5CD284]" />
            BRN verified
          </span>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-[#142e1d] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-[#1A3626] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 w-full flex-1 min-w-0">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between sm:justify-start gap-4 min-w-0">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px] flex items-center gap-1 shrink-0">
                {r.label}
                {r.hint && (
                  <span title={r.hint}>
                    <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
                  </span>
                )}
              </span>
              <span className={`text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate ${r.mono ? "font-mono" : ""}`} title={r.value}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {/* Backend ka asli Trakheesi document (aksar PDF) — image ho to preview, warna link */}
        {docUrl && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex flex-col items-center gap-2.5 self-center md:self-auto pt-4 md:pt-0 md:ps-6 md:border-s border-gray-200 dark:border-[#1A3626] group"
          >
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-xl p-2 border border-gray-200 dark:border-[#1A3626] shadow-sm flex items-center justify-center overflow-hidden">
              {docIsImage ? (
                <Image src={docUrl} alt={docLabel} fill unoptimized className="object-contain p-1.5" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 text-center text-gray-800">
                  <FileText className="w-12 h-12 text-[#1A3626]" />
                  <span className="text-[10px] font-bold text-gray-600">PDF</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1.5 text-center group-hover:text-[#5CD284]">
              View {docLabel} <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
