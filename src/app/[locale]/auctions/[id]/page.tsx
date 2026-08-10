"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ShieldCheck, MapPin, ChevronRight, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function LiveAuctionPage() {
  const { dict, locale } = useDictionary();
  const content = dict.auctions;
  const auctionData = content.auctionData;

  const [activeImage, setActiveImage] = useState(0);
  const [offers, setBids] = useState(auctionData.initialBids);
  const [currentBid, setCurrentBid] = useState(auctionData.initialBids[0].amount);

  // Countdown timer logic
  const [timeLeftStr, setTimeLeftStr] = useState("Loading...");

  useEffect(() => {
    // Creating a fixed end time 4h 23m from when page loads
    const endTime = new Date(Date.now() + 1000 * 60 * 60 * 4 + 1000 * 60 * 23);
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeftStr("AUCTION ENDED");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlaceOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const newBid = currentBid + auctionData.minIncrement;
    const newBidObj = {
      id: offers.length + 1,
      user: "Y***u",
      amount: newBid,
      time: "Just now"
    };
    setBids([newBidObj, ...offers]);
    setCurrentBid(newBid);
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-32 sm:pt-36 pb-16 transition-colors">
      
      {/* Top Breadcrumb & Status */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/auctions`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Live Offers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-bold">{auctionData.id}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full border border-red-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[12px] font-bold tracking-widest uppercase">Live Now</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
              <Users className="w-4 h-4" /> 24 Watching
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gallery & Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Gallery */}
          <div className="bg-white dark:bg-[#102418] p-2 rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626]">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden mb-2 bg-gray-100 dark:bg-[#091711]">
              <Image src={auctionData.images[activeImage]} alt="Property" fill className="object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#102418]/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-[#1A3626] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5CD284]" />
                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Verified by DLD</span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto global-green-scrollbar pb-2">
              {auctionData.images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-[#5CD284] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-[#1A3626]">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-gray-900 dark:text-white mb-4 leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {auctionData.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[15px] mb-8">
              <MapPin className="w-5 h-5" />
              <span>{auctionData.location}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-[#1A3626] mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Type</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{auctionData.type}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Bedrooms</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{auctionData.beds}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Bathrooms</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{auctionData.baths}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Area (Sqft)</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{auctionData.sqft}</span>
              </div>
            </div>

            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">{content.property.description}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px] mb-8">
              An exceptional {auctionData.type.toLowerCase()} offering luxurious living spaces, premium finishes, and breathtaking views. This distress property is listed exclusively on our platform for a 7-day fast-track live offer. Act quickly to secure this premium asset below market value.
            </p>
          </div>
        </div>

        {/* Right Column: Offering Dashboard (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">
            
            {/* Realtime Dashboard */}
            <div className="bg-[#1B3A2D] dark:bg-[#0A1612] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5CD284]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col">
                <p className="text-white/60 text-[13px] font-bold uppercase tracking-widest mb-2">{content.offering.endsIn}</p>
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="w-6 h-6 text-red-400" />
                  <span className="text-white text-[28px] font-bold tracking-tight tabular-nums">{timeLeftStr}</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-md">
                  <p className="text-[#5CD284] text-[12px] font-bold uppercase tracking-widest mb-1">{content.offering.currentBid}</p>
                  <p className="text-white text-[36px] font-bold tracking-tight mb-4 tabular-nums">
                    Ð {currentBid.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 text-[13px] text-white/60 bg-black/20 p-3 rounded-xl border border-white/5">
                    <TrendingUp className="w-4 h-4 text-[#5CD284]" />
                    Minimum Increment: <strong>Ð {auctionData.minIncrement.toLocaleString()}</strong>
                  </div>
                </div>

                <form onSubmit={handlePlaceOffer} className="flex flex-col gap-4">
                  <button type="submit" className="w-full bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold text-[16px] py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(92,210,132,0.3)] hover:shadow-[0_0_30px_rgba(92,210,132,0.5)]">
                    {content.offering.placeOfferBtn} (Ð {(currentBid + auctionData.minIncrement).toLocaleString()})
                  </button>
                  <p className="text-white/40 text-[11px] text-center">
                    By placing a offer, you agree to our Terms and Conditions. A 10% deposit is required upon winning.
                  </p>
                </form>
              </div>
            </div>

            {/* Offer History */}
            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1A3626]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[18px] text-gray-900 dark:text-white">Live Offers</h3>
                <span className="bg-gray-100 dark:bg-[#102418] text-gray-600 dark:text-gray-300 text-[12px] font-bold px-3 py-1 rounded-lg">
                  {offers.length} Offers
                </span>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto global-green-scrollbar pr-2 max-h-[300px]">
                {offers.map((offer: any, i: number) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#102418]/50 border border-gray-100 dark:border-[#1A3626]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#163321] flex items-center justify-center text-[14px] font-bold text-gray-600 dark:text-gray-300">
                        {offer.user[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-gray-900 dark:text-white">{offer.user}</span>
                        <span className="text-[12px] text-gray-500 dark:text-gray-400">{offer.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-[15px] text-[#1A3626] dark:text-[#c9a14b]">
                        Ð {offer.amount.toLocaleString()}
                      </span>
                      {i === 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase">
                          Highest <CheckCircle2 className="w-3 h-3 text-[#5CD284]" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
