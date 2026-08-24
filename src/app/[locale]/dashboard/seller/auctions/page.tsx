"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, Gavel, MapPin, Eye, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSocket } from "@/context/SocketContext";

export default function MyAuctionsPage() {
  const { locale } = useDictionary();
  const { addToast } = useSocket();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await api.get('/seller/myAuction');
        setAuctions(response.data?.data || []);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Failed to load your auctions. Please try refreshing.";
        addToast("Error", errorMsg, "warning");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Live Auctions</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-sm">Monitor your properties currently on auction</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" />
        </div>
      ) : auctions.length === 0 ? (
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 border border-gray-100 dark:border-[#1A3626] text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#1A3626]/30 rounded-full flex items-center justify-center mb-6">
            <Gavel className="w-10 h-10 text-gray-400 dark:text-[#c9a14b]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Live Auctions</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">None of your properties are currently live for bidding. Once approved, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div key={auction._id} className="bg-white dark:bg-[#102418] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#1A3626] flex flex-col group hover:shadow-xl transition-all duration-300">
              
              <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
                {auction.propertyId?.propertyImages?.[0] ? (
                  <Image 
                    src={auction.propertyId.propertyImages[0].url} 
                    alt={auction.propertyId.propertyTitle || "Property"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gavel className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-[#FF0000] px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
                  {auction.propertyId?.propertyTitle || "Unknown Title"}
                </h3>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{auction.propertyId?.propertyLocation || "Unknown Location"}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                  <div className="bg-gray-50 dark:bg-[#163321] p-3 rounded-xl border border-gray-100 dark:border-[#1A3626]">
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Current Bid</div>
                    <div className="font-bold text-lg text-[#1A3626] dark:text-[#5CD284]">AED {auction.currentHighestBid?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#163321] p-3 rounded-xl border border-gray-100 dark:border-[#1A3626]">
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Total Bids</div>
                    <div className="font-bold text-lg text-[#1A3626] dark:text-white">{auction.bidCounter || 0}</div>
                  </div>
                </div>

                <Link 
                  href={`/${locale}/auctions/${auction._id}`}
                  className="w-full py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:opacity-90 flex justify-center items-center gap-2 transition-opacity cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Live Action
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
