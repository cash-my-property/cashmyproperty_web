"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, ListOrdered, User, Clock, ShieldCheck, FileText } from "lucide-react";
import Image from "next/image";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSocket } from "@/context/SocketContext";

export default function ReceivedBidsPage() {
  const { locale } = useDictionary();
  const { addToast } = useSocket();
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await api.get('/seller/myBids');
        setBids(response.data?.data || []);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Failed to load received bids. Please try refreshing.";
        addToast("Error", errorMsg, "warning");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBids();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Received Offers</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Review all offers made on your properties</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" />
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 border border-gray-100 dark:border-[#1A3626] text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#1A3626]/30 rounded-full flex items-center justify-center mb-6">
            <ListOrdered className="w-10 h-10 text-gray-400 dark:text-[#c9a14b]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Offers Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">You haven't received any offers on your properties yet. When buyers place offers, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#163321]/50 border-b border-gray-100 dark:border-[#1A3626]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buyer Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626]">
                {bids.map((bid, index) => (
                  <tr key={bid._id || index} className="hover:bg-gray-50/50 dark:hover:bg-[#163321]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                          {bid.propertyId?.propertyImages?.[0]?.url ? (
                            <Image src={bid.propertyId.propertyImages[0].url} alt="Property" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FileText className="w-4 h-4 text-gray-400" /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{bid.propertyId?.propertyTitle || "Unknown Property"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{bid.propertyId?.propertyType || "Property"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Buyer #{bid.bidderId ? bid.bidderId.substring(0, 6).toUpperCase() : "..."}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[15px] font-bold text-[#1A3626] dark:text-[#5CD284]">
                        AED {bid.bidAmount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(bid.bidTime || bid.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        bid.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {bid.status === 'ACCEPTED' ? <ShieldCheck className="w-3 h-3" /> : null}
                        {bid.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {bid.status !== 'ACCEPTED' && bid.status !== 'REJECTED' ? (
                        <div className="flex justify-end gap-2">
                          <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1A3626] dark:bg-[#c9a14b] text-white hover:opacity-90 transition-opacity cursor-pointer">
                            Accept
                          </button>
                          <button className="px-4 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Action taken</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
