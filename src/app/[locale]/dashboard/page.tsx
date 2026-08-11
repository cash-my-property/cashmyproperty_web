"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Gavel, Heart, Building2, TrendingUp, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardOverviewPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.overview;

  const [activeBidsCount, setActiveBidsCount] = useState("0");
  const [wonAuctionsCount, setWonAuctionsCount] = useState("0");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";
        
        if (role === 'seller') {
          // Temporarily set empty stats for seller until seller dashboard API is ready
          setActiveBidsCount("0");
          setWonAuctionsCount("0");
          setRecentActivity([]);
          return;
        }

        // Fetch active bids and history in parallel
        const [myBidsRes, historyRes] = await Promise.all([
          api.get('/buyer/my-bids'),
          api.get('/buyer/bids-history')
        ]);

        const activeBids = myBidsRes.data.data || [];
        setActiveBidsCount(activeBids.length.toString());

        const history = historyRes.data.data || [];
        const wonCount = history.filter((item: any) => item.status === 'WON').length;
        setWonAuctionsCount(wonCount.toString());

        // Process recent activity by merging both lists and sorting by date
        const formattedBids = activeBids.map((bid: any) => ({
          id: bid.bidId,
          type: bid.bidStatus === 'LEADING' ? 'offer' : 'outbid',
          text: bid.bidStatus === 'LEADING' 
            ? `You placed a bid of ${bid.bidAmount.toLocaleString()} AED on ${bid.property.propertyTitle}` 
            : `You were outbid on ${bid.property.propertyTitle}`,
          date: new Date(bid.bidDate)
        }));

        const formattedHistory = history.map((item: any) => ({
          id: item._id,
          type: item.status === 'WON' ? 'won' : 'lost',
          text: item.status === 'WON' 
            ? `You won the auction for ${item.property.title}`
            : `You lost the auction for ${item.property.title}`,
          date: new Date(item.bidInfo.date)
        }));

        const combinedActivity = [...formattedBids, ...formattedHistory]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5)
          .map(activity => ({
            ...activity,
            time: activity.date.toLocaleDateString()
          }));

        setRecentActivity(combinedActivity);
      } catch (error) {
        console.error("Error fetching dashboard overview", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const stats = [
    { label: content.stats.activeBids, value: activeBidsCount, icon: Gavel, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: content.stats.wonAuctions, value: wonAuctionsCount, icon: TrendingUp, color: "text-[#5CD284]", bg: "bg-[#5CD284]/10" },
    { label: content.stats.savedProperties, value: "0", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#915331]" />
      </div>
    );
  }

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
          <div key={i} className="bg-white dark:bg-[#102418] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] flex items-center gap-4 hover:shadow-md transition-shadow">
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
      <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{content.recentActivity}</h2>
          <Link href={`/${locale}/dashboard/bids`} className="text-sm font-semibold text-[#1A3626] dark:text-[#915331] hover:underline flex items-center gap-1">
            {content.viewAll} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6 space-y-6">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity found.</p>
          ) : (
            recentActivity.map((activity, i) => (
              <div key={activity.id + '-' + i} className="flex gap-4">
                <div className="mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'offer' || activity.type === 'won' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'outbid' || activity.type === 'lost' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {activity.type === 'offer' ? <Gavel className="w-4 h-4" /> :
                     activity.type === 'won' ? <CheckCircle2 className="w-4 h-4" /> :
                     activity.type === 'outbid' || activity.type === 'lost' ? <TrendingUp className="w-4 h-4 rotate-180" /> :
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
