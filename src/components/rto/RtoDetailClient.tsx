"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, Building2, ChevronLeft, ChevronRight, Expand, MapPin, PauseCircle, Ruler, ShieldCheck, Users, X } from "lucide-react";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import PropertyMapCard from "@/components/listings/PropertyMapCard";
import RtoStatusBadge from "@/components/listings/RtoStatusBadge";
import RtoActionPanel from "@/components/rto/RtoActionPanel";
import { useRtoLive, splitDuration } from "@/components/rto/useRtoLive";
import { formatAmenity, formatPropertyCategory, formatPropertyPlan, formatPropertyType } from "@/utils/formatters";
import { getOptimizedImageUrl } from "@/utils/imageUrl";
import { rtoService, type RtoDetail, type RtoOfferHistory } from "@/services/rtoService";

const FINAL = new Set(["SOLD", "NOT_SOLD", "ENDED"]);
const PLACEHOLDER = "/property-placeholder.svg";

export default function RtoDetailClient({ id, initialData, locale }: { id: string; initialData: RtoDetail | null; locale: string }) {
  const { dict } = useDictionary();
  const t = dict.rto;
  const { user, isAuthenticated, isAgent, isBroker, isLoading: authLoading } = useAuth();

  const [detail, setDetail] = useState<RtoDetail | null>(initialData);
  const [notFound, setNotFound] = useState(!initialData);
  const [history, setHistory] = useState<RtoOfferHistory | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const { state: live, refresh: refreshLive, msLeft } = useRtoLive(
    id,
    initialData
      ? {
          id,
          status: initialData.status,
          currentPrice: initialData.currentPrice,
          offers: initialData.offers,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          finalPrice: initialData.finalPrice,
          serverTime: new Date().toISOString(),
        }
      : null
  );

  const loadDetail = useCallback(async () => {
    try {
      setDetail(await rtoService.getDetail(id));
      setNotFound(false);
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) setNotFound(true);
    }
  }, [id]);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await rtoService.getOfferHistory(id));
    } catch {
      /* history optional */
    }
  }, [id]);

  // Login ho to detail dobara (myContract / myOffer / can.* user-specific hain). Guest ke liye server data kaafi hai.
  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; state await ke baad set hoti hai
    if (isAuthenticated || !initialData) loadDetail();
  }, [authLoading, isAuthenticated, initialData, loadDetail]);

  // History: shuru mein + jab bhi offers ka count badle (polling se)
  const offerCount = live?.offers ?? detail?.offers ?? 0;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; state await ke baad set hoti hai
    loadHistory();
  }, [loadHistory, offerCount]);

  // Status final ho jaye (SOLD / NOT_SOLD) to detail refresh — myOffer WON / LOST aata hai
  const liveStatus = live?.status;
  const prevStatus = useRef(liveStatus);
  useEffect(() => {
    if (prevStatus.current && liveStatus && prevStatus.current !== liveStatus) loadDetail();
    prevStatus.current = liveStatus;
  }, [liveStatus, loadDetail]);

  const onChanged = useCallback(async () => {
    await Promise.all([loadDetail(), loadHistory(), refreshLive()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDetail, loadHistory]);

  const images = (detail?.images?.length ? detail.images : detail?.coverImage ? [detail.coverImage] : []).map(getOptimizedImageUrl);
  // Jo image load na ho (404 / tooti URL) uski jagah placeholder — khaali dabba nahi
  const [brokenImages, setBrokenImages] = useState<Set<string>>(() => new Set());
  const srcOf = (src: string) => (brokenImages.has(src) ? PLACEHOLDER : src);
  const markBroken = (src: string) => setBrokenImages((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveImage((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  if (notFound || !detail) {
    return (
      <main className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 px-6 pt-32 pb-16 bg-[#F4F5F7] dark:bg-[#091711]">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{t.detail.notFound}</p>
        <Link href={`/${locale}/auctions`} className="text-sm font-bold text-[#1A3626] dark:text-[#c9a14b] underline">{t.detail.backToOffers}</Link>
      </main>
    );
  }

  const status = live?.status || detail.status;
  const isFinal = FINAL.has(status);
  const price = isFinal && status === "SOLD" ? live?.finalPrice ?? detail.finalPrice ?? detail.currentPrice : live?.currentPrice ?? detail.currentPrice;
  const priceLabel = isFinal && status === "SOLD" ? t.detail.finalPrice : (live?.offers ?? detail.offers) > 0 ? t.detail.currentPrice : t.detail.startingPrice;
  const d = msLeft != null ? splitDuration(msLeft) : null;

  const facts = [
    detail.bedrooms && { icon: BedDouble, label: dict.propertyCards?.beds || "Beds", value: detail.bedrooms },
    detail.washrooms && { icon: Bath, label: dict.propertyCards?.baths || "Baths", value: detail.washrooms },
    detail.area && { icon: Ruler, label: t.detail.area, value: `${detail.area.toLocaleString()} ${detail.areaUnit}` },
    detail.builtUpArea && { icon: Ruler, label: t.detail.builtUp, value: `${detail.builtUpArea.toLocaleString()} ${detail.areaUnit}` },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-28 sm:pt-32 pb-16 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link href={`/${locale}/auctions`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284]">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t.detail.backToOffers}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-500 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-full px-3 py-1">{detail.rtoRef}</span>
            <RtoStatusBadge status={status} />
          </div>
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:h-[460px] rounded-[28px] overflow-hidden mb-8">
            <button type="button" onClick={() => { setActiveImage(0); setLightbox(true); }} className="relative md:col-span-3 md:row-span-2 h-[280px] md:h-auto cursor-zoom-in group">
              <Image src={srcOf(images[0])} onError={() => markBroken(images[0])} alt={detail.title} fill priority sizes="(max-width: 768px) 100vw, 75vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <span className="absolute bottom-3 end-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Expand className="w-3.5 h-3.5" /> {images.length}
              </span>
            </button>
            {images.slice(1, 3).map((src, i) => (
              <button key={src} type="button" onClick={() => { setActiveImage(i + 1); setLightbox(true); }} className="relative hidden md:block cursor-zoom-in">
                <Image src={srcOf(src)} onError={() => markBroken(src)} alt={`${detail.title} ${i + 2}`} fill sizes="25vw" className="object-cover" />
                {i === 1 && images.length > 3 && (
                  <span className="absolute inset-0 bg-black/45 flex items-center justify-center text-white font-extrabold text-lg">+{images.length - 3}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
            <div className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{detail.title}</h1>
              <p className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
                <MapPin className="w-4 h-4 text-[#5CD284] shrink-0 mt-0.5" /> {detail.location}
              </p>

              {/* Price + countdown */}
              <div className="rounded-2xl bg-gradient-to-br from-[#1A3626] to-[#0f2418] text-white p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">{priceLabel}</p>
                  <p className="text-3xl font-extrabold text-[#5CD284] flex items-baseline gap-1" aria-live="polite">
                    <Dirham /> {price.toLocaleString()}
                  </p>
                  {priceLabel !== t.detail.startingPrice && (
                    <p className="text-xs text-white/60 mt-1">{t.detail.startingPrice}: AED {detail.startPrice.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.detail.offers}</p>
                  <p className="text-3xl font-extrabold">{offerCount}</p>
                </div>
                <div>
                  {status === "PAUSED" ? (
                    <p className="text-sm text-white/80 flex items-start gap-2"><PauseCircle className="w-5 h-5 shrink-0" /> {t.detail.pausedNote}</p>
                  ) : isFinal ? (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">{t.detail.ended}</p>
                      <p className="text-lg font-bold">{new Date(live?.endTime || detail.endTime || detail.startTime).toLocaleString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" })}</p>
                    </>
                  ) : d ? (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">{status === "UPCOMING" ? t.detail.startsIn : t.detail.endsIn}</p>
                      <p className="text-2xl font-extrabold tabular-nums" dir="ltr">
                        {d.days > 0 && <>{d.days}{t.detail.days} </>}
                        {String(d.hours).padStart(2, "0")}{t.detail.hours} {String(d.minutes).padStart(2, "0")}{t.detail.minutes} {String(d.seconds).padStart(2, "0")}{t.detail.seconds}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Facts */}
              {facts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl bg-gray-50 dark:bg-[#091711] border border-gray-100 dark:border-[#1A3626] p-3">
                      <Icon className="w-4 h-4 text-[#5CD284] mb-1" />
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                {[formatPropertyType(detail.typeLabel || detail.type, locale), formatPropertyCategory(detail.category, locale), formatPropertyPlan(detail.plan, locale)]
                  .filter(Boolean)
                  .map((chip) => (
                    <span key={chip} className="px-3 py-1 rounded-full bg-[#1A3626]/5 dark:bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] text-xs font-bold">{chip}</span>
                  ))}
                {detail.trakheesiNumber && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t.detail.trakheesi}: {detail.trakheesiNumber}
                  </span>
                )}
              </div>
            </div>

            {detail.description && (
              <section className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.detail.description}</h2>
                <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{detail.description}</p>
              </section>
            )}

            {detail.amenities?.length > 0 && (
              <section className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.detail.amenities}</h2>
                <div className="flex flex-wrap gap-2">
                  {detail.amenities.map((a) => (
                    <span key={a} className="px-3 py-1.5 rounded-full border border-[#5CD284]/40 bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] text-xs font-bold">{formatAmenity(a, locale)}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Offer history */}
            <section className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {t.detail.history} {history ? <span className="text-gray-400 font-semibold">({history.total})</span> : null}
              </h2>
              {!history || history.offers.length === 0 ? (
                <p className="text-sm text-gray-500">{t.detail.noOffers}</p>
              ) : (
                <ol className="divide-y divide-gray-100 dark:divide-[#1A3626]">
                  {history.offers.map((o, i) => (
                    <li key={`${o.at}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
                      <span className={`font-bold ${o.buyer === "You" ? "text-[#1A3626] dark:text-[#5CD284]" : "text-gray-700 dark:text-gray-200"}`}>
                        {o.buyer === "You" ? t.detail.yourOffer : o.buyer}
                        {i === 0 && <span className="ms-2 text-[10px] uppercase text-emerald-600">▲</span>}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-extrabold text-gray-900 dark:text-white flex items-baseline gap-1"><Dirham /> {o.amount.toLocaleString()}</span>
                        <time className="text-xs text-gray-400" dateTime={o.at}>
                          {new Date(o.at).toLocaleTimeString(locale === "ar" ? "ar-AE" : "en-AE", { hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 self-start w-full">
            <RtoActionPanel detail={detail} live={live} isAuthenticated={isAuthenticated} isAgent={isAgent} isBroker={isBroker} myCompanyName={user?.agent?.companyName} onChanged={onChanged} />

            {detail.company && (
              <div className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm p-5 flex items-center gap-3">
                {detail.company.logo ? (
                  <Image src={getOptimizedImageUrl(detail.company.logo)} alt={detail.company.name} width={48} height={48} className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-100" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-400" />
                )}
                <p className="font-bold text-gray-900 dark:text-white">{detail.company.name}</p>
              </div>
            )}

            {detail.coordinates && (
              <PropertyMapCard coordinates={detail.coordinates} location={detail.location} title={detail.title} />
            )}
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] bg-black/95 flex flex-col" onClick={() => setLightbox(false)}>
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm font-bold">{activeImage + 1} / {images.length}</span>
            <button type="button" aria-label="Close" onClick={() => setLightbox(false)} className="p-2 rounded-full hover:bg-white/10 cursor-pointer"><X className="w-6 h-6" /></button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image src={srcOf(images[activeImage])} onError={() => markBroken(images[activeImage])} alt={detail.title} fill sizes="100vw" className="object-contain" />
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Previous" onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)} className="absolute start-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                  <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                </button>
                <button type="button" aria-label="Next" onClick={() => setActiveImage((i) => (i + 1) % images.length)} className="absolute end-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                  <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
