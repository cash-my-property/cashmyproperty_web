"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Clock, Filter, Bed, Bath, Square, ChevronDown, ArrowRight, Building, Share2, Maximize } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";

export default function AuctionsListingPage() {
  const { dict, locale } = useDictionary();
  const content = dict.home;
  const realtimeOffers = dict.home.realtimebids.items;

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
        const [liveRes, upcomingRes] = await Promise.all([
          axios.get(`${API_URL}/public/live-properties`),
          axios.get(`${API_URL}/public/upcoming-properties`)
        ]);
        setLiveAuctions(liveRes.data.data || []);
        setUpcomingAuctions(upcomingRes.data.data || []);
      } catch (err) {
        console.error("Error fetching live bids:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-6 lg:px-12 flex flex-col items-center justify-center bg-[#1B3A2D] dark:bg-[#0A1612]">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#5CD284]/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center mt-8">
          {/* Tagline removed as not present in home hero */}
          <div className="flex items-center gap-2 mb-6">
            {/* placeholder for tagline */}
          </div>
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

          {/* Search Bar - Inline Filters */}
          <div className="w-full max-w-4xl bg-white dark:bg-[#102418] p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-gray-100 dark:border-[#1A3626]">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#091711]/50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder={content.hero.searchPlaceholder}
                className="w-full bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              />
            </div>
            
            <div className="relative hidden md:block">
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#091711]/50 rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#102418] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              >
                <Building className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors" />
                <span className="text-[14px] text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap min-w-[80px]">
                  {selectedType || content.hero.filters.type}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
              </div>
              
              {activeDropdown === 'type' && (
                <div className="absolute top-full mt-2 w-[200px] right-0 bg-white dark:bg-[#091711] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                  {Object.entries(dict.home.hero.filters.types).map(([key, value]) => (
                    <div 
                      key={key} 
                      className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedType === value ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#915331]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                      onClick={() => { setSelectedType(value as string); setActiveDropdown(null); }}
                    >
                      {value as string}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative hidden md:block">
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#091711]/50 rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#102418] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              >
                <Clock className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors" />
                <span className="text-[14px] text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap min-w-[80px]">
                  {selectedStatus === "All" ? "Status" : selectedStatus}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
              </div>
              
              {activeDropdown === 'status' && (
                <div className="absolute top-full mt-2 w-[160px] right-0 bg-white dark:bg-[#091711] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                  {["All", "Active", "Upcoming"].map((statusValue) => (
                    <div 
                      key={statusValue} 
                      className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedStatus === statusValue ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#915331]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                      onClick={() => { setSelectedStatus(statusValue); setActiveDropdown(null); }}
                    >
                      {statusValue}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-[14px] hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Filter className="w-4 h-4" />
              {content.hero.searchButton}
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <section className="border-b border-gray-200 dark:border-[#1A3626] bg-white dark:bg-[#091711]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex gap-3 overflow-x-auto global-green-scrollbar">
          {["All", "Villa", "Apartment", "Penthouse", "Townhouse", "Commercial"].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeType === type ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#091711] dark:text-gray-300 dark:hover:bg-[#163321]'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* AUCTIONS GRID */}
      <section className="py-16 px-6 lg:px-12 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden border border-gray-100 dark:border-[#1A3626] flex flex-col p-2 animate-pulse shadow-sm">
                <div className="relative h-[240px] rounded-[20px] bg-gray-200 dark:bg-[#163321] w-full" />
                <div className="p-4 pt-5 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-2/3" />
                    <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2 mb-2" />
                  <div className="flex gap-4">
                    <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded-md w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded-md w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-[#163321] rounded-md w-20" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1A3626] flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-24" />
                    <div className="h-8 bg-gray-200 dark:bg-[#163321] rounded-md w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            (() => {
              const combinedAuctions = [...liveAuctions, ...upcomingAuctions].filter(item => {
                if (selectedStatus === "All") return true;
                if (selectedStatus === "Upcoming" && item.status === "UPCOMING") return true;
                if (selectedStatus === "Active" && item.status !== "UPCOMING") return true;
                return false;
              });
              
              if (combinedAuctions.length === 0) {
                return <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">No properties match the selected filters.</div>;
              }
              
              return combinedAuctions.map((item: any) => {
              const details = item.propertyDetails || {};
              const title = details.propertyTitle || "Untitled Property";
              const location = details.propertyLocation?.city || "Dubai";
              const image = details.propertyImages?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              const beds = details.propertyBedrooms || 0;
              const baths = details.propertyBathrooms || 0;
              const type = details.propertyType || "Property";
              const highestBid = item.currentHighestBid || (typeof item.currentHighestOffer === 'object' ? item.currentHighestOffer?.amount : item.currentHighestOffer);
              const fallbackPrice = details.propertyPrice?.amount || details.propertyPrice || 0;
              const price = highestBid ? `Ð ${highestBid.toLocaleString()}` : `Ð ${fallbackPrice.toLocaleString()}`;
              
              const getArea = (area: any) => {
                if (!area) return "N/A";
                if (typeof area === 'object' && area.value !== undefined) return `${area.value} ${area.unit || 'sqft'}`;
                return `${area} sqft`;
              };
              const area = getArea(details.propertyArea || details.propertyBuiltUpArea);
              
              const endDate = new Date(item.endTime);
              const startDate = new Date(item.startTime);
              const now = new Date().getTime();
              
              let timeDisplay = "";
              if (item.status === 'UPCOMING') {
                timeDisplay = `Starts: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
              } else {
                const timeDiff = endDate.getTime() - now;
                if (timeDiff > 0) {
                  const d = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  const h = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const m = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                  timeDisplay = `${d}d ${h}h ${m}m`;
                } else {
                  timeDisplay = 'Ended';
                }
              }

              const priceValue = highestBid ? highestBid.toLocaleString() : fallbackPrice.toLocaleString();

              return (
              <Link href={`/${locale}/listings/${item._id}`} key={item._id} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group block cursor-pointer">
                <div className="relative h-[240px] overflow-hidden rounded-[20px] bg-gray-100 dark:bg-[#091711]">
                  <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#915331] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                     <span className={`w-2 h-2 rounded-full ${item.status === 'UPCOMING' ? 'bg-orange-500' : 'bg-[#5CD284]'}`}></span> {item.status || 'ACTIVE'}
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#915331] px-3 py-1.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 shadow-md whitespace-nowrap">
                     <Clock className="w-3.5 h-3.5 text-[#5CD284]" /> {timeDisplay}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#915331] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase shadow-md">
                     PID-{item.PID || item._id.substring(0,8).toUpperCase()}
                  </div>

                  <div 
                    className="absolute bottom-4 right-4 w-10 h-10 bg-[#0A3622] dark:bg-[#915331] rounded-full flex items-center justify-center text-white dark:text-[#0A3622] shadow-md hover:bg-[#124d31] dark:hover:bg-[#b38d3f] transition-colors"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      const shareUrl = `${window.location.origin}/${locale}/auctions/${item._id}`;
                      if (navigator.share) {
                        navigator.share({ title: title, url: shareUrl }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        alert("Link copied to clipboard!");
                      }
                    }}
                  >
                     <Share2 className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="p-4 pt-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-[20px] text-gray-900 dark:text-white leading-tight line-clamp-1">{title}</h3>
                    <span className="font-bold text-[22px] text-gray-900 dark:text-[#915331] leading-none whitespace-nowrap">Ð {priceValue}</span>
                  </div>
                  
                  <p className="text-[#1A3626] dark:text-[#915331] text-[13px] font-medium flex items-center gap-1.5 mb-4">
                    <MapPin className="w-4 h-4" /> {location}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-5">
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bed className="w-5 h-5 text-[#1A3626] dark:text-[#915331]" /> {beds}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bath className="w-5 h-5 text-[#1A3626] dark:text-[#915331]" /> {baths}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Maximize className="w-4 h-4 text-[#1A3626] dark:text-[#915331]" /> {area}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-bold text-[14px] text-gray-900 dark:text-white">Total Offers {item.totalOffers || 0}</span>
                    <div className="px-5 py-2.5 bg-[#0A3622] dark:bg-[#915331] text-white dark:text-[#0A3622] rounded-lg font-bold text-[14px] hover:bg-[#124d31] dark:hover:bg-[#b38d3f] transition-colors inline-block text-center">
                      Make Offer
                    </div>
                  </div>

                  {/* Footer Grid */}
                  <div className="mt-auto bg-[#F4F5F7] dark:bg-[#091711] rounded-xl p-3 grid grid-cols-3 divide-x divide-gray-300 dark:divide-[#1A3626]">
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#915331] text-[10px] font-bold uppercase tracking-wider mb-0.5">Category</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{details.propertyCategory || "Residential"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#915331] text-[10px] font-bold uppercase tracking-wider mb-0.5">Type</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{type}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[#1A3626] dark:text-[#915331] text-[10px] font-bold uppercase tracking-wider mb-0.5">Status</span>
                      <span className="text-gray-900 dark:text-white text-[12px] font-bold uppercase truncate w-full">{item.status || "Ready"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
            })
            })()
          )}
        </div>
      </section>

    </main>
  );
}
