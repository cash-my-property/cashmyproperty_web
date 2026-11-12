"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Heart, Building2, ChevronRight, UserCheck, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";
import connectPublicService from "@/services/connectPublicService";
import { useAuth } from "@/context/AuthContext";

export default function DashboardOverviewPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.overview;

  // Teeno cards asli API counts se. API fail ho to "—" (chupke se "0" nahi)
  const [savedCount, setSavedCount] = useState<string>("—");
  const [listingsCount, setListingsCount] = useState<string>("—");
  const [agentsCount, setAgentsCount] = useState<string>("—");
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAgent, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n.toLocaleString(locale === "ar" ? "ar-AE" : "en-AE") : "—");
    const fetchTotals = async () => {
      setIsLoading(true);
      const [fav, home, agents] = await Promise.allSettled([
        api.get(`${PUBLIC_API_PREFIX}/me/favourites?page=1&limit=1`),
        connectPublicService.getHome(),
        connectPublicService.getAgents({ limit: 1 }),
      ]);
      if (fav.status === "fulfilled") setSavedCount(num(fav.value.data?.pagination?.total ?? fav.value.data?.data?.length));
      if (home.status === "fulfilled") setListingsCount(num(home.value?.totals?.live));
      if (agents.status === "fulfilled") setAgentsCount(num(agents.value?.pagination?.total));
      setIsLoading(false);
    };
    fetchTotals();
  }, [authLoading, user, locale]);

  const stats = [
    {
      label: "Browse Properties",
      value: listingsCount,
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: `/${locale}/listings`,
    },
    {
      label: "Verified Agents",
      value: agentsCount,
      icon: UserCheck,
      color: "text-[#5CD284]",
      bg: "bg-[#5CD284]/10",
      href: `/${locale}/agents`,
    },
    {
      label: content.stats.savedProperties || "Saved Properties",
      value: savedCount,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      href: `/${locale}/dashboard/favorites`,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {content.title || "Dashboard Overview"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back,{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {user?.fullName || user?.firstName || "Valued User"}
          </span>
          {isAgent && user?.agent?.companyName ? (
            <span> ({user.agent.companyName})</span>
          ) : null}
          . Manage your saved properties and account preferences.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href || `/${locale}/dashboard`}
            className="group relative bg-white dark:bg-[#102418] p-6 rounded-2xl shadow-xs hover:shadow-md border border-gray-100 dark:border-[#1A3626] flex items-center justify-between transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${stat.bg} ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#091711] flex items-center justify-center text-gray-400 group-hover:text-[#5CD284] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Account Quick Card */}
      <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-xs border border-gray-100 dark:border-[#1A3626] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Account Settings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAgent
              ? `Signed in as a CMP Connect Agent${user?.agent?.companyName ? ` (${user.agent.companyName})` : ""}.`
              : "Update your full name, UAE phone number, profile photo, or password."}
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard/settings`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#091711] text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          <Settings className="w-4 h-4" />
          <span>Manage Account</span>
        </Link>
      </div>
    </div>
  );
}
