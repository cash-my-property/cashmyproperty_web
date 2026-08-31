"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Bed, 
  Bath, 
  Square, 
  Phone, 
  Mail, 
  MessageCircle, 
  Building2, 
  Loader2, 
  Share2, 
  Heart,
  Camera,
  Sparkles,
  Lock
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import Dirham from "@/components/Dirham";
import { generateShareToken } from "@/lib/shareToken";

interface SimpleListingDetailClientProps {
  id: string;
  initialData: any;
  locale: string;
}

export default function SimpleListingDetailClient({ id, initialData, locale }: SimpleListingDetailClientProps) {
  const { dict } = useDictionary();
  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller, fetchProfile } = useAuth();
  const searchParams = useSearchParams();
  const st = searchParams?.get('st');
  const { addToast } = useSocket();

  const [activeImage, setActiveImage] = useState(0);
  const [propertyInfo, setPropertyInfo] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isFavourited, setIsFavourited] = useState(initialData?.isFavourited || false);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (propertyInfo) {
      setIsFavourited(propertyInfo.isFavourited || false);
    }
  }, [propertyInfo]);

  const handleToggleFavourite = async () => {
    try {
      setIsFavouriting(true);
      const targetState = !isFavourited;
      await api.put("/buyer/favourites", {
        _id: id,
        listingType: "SIMPLE",
        isFavourited: targetState
      });
      setIsFavourited(targetState);
      setPropertyInfo((prev: any) => (prev ? { ...prev, isFavourited: targetState } : prev));
      addToast(
        targetState ? "Saved to Favorites" : "Removed from Favorites",
        targetState ? "This listing has been bookmarked successfully." : "This listing has been removed from your bookmarks.",
        "success"
      );
    } catch (err) {
      console.error("Error toggling favorite status", err);
      addToast("Error", "Failed to update favorite status. Please try again.", "warning");
    } finally {
      setIsFavouriting(false);
    }
  };

  const fetchDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
      
      let res;
      if (st || isAuthenticated) {
        try {
          const queryStr = st ? `?st=${encodeURIComponent(st)}` : '';
          res = await api.get(`/buyer/simpleListingDetails/${id}${queryStr}`);
          if (res.data?.roleWasSwitched) {
            await fetchProfile();
            addToast("Role Switched", "Your mode was automatically switched to Buyer mode to view this shared property.", "info");
          }
        } catch (apiErr) {
          res = await axios.get(`${API_URL}/public/simple-property-details/${id}`);
        }
      } else {
        res = await axios.get(`${API_URL}/public/simple-property-details/${id}`);
      }
      
      const data = res.data.data || res.data;
      setPropertyInfo(data);
      if (typeof data?.isFavourited === 'boolean') {
        setIsFavourited(data.isFavourited);
      }
    } catch (err) {
      console.error("Error fetching simple listing details client-side", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchDetails();
  }, [id, authLoading, isAuthenticated, user]);

  if (isLoading && !propertyInfo) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-32 sm:pt-36 pb-16 w-full max-w-7xl mx-auto px-6 lg:px-12 animate-pulse transition-colors">
        <div className="flex flex-col lg:flex-row gap-8 w-full mt-6">
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-[450px] bg-gray-200 dark:bg-[#163321] rounded-[32px] w-full" />
            <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded-md w-3/4" />
            <div className="flex gap-6 py-4 border-y border-gray-200 dark:border-[#1A3626]">
              <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-20" />
              <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-20" />
              <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-24" />
            </div>
          </div>
          <div className="w-full lg:w-[380px] h-[300px] bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] rounded-3xl p-6 flex flex-col gap-4">
            <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded-md w-1/2" />
            <div className="h-12 bg-gray-200 dark:bg-[#163321] rounded-md w-full mt-4" />
          </div>
        </div>
      </main>
    );
  }

  if (!authLoading && isAuthenticated && isSeller) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] items-center justify-center gap-8 px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A3626] dark:bg-[#102418] p-10 sm:p-14 flex flex-col items-center gap-6 shadow-2xl border border-[#2a4f38] dark:border-[#1A3626] max-w-lg w-full text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5CD284]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 w-20 h-20 rounded-3xl bg-[#5CD284]/15 border border-[#5CD284]/30 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-[#5CD284]" />
          </div>
          <div className="relative z-10">
            <p className="text-[#5CD284] font-bold tracking-[0.2em] text-[11px] uppercase mb-3">Seller Mode Active</p>
            <h2 className="text-white text-[28px] font-bold mb-3 leading-tight">Access Restricted</h2>
            <p className="text-white/65 text-[15px] leading-relaxed">
              Property detail pages are exclusively for buyers. As a seller, you can only manage and track your own listed properties.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href={`/${locale}/dashboard/seller/simple-listings`}
              className="inline-flex items-center justify-center gap-2 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(92,210,132,0.4)] text-[15px]"
            >
              <Building2 className="w-5 h-5" />
              My Simple Listings
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-[15px]"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const detailDict = dict.listings?.detail || {};

  if (!propertyInfo) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-32 sm:pt-36 pb-16 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Property not found</h1>
        <Link href={`/${locale}/simple-listings`} className="mt-4 text-[#1A3626] dark:text-[#c9a14b] underline">Back to listings</Link>
      </main>
    );
  }

  const details = propertyInfo.propertyDetails || propertyInfo;
  const images = details.propertyImages?.length > 0 ? details.propertyImages.map((i:any) => i.url || i) : ["/property-placeholder.svg"];
  const title = details.propertyTitle || propertyInfo.title || "Untitled Property";
  const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || propertyInfo.location || "Dubai, UAE");
  const priceAmount = details.propertyPrice?.amount || details.propertyPrice || propertyInfo.price || 0;
  const priceValue = priceAmount.toLocaleString();
  const type = details.propertyType || propertyInfo.propertyType || "N/A";
  const beds = details.propertyBedrooms || propertyInfo.bedrooms || 0;
  const baths = details.propertyWashrooms || details.propertyBathrooms || propertyInfo.bathrooms || 0;
  
  const getAreaValue = (area: any) => {
    if (!area) return 0;
    if (typeof area === 'object' && area.value !== undefined) return area.value;
    return area;
  };
  const sqft = getAreaValue(details.propertyArea || details.propertyBuiltUpArea || propertyInfo.area);
  const description = details.propertyDescription || propertyInfo.description || "No description provided.";
  const features = details.propertyFeatures || propertyInfo.features || ["Central A/C", "Balcony", "Shared Pool", "Security"];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-28 sm:pt-32 pb-16 transition-colors">
      {/* Top Breadcrumb & Status */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">{dict.navbar?.links?.[0]?.title || "Home"}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/simple-listings`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Simple Listings</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-bold font-mono">{propertyInfo.PID || propertyInfo._id || propertyInfo.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#c9a14b]/10 dark:text-[#c9a14b] uppercase tracking-wider border border-[#1A3626]/20 dark:border-[#c9a14b]/30">
              {type}
            </span>
            <div className="flex items-center gap-1.5 bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] px-3.5 py-1 rounded-full border border-[#5CD284]/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{propertyInfo.status || 'Active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gallery & Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Gallery Container */}
          <div className="bg-white dark:bg-[#102418] p-3 rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden mb-3 bg-gray-900 group">
              <Image
                src={images[activeImage] || images[0]}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Photo Count Badge */}
              <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10 z-10">
                <Camera className="w-3.5 h-3.5 text-[#c9a14b]" />
                <span>{activeImage + 1} / {images.length} Photos</span>
              </div>

              {/* Carousel Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10 opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10 opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto global-green-scrollbar pb-1 px-1">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      activeImage === idx 
                        ? 'border-[#1A3626] dark:border-[#c9a14b] ring-2 ring-[#c9a14b]/30 shadow-md scale-105' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Actions & Pricing Header */}
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-[#1A3626] space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {title}
                </h1>
                
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />
                  <span>{location}</span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="shrink-0 bg-gradient-to-br from-[#1A3626]/5 to-[#1A3626]/10 dark:from-[#163321] dark:to-[#102418] px-6 py-4 rounded-2xl border border-[#1A3626]/10 dark:border-[#1A3626]">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Asking Price
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1A3626] dark:text-[#c9a14b] tabular-nums flex items-center gap-1.5">
                  <Dirham className="text-xl sm:text-2xl" /> {priceValue}
                </p>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <button 
                onClick={() => {
                  const token = generateShareToken(id, user?._id);
                  const shareUrl = typeof window !== 'undefined' 
                    ? `${window.location.origin}${window.location.pathname}?st=${token}` 
                    : '';
                  if (navigator.share) {
                    navigator.share({ title: title, url: shareUrl }).catch(console.error);
                  } else if (shareUrl) {
                    navigator.clipboard.writeText(shareUrl);
                    addToast("Link Copied", "Shareable property link copied to clipboard successfully!", "success");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#163321] hover:bg-gray-200 dark:hover:bg-[#1A3626] text-gray-800 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer border border-gray-200/50 dark:border-[#1A3626]"
              >
                <Share2 className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                <span>Share Property</span>
              </button>

              {isAuthenticated && isBuyer && (
                <button 
                  onClick={handleToggleFavourite}
                  disabled={isFavouriting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#163321] hover:bg-gray-200 dark:hover:bg-[#1A3626] text-gray-800 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer border border-gray-200/50 dark:border-[#1A3626]"
                >
                  {isFavouriting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavourited ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                  )}
                  <span>{isFavourited ? 'Favourited' : 'Add to Favourites'}</span>
                </button>
              )}
            </div>

            {/* Featured Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Property Type</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{type}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] flex items-center justify-center shrink-0">
                  <Bed className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Bedrooms</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{beds} Beds</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] flex items-center justify-center shrink-0">
                  <Bath className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Washrooms</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{baths} Baths</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] flex items-center justify-center shrink-0">
                  <Square className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Built Up Area</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{sqft} sqft</p>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Additional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {propertyInfo.listingPurpose && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626]">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Purpose</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{propertyInfo.listingPurpose}</span>
                  </div>
                )}
                {propertyInfo.propertyCategory && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626]">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{propertyInfo.propertyCategory}</span>
                  </div>
                )}
                {propertyInfo.unitNumber && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626]">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Unit Number</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">{propertyInfo.unitNumber}</span>
                  </div>
                )}
                {propertyInfo.furnishingStatus && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626]">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Furnishing</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase">{propertyInfo.furnishingStatus.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2.5">
                {features.map((feature: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-[#163321] text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#5CD284]" />
                    <span>{feature}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact Dashboard (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            
            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-[#1A3626] space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interested in this property?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Contact the seller directly to request details, schedule a viewing, or negotiate terms.
              </p>

              <div className="space-y-3 pt-2">
                {/* WhatsApp Button */}
                {propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setShowLoginModal(true);
                        return;
                      }
                      const waNum = (propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber).replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${waNum}`, '_blank');
                    }}
                    className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Agent
                  </button>
                ) : null}

                {/* Phone Button */}
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      setShowLoginModal(true);
                      return;
                    }
                    if (propertyInfo.sellerInfo?.phone) {
                      window.location.href = `tel:${propertyInfo.sellerInfo.phone}`;
                    } else {
                      addToast("Unavailable", "Agent phone number not available", "warning");
                    }
                  }}
                  className="w-full py-3.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Call Agent
                </button>
                
                {/* Email Button */}
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      setShowLoginModal(true);
                      return;
                    }
                    if (propertyInfo.sellerInfo?.email) {
                      window.location.href = `mailto:${propertyInfo.sellerInfo.email}`;
                    } else {
                      addToast("Unavailable", "Agent email not available", "warning");
                    }
                  }}
                  className="w-full py-3.5 bg-transparent border-2 border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-[#163321]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> Email Agent
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-[#1A3626] text-center">
            <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2">
              {detailDict.loginRequired || "Login Required"}
            </h3>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
              {detailDict.loginRequiredDesc || "You need to be logged in to contact the agent. Would you like to log in now?"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 font-bold text-[15px] hover:bg-gray-50 dark:hover:bg-[#1A3626]/50 transition-colors cursor-pointer"
              >
                {detailDict.stayLoggedOut || "Stay Logged Out"}
              </button>
              <Link 
                href={`/${locale}/login`}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold text-[15px] hover:opacity-90 transition-opacity text-center flex items-center justify-center"
              >
                {detailDict.goToLogin || "Go to Login"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
