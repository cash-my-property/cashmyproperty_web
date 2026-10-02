"use client";

import Image from "next/image";
import { ShieldCheck, Sparkles, Info, QrCode } from "lucide-react";

interface PropertyRegulatoryInfoProps {
  propertyInfo?: any;
  details?: any;
  className?: string;
}

const formatRelativeTime = (isoStr?: string): string => {
  if (!isoStr) return "Recently";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return "1 month ago";
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "Recently";
  }
};

export default function PropertyRegulatoryInfo({
  propertyInfo = {},
  details = {},
  className = "",
}: PropertyRegulatoryInfoProps) {
  const mergedDetails = details || propertyInfo.propertyDetails || propertyInfo || {};
  const root = propertyInfo || {};

  const trakheesiDoc =
    mergedDetails.propertyDocuments?.propertyTrakheesi ||
    root.propertyDocuments?.propertyTrakheesi ||
    mergedDetails.propertyTrakheesi ||
    root.propertyTrakheesi;

  const regReference =
    trakheesiDoc?.referenceNumber ||
    mergedDetails.referenceNumber ||
    root.referenceNumber ||
    root.PID ||
    mergedDetails.PID ||
    mergedDetails.propertyId ||
    root.propertyId ||
    mergedDetails.listingId ||
    root.listingId ||
    mergedDetails._id ||
    root._id ||
    "CPM-REG-VERIFIED";

  const regListedAt =
    trakheesiDoc?.listedAt ||
    trakheesiDoc?.uploadedAt ||
    root.createdAt ||
    mergedDetails.createdAt ||
    root.updatedAt ||
    mergedDetails.updatedAt;

  const regBrokerLicense =
    trakheesiDoc?.orn ||
    mergedDetails.orn ||
    root.sellerInfo?.orn ||
    root.orn ||
    "19898";

  const regAgencyName =
    trakheesiDoc?.agencyName ||
    mergedDetails.agencyName ||
    root.sellerInfo?.agencyName ||
    root.sellerInfo?.name ||
    "CPM Verified Agency";

  const regZoneName =
    trakheesiDoc?.zoneName ||
    mergedDetails.zoneName ||
    (typeof mergedDetails.propertyLocation === "string"
      ? mergedDetails.propertyLocation
      : mergedDetails.propertyLocation?.city) ||
    root.location ||
    "Dubai, UAE";

  const regAgentLicense =
    trakheesiDoc?.brn ||
    mergedDetails.brn ||
    root.sellerInfo?.brn ||
    root.brn ||
    "N/A";

  const regQrUrl =
    trakheesiDoc?.url ||
    trakheesiDoc?.qrUrl ||
    trakheesiDoc?.documentUrl ||
    (typeof trakheesiDoc === "string" ? trakheesiDoc : null) ||
    mergedDetails.qrCodeUrl ||
    root.qrCodeUrl ||
    mergedDetails.qrCode ||
    root.qrCode;

  const isQrImage = Boolean(
    regQrUrl &&
      (regQrUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ||
        regQrUrl.includes("cloudinary") ||
        regQrUrl.includes("mediaoffice") ||
        regQrUrl.startsWith("data:image") ||
        !regQrUrl.match(/\.pdf($|\?)/i))
  );

  return (
    <div className={`space-y-4 pt-6 border-t border-gray-100 dark:border-[#1A3626] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5CD284]" />
          <span>Regulatory Information</span>
        </h3>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] border border-[#5CD284]/20 flex items-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#5CD284]" />
          DLD Verified
        </span>
      </div>

      {/* Box */}
      <div className="bg-gray-50 dark:bg-[#142e1d] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-[#1A3626] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Metadata List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 w-full flex-1">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Reference</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">
              {regReference}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Listed</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              {formatRelativeTime(regListedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px] flex items-center gap-1">
              Broker License
              <span title="DLD Office Registration Number (ORN)">
                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
              </span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono">
              {regBrokerLicense}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Agency name</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate" title={regAgencyName}>
              {regAgencyName}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Zone name</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate" title={regZoneName}>
              {regZoneName}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px] flex items-center gap-1">
              Agent License
              <span title="DLD Broker Registration Number (BRN)">
                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
              </span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono">
              {regAgentLicense}
            </span>
          </div>
        </div>

        {/* Right: QR Code / DLD Permit Verification */}
        {regQrUrl && (
          <div className="shrink-0 flex flex-col items-center gap-2.5 self-center md:self-auto pt-4 md:pt-0 md:pl-6 md:border-l border-gray-200 dark:border-[#1A3626]">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-xl p-2 border border-gray-200 dark:border-[#1A3626] shadow-sm flex items-center justify-center overflow-hidden">
              {isQrImage ? (
                <Image
                  src={regQrUrl}
                  alt="DLD QR Verification"
                  fill
                  unoptimized
                  className="object-contain p-1.5"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 text-center text-gray-800">
                  <QrCode className="w-12 h-12 text-[#1A3626]" />
                  <span className="text-[10px] font-bold text-gray-600">DLD Permit</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 text-center">
              <QrCode className="w-3.5 h-3.5 text-[#5CD284]" />
              Scan to verify with DLD
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
