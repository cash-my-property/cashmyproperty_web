"use client";

import { useState, useEffect, useRef } from "react";
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
  Lock,
  X,
  Car,
  FileText,
  Hash,
  Info,
  QrCode,
  ExternalLink
} from "lucide-react";
import { 
  formatPropertyType, 
  formatPropertyCategory, 
  formatPropertyPlan, 
  formatListingPurpose, 
  formatFurnishingStatus, 
  formatRentalPeriod, 
  formatRentalPeriodShort, 
  formatAmenity,
  formatAvailability
} from "@/utils/formatters";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [propertyInfo, setPropertyInfo] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isFavourited, setIsFavourited] = useState(initialData?.isFavourited || false);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);
  const hasSwitchedRef = useRef(false);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const totalImgs = propertyInfo?.propertyDetails?.propertyImages?.length || 1;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") setActiveImage((prev) => (prev === 0 ? totalImgs - 1 : prev - 1));
      if (e.key === "ArrowRight") setActiveImage((prev) => (prev === totalImgs - 1 ? 0 : prev + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, propertyInfo]);

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
      
      let res: any;
      if (isAuthenticated) {
        try {
          const queryStr = st ? `?st=${encodeURIComponent(st)}` : '';
          
          // If logged-in user is a Buyer and not in SIMPLE mode, switch to SIMPLE mode first (once per lifecycle)
          const currentType = typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : '';
          if (isBuyer && currentType !== 'SIMPLE' && !hasSwitchedRef.current) {
            hasSwitchedRef.current = true;
            try {
              await api.put('/switch/toggleRole', { type: 'SIMPLE' });
              if (fetchProfile) await fetchProfile();
            } catch (switchErr) {
              console.error("Failed to auto-switch to SIMPLE mode", switchErr);
            }
          }

          res = await api.get(`/buyer/simpleListingDetails/${id}${queryStr}`);
          if (res.data?.roleWasSwitched && !hasSwitchedRef.current) {
            hasSwitchedRef.current = true;
            await fetchProfile();
            addToast("Role Switched", "Your mode was automatically switched to Buyer mode to view this shared property.", "info");
          }
        } catch (apiErr) {
          if (!propertyInfo && !initialData) {
            res = await axios.get(`${API_URL}/public/simple-property-details/${id}`);
          }
        }
      } else {
        if (!propertyInfo && !initialData) {
          res = await axios.get(`${API_URL}/public/simple-property-details/${id}`);
        }
      }
      
      if (res?.data) {
        const data = res.data.data || res.data;
        setPropertyInfo(data);
        if (typeof data?.isFavourited === 'boolean') {
          setIsFavourited(data.isFavourited);
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 429) {
        console.warn("Simple listing details rate limit reached. Using cached/server data.");
      } else {
        console.error("Error fetching simple listing details client-side", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated && (initialData || propertyInfo)) {
      setIsLoading(false);
      return;
    }

    const fetchKey = `${id}_${isAuthenticated ? (user?._id || 'auth') : 'guest'}`;
    if (hasFetchedRef.current === fetchKey) return;
    hasFetchedRef.current = fetchKey;

    fetchDetails();
  }, [id, authLoading, isAuthenticated, user?._id]);

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
  const downPaymentAmount = details.propertyPrice?.downPayment ?? propertyInfo.propertyPrice?.downPayment;
  const downPaymentValue = (downPaymentAmount !== undefined && downPaymentAmount !== null && Number(downPaymentAmount) > 0)
    ? Number(downPaymentAmount).toLocaleString()
    : null;
  const type = details.propertyType || propertyInfo.propertyType || "N/A";
  const purpose = details.listingPurpose || propertyInfo.listingPurpose || "";
  const category = details.propertyCategory || propertyInfo.propertyCategory || "";
  const plan = details.propertyPlan || propertyInfo.propertyPlan || "";
  const beds = details.propertyBedrooms || propertyInfo.bedrooms;
  const baths = details.propertyWashrooms || details.propertyBathrooms || propertyInfo.bathrooms;
  const parkingSpaces = details.parkingSpaces !== undefined ? details.parkingSpaces : propertyInfo.parkingSpaces;
  const permitNumber = details.permitNumber || propertyInfo.permitNumber || "";
  const referenceNumber = details.referenceNumber || propertyInfo.referenceNumber || "";
  const listingId = details.listingId || propertyInfo.listingId || "";
  const availability = details.availability || propertyInfo.availability || "";
  const furnishingStatus = details.furnishingStatus || propertyInfo.furnishingStatus || "";
  const rentalPeriod = details.rentalPeriod || propertyInfo.rentalPeriod || "";
  const isForRent = purpose === "RENT" || details.listingPurpose === "RENT" || propertyInfo.listingPurpose === "RENT";

  const formatRentalPeriod = (period: string) => {
    const p = (period || "").toUpperCase();
    if (p === "PER_YEAR") return "Yearly";
    if (p === "PER_MONTH") return "Monthly";
    if (p === "PER_WEEK") return "Weekly";
    if (p === "PER_DAY") return "Daily";
    return period.replace(/PER_/i, "").replace(/_/g, " ");
  };

  const getRentalPeriodSuffix = (period: string) => {
    const p = (period || "").toUpperCase();
    if (p === "PER_YEAR") return "year";
    if (p === "PER_MONTH") return "month";
    if (p === "PER_WEEK") return "week";
    if (p === "PER_DAY") return "day";
    return period.replace(/PER_/i, "").replace(/_/g, " ").toLowerCase();
  };
  
  const getAreaValue = (area: any) => {
    if (!area) return 0;
    if (typeof area === 'object' && area.value !== undefined) return Number(area.value);
    return Number(area) || 0;
  };
  const totalArea = getAreaValue(details.propertyArea || propertyInfo.propertyArea || propertyInfo.area);
  const builtUpArea = getAreaValue(details.propertyBuiltUpArea || propertyInfo.propertyBuiltUpArea);
  const sqft = builtUpArea || totalArea;
  const description = details.propertyDescription || propertyInfo.description || "No description provided.";
  
  // Real propertyAmenities from backend response (fallback to propertyFeatures/features only if empty)
  const features = (details.propertyAmenities && details.propertyAmenities.length > 0)
    ? details.propertyAmenities
    : (propertyInfo.propertyAmenities && propertyInfo.propertyAmenities.length > 0)
    ? propertyInfo.propertyAmenities
    : (details.propertyFeatures && details.propertyFeatures.length > 0)
    ? details.propertyFeatures
    : (propertyInfo.features && propertyInfo.features.length > 0)
    ? propertyInfo.features
    : ["Central A/C", "Balcony", "Shared Pool", "Security"];

  // Regulatory / DLD Trakheesi Permit Data
  const trakheesiDoc = details.propertyDocuments?.propertyTrakheesi 
    || propertyInfo.propertyDocuments?.propertyTrakheesi 
    || details.propertyTrakheesi 
    || propertyInfo.propertyTrakheesi;

  const regReference = trakheesiDoc?.referenceNumber 
    || referenceNumber 
    || details.referenceNumber 
    || propertyInfo.referenceNumber 
    || permitNumber 
    || details.permitNumber 
    || propertyInfo.permitNumber 
    || listingId 
    || "N/A";

  const regListedAt = trakheesiDoc?.listedAt 
    || trakheesiDoc?.uploadedAt 
    || propertyInfo.createdAt 
    || details.createdAt;

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Recently listed";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - d.getTime());
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffHours < 24) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 14) return "1 week ago";
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 60) return "1 month ago";
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return dateStr;
    }
  };

  const regBrokerLicense = trakheesiDoc?.orn 
    || details.orn 
    || propertyInfo.sellerInfo?.orn 
    || propertyInfo.orn 
    || "19898";

  const regAgencyName = trakheesiDoc?.agencyName 
    || details.agencyName 
    || propertyInfo.sellerInfo?.agencyName 
    || propertyInfo.sellerInfo?.name 
    || "CPM Verified Agency";

  const regZoneName = trakheesiDoc?.zoneName 
    || details.zoneName 
    || (typeof details.propertyLocation === 'string' ? details.propertyLocation : details.propertyLocation?.city) 
    || propertyInfo.location 
    || "Dubai, UAE";

  const regAgentLicense = trakheesiDoc?.brn 
    || details.brn 
    || propertyInfo.sellerInfo?.brn 
    || propertyInfo.brn 
    || "N/A";

  const regQrUrl = trakheesiDoc?.url 
    || (typeof trakheesiDoc === 'string' ? trakheesiDoc : null);

  const isQrImage = Boolean(
    regQrUrl && (
      regQrUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ||
      regQrUrl.includes('cloudinary') ||
      regQrUrl.includes('mediaoffice') ||
      !regQrUrl.match(/\.pdf($|\?)/i)
    )
  );

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-28 sm:pt-32 pb-16 transition-colors">
      {/* Top Breadcrumb & Status */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">{dict.navbar?.links?.[0]?.title || "Home"}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/listings`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Listings</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-[350px] md:max-w-[500px]" title={title}>{title}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#c9a14b]/10 dark:text-[#c9a14b] uppercase tracking-wider border border-[#1A3626]/20 dark:border-[#c9a14b]/30">
              {formatPropertyType(type)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        
        {/* Left Column: Gallery & Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Multi-Photo Hero Gallery Grid */}
          <div className="bg-white dark:bg-[#102418] p-1.5 sm:p-2 rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden">
            {images.length === 1 ? (
              <div 
                onClick={() => { setActiveImage(0); setIsLightboxOpen(true); }}
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
              >
                <Image
                  src={images[0]}
                  alt={title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/15">
                  <Camera className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                  <span>1 Photo</span>
                </div>
              </div>
            ) : images.length === 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[280px] sm:h-[360px] md:h-[420px]">
                <div 
                  onClick={() => { setActiveImage(0); setIsLightboxOpen(true); }}
                  className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
                >
                  <Image src={images[0]} alt={title} fill priority sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div 
                  onClick={() => { setActiveImage(1); setIsLightboxOpen(true); }}
                  className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
                >
                  <Image src={images[1]} alt={title} fill priority sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/15">
                    <Camera className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                    <span>2 Photos</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[280px] sm:h-[360px] md:h-[440px] lg:h-[480px]">
                {/* Left Large Main Image */}
                <div 
                  onClick={() => { setActiveImage(0); setIsLightboxOpen(true); }}
                  className="md:col-span-2 relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
                >
                  <Image
                    src={images[0]}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Bottom Right Photo Count Badge */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                    className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/15 z-10 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                    <span>{images.length} Photos</span>
                  </div>
                </div>

                {/* Right Stacked Column (Top & Bottom Images) */}
                <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                  {/* Top Right Image */}
                  <div 
                    onClick={() => { setActiveImage(1); setIsLightboxOpen(true); }}
                    className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
                  >
                    <Image
                      src={images[1]}
                      alt={title}
                      fill
                      sizes="33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Bottom Right Image */}
                  <div 
                    onClick={() => { setActiveImage(2); setIsLightboxOpen(true); }}
                    className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
                  >
                    <Image
                      src={images[2]}
                      alt={title}
                      fill
                      sizes="33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {images.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-md group-hover:bg-black/25 transition-all flex items-center justify-center z-10">
                        <span className="bg-black/60 backdrop-blur-xl text-white text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-xl border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                          +{images.length - 3} More
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title, Actions & Pricing Header Card */}
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-[#1A3626] space-y-6 relative overflow-hidden">
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
                <p className="text-[11px] text-white/70 font-extrabold uppercase tracking-widest mb-1">
                  {isForRent ? "Rental Price" : "Asking Price"}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#5CD284] dark:text-[#c9a14b] tabular-nums flex items-baseline gap-2">
                  <span className="flex items-center gap-1">
                    <Dirham className="text-xl sm:text-2xl" /> {priceValue}
                  </span>
                  {isForRent && rentalPeriod && (
                    <span className="text-xs sm:text-sm font-bold text-white/80 tracking-normal lowercase">
                      / {getRentalPeriodSuffix(rentalPeriod)}
                    </span>
                  )}
                </p>
                {downPaymentValue && (
                  <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between gap-3 text-xs">
                    <span className="text-white/70 font-semibold uppercase tracking-wider text-[10px]">Down Payment</span>
                    <span className="text-white font-extrabold tabular-nums flex items-center gap-1">
                      <Dirham className="text-xs text-[#5CD284] dark:text-[#c9a14b]" /> {downPaymentValue}
                    </span>
                  </div>
                )}
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

            {/* Featured Key Specs Grid (Top 4 Boxes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Property Type</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate" title={formatPropertyType(type)}>{formatPropertyType(type)}</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Bed className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Bedrooms</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize truncate" title={beds?.toString()}>
                    {beds?.toString().toUpperCase() === "STUDIO" ? "Studio" : `${beds || 0} Beds`}
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Bath className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Washrooms</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate" title={`${baths}`}>
                    {Number(baths) === 1 ? "1 Bath" : `${baths || 0} Baths`}
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-3 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  {parkingSpaces ? (
                    <Car className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b]" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">
                    {parkingSpaces ? "Parking" : "Property Plan"}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {parkingSpaces ? `${parkingSpaces} Spaces` : formatPropertyPlan(plan)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Additional Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {referenceNumber && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Reference No.</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono truncate" title={referenceNumber}>{referenceNumber}</span>
                  </div>
                )}
                {permitNumber && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Permit No.</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono truncate" title={permitNumber}>{permitNumber}</span>
                  </div>
                )}
                {builtUpArea > 0 && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Built Up Area</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{builtUpArea.toLocaleString()} sqft</span>
                  </div>
                )}
                {totalArea > 0 && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Property Area</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{totalArea.toLocaleString()} sqft</span>
                  </div>
                )}
                {purpose && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Purpose</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{formatListingPurpose(purpose)}</span>
                  </div>
                )}
                {isForRent && rentalPeriod && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Rental Period</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#1A3626] dark:text-[#5CD284] truncate">
                      {formatRentalPeriod(rentalPeriod)}
                    </span>
                  </div>
                )}
                {category && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Category</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{formatPropertyCategory(category)}</span>
                  </div>
                )}
                {plan && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Property Plan</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{formatPropertyPlan(plan)}</span>
                  </div>
                )}
                {availability && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Availability</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{formatAvailability(availability)}</span>
                  </div>
                )}
                {furnishingStatus && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Furnishing</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {formatFurnishingStatus(furnishingStatus)}
                    </span>
                  </div>
                )}
                {parkingSpaces !== undefined && parkingSpaces !== null && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Parking Spaces</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{parkingSpaces} {parkingSpaces === 1 ? 'Space' : 'Spaces'}</span>
                  </div>
                )}
                {propertyInfo.unitNumber && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 transition-colors">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Unit Number</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">{propertyInfo.unitNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Property Overview</h3>
              <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-normal">
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
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5CD284]/10 dark:bg-[#163321] text-gray-800 dark:text-emerald-300 text-xs font-bold border border-[#5CD284]/20 shadow-xs hover:scale-105 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#5CD284]" />
                    <span>{formatAmenity(feature)}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Regulatory Information Section */}
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-[#1A3626]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#5CD284]" />
                  <span>Regulatory Information</span>
                </h3>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#5CD284]/10 text-[#1A3626] dark:text-[#5CD284] border border-[#5CD284]/20 flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#5CD284]" />
                  DLD Verified
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-[#142e1d] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-[#1A3626] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Left: Regulatory Metadata List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 w-full flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Reference</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">{regReference}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Listed</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{formatRelativeTime(regListedAt)}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px] flex items-center gap-1">
                      Broker License
                      <span title="DLD Office Registration Number (ORN)">
                        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono">{regBrokerLicense}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Agency name</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate" title={regAgencyName}>{regAgencyName}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">Zone name</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate" title={regZoneName}>{regZoneName}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[110px] flex items-center gap-1">
                      Agent License
                      <span title="DLD Broker Registration Number (BRN)">
                        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono">{regAgentLicense}</span>
                  </div>
                </div>

                {/* Right: QR Code / DLD Permit Verification Box */}
                {regQrUrl && (
                  <div className="shrink-0 flex flex-col items-center gap-2.5 self-center md:self-auto pt-4 md:pt-0 md:pl-6 md:border-l border-gray-200 dark:border-[#1A3626]">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-xl p-2 border border-gray-200 dark:border-[#1A3626] shadow-sm flex items-center justify-center overflow-hidden">
                      {isQrImage ? (
                        <Image 
                          src={regQrUrl}
                          alt="DLD QR Verification"
                          fill
                          unoptimized
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5 text-center text-gray-800">
                          <QrCode className="w-12 h-12 text-[#1A3626]" />
                          <span className="text-[10px] font-bold text-gray-600">
                            DLD Permit
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 text-center">
                      <QrCode className="w-3.5 h-3.5 text-[#5CD284]" />
                      Scan to verify with DLD
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Dashboard (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            
            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-[#1A3626] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interested in this property?</h3>
              </div>

              {/* Seller / Agent Profile Card */}
              {propertyInfo.sellerInfo && (
                <div className="flex items-center gap-3.5 p-4 bg-gray-50 dark:bg-[#142e1d] rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                  <div className="relative w-13 h-13 rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-[#091711] border-2 border-[#5CD284]/40">
                    <Image
                      src={propertyInfo.sellerInfo.thumbnail || "/placeholder-avatar.png"}
                      alt={propertyInfo.sellerInfo.name || "Agent"}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {propertyInfo.sellerInfo.name || "Real Estate Agent"}
                      </h4>
                      {propertyInfo.sellerInfo.isVerified && (
                        <span title="Verified Agent">
                          <ShieldCheck className="w-4 h-4 text-[#5CD284] shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {propertyInfo.sellerInfo.agencyName || "CPM Certified Real Estate Agent"}
                    </p>
                    {propertyInfo.sellerInfo.phone && (
                      <p className="text-xs text-[#1A3626] dark:text-[#5CD284] font-bold font-mono mt-0.5">
                        {propertyInfo.sellerInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Connect directly with the authorized agent to schedule a private viewing or ask questions.
              </p>

              <div className="space-y-3 pt-1">
                {/* WhatsApp Button */}
                {(propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber) && (
                  <button
                    onClick={() => {
                      const waNum = (propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber).replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${waNum}`, '_blank');
                    }}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02]"
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
                  className="w-full py-3.5 bg-[#1A3626] hover:bg-[#12281c] dark:bg-[#c9a14b] dark:hover:bg-[#b08b3a] text-white dark:text-[#0A3622] rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02]"
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

              {/* Verified CPM Guarantee Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-[#142e1d]/50 border border-emerald-500/15 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#5CD284] shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                  <strong className="text-gray-900 dark:text-white font-bold">Verified Listing & Direct Contact:</strong> Connect directly with licensed agents with zero middleman markups.
                </p>
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

      {/* Sticky Mobile Contact Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#102418]/95 backdrop-blur-md border-t border-gray-200 dark:border-[#1A3626] p-3 px-4 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {isForRent ? "Rental Price" : "Price"}
          </p>
          <p className="text-base font-extrabold text-[#1A3626] dark:text-[#5CD284] tabular-nums flex items-center gap-1 truncate">
            <Dirham className="text-sm" /> {priceValue}
            {isForRent && rentalPeriod && (
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 lowercase">
                /{getRentalPeriodSuffix(rentalPeriod)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber) && (
            <button
              onClick={() => {
                const waNum = (propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber).replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${waNum}`, '_blank');
              }}
              className="px-4 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          )}
          <button
            onClick={() => {
              const phone = propertyInfo.sellerInfo?.phone || propertyInfo.phone;
              if (phone) {
                window.location.href = `tel:${phone}`;
              } else {
                addToast("Unavailable", "Agent phone number not available", "warning");
              }
            }}
            className="px-4 py-2.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <Phone className="w-4 h-4" /> Call
          </button>
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

      {/* Fullscreen Picture Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 bg-white/10 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full border border-white/15">
              <Camera className="w-4 h-4 text-[#5CD284]" />
              <span>{activeImage + 1} of {images.length} Photos</span>
            </div>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/15 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Main Image Display */}
          <div className="relative flex-1 my-4 flex items-center justify-center min-h-0" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image 
                src={images[activeImage] || images[0]} 
                alt={title} 
                fill 
                className="object-contain" 
                priority 
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto justify-center max-w-4xl mx-auto py-2 px-4 z-10" onClick={(e) => e.stopPropagation()}>
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-12 sm:w-20 sm:h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === idx 
                      ? 'border-[#5CD284] ring-2 ring-[#5CD284]/40 scale-105' 
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
