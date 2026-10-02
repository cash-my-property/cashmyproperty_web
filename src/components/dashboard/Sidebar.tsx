"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Heart, Settings, LogOut, ChevronRight, FileText, Building, PlusCircle, ListOrdered, X, AlertTriangle, Flame, Tag, TrendingUp, History, UserCheck } from "lucide-react";
import Image from "next/image";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { dict, locale } = useDictionary();
  const { user, logout } = useAuth();
  const content = dict.dashboard.sidebar;
  const pathname = usePathname();
  const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";
  const userType = (user as any)?.sellerType?.toUpperCase() || (typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR');

  const buyerLinks = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: "Realtime Offers", href: `/${locale}/auctions`, icon: TrendingUp },
    { name: content.favorites || "Favorites", href: `/${locale}/dashboard/favorites`, icon: Heart },
    { name: "My Contracts", href: `/${locale}/dashboard/contracts`, icon: FileText },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const simpleBuyerLinks = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: "Listings", href: `/${locale}/listings`, icon: Building },
    { name: "Find Agents", href: `/${locale}/sellers`, icon: UserCheck },
    { name: content.favorites || "Favorites", href: `/${locale}/dashboard/favorites`, icon: Heart },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const sellerLinks = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: "Add Property", href: `/${locale}/dashboard/seller/add-property`, icon: PlusCircle },
    { name: "My Properties", href: `/${locale}/dashboard/seller/properties`, icon: Building },
    { name: "Sold History", href: `/${locale}/dashboard/seller/sold-history`, icon: History },
    { name: "Rejected Properties", href: `/${locale}/dashboard/seller/rejected-properties`, icon: AlertTriangle },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const simpleSellerLinks = [
    { name: content.overview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: "Add Listing", href: `/${locale}/dashboard/seller/add-simple-property`, icon: PlusCircle },
    { name: "My Listings", href: `/${locale}/dashboard/seller/simple-listings`, icon: Building },
    { name: "Rejected Properties", href: `/${locale}/dashboard/seller/rejected-simple-properties`, icon: AlertTriangle },
    { name: content.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const getLinks = () => {
    if (role === 'seller') {
      return userType === 'SIMPLE' ? simpleSellerLinks : sellerLinks;
    }
    // buyer
    return userType === 'SIMPLE' ? simpleBuyerLinks : buyerLinks;
  };

  const links = getLinks();

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

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== `/${locale}/dashboard` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-[#1A3626] text-white dark:bg-[#5CD284]/15 dark:text-[#5CD284] dark:border dark:border-[#5CD284]/30 font-bold shadow-xs" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#163321]/60 hover:text-gray-900 dark:hover:text-white font-medium"
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon className={`w-4 h-4 transition-colors ${
                  isActive 
                    ? "text-[#5CD284]" 
                    : "text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                }`} />
                <span className="text-[13px]">{link.name}</span>
              </div>
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
