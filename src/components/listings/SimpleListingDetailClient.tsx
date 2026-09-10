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
import dynamic from "next/dynamic";
import Dirham from "@/components/Dirham";
import { generateShareToken } from "@/lib/shareToken";

const PropertyMapCard = dynamic(() => import("@/components/listings/PropertyMapCard"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-3xl bg-gray-100 dark:bg-[#102418] animate-pulse border border-gray-200 dark:border-[#1A3626]" />
});

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

          {/* Title, Actions & Pricing Header Card */}
          <div className="bg-white dark:bg-[#102418] rounded-[32px] p-6 sm:p-8 lg:p-9 shadow-xl border border-gray-200/80 dark:border-[#1A3626] space-y-6 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A3626] via-[#5CD284] to-[#c9a14b]" />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              <div className="space-y-2.5 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {title}
                </h1>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-medium">
                  <div className="p-1 rounded-md bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{location}</span>
                </div>
              </div>

              {/* High-End Price Banner */}
              <div className="shrink-0 bg-gradient-to-br from-[#1A3626] via-[#163321] to-[#0A1C12] text-white px-7 py-4 rounded-2xl border border-white/15 dark:border-[#c9a14b]/30 shadow-xl relative overflow-hidden group/price">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#5CD284]/20 rounded-full blur-xl pointer-events-none" />
                <p className="text-[11px] text-white/70 font-extrabold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5CD284] animate-pulse" />
                  Asking Price
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#5CD284] dark:text-[#c9a14b] tabular-nums flex items-center gap-2">
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#163321] hover:bg-gray-100 dark:hover:bg-[#1A3626] text-gray-800 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-[#1A3626] hover:scale-105"
              >
                <Share2 className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                <span>Share Property</span>
              </button>

              {isAuthenticated && isBuyer && (
                <button 
                  onClick={handleToggleFavourite}
                  disabled={isFavouriting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#163321] hover:bg-gray-100 dark:hover:bg-[#1A3626] text-gray-800 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-[#1A3626] hover:scale-105"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Property Type</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white uppercase truncate" title={type}>{type}</p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Bed className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Bedrooms</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate" title={beds?.toString()}>
                    {beds?.toString().toUpperCase() === "STUDIO" ? "Studio" : `${beds} Beds`}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Bath className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Washrooms</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate" title={`${baths}`}>
                    {Number(baths) === 1 ? "1 Bath" : `${baths} Baths`}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Square className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Built Up Area</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate" title={`${sqft} sqft`}>{sqft} sqft</p>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Additional Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {propertyInfo.listingPurpose && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Purpose</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">{propertyInfo.listingPurpose.toLowerCase()}</span>
                  </div>
                )}
                {propertyInfo.propertyCategory && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Category</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">{propertyInfo.propertyCategory.toLowerCase()}</span>
                  </div>
                )}
                {propertyInfo.furnishingStatus && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Furnishing</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">
                      {propertyInfo.furnishingStatus === "NOT_FURNISHED" ? "Not Furnished" : propertyInfo.furnishingStatus === "SEMI" ? "Semi Furnished" : propertyInfo.furnishingStatus.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {propertyInfo.unitNumber && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Unit Number</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white font-mono truncate">{propertyInfo.unitNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Property Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2.5">
                {features.map((feature: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 dark:bg-[#163321] text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 shadow-sm hover:scale-105 transition-transform"
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

              {/* Seller / Agent Profile Card */}
              {propertyInfo.sellerInfo && (
                <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 dark:bg-[#163321] rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626]">
                    <Image
                      src={propertyInfo.sellerInfo.thumbnail || "/placeholder-avatar.png"}
                      alt={propertyInfo.sellerInfo.name || "Agent"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {propertyInfo.sellerInfo.name || "Real Estate Agent"}
                      </h4>
                      {propertyInfo.sellerInfo.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-[#5CD284] shrink-0" />
                      )}
                    </div>
                    {propertyInfo.sellerInfo.phone && (
                      <p className="text-xs text-[#1A3626] dark:text-[#5CD284] font-bold font-mono mt-0.5">
                        {propertyInfo.sellerInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Contact the seller directly to request details, schedule a viewing, or negotiate terms.
              </p>

              <div className="space-y-3 pt-2">
                {/* WhatsApp Button */}
                {(propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber) && (
                  <button
                    onClick={() => {
                      const waNum = (propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber).replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${waNum}`, '_blank');
                    }}
                    className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Agent
                  </button>
                )}

                {/* Phone Button */}
                <button 
                  onClick={() => {
                    const phone = propertyInfo.sellerInfo?.phone || propertyInfo.phone;
                    if (phone) {
                      window.location.href = `tel:${phone}`;
                    } else {
                      addToast("Unavailable", "Agent phone number not available", "warning");
                    }
                  }}
                  className="w-full py-3.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Call Agent {propertyInfo.sellerInfo?.phone ? `(${propertyInfo.sellerInfo.phone})` : ''}
                </button>
                
                {/* Email Button */}
                <button 
                  onClick={() => {
                    const email = propertyInfo.sellerInfo?.email || propertyInfo.email;
                    if (email) {
                      window.location.href = `mailto:${email}`;
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

            {/* Google Map Location Card (Square Shape) */}
            <PropertyMapCard 
              coordinates={details.propertyCoordinates || propertyInfo.propertyCoordinates || details.locationCoordinates || propertyInfo.locationCoordinates} 
              location={location} 
              title={title} 
            />

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
