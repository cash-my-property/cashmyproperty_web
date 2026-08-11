"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Gavel, Heart, Settings, LogOut, ChevronRight, FileText, Building, PlusCircle, ListOrdered, X } from "lucide-react";
import Image from "next/image";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { dict, locale } = useDictionary();
  const { user, logout } = useAuth();
  const content = dict.dashboard.sidebar;
  const pathname = usePathname();
  const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";

  const buyerLinks = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: content.myBids || "My Bids", href: `/${locale}/dashboard/bids`, icon: Gavel },
    { name: "My Contracts", href: `/${locale}/dashboard/contracts`, icon: FileText },
    { name: content.favorites, href: `/${locale}/dashboard/favorites`, icon: Heart },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const sellerLinks = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: "My Properties", href: `/${locale}/dashboard/seller/properties`, icon: Building },
    { name: "My Auctions", href: `/${locale}/dashboard/seller/auctions`, icon: Gavel },
    { name: "Received Bids", href: `/${locale}/dashboard/seller/bids`, icon: ListOrdered },
    { name: "Add Property", href: `/${locale}/dashboard/seller/add-property`, icon: PlusCircle },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const links = role === 'seller' ? sellerLinks : buyerLinks;

  return (
    <aside className="w-64 bg-white dark:bg-[#102418] border-e border-gray-200 dark:border-[#1A3626] flex flex-col min-h-screen transition-colors">
      <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 dark:border-[#1A3626]">
        <Link href={`/${locale}`}>
          <Image 
            src="/cmpfavicon-removebg-preview.png" 
            alt="Cash My Property" 
            width={120} 
            height={34} 
            className="object-contain w-[110px]" 
            priority
          />
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 -mr-4 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#102418] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
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
                  ? "bg-[#1A3626] dark:bg-[#915331]/10 text-white dark:text-[#915331] font-semibold" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#102418]/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-70"}`} />
              <span className="text-[14px]">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-[#1A3626]">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium w-full text-left cursor-pointer"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          <span className="text-[14px]">{content.logout}</span>
        </button>
      </div>
    </aside>
  );
}
