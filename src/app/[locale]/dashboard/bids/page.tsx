"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Search, Filter, MoreHorizontal, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

export default function BidsPage() {
  const { dict } = useDictionary();
  const content = dict.dashboard.bids;

  const bids = [
    {
      id: "BID-8239",
      property: "Luxury Villa in Palm Jumeirah",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      myBid: "1,200,000 Ð",
      highestBid: "1,200,000 Ð",
      status: "winning",
      date: "Oct 24, 2026",
    },
    {
      id: "BID-8102",
      property: "Downtown Penthouse",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      myBid: "3,400,000 Ð",
      highestBid: "3,500,000 Ð",
      status: "outbid",
      date: "Oct 22, 2026",
    },
    {
      id: "BID-7933",
      property: "Modern Apartment in Dubai Marina",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      myBid: "850,000 Ð",
      highestBid: "850,000 Ð",
      status: "won",
      date: "Oct 15, 2026",
    },
    {
      id: "BID-7821",
      property: "Beachfront Mansion",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      myBid: "5,000,000 Ð",
      highestBid: "5,200,000 Ð",
      status: "lost",
      date: "Oct 10, 2026",
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {content.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-xl w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search bids..."
            className="w-full bg-transparent border-none outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 w-full sm:w-auto transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.property}</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.bidAmount}</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.currentHighest}</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.status}</th>
                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.date}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {bids.map((bid) => (
                <tr key={bid.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0">
                        <Image src={bid.image} alt={bid.property} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors line-clamp-1">{bid.property}</p>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400">{bid.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{bid.myBid}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-medium text-gray-600 dark:text-gray-400">{bid.highestBid}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold ${
                      bid.status === 'winning' ? 'bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284]' :
                      bid.status === 'outbid' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                      bid.status === 'won' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {bid.status === 'winning' && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {bid.status === 'outbid' && <ArrowUpRight className="w-3.5 h-3.5 rotate-90" />}
                      {bid.status === 'won' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {bid.status === 'lost' && <XCircle className="w-3.5 h-3.5" />}
                      {content.status[bid.status as keyof typeof content.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                    {bid.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
