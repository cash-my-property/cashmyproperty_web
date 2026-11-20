"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarClock, MapPin, Percent, Hammer } from "lucide-react";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import { getOptimizedImageUrl } from "@/utils/imageUrl";
import { formatPropertyType } from "@/utils/formatters";
import type { PublicProjectCard } from "@/services/connectPublicService";

/** New Projects card — sirf API ka data (GET /projects). Jo field na ho wo dikhta nahi. */
export default function ProjectCard({ project, priority = false }: { project: PublicProjectCard; priority?: boolean }) {
  const { dict, locale } = useDictionary();
  const t = dict.projectsPage;
  const p = project;
  const place = [p.community, p.emirate].filter(Boolean).join(", ");
  const stageLabel = p.stage ? (t.stages as Record<string, string>)[p.stage] || p.stage : "";
  const statusLabel = p.status && p.status !== "LIVE" ? (t.status as Record<string, string>)[p.status] || "" : "";
  const kinds = (p.unitKinds || []).map((k) => formatPropertyType(k.toUpperCase(), locale)).join(" · ");
  const beds = p.bedsRange
    ? p.bedsRange.min === p.bedsRange.max
      ? p.bedsRange.min === 0 ? t.studio : t.bedsOne.replace("{n}", String(p.bedsRange.min))
      : t.bedsRange.replace("{min}", p.bedsRange.min === 0 ? t.studio : String(p.bedsRange.min)).replace("{max}", String(p.bedsRange.max))
    : "";

  return (
    <Link
      href={`/${locale}/projects/${encodeURIComponent(p.projectRef)}`}
      className="group w-full bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm hover:shadow-xl hover:border-[#5CD284]/40 transition-all overflow-hidden flex flex-col"
    >
      <div className="relative h-[200px] bg-gray-100 dark:bg-[#163321]">
        {p.coverPhoto ? (
          <Image
            src={getOptimizedImageUrl(p.coverPhoto)}
            alt={p.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-300" /></div>
        )}
        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
          {stageLabel && (
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#1A3626]/90 text-white backdrop-blur-md">
              {stageLabel}
            </span>
          )}
          {statusLabel && (
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#c9a14b]/95 text-[#1A3626]">
              {statusLabel}
            </span>
          )}
        </div>
        {p.developer?.logo && (
          <div className="absolute bottom-3 end-3 w-11 h-11 rounded-xl bg-white p-1 shadow-md">
            <div className="relative w-full h-full">
              <Image src={getOptimizedImageUrl(p.developer.logo)} alt={p.developer.name} fill sizes="44px" className="object-contain" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284]">{p.name}</h3>
          {place && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 min-w-0">
              <MapPin className="w-3 h-3 text-[#5CD284] shrink-0" /> <span className="truncate">{place}</span>
            </p>
          )}
          {p.developer?.name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {t.by} <span className="font-semibold text-gray-700 dark:text-gray-200">{p.developer.name}</span>
            </p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.fromPrice ? t.launchPrice : ""}</p>
          <p className="text-xl font-extrabold text-[#1A3626] dark:text-[#c9a14b] flex items-baseline gap-1">
            {p.fromPrice ? (<><Dirham /> {p.fromPrice.toLocaleString()}</>) : <span className="text-sm font-bold text-gray-500">{t.priceOnRequest}</span>}
          </p>
        </div>

        {(kinds || beds) && (
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{[kinds, beds].filter(Boolean).join(" · ")}</p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-semibold text-gray-600 dark:text-gray-300">
          {p.deliveryLabel && (
            <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5 text-[#5CD284]" /> {t.handover}: {p.deliveryLabel}</span>
          )}
          {p.paymentPlanLabel && (
            <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5 text-[#5CD284]" /> {p.paymentPlanLabel}</span>
          )}
          {p.offPlan && typeof p.buildPct === "number" && p.buildPct > 0 && (
            <span className="flex items-center gap-1"><Hammer className="w-3.5 h-3.5 text-[#5CD284]" /> {t.built.replace("{pct}", String(p.buildPct))}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
