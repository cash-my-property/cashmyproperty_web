"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Filter, Bed, Bath, Square, ChevronDown, ArrowRight, Building } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function ListingsPage() {
  const { dict, locale } = useDictionary();
  const content = dict.home;

  // Filter state
  const [activeType, setActiveType] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, isLoading: authLoading, isBuyer } = useAuth();
  const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';

  useEffect(() => {
    if (authLoading) return;
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
        
        let res;
        if (isAuthenticated && isBuyer && buyerType === 'SIMPLE') {
          res = await api.get('/buyer/simpleLiveListings');
        } else {
          res = await axios.get(`${API_URL}/public/simple-live-properties`);
        }
        
        const data = res.data.data;
        setProperties(Array.isArray(data) ? data : (data?.data || []));
      } catch (err) {
        console.error("Error fetching properties", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [authLoading, isAuthenticated, user]);

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full pt-36 sm:pt-40 pb-16 px-6 lg:px-12 flex flex-col items-center justify-center bg-[#1B3A2D] dark:bg-[#0A1612]">
        {/* Background elements wrapped to prevent overflow clipping dropdown */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5CD284]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#5CD284]/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center mt-8">
            {/* placeholder for tagline */}
          <h1 className="text-white text-[40px] sm:text-[56px] font-bold mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.hero.headline.replace('\n', '<br/>') }}>
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light mb-10">
            {content.hero.subheadline}
          </p>

          {/* Search Bar - Inline Filters */}
          {/* Search Bar & Filters Container */}
          <div className="w-full max-w-4xl flex flex-col gap-4">
            {/* Row 1: Search Input & Search Button */}
            <div className="w-full bg-white dark:bg-[#102418] p-2 rounded-2xl shadow-2xl flex flex-row gap-2 border border-gray-100 dark:border-[#1A3626] items-center">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#102418]/50 rounded-xl">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder={content.hero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                />
              </div>
              
              <button className="bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] px-8 py-3.5 rounded-xl font-bold text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap">
                <Filter className="w-4 h-4 shrink-0" />
                {content.hero.searchButton}
              </button>
            </div>

            {/* Row 2: Filter Dropdowns Grouped Together */}
            <div className="flex flex-wrap items-center justify-center gap-3 bg-white/5 dark:bg-[#102418]/20 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              {/* Type Dropdown */}
              <div className="relative w-[160px] shrink-0">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#1A3626] transition-colors border border-gray-100 dark:border-[#1A3626] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors shrink-0" />
                    <span className="text-[13.5px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                      {selectedType || content.hero.filters.type}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all shrink-0 ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                </div>
                
                {activeDropdown === 'type' && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {Object.entries(dict.home.hero.filters.types).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer ${selectedType === value ? 'bg-green-50/80 dark:bg-[#163321]/80 text-[#1A3626] dark:text-[#c9a14b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50'}`}
                        onClick={() => { setSelectedType(value as string); setActiveDropdown(null); }}
                      >
                        {value as string}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Sort Dropdown */}
              <div className="relative w-[160px] shrink-0">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#102418] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#1A3626] transition-colors border border-gray-100 dark:border-[#1A3626] min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-colors shrink-0" />
                    <span className="text-[13.5px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                      {priceSort === 'asc' ? "Low to High" : priceSort === 'desc' ? "High to Low" : "Sort Price"}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5CD284] transition-all shrink-0 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
                </div>
                
                {activeDropdown === 'price' && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#102418] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#1A3626] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div 
                      className="px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50"
                      onClick={() => { setPriceSort(null); setActiveDropdown(null); }}
                    >
                      Default
                    </div>
                    <div 
                      className="px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50"
                      onClick={() => { setPriceSort("asc"); setActiveDropdown(null); }}
                    >
                      Price: Low to High
                    </div>
                    <div 
                      className="px-4 py-3 text-[13.5px] font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#163321]/50"
                      onClick={() => { setPriceSort("desc"); setActiveDropdown(null); }}
                    >
                      Price: High to Low
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeType === type ? 'bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#102418] dark:text-gray-300 dark:hover:bg-[#163321]'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS GRID */}
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
                </div>
              </div>
            ))
          ) : (() => {
            const filteredProperties = properties
              .filter(item => {
                const details = item.propertyDetails || item || {};
                const title = item.title || details.propertyTitle || "";
                const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai");

                if (searchQuery) {
                  const query = searchQuery.toLowerCase();
                  const matchTitle = title.toLowerCase().includes(query);
                  const matchLocation = location.toLowerCase().includes(query);
                  return matchTitle || matchLocation;
                }
                return true;
              })
              .filter(item => {
                const details = item.propertyDetails || item || {};
                const type = details.propertyType || "";

                if (activeType !== "All") {
                  return type.toUpperCase() === activeType.toUpperCase();
                }
                return true;
              })
              .filter(item => {
                const details = item.propertyDetails || item || {};
                const type = details.propertyType || "";

                if (selectedType && selectedType !== "All Type" && selectedType !== "All") {
                  return type.toUpperCase() === selectedType.toUpperCase();
                }
                return true;
              })
              .sort((a, b) => {
                if (!priceSort) return 0;
                const detailsA = a.propertyDetails || a || {};
                const detailsB = b.propertyDetails || b || {};
                const priceA = a.price?.amount || detailsA.propertyPrice?.amount || detailsA.propertyPrice || 0;
                const priceB = b.price?.amount || detailsB.propertyPrice?.amount || detailsB.propertyPrice || 0;

                return priceSort === "asc" ? priceA - priceB : priceB - priceA;
              });

            if (filteredProperties.length === 0) {
              return <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500">No properties match the selected filters.</div>;
            }

            return filteredProperties.map((item) => {
              const details = item.propertyDetails || item || {};
              const title = item.title || details.propertyTitle || "Untitled Property";
              const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai");
              const image = item.image || details.propertyImages?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              const beds = item.specs?.beds || details.propertyBedrooms || 0;
              const baths = item.specs?.washrooms || details.propertyWashrooms || details.propertyBathrooms || 0;
              const area = item.area?.value ? `${item.area.value} ${item.area.unit || 'sqft'}` : (details.propertyArea?.value ? `${details.propertyArea.value} ${details.propertyArea.unit || 'sqft'}` : (details.propertyBuiltUpArea || 0) + ' sqft');
              const price = item.price?.amount || details.propertyPrice?.amount || details.propertyPrice || 0;
              const type = details.propertyType || "Property";

              return (
              <Link href={`/${locale}/simple-listings/${item._id || item.id}`} key={item._id || item.id} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group block cursor-pointer">
                <div className="relative h-[240px] overflow-hidden rounded-[20px] bg-gray-100 dark:bg-[#091711]">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white dark:bg-[#102418] text-[#1A3626] dark:text-[#c9a14b] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                     <span className="w-2 h-2 rounded-full bg-[#5CD284]"></span> ACTIVE
                  </div>
                </div>
                
                <div className="p-4 pt-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-[20px] text-gray-900 dark:text-white leading-tight line-clamp-1">{title}</h3>
                    <span className="font-bold text-[22px] text-gray-900 dark:text-[#c9a14b] leading-none whitespace-nowrap">Ð {price.toLocaleString()}</span>
                  </div>
                  
                  <p className="text-[#1A3626] dark:text-[#c9a14b] text-[13px] font-medium flex items-center gap-1.5 mb-4">
                    <MapPin className="w-4 h-4" /> {location}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-5">
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bed className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" /> {beds}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Bath className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" /> {baths}</div>
                     <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 dark:text-white"><Square className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {area}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-5">
                    <div className="px-5 py-2.5 w-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-lg font-bold text-[14px] hover:bg-[#124d31] dark:hover:bg-[#b38d3f] transition-colors inline-block text-center">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            );
          });
        })()}
        </div>
      </section>

    </main>
  );
}
