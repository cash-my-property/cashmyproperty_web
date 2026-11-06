"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileCheck2, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { getOptimizedImageUrl } from "@/utils/imageUrl";
import { rtoService, type RtoMyContract } from "@/services/rtoService";

// My Contracts — GET /cmpConnect/public/me/contracts. Contract ka detail offer page pe hota hai
// (wahan status, rejection reason aur dobara upload), isliye card offer page kholta hai.
const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  REJECTED: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

export default function MyContractsPage() {
  const { dict, locale } = useDictionary();
  const t = dict.rto.dashboard;
  // Backend: /me/offers aur /me/contracts sirf agency brokers ke liye (baaki ko 403)
  const { isBroker, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<RtoMyContract[] | null>(null);
  const [error, setError] = useState(false);
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium" }) : null;

  const load = async () => {
    try {
      setError(false);
      setItems(await rtoService.getMyContracts());
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    if (authLoading || !isBroker) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount pe data fetch
    load();
  }, [authLoading, isBroker]);

  if (!authLoading && !isBroker) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.myContracts}</h1>
        <div className="bg-white dark:bg-[#102418] rounded-2xl border border-gray-100 dark:border-[#1A3626] p-10 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-5">{t.brokersOnly}</p>
          <Link href={`/${locale}/auctions`} className="inline-block px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm">{t.browse}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{t.myContracts}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.myContractsSubtitle}</p>
      </div>

      {error ? (
        <div className="bg-white dark:bg-[#102418] rounded-2xl border border-gray-100 dark:border-[#1A3626] p-10 text-center">
          <p className="text-gray-700 dark:text-gray-200 font-semibold mb-4">{t.loadError}</p>
          <button onClick={load} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm cursor-pointer">
            <RefreshCw className="w-4 h-4" /> {dict.rto.list.retry}
          </button>
        </div>
      ) : !items ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-[#102418] rounded-2xl border border-gray-100 dark:border-[#1A3626] p-12 text-center">
          <FileCheck2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300 mb-5">{t.emptyContracts}</p>
          <Link href={`/${locale}/auctions`} className="inline-block px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm">{t.browse}</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((c) => (
            <li key={c.contractId}>
              <Link href={`/${locale}/auctions/${c.id}`} className="flex gap-4 bg-white dark:bg-[#102418] rounded-2xl border border-gray-100 dark:border-[#1A3626] p-3 hover:border-[#5CD284]/50 transition-colors">
                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#163321]">
                  {c.property.coverImage && <Image src={getOptimizedImageUrl(c.property.coverImage)} alt={c.property.title} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{c.property.title}</h3>
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[c.status] || "bg-gray-100 text-gray-600"}`}>
                      {t.statusLabels[c.status as keyof typeof t.statusLabels] || c.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 line-clamp-1"><MapPin className="w-3 h-3 text-[#5CD284] shrink-0" /> {c.property.location}</p>
                  <p className="text-[11px] font-mono text-gray-400 mt-1">{c.contractId} · {c.property.rtoRef} · {dict.rto.contract.submission} #{c.submissionNumber}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {fmt(c.signedAt) && <>{t.signedAt}: {fmt(c.signedAt)}</>}
                    {fmt(c.reviewedAt) && <> · {t.reviewedAt}: {fmt(c.reviewedAt)}</>}
                  </p>
                  {c.status === "REJECTED" && c.rejectionReason && (
                    <p className="text-xs text-rose-600 dark:text-rose-300 mt-1.5 line-clamp-2">{c.rejectionReason}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
