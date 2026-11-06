"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, Building2, UserCheck } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

// Agents | Agencies | Developers — teeno directory pages ke hero mein (backend 4728f57 directories)
export default function DirectoryTabs() {
  const { dict, locale } = useDictionary();
  const t = dict.directory.tabs;
  const pathname = usePathname() || "";
  const tabs = [
    { href: `/${locale}/agents`, label: t.agents, icon: UserCheck },
    { href: `/${locale}/agencies`, label: t.agencies, icon: Building },
    { href: `/${locale}/developers`, label: t.developers, icon: Building2 },
  ];

  return (
    <nav aria-label="Directory" className="inline-flex items-center gap-1 p-1 mb-6 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${
              active ? "bg-[#5CD284] text-[#0A1C12]" : "text-white/85 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
