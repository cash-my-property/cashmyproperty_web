"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldCheck, MapPin, ChevronRight, CheckCircle2, Bed, Bath, Square, Phone, Mail, Building2, User, Loader2 } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";

export default function PropertyDetailPage() {
  const { dict, locale } = useDictionary();
  const params = useParams();
  const contactForm = dict.contact.main.form;

  const [activeImage, setActiveImage] = useState(0);
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const id = params.id as string;
        if (!id) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
        const res = await axios.get(`${API_URL}/public/property-details/${id}`);
        setPropertyInfo(res.data.data);
      } catch (err) {
        console.error("Error fetching property details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Inquiry Sent Successfully!");
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#0A101C] pt-32 sm:pt-36 pb-16 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
      </main>
    );
  }

  if (!propertyInfo) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#0A101C] pt-32 sm:pt-36 pb-16 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Property not found</h1>
        <Link href={`/${locale}/listings`} className="mt-4 text-[#1A3626] dark:text-[#5CD284] underline">Back to listings</Link>
      </main>
    );
  }

  const details = propertyInfo.propertyDetails || {};
  const images = details.propertyImages?.length > 0 ? details.propertyImages.map((i:any) => i.url) : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"];
  const title = details.propertyTitle || "Untitled Property";
  const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai");
  const priceAmount = details.propertyPrice?.amount || details.propertyPrice || 0;
  const price = propertyInfo.currentHighestBid ? `Ð ${propertyInfo.currentHighestBid.toLocaleString()}` : `Ð ${priceAmount.toLocaleString()}`;
  const type = details.propertyType || "N/A";
  const beds = details.propertyBedrooms || 0;
  const baths = details.propertyWashrooms || details.propertyBathrooms || 0;
  
  // Safely extract area if it's an object { value, unit }
  const getAreaValue = (area: any) => {
    if (!area) return 0;
    if (typeof area === 'object' && area.value !== undefined) return area.value;
    return area;
  };
  const sqft = getAreaValue(details.propertyArea || details.propertyBuiltUpArea);
  const description = details.propertyDescription || "No description provided.";
  const features = details.propertyFeatures || ["Central A/C", "Balcony", "Shared Pool", "Security"];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#0A101C] pt-32 sm:pt-36 pb-16 transition-colors">
      
      {/* Top Breadcrumb & Status */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/listings`} className="hover:text-[#1A3626] dark:hover:text-[#5CD284] transition-colors">Properties</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-bold">{propertyInfo.PID || propertyInfo._id}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] px-4 py-1.5 rounded-full border border-[#5CD284]/20">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[12px] font-bold tracking-widest uppercase">{propertyInfo.status || 'Available'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gallery & Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Gallery */}
          <div className="bg-white dark:bg-[#1E293B] p-2 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden mb-2 bg-gray-100 dark:bg-slate-900 group">
              <Image src={images[activeImage] || images[0]} alt="Property" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5CD284]" />
                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Verified by DLD</span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto global-green-scrollbar pb-2">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-[#1A3626] dark:border-[#5CD284] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold text-gray-900 dark:text-white mb-2 leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {title}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[15px]">
                  <MapPin className="w-5 h-5" />
                  <span>{location}</span>
                </div>
              </div>
              <div className="shrink-0 bg-green-50 dark:bg-slate-800/80 px-5 py-3 rounded-2xl border border-green-100 dark:border-slate-700">
                <p className="text-[13px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">{propertyInfo.currentHighestBid ? 'Highest Bid' : 'Asking Price'}</p>
                <p className="text-[24px] font-bold text-[#1A3626] dark:text-[#5CD284] tabular-nums">
                  {price}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-slate-700 mb-8 bg-gray-50 dark:bg-slate-800/30 rounded-2xl px-6">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Building2 className="w-4 h-4"/> Type</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{type}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-gray-200 dark:border-slate-700 pl-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Bed className="w-4 h-4"/> Bedrooms</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{beds}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-gray-200 dark:border-slate-700 pl-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Bath className="w-4 h-4"/> Bathrooms</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{baths}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-gray-200 dark:border-slate-700 pl-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Square className="w-4 h-4"/> Area (Sqft)</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{sqft}</span>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px] whitespace-pre-wrap">
                {description}
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-[15px]">
                    <CheckCircle2 className="w-5 h-5 text-[#5CD284] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {details.trakheesiNumber && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-[15px]">
                    <CheckCircle2 className="w-5 h-5 text-[#5CD284] shrink-0" />
                    <span>Trakheesi No: {details.trakheesiNumber}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact Dashboard (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">
            
            {/* Reserved for Future Google Ads */}
            <div className="bg-gray-100 dark:bg-slate-800/50 rounded-3xl p-6 border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center min-h-[400px] text-center">
              <span className="text-gray-400 dark:text-gray-500 font-bold text-[14px] uppercase tracking-widest mb-2">Advertisement</span>
              <p className="text-gray-500 dark:text-gray-400 text-[13px]">Space reserved for future Google Ads integration.</p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
