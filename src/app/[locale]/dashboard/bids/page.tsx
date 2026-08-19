"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Search, Filter, ArrowUpRight, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

export default function OffersPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.bids;
  const { addToast } = useSocket();

  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/buyer/my-bids');
        const formattedBids = (res.data.data || []).map((bid: any) => ({
          id: bid.bidId?.toString() || '',
          auctionId: bid.auction?.auctionId?.toString() || '',
          propertyTitle: bid.property?.propertyTitle || 'Property',
          image: bid.property?.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          myOffer: bid.bidAmount != null ? `AED ${bid.bidAmount.toLocaleString()}` : "N/A",
          status: bid.bidStatus ? bid.bidStatus.toLowerCase() : 'unknown',
          date: bid.bidDate ? new Date(bid.bidDate).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        }));
        setBids(formattedBids);
      } catch {
        addToast("Error", "Failed to load your bids. Please try refreshing.", "warning");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBids();
  }, []);

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
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search offers..."
            className="w-full bg-transparent border-none outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#102418] w-full sm:w-auto transition-colors cursor-pointer">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
          </div>
        ) : bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-gray-400">
            <p>You haven't placed any bids yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-[#102418]/50 border-b border-gray-100 dark:border-[#1A3626]">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.property}</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.bidAmount}</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.status}</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{content.table.date}</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626]">
                {bids.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50/50 dark:hover:bg-[#102418]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0">
                          <Image src={offer.image} alt={offer.propertyTitle} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors line-clamp-1">{offer.propertyTitle}</p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">{offer.id ? offer.id.slice(-6).toUpperCase() : '——'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{offer.myOffer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold uppercase ${
                        offer.status === 'leading' ? 'bg-[#5CD284]/10 text-[#1A3626] dark:text-[#c9a14b]' :
                        offer.status === 'outbid' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                        offer.status === 'won' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        offer.status === 'lost' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                      }`}>
                        {offer.status === 'leading' && <ArrowUpRight className="w-3.5 h-3.5" />}
                        {offer.status === 'outbid' && <ArrowUpRight className="w-3.5 h-3.5 rotate-90" />}
                        {offer.status === 'won' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {offer.status === 'lost' && <XCircle className="w-3.5 h-3.5" />}
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                      {offer.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {offer.auctionId ? (
                        <Link href={`/${locale}/auctions/${offer.auctionId}`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1A3626] dark:text-[#c9a14b] hover:underline">
                          View <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
