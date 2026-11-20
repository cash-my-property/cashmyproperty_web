"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import ProjectCard from "@/components/projects/ProjectCard";
import connectPublicService, { type PublicProjectCard } from "@/services/connectPublicService";

const AUTOPLAY_MS = 5000;

/**
 * Homepage "New Projects" slider — GET /projects (featured). Koi project na ho to section render nahi hota.
 * CSS scroll-snap + arrows (RecommendedProperties jaisa); autoplay hover / focus / reduced-motion pe ruk jata hai. RTL-aware.
 */
export default function HomeProjectsSlider() {
  const { dict, locale } = useDictionary();
  const t = dict.projectsPage;
  const [items, setItems] = useState<PublicProjectCard[] | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    connectPublicService
      .getProjects({ sort: "featured", limit: 10 })
      .then((res) => { if (!cancelled) setItems(res.data || []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  // RTL mein scrollLeft 0 se manfi ki taraf jata hai — isliye abs()
  const isRtl = () => typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    setCanPrev(pos > 10);
    setCanNext(pos + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items, update]);

  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.9;
    el.scrollBy({ left: dir * amount * (isRtl() ? -1 : 1), behavior: "smooth" });
  }, []);

  // Autoplay: aakhir pe pahunch ke shuru pe wapas
  useEffect(() => {
    if (!items || items.length < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || document.visibilityState !== "visible") return;
      const pos = Math.abs(el.scrollLeft);
      if (pos + el.clientWidth >= el.scrollWidth - 10) el.scrollTo({ left: 0, behavior: "smooth" });
      else step(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [items, paused, step]);

  // API ka jawab aane tak skeleton; khaali ho to section hi nahi
  if (items && items.length === 0) return null;

  const arrowCls = (enabled: boolean) =>
    `w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
      enabled
        ? "bg-white dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-200 hover:bg-[#1A3626] hover:text-white dark:hover:bg-[#5CD284] dark:hover:text-[#0A1C12] shadow-sm"
        : "bg-gray-100/70 dark:bg-[#102418]/40 border-gray-200/50 dark:border-[#1A3626]/50 text-gray-400 opacity-40 cursor-not-allowed"
    }`;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.title}
      className="py-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto border-t border-gray-200 dark:border-[#1A3626]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <p className="text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase">{t.badge}</p>
          <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {t.title}
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 max-w-2xl">{t.homeSubtitle}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link href={`/${locale}/projects`} className="group inline-flex items-center gap-2 font-semibold text-[#1A3626] dark:text-[#c9a14b] hover:opacity-80">
            {t.viewAll} <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
          {items && items.length > 1 && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => step(-1)} disabled={!canPrev} aria-label={t.prev} className={arrowCls(canPrev)}>
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <button type="button" onClick={() => step(1)} disabled={!canNext} aria-label={t.next} className={arrowCls(canNext)}>
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!items ? (
        <div className="flex gap-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 h-[400px] bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-1 -mx-1"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((p, i) => (
            <div
              key={p.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${items.length}`}
              className="w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start flex"
            >
              <div className="w-full flex"><ProjectCard project={p} /></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
