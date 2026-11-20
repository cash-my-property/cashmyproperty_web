"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import ProjectCard from "@/components/projects/ProjectCard";
import connectPublicService, { type PublicProjectCard } from "@/services/connectPublicService";

/** Developer page pe uske New Projects (GET /projects?developerId=). Koi project na ho to kuch render nahi. */
export default function DeveloperProjects({ developerId, initial, initialTotal }: { developerId: string; initial?: PublicProjectCard[]; initialTotal?: number }) {
  const { dict, locale } = useDictionary();
  const t = dict.projectsPage;
  const [items, setItems] = useState<PublicProjectCard[]>(initial || []);
  const [total, setTotal] = useState(initialTotal ?? initial?.length ?? 0);

  useEffect(() => {
    if (initial) return; // developer profile (GET /developers/:id) ke saath aa gaye
    let cancelled = false;
    connectPublicService
      .getProjects({ developerId, limit: 6 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data || []);
        setTotal(res.pagination?.total || 0);
      })
      .catch(() => { /* projects optional — listings neeche dikhti rahengi */ });
    return () => { cancelled = true; };
  }, [developerId, initial]);

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {t.title} <span className="text-gray-400 font-semibold">({total})</span>
        </h2>
        {total > items.length && (
          <Link href={`/${locale}/projects?developerId=${developerId}`} className="text-sm font-bold text-[#1A3626] dark:text-[#5CD284] flex items-center gap-1 hover:underline">
            {t.loadMore} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  );
}
