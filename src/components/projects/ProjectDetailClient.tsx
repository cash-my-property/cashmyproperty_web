"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Building2, CalendarClock, CheckCircle2, Download, ExternalLink, Globe, Hammer, Mail, MapPin, Percent, Phone, PlayCircle, ShieldCheck,
} from "lucide-react";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import PropertyMapCard from "@/components/listings/PropertyMapCard";
import ProjectEnquiryForm from "@/components/projects/ProjectEnquiryForm";
import type { PublicProjectDetail } from "@/services/connectPublicService";
import { getOptimizedImageUrl } from "@/utils/imageUrl";
import { formatAmenity, formatPropertyType } from "@/utils/formatters";
import { safeExternalUrl } from "@/utils/safeUrl";
import { whatsappLink } from "@/lib/whatsapp";

const PLACEHOLDER = "/property-placeholder.svg";

/** New Project detail — GET /projects/:ref ka data. Jo field na ho wo section / row nahi dikhta. */
export default function ProjectDetailClient({ project, locale }: { project: PublicProjectDetail | null; locale: string }) {
  const { dict } = useDictionary();
  const t = dict.projectsPage;
  const d = t.detail;
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Set<string>>(() => new Set());

  if (!project) {
    return (
      <main className="flex-1 min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 pt-28 bg-[#F4F5F7] dark:bg-[#091711]">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-700 dark:text-gray-200 font-semibold">{d.notFound}</p>
        <Link href={`/${locale}/projects`} className="text-[#1A3626] dark:text-[#5CD284] font-bold underline">{d.back}</Link>
      </main>
    );
  }

  const p = project;
  const photos = (p.photos?.length ? p.photos.map((ph) => ph.url) : p.coverPhoto ? [p.coverPhoto] : []).filter(Boolean);
  const src = (u: string) => (broken.has(u) ? PLACEHOLDER : getOptimizedImageUrl(u));
  const markBroken = (u: string) => setBroken((prev) => (prev.has(u) ? prev : new Set(prev).add(u)));
  const place = [p.community, p.emirate].filter(Boolean).join(", ");
  const stageLabel = p.stage ? (t.stages as Record<string, string>)[p.stage] || p.stage : "";
  const statusLabel = p.status && p.status !== "LIVE" ? (t.status as Record<string, string>)[p.status] || "" : "";
  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeZone: "Asia/Dubai" }) : "";
  const dev = p.seller?.developer || null;
  const members = p.seller?.members || [];
  const videoUrl = safeExternalUrl(p.video?.url);
  const brochureUrl = safeExternalUrl(p.brochure?.url);
  const devWebsite = safeExternalUrl(dev?.website);
  // URL click pe banta hai (server pe window nahi — render mein banao to hydration mismatch)
  const openWhatsApp = () => {
    const link = whatsappLink(dev?.whatsapp, d.whatsappMessage.replace("{name}", p.name).replace("{url}", window.location.href));
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };
  const hasWhatsApp = !!dev?.whatsapp?.replace(/\D/g, "");

  const keyInfo: Array<[string, string]> = ([
    [d.stage, stageLabel],
    [d.buildings, p.buildingsCount != null ? String(p.buildingsCount) : ""],
    [t.handover, p.deliveryLabel || fmtDate(p.handoverDate)],
    [d.launchDate, fmtDate(p.launchDate)],
    [d.ownership, p.ownershipType || ""],
    [d.governmentFee, p.governmentFeePct != null ? `${p.governmentFeePct}%` : ""],
    [d.serviceCharge, p.serviceCharge != null ? `${p.serviceCharge} ${d.perSqft}` : ""],
    [d.dldWaiver, p.dldWaiver ? `${p.dldWaiver}%` : ""],
    [d.rera, p.rera || ""],
    [d.escrow, p.escrowBank || ""],
  ] as Array<[string, string]>).filter(([, v]) => v);

  return (
    <main className="flex-1 bg-[#F4F5F7] dark:bg-[#091711] min-h-screen pt-24 sm:pt-28 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/projects`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1A3626] dark:hover:text-[#5CD284] mb-5">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {d.back}
        </Link>

        {/* Gallery */}
        {photos.length > 0 && (
          <div className="mb-6">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-200 dark:bg-[#102418]">
              <Image src={src(photos[active])} alt={p.name} fill priority sizes="100vw" className="object-cover" onError={() => markBroken(photos[active])} />
              <div className="absolute top-4 start-4 flex flex-wrap gap-2">
                {stageLabel && <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#1A3626]/90 text-white">{stageLabel}</span>}
                {statusLabel && <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#c9a14b] text-[#1A3626]">{statusLabel}</span>}
              </div>
            </div>
            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
                {photos.map((u, i) => (
                  <button
                    key={u + i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 cursor-pointer ${i === active ? "border-[#5CD284]" : "border-transparent opacity-80 hover:opacity-100"}`}
                  >
                    <Image src={src(u)} alt="" fill sizes="96px" className="object-cover" onError={() => markBroken(u)} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
            <section className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626]">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>{p.name}</h1>
              {place && <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#5CD284] shrink-0" /> {place}</p>}
              {dev?.name && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.by} <Link href={`/${locale}/developers/${dev.id}`} className="font-bold text-gray-800 dark:text-gray-100 hover:text-[#5CD284]">{dev.name}</Link></p>}

              <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{p.fromPrice ? t.launchPrice : ""}</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#1A3626] dark:text-[#c9a14b] flex items-baseline gap-1">
                    {p.fromPrice ? (<><Dirham /> {p.fromPrice.toLocaleString()}</>) : <span className="text-base text-gray-500">{t.priceOnRequest}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {p.deliveryLabel && <span className="flex items-center gap-1.5"><CalendarClock className="w-4 h-4 text-[#5CD284]" /> {t.handover}: {p.deliveryLabel}</span>}
                  {p.paymentPlanLabel && <span className="flex items-center gap-1.5"><Percent className="w-4 h-4 text-[#5CD284]" /> {t.paymentPlan}: {p.paymentPlanLabel}</span>}
                </div>
              </div>

              {p.offPlan && typeof p.buildPct === "number" && p.buildPct > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1.5"><Hammer className="w-3.5 h-3.5 text-[#5CD284]" /> {d.progress}</span>
                    <span>{p.buildPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-[#163321] overflow-hidden">
                    <div className="h-full bg-[#5CD284] rounded-full" style={{ width: `${Math.min(100, Math.max(0, p.buildPct))}%` }} />
                  </div>
                </div>
              )}

              {p.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{d.overview}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{p.description}</p>
                </div>
              )}

              {(videoUrl || brochureUrl) && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {brochureUrl && (
                    <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0A1C12] text-sm font-bold">
                      <Download className="w-4 h-4" /> {d.brochure}
                    </a>
                  )}
                  {videoUrl && (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-100 text-sm font-bold">
                      <PlayCircle className="w-4 h-4 text-[#5CD284]" /> {d.video}
                    </a>
                  )}
                </div>
              )}
            </section>

            {/* Unit types */}
            {!!p.unitTypes?.length && (
              <section className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{d.units}</h2>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="text-start text-[11px] uppercase tracking-wider text-gray-400">
                        <th className="px-2 py-2 text-start font-bold">{d.unitType}</th>
                        <th className="px-2 py-2 text-start font-bold">{d.unitBeds}</th>
                        <th className="px-2 py-2 text-start font-bold">{d.unitSize}</th>
                        <th className="px-2 py-2 text-start font-bold">{d.unitPrice}</th>
                        <th className="px-2 py-2 text-start font-bold" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626]">
                      {p.unitTypes.map((u) => (
                        <tr key={u.id} className="text-gray-800 dark:text-gray-100">
                          <td className="px-2 py-3 font-semibold">{u.label}<span className="block text-xs font-normal text-gray-500">{formatPropertyType(u.type?.toUpperCase(), locale)}</span></td>
                          <td className="px-2 py-3">{u.beds == null ? "—" : u.beds === 0 ? t.studio : u.beds}</td>
                          <td className="px-2 py-3 tabular-nums" dir="ltr">{u.sizeFrom ? (u.sizeTo && u.sizeTo !== u.sizeFrom ? `${u.sizeFrom.toLocaleString()}–${u.sizeTo.toLocaleString()}` : u.sizeFrom.toLocaleString()) : "—"}</td>
                          <td className="px-2 py-3 font-bold tabular-nums">{u.priceFrom ? <span className="inline-flex items-baseline gap-1"><Dirham /> {u.priceFrom.toLocaleString()}</span> : "—"}</td>
                          <td className="px-2 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${u.available ? "bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284]" : "bg-gray-100 dark:bg-[#163321] text-gray-500"}`}>
                              {u.available ? d.available : d.soldOut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Payment plan */}
            {!!p.paymentPlan?.length && (
              <section className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.paymentPlan}{p.paymentPlanLabel ? ` · ${p.paymentPlanLabel}` : ""}</h2>
                <ol className="flex flex-col gap-3">
                  {p.paymentPlan.map((m, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <span className="w-14 shrink-0 text-xl font-extrabold text-[#1A3626] dark:text-[#5CD284] tabular-nums">{m.share}%</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.milestone}</p>
                        {m.due && <p className="text-xs text-gray-500 dark:text-gray-400">{d.due}: {m.due}</p>}
                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-[#163321] overflow-hidden">
                          <div className="h-full bg-[#5CD284]" style={{ width: `${Math.min(100, Math.max(0, m.share))}%` }} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Amenities */}
            {!!p.amenities?.length && (
              <section className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{d.amenities}</h2>
                <div className="flex flex-wrap gap-2.5">
                  {p.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 dark:bg-[#163321] text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-[#5CD284]" /> {formatAmenity(a, locale)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Key information */}
            {keyInfo.length > 0 && (
              <section className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#5CD284]" /> {d.keyInfo}</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {keyInfo.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between sm:justify-start gap-4 min-w-0">
                      <dt className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[130px] shrink-0">{k}</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={v}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Location — sirf jab geo ya jagah ho (map card khud hide hota hai) */}
            {(p.geo || place) && (
              <section>
                <PropertyMapCard coordinates={p.geo ? { lat: p.geo.lat, lng: p.geo.lng } : null} location={place} title={p.name} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 self-start w-full min-w-0">
            {dev && (
              <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626] flex flex-col gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#163321] border border-gray-100 dark:border-[#1A3626] overflow-hidden shrink-0 flex items-center justify-center">
                    {dev.logo ? <Image src={getOptimizedImageUrl(dev.logo)} alt={dev.name} fill sizes="56px" className="object-contain p-1.5" /> : <Building2 className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{d.developer}</p>
                    <Link href={`/${locale}/developers/${dev.id}`} className="font-bold text-gray-900 dark:text-white hover:text-[#5CD284] truncate block">{dev.name}</Link>
                    {dev.founded && <p className="text-xs text-gray-500">{d.founded}: {dev.founded}</p>}
                  </div>
                </div>
                {dev.about && <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">{dev.about}</p>}
                {(dev.phone || hasWhatsApp || dev.email || devWebsite) && (
                  <div className="flex flex-wrap gap-2">
                    {dev.phone && (
                      <a href={`tel:${dev.phone.replace(/[^\d+]/g, "")}`} className="flex-1 basis-[90px] py-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#163321]">
                        <Phone className="w-4 h-4" /> {d.call}
                      </a>
                    )}
                    {hasWhatsApp && (
                      <button type="button" onClick={openWhatsApp} className="flex-1 basis-[90px] py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                        {d.whatsapp}
                      </button>
                    )}
                    {dev.email && (
                      <a href={`mailto:${dev.email}?subject=${encodeURIComponent(p.name)}`} className="flex-1 basis-[90px] py-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#163321]">
                        <Mail className="w-4 h-4" /> {d.email}
                      </a>
                    )}
                    {devWebsite && (
                      <a href={devWebsite} target="_blank" rel="noopener noreferrer" className="w-full py-2 text-xs font-bold text-[#1A3626] dark:text-[#5CD284] flex items-center justify-center gap-1.5 hover:underline">
                        <Globe className="w-3.5 h-3.5" /> {d.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
                {members.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-[#1A3626]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">{d.salesTeam}</p>
                    <ul className="flex flex-col gap-2">
                      {members.map((m) => (
                        <li key={m.id} className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-[#163321] overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                            {m.photo ? <Image src={getOptimizedImageUrl(m.photo)} alt={m.name} fill sizes="36px" className="object-cover" /> : m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
                            {(m.brn || m.languages?.length) && (
                              <p className="text-[11px] text-gray-500 truncate">{[m.brn && `BRN ${m.brn}`, m.languages?.join(", ")].filter(Boolean).join(" · ")}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626]">
              <ProjectEnquiryForm projectRef={p.projectRef} units={p.unitTypes} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
