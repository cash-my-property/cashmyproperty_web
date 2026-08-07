"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Gavel, Heart, Building2, TrendingUp, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.overview;

  const stats = [
    { label: content.stats.activeBids, value: "12", icon: Gavel, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: content.stats.wonAuctions, value: "3", icon: TrendingUp, color: "text-[#5CD284]", bg: "bg-[#5CD284]/10" },
    { label: content.stats.savedProperties, value: "28", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const recentActivity = [
    { id: 1, type: "bid", text: "You placed a bid of 1,200,000 Ð on Luxury Villa in Palm Jumeirah", time: "2 hours ago" },
    { id: 2, type: "outbid", text: "You were outbid on Downtown Penthouse. Current highest: 3,500,000 Ð", time: "5 hours ago" },
    { id: 3, type: "saved", text: "You saved Modern Apartment in Dubai Marina", time: "1 day ago" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {content.title}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{content.recentActivity}</h2>
          <Link href={`/${locale}/dashboard/bids`} className="text-sm font-semibold text-[#1A3626] dark:text-[#5CD284] hover:underline flex items-center gap-1">
            {content.viewAll} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6 space-y-6">
          {recentActivity.map((activity, i) => (
            <div key={activity.id} className="flex gap-4">
              <div className="mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'bid' ? 'bg-blue-500/10 text-blue-500' :
                  activity.type === 'outbid' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {activity.type === 'bid' ? <Gavel className="w-4 h-4" /> :
                   activity.type === 'outbid' ? <TrendingUp className="w-4 h-4 rotate-180" /> :
                   <Heart className="w-4 h-4" />}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 leading-relaxed">
                  {activity.text}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
