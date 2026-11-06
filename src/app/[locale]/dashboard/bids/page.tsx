"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gavel, Loader2, MapPin, RefreshCw } from "lucide-react";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import RtoStatusBadge from "@/components/listings/RtoStatusBadge";
import { getOptimizedImageUrl } from "@/utils/imageUrl";
import { rtoService, type RtoMyOffer } from "@/services/rtoService";

// My Offers — GET /cmpConnect/public/me/offers (Real Time Offer buyer side)
const STATUS_STYLE: Record<string, string> = {
  LEADING: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  WON: "bg-emerald-600 text-white",
  OUTBID: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  LOST: "bg-gray-100 text-gray-600 dark:bg-[#163321] dark:text-gray-300",
};

export default function MyOffersPage() {
  const { dict, locale } = useDictionary();
  const t = dict.rto.dashboard;
  // Backend: /me/offers aur /me/contracts sirf agency brokers ke liye (baaki ko 403)
  const { isBroker, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<RtoMyOffer[] | null>(null);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      setError(false);
      setItems(await rtoService.getMyOffers());
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.myOffers}</h1>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{t.myOffers}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.myOffersSubtitle}</p>
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
          <Gavel className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300 mb-5">{t.emptyOffers}</p>
          <Link href={`/${locale}/auctions`} className="inline-block px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm">{t.browse}</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((o) => (
            <li key={o.id}>
              <Link href={`/${locale}/auctions/${o.id}`} className="flex gap-4 bg-white dark:bg-[#102418] rounded-2xl border border-gray-100 dark:border-[#1A3626] p-3 hover:border-[#5CD284]/50 transition-colors">
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#163321]">
                  {o.coverImage && <Image src={getOptimizedImageUrl(o.coverImage)} alt={o.title} fill sizes="112px" className="object-cover" />}
                  <div className="absolute top-1.5 start-1.5 scale-90 origin-top-left rtl:origin-top-right"><RtoStatusBadge status={o.status} /></div>
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{o.title}</h3>
                    <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[o.myOfferStatus] || STATUS_STYLE.LOST}`}>
                      {t.statusLabels[o.myOfferStatus as keyof typeof t.statusLabels] || o.myOfferStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 line-clamp-1"><MapPin className="w-3 h-3 text-[#5CD284] shrink-0" /> {o.location}</p>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div>
                      <p className="text-gray-400 font-semibold">{dict.rto.detail.yourOffer}</p>
                      <p className="font-extrabold text-gray-900 dark:text-white flex items-baseline gap-1"><Dirham /> {o.myOffer.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold">{dict.rto.detail.currentPrice}</p>
                      <p className="font-extrabold text-[#1A3626] dark:text-[#c9a14b] flex items-baseline gap-1"><Dirham /> {(o.finalPrice ?? o.currentPrice).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {o.offersPlaced} {t.offersPlaced} · {t.lastOffer}: {new Date(o.lastOfferAt).toLocaleString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
