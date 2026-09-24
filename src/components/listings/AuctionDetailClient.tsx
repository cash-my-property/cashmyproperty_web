"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Bed, 
  Bath, 
  Square, 
  Building2, 
  Loader2, 
  Share2, 
  AlertTriangle, 
  Heart,
  Camera,
  Sparkles,
  Lock,
  X,
  FileText,
  Eye,
  ExternalLink
} from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import BuyerActionSidebar from "@/components/listings/BuyerActionSidebar";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import dynamic from "next/dynamic";
import Dirham from "@/components/Dirham";
import { generateShareToken } from "@/lib/shareToken";

const PropertyMapCard = dynamic(() => import("@/components/listings/PropertyMapCard"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-3xl bg-gray-100 dark:bg-[#102418] animate-pulse border border-gray-200 dark:border-[#1A3626]" />
});

interface AuctionDetailClientProps {
  id: string;
  initialData: any;
  locale: string;
}

export default function AuctionDetailClient({ id, initialData, locale }: AuctionDetailClientProps) {
  const { dict } = useDictionary();
  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller, fetchProfile } = useAuth();
  const { socket, isConnected, joinRoom, leaveRoom, addToast } = useSocket();

  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [propertyInfo, setPropertyInfo] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isFavourited, setIsFavourited] = useState(initialData?.isFavourited || false);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);
  const hasSwitchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || isConnected) {
      setShowOfflineWarning(false);
      return;
    }

    // Grace period: only show warning if socket remains disconnected for > 3.5s
    const timer = setTimeout(() => {
      if (isAuthenticated && !isConnected) {
        setShowOfflineWarning(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isConnected]);

  useEffect(() => {
    if (propertyInfo) {
      setIsFavourited(propertyInfo.isFavourited || false);
    }
  }, [propertyInfo]);

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

  const handleToggleFavourite = async () => {
    try {
      setIsFavouriting(true);
      const targetState = !isFavourited;
      await api.put("/buyer/favourites", {
        _id: id,
        listingType: "REGULAR",
        isFavourited: targetState
      });
      setIsFavourited(targetState);
      setPropertyInfo((prev: any) => (prev ? { ...prev, isFavourited: targetState } : prev));
      addToast(
        targetState ? "Saved to Favorites" : "Removed from Favorites",
        targetState ? "This property has been bookmarked successfully." : "This property has been removed from your bookmarks.",
        "success"
      );
    } catch (err) {
      console.error("Error toggling favorite status", err);
      addToast("Error", "Failed to update favorite status. Please try again.", "warning");
    } finally {
      setIsFavouriting(false);
    }
  };

  useEffect(() => {
    if (!id || !socket || !isConnected) return;

    joinRoom(`auction_${id}`);

    const handleUpdateBid = (data: any) => {
      console.log("📡 Real-time bid update received:", data);
      setPropertyInfo((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentHighestBid: data.bidAmount,
          bidCounter: data.bidCounter || prev.bidCounter
        };
      });
    };

    const handleAuctionEnded = (data: any) => {
      console.log("📡 Auction ended event received:", data);
      setPropertyInfo((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "ENDED"
        };
      });
    };

    socket.on("update_bid", handleUpdateBid);
    socket.on("auction_ended", handleAuctionEnded);

    return () => {
      leaveRoom(`auction_${id}`);
      socket.off("update_bid", handleUpdateBid);
      socket.off("auction_ended", handleAuctionEnded);
    };
  }, [id, socket, isConnected]);

  const fetchDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
      
      let res: any;
      if (isAuthenticated) {
        // If logged-in user is a Buyer and not in REGULAR mode, auto-switch to REGULAR mode first (once per lifecycle)
        const currentType = (user as any)?.sellerType?.toUpperCase() || (typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR');
        if (isBuyer && currentType !== 'REGULAR' && !hasSwitchedRef.current) {
          hasSwitchedRef.current = true;
          try {
            await api.put('/switch/toggleRole', { type: 'REGULAR' });
            if (fetchProfile) await fetchProfile();
          } catch (switchErr) {
            console.error("Auto switch to REGULAR mode failed", switchErr);
          }
        }

        try {
          res = await api.get(`/buyer/auction-details/${id}`);
          if (res.data?.roleWasSwitched && !hasSwitchedRef.current) {
            hasSwitchedRef.current = true;
            if (fetchProfile) await fetchProfile();
          }
        } catch (apiErr: any) {
          const errMsg = apiErr?.response?.data?.message || "";
          if (!hasSwitchedRef.current && (apiErr?.response?.status === 403 || errMsg.includes("Regular Buyer mode"))) {
            hasSwitchedRef.current = true;
            try {
              await api.put('/switch/toggleRole', { type: 'REGULAR' });
              if (fetchProfile) await fetchProfile();
              res = await api.get(`/buyer/auction-details/${id}`);
            } catch (retryErr) {
              if (!propertyInfo && !initialData) {
                res = await axios.get(`${API_URL}/public/property-details/${id}`);
              }
            }
          } else if (!propertyInfo && !initialData) {
            res = await axios.get(`${API_URL}/public/property-details/${id}`);
          }
        }
      } else {
        if (!propertyInfo && !initialData) {
          res = await axios.get(`${API_URL}/public/property-details/${id}`);
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
        console.warn("Property details rate limit reached. Using cached/server data.");
      } else {
        console.error("Error fetching property details client-side", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // If guest user and we already have server data, skip refetching to avoid rate limits
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

  if (!authLoading && isAuthenticated && isSeller) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] items-center justify-center gap-8 px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A3626] dark:bg-[#102418] p-10 sm:p-14 flex flex-col items-center gap-6 shadow-2xl border border-[#2a4f38] dark:border-[#1A3626] max-w-lg w-full text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5CD284]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 w-20 h-20 rounded-3xl bg-[#5CD284]/15 border border-[#5CD284]/30 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-[#5CD284]" />
          </div>
          <div className="relative z-10">
            <p className="text-[#5CD284] font-bold tracking-[0.2em] text-[11px] uppercase mb-3">Agent Mode Active</p>
            <h2 className="text-white text-[28px] font-bold mb-3 leading-tight">Access Restricted</h2>
            <p className="text-white/65 text-[15px] leading-relaxed">
              Property detail pages are exclusively for buyers. As an agent, you can only manage and track your own listed properties.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href={`/${locale}/dashboard/seller/properties`}
              className="inline-flex items-center justify-center gap-2 bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(92,210,132,0.4)] text-[15px]"
            >
              <Building2 className="w-5 h-5" />
              My Listings
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{detailDict.propertyNotFound || "Property not found"}</h1>
        <Link href={`/${locale}/listings`} className="mt-4 text-[#1A3626] dark:text-[#c9a14b] underline">{detailDict.backToProperties || "Back to listings"}</Link>
      </main>
    );
  }

  const details = propertyInfo.propertyDetails || {};
  const images = details.propertyImages?.length > 0 ? details.propertyImages.map((i:any) => i.url) : ["/property-placeholder.svg"];
  const title = details.propertyTitle || "Untitled Property";
  const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai, UAE");
  const priceAmount = details.propertyPrice?.amount || details.propertyPrice || 0;
  const highestBid = propertyInfo.currentHighestBid || (typeof propertyInfo.currentHighestOffer === 'object' ? propertyInfo.currentHighestOffer?.amount : propertyInfo.currentHighestOffer);
  const priceValue = highestBid ? highestBid.toLocaleString() : priceAmount.toLocaleString();
  const type = details.propertyType || "N/A";
  const beds = details.propertyBedrooms || 0;
  const baths = details.propertyWashrooms || details.propertyBathrooms || 0;
  
  const getAreaValue = (area: any) => {
    if (!area) return 0;
    if (typeof area === 'object' && area.value !== undefined) return Number(area.value);
    return Number(area) || 0;
  };
  const totalArea = getAreaValue(details.propertyArea);
  const builtUpArea = getAreaValue(details.propertyBuiltUpArea);
  const sqft = builtUpArea || totalArea;
  const description = details.propertyDescription || "No description provided.";
  
  const getAmenitiesList = (): string[] => {
    const raw = details.propertyAmenities || propertyInfo.propertyAmenities || details.propertyFeatures || propertyInfo.features;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string' && raw.trim()) return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
  };
  const features = getAmenitiesList();

  const rawDocs = details.propertyDocuments || propertyInfo.propertyDocuments || propertyInfo.documents;

  const DOC_LABELS: Record<string, string> = {
    propertyTrakheesi: "Trakheesi Permit",
    trakheesi: "Trakheesi Permit",
    propertyTitleDeed: "Title Deed",
    titleDeed: "Title Deed",
    passportDocument: "Passport / Emirates ID",
    visaPassport: "Passport / Visa",
    exclusiveContract: "Exclusive Listing Contract",
    contractA: "Form A Contract",
    propertyCheque: "Security Cheque",
    oqoodDocument: "Oqood Certificate",
    spaDocument: "Sales & Purchase Agreement (SPA)",
    statementOfAccount: "Statement of Account",
    propertyFloorPlan: "Floor Plan",
    propertyUndertakingLetter: "Undertaking Letter",
    brokerCard: "Broker Card",
  };

  const parseDocuments = (docsObj: any) => {
    if (!docsObj || typeof docsObj !== 'object') return [];
    const list: Array<{ key: string; label: string; url: string; fileName?: string; uploadedAt?: string }> = [];

    Object.entries(docsObj).forEach(([key, val]: [string, any]) => {
      if (!val) return;

      if (Array.isArray(val)) {
        val.forEach((item, i) => {
          if (!item) return;
          const url = typeof item === 'string' ? item : item.url;
          if (url && typeof url === 'string') {
            list.push({
              key: `${key}_${i}`,
              label: item.title || item.name || `Additional Document ${i + 1}`,
              url,
              fileName: item.fileName || item.name || undefined,
              uploadedAt: item.uploadedAt || undefined
            });
          }
        });
        return;
      }

      const url = typeof val === 'string' ? val : val.url;
      if (url && typeof url === 'string') {
        const formattedKey = DOC_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
        list.push({
          key,
          label: formattedKey,
          url,
          fileName: val.fileName || undefined,
          uploadedAt: val.uploadedAt || undefined
        });
      }
    });

    return list;
  };

  const documentList = parseDocuments(rawDocs);

  const formatUploadDate = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr.split("T")[0] || isoStr;
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoStr.split("T")[0] || isoStr;
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-28 sm:pt-32 pb-16 transition-colors">
      {showOfflineWarning && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-6 text-center text-[13px] font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 animate-pulse mb-6">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Live connection offline. Bids may not update in real-time. Retrying...
        </div>
      )}
      
      {/* Top Breadcrumb & Status */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">{dict.navbar?.links?.[0]?.title || "Home"}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/auctions`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Auctions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-[350px] md:max-w-[500px]" title={title}>{title}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#c9a14b]/10 dark:text-[#c9a14b] uppercase tracking-wider border border-[#1A3626]/20 dark:border-[#c9a14b]/30">
              {type}
            </span>
            <div className="flex items-center gap-1.5 bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] px-3.5 py-1 rounded-full border border-[#5CD284]/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{propertyInfo.status || 'Live Auction'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gallery & Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Multi-Photo Hero Gallery Grid */}
          <div className="bg-white dark:bg-[#102418] p-1 sm:p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden">
            {images.length === 1 ? (
              <div 
                onClick={() => { setActiveImage(0); setIsLightboxOpen(true); }}
                className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
              >
                <Image
                  src={images[0]}
                  alt={title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/15">
                  <Camera className="w-3.5 h-3.5 text-[#c9a14b]" />
                  <span>1 Photo</span>
                </div>
              </div>
            ) : images.length === 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 h-[280px] sm:h-[360px] md:h-[420px]">
                <div 
                  onClick={() => { setActiveImage(0); setIsLightboxOpen(true); }}
                  className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
                >
                  <Image src={images[0]} alt={title} fill priority sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div 
                  onClick={() => { setActiveImage(1); setIsLightboxOpen(true); }}
                  className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
                >
                  <Image src={images[1]} alt={title} fill priority sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/15">
                    <Camera className="w-3.5 h-3.5 text-[#c9a14b]" />
                    <span>2 Photos</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 sm:gap-2 h-[280px] sm:h-[360px] md:h-[440px] lg:h-[480px]">
                {/* Left Large Main Image */}
                <div 
                  onClick={() => { setActiveImage(0); setIsLightboxOpen(true); }}
                  className="md:col-span-2 relative w-full h-full rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
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
                    className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/15 z-10 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#c9a14b]" />
                    <span>{images.length}</span>
                  </div>
                </div>

                {/* Right Stacked Column (Top & Bottom Images) */}
                <div className="hidden md:grid grid-rows-2 gap-1.5 sm:gap-2 h-full">
                  {/* Top Right Image */}
                  <div 
                    onClick={() => { setActiveImage(1); setIsLightboxOpen(true); }}
                    className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
                  >
                    <Image
                      src={images[1]}
                      alt={title}
                      fill
                      sizes="33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Bottom Right Image with Blurred Overlay */}
                  <div 
                    onClick={() => { setActiveImage(2); setIsLightboxOpen(true); }}
                    className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
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

          {/* Title, Actions & Pricing Header */}
          <div className="bg-white dark:bg-[#102418] rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 dark:border-[#1A3626] space-y-6">
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
                  {propertyInfo.currentHighestBid ? 'Highest Live Bid' : 'Starting Price'}
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

            {/* Featured Key Specs Grid (Top 4 Boxes) */}
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
                    {beds?.toString().toUpperCase() === "STUDIO" ? "Studio" : `${beds || 0} Beds`}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Bath className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Bathrooms</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate" title={`${baths}`}>
                    {Number(baths) === 1 ? "1 Bath" : `${baths || 0} Baths`}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center gap-2 sm:gap-2.5 hover:-translate-y-0.5 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] border border-white/10 dark:border-[#c9a14b]/30 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#5CD284] dark:text-[#c9a14b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider truncate">Property Plan</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white uppercase truncate">
                    {details.propertyPlan ? details.propertyPlan.replace('_', ' ') : "Ready"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Additional Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {builtUpArea > 0 && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Built Up Area</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate">{builtUpArea.toLocaleString()} sqft</span>
                  </div>
                )}
                {totalArea > 0 && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Property Area</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate">{totalArea.toLocaleString()} sqft</span>
                  </div>
                )}
                {details.listingPurpose && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Purpose</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">{details.listingPurpose.toLowerCase()}</span>
                  </div>
                )}
                {details.propertyCategory && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Category</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">{details.propertyCategory.toLowerCase()}</span>
                  </div>
                )}
                {details.furnishingStatus && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Furnishing</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">
                      {details.furnishingStatus.toUpperCase() === "NOT_FURNISHED"
                        ? "Not Furnished"
                        : details.furnishingStatus.toUpperCase() === "SEMI"
                        ? "Semi Furnished"
                        : details.furnishingStatus.toUpperCase() === "FULL"
                        ? "Fully Furnished"
                        : details.furnishingStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
                {details.propertyPlan && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Property Plan</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">{details.propertyPlan.toLowerCase().replace('_', ' ')}</span>
                  </div>
                )}
                {details.trakheesiNumber && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Trakheesi Permit</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white font-mono truncate">{details.trakheesiNumber}</span>
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

            {/* Features & Amenities */}
            {features.length > 0 && (
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
            )}

            {/* Property Documents */}
            {documentList.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1A3626] dark:text-[#5CD284]" />
                    <span>Property Documents</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#5CD284] border border-emerald-500/20 uppercase tracking-wider">
                      Verified
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Official permits and compliance certificates for this property.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documentList.map((doc) => (
                    <div 
                      key={doc.key}
                      className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#142e1d] border border-gray-100 dark:border-[#1A3626] flex items-center justify-between gap-3 hover:border-[#5CD284]/40 dark:hover:border-[#c9a14b]/40 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#102418] border border-gray-200/70 dark:border-[#1A3626] flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-5 h-5 text-[#1A3626] dark:text-[#5CD284]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                            {doc.label}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono mt-0.5">
                            {doc.fileName || "Verified Document"}
                          </p>
                          {doc.uploadedAt && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5" suppressHydrationWarning>
                              Uploaded: {formatUploadDate(doc.uploadedAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#102418] hover:bg-[#5CD284] hover:text-[#0A1C12] dark:hover:bg-[#5CD284] dark:hover:text-[#0A1C12] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#1A3626] text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Bidding Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            {isAuthenticated ? (
              <BuyerActionSidebar 
                auctionId={id}
                contractStatus={propertyInfo.userContractStatus?.status || 'NOT_SIGNED'}
                canBid={propertyInfo.userContractStatus?.canBid || false}
                currentValue={highestBid || priceAmount}
                onBidSuccess={() => fetchDetails()}
                onContractSubmitted={() => fetchDetails()}
                onBidOptimistic={(amount) => {
                  setPropertyInfo((prev: any) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      currentHighestBid: amount
                    };
                  });
                }}
              />
            ) : (
              <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-[#1A3626] text-center space-y-4">
                <div className="w-14 h-14 bg-[#1A3626]/10 dark:bg-[#c9a14b]/10 rounded-2xl flex items-center justify-center mx-auto text-[#1A3626] dark:text-[#c9a14b]">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {detailDict.interestedTitle || "Interested in this property?"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {detailDict.interestedDesc || "Log in to place your bid or make an offer on this auction property."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full py-3.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer shadow-md"
                >
                  {detailDict.makeOffer || "Make Offer / Place Bid"}
                </button>
              </div>
            )}

            {/* Google Map Location Card (Square Shape) */}
            <PropertyMapCard 
              coordinates={propertyInfo.propertyCoordinates || propertyInfo.locationCoordinates || propertyInfo.propertyDetails?.propertyCoordinates} 
              location={propertyInfo.propertyLocation || propertyInfo.location || "Dubai, UAE"} 
              title={propertyInfo.propertyTitle || propertyInfo.title} 
            />
          </div>
        </div>

      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-[#1A3626] text-center">
            <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2">{detailDict.loginRequired || "Login Required"}</h3>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
              {detailDict.loginRequiredDesc || "You need to be logged in to make an offer. Would you like to log in now?"}
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
