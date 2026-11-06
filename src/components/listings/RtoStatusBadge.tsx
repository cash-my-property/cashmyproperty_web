"use client";

import { useDictionary } from "@/components/DictionaryProvider";

// Real Time Offer status pill — list cards + offer page. Status values: CMP Connect RTO API.
const STYLES: Record<string, { cls: string; pulse?: boolean }> = {
  ACTIVE: { cls: "bg-emerald-600/90", pulse: true },
  UPCOMING: { cls: "bg-amber-600/90" },
  PAUSED: { cls: "bg-slate-600/90" },
  SOLD: { cls: "bg-[#1A3626]/90" },
  NOT_SOLD: { cls: "bg-rose-700/90" },
};

export default function RtoStatusBadge({ status }: { status?: string }) {
  const { dict } = useDictionary();
  const pc = dict.propertyCards;
  const rto = dict.rto;
  const key = status && STYLES[status] ? status : "ACTIVE";
  const label =
    key === "UPCOMING" ? pc?.upcoming || "Upcoming"
    : key === "PAUSED" ? rto.status.paused
    : key === "SOLD" ? rto.status.sold
    : key === "NOT_SOLD" ? rto.status.notSold
    : pc?.liveOffer || "Live Offer";
  const { cls, pulse } = STYLES[key];

  return (
    <div className={`flex items-center gap-1.5 ${cls} backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-white ${pulse ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </div>
  );
}
