"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Gavel, Heart, Settings, LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const { dict, locale } = useDictionary();
  const { logout } = useAuth();
  const content = dict.dashboard.sidebar;
  const pathname = usePathname();

  const links = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: content.myBids, href: `/${locale}/dashboard/bids`, icon: Gavel },
    { name: content.favorites, href: `/${locale}/dashboard/favorites`, icon: Heart },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1E293B] border-e border-gray-200 dark:border-slate-800 flex flex-col min-h-screen transition-colors">
      <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-slate-800">
        <Link href={`/${locale}`}>
          <Image 
            src="/logo.png" 
            alt="Cash My Property" 
            width={120} 
            height={34} 
            className="object-contain w-[110px]" 
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-[#1A3626] dark:bg-[#5CD284]/10 text-white dark:text-[#5CD284] font-semibold" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-70"}`} />
              <span className="text-[14px]">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium w-full text-left"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          <span className="text-[14px]">{content.logout}</span>
        </button>
      </div>
    </aside>
  );
}
