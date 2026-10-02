"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Tag, Heart, Building2, TrendingUp, Clock, ChevronRight, CheckCircle2, UserCheck, Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function DashboardOverviewPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.overview;

  const [activeBidsCount, setActiveBidsCount] = useState("0");
  const [wonAuctionsCount, setWonAuctionsCount] = useState("0");
  const [propertiesCount, setPropertiesCount] = useState("0");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useSocket();

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";
        const sellerType = (user as any)?.sellerType?.toUpperCase() || (typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR');
        
        if (role === 'seller') {
          if (sellerType === 'SIMPLE') {
            try {
              const propsRes = await api.get('/seller/mySimpleListings?page=1&limit=1');
              const resData = propsRes.data?.result || propsRes.data;
              const totalCount = resData?.pagination?.total ?? (resData?.data?.length ?? 0);
              setPropertiesCount(totalCount.toString());
            } catch {
              // Soft handle
            }
          } else {
            try {
              const [propsRes, auctionsRes, bidsRes] = await Promise.all([
                api.get('/seller/my-properties'),
                api.get('/seller/myAuction'),
                api.get('/seller/myBids')
              ]);
              
              const propsList = propsRes.data.result?.data || propsRes.data.data || [];
              const auctionsList = auctionsRes.data.data || [];
              const bidsList = bidsRes.data.data || [];
              
              setPropertiesCount(propsList.length.toString());
              setWonAuctionsCount(auctionsList.length.toString());
              setActiveBidsCount(bidsList.length.toString());
            } catch {
              addToast("Error", "Failed to load agent statistics.", "warning");
            }
          }
          setRecentActivity([]);
          return;
        }

        const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';
        if (role === 'buyer' && buyerType === 'SIMPLE') {
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
        const formattedBids = activeBids
          .filter((bid: any) => bid.bidId && bid.bidDate)
          .map((bid: any) => ({
            id: bid.bidId?.toString() || '',
            type: bid.bidStatus === 'LEADING' ? 'offer' : 'outbid',
            text: bid.bidStatus === 'LEADING'
              ? `You placed an offer of AED ${(bid.bidAmount ?? 0).toLocaleString()} on ${bid.property?.propertyTitle || 'a property'}`
              : `You were outoffered on ${bid.property?.propertyTitle || 'a property'}`,
            date: new Date(bid.bidDate)
          }));

        const formattedHistory = history
          .filter((item: any) => item._id && item.bidInfo?.date)
          .map((item: any) => ({
            id: item._id?.toString() || '',
            type: item.status === 'WON' ? 'won' : 'lost',
            text: item.status === 'WON'
              ? `You won the offer for ${item.property?.title || 'a property'}`
              : `Your offer was unsuccessful for ${item.property?.title || 'a property'}`,
            date: new Date(item.bidInfo.date)
          }));

        const combinedActivity = [...formattedBids, ...formattedHistory]
          .filter(a => !isNaN(a.date.getTime()))
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5)
          .map(activity => ({
            ...activity,
            time: activity.date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })
          }));

        setRecentActivity(combinedActivity);
      } catch {
        addToast("Error", "Failed to load dashboard data. Please refresh the page.", "warning");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, user?.email]);

  const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";
  const sellerType = (user as any)?.sellerType?.toUpperCase() || (typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR');
  const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';

  let stats = [
    { label: content.stats.activeBids, value: activeBidsCount, icon: Tag, color: "text-blue-500", bg: "bg-blue-500/10", href: `/${locale}/dashboard/bids` },
    { label: content.stats.wonAuctions, value: wonAuctionsCount, icon: TrendingUp, color: "text-[#5CD284]", bg: "bg-[#5CD284]/10", href: `/${locale}/dashboard/bids` },
    { label: content.stats.savedProperties, value: "0", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", href: `/${locale}/dashboard/favorites` },
  ];

  if (role === 'buyer' && buyerType === 'SIMPLE') {
    stats = [
      { label: "Listings", value: "Browse", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10", href: `/${locale}/listings` },
      { label: "Verified Agents", value: "Directory", icon: UserCheck, color: "text-[#5CD284]", bg: "bg-[#5CD284]/10", href: `/${locale}/sellers` },
      { label: content.stats.savedProperties, value: "Saved", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", href: `/${locale}/dashboard/favorites` },
    ];
  } else if (role === 'seller' && sellerType === 'SIMPLE') {
    stats = [
      { label: "Free Plan", value: "5 Free Listings", icon: Sparkles, color: "text-[#5CD284]", bg: "bg-[#5CD284]/10", href: `/${locale}/dashboard/seller/simple-listings` },
      { label: "My Listings", value: propertiesCount, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10", href: `/${locale}/dashboard/seller/simple-listings` },
      { label: "Add Listing", value: "Create New", icon: PlusCircle, color: "text-rose-500", bg: "bg-rose-500/10", href: `/${locale}/dashboard/seller/add-simple-property` },
    ];
  } else if (role === 'seller' && sellerType === 'REGULAR') {
    stats = [
      { label: "Received Offers", value: activeBidsCount, icon: Tag, color: "text-blue-500", bg: "bg-blue-500/10", href: `/${locale}/dashboard/seller/properties` },
      { label: "Active Listings", value: wonAuctionsCount, icon: TrendingUp, color: "text-[#5CD284]", bg: "bg-[#5CD284]/10", href: `/${locale}/dashboard/seller/properties` },
      { label: "Total Properties", value: propertiesCount, icon: Building2, color: "text-rose-500", bg: "bg-rose-500/10", href: `/${locale}/dashboard/seller/properties` },
    ];
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Clean Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {content.title || "Dashboard Overview"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.fullName || user?.firstName || 'Valued User'}</span>. Track your active properties, bids, and market activity in real-time.
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
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#091711] flex items-center justify-center text-gray-400 group-hover:text-[#5CD284] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-xs border border-gray-100 dark:border-[#1A3626] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#1A3626] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{content.recentActivity}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time updates on your offers and interactions</p>
          </div>
          <Link
            href={role === 'buyer' && buyerType === 'SIMPLE' ? `/${locale}/sellers` : `/${locale}/dashboard/bids`}
            className="text-xs font-bold text-[#1A3626] dark:text-[#5CD284] hover:underline flex items-center gap-1"
          >
            <span>{content.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="p-6 space-y-4">
          {recentActivity.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#163321] flex items-center justify-center text-gray-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No recent activity found</p>
              <p className="text-xs text-gray-400">Activity on properties and bids will appear here automatically.</p>
            </div>
          ) : (
            recentActivity.map((activity, i) => (
              <div
                key={activity.id + '-' + i}
                className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#163321]/40 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-[#1A3626]"
              >
                <div className="shrink-0 mt-0.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activity.type === 'offer' || activity.type === 'won' ? 'bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284]' :
                    activity.type === 'outbid' || activity.type === 'lost' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {activity.type === 'offer' ? <Tag className="w-4 h-4" /> :
                     activity.type === 'won' ? <CheckCircle2 className="w-4 h-4" /> :
                     activity.type === 'outbid' || activity.type === 'lost' ? <TrendingUp className="w-4 h-4 rotate-180" /> :
                     <Heart className="w-4 h-4" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 leading-relaxed">
                    {activity.text}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{activity.time}</span>
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
