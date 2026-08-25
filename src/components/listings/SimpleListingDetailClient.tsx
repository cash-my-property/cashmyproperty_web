"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, ChevronRight, ChevronLeft, CheckCircle2, Bed, Bath, Square, Phone, Mail, Building2, User, Loader2, Share2, MessageCircle, Heart } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";

interface SimpleListingDetailClientProps {
  id: string;
  initialData: any;
  locale: string;
}

export default function SimpleListingDetailClient({ id, initialData, locale }: SimpleListingDetailClientProps) {
  const { dict } = useDictionary();
  const { isAuthenticated, user, isLoading: authLoading, isBuyer, isSeller } = useAuth();
  const { addToast } = useSocket();

  const [activeImage, setActiveImage] = useState(0);
  const [propertyInfo, setPropertyInfo] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isFavourited, setIsFavourited] = useState(initialData?.isFavourited || false);
  const [isFavouriting, setIsFavouriting] = useState(false);

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
      const buyerType = typeof user?.role === 'object' ? (user?.role as any)?.type?.toUpperCase() : 'REGULAR';
      if (isAuthenticated && isBuyer && buyerType === 'SIMPLE') {
        res = await api.get(`/buyer/simpleListingDetails/${id}`);
      } else {
        res = await axios.get(`${API_URL}/public/simple-property-details/${id}`);
      }
      
      setPropertyInfo(res.data.data || res.data);
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
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-3 w-2/3">
                <div className="h-8 bg-gray-200 dark:bg-[#163321] rounded-md w-full" />
                <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded-md w-1/3" />
              </div>
              <div className="h-8 bg-gray-200 dark:bg-[#163321] rounded-md w-1/4" />
            </div>
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

  // Seller access block — stays on page, shows access restricted screen
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Property not found</h1>
        <Link href={`/${locale}/listings`} className="mt-4 text-[#1A3626] dark:text-[#c9a14b] underline">Back to listings</Link>
      </main>
    );
  }

  const details = propertyInfo.propertyDetails || propertyInfo || {};
  const images = details.propertyImages?.length > 0 ? details.propertyImages.map((i:any) => i.url) : ["/property-placeholder.svg"];
  const title = details.propertyTitle || "Untitled Property";
  const location = typeof details.propertyLocation === 'string' ? details.propertyLocation : (details.propertyLocation?.city || "Dubai");
  const priceAmount = details.propertyPrice?.amount || details.propertyPrice || 0;
  const highestBid = propertyInfo.currentHighestBid || (typeof propertyInfo.currentHighestOffer === 'object' ? propertyInfo.currentHighestOffer?.amount : propertyInfo.currentHighestOffer);
  const price = highestBid ? `Ð ${highestBid.toLocaleString()}` : `Ð ${priceAmount.toLocaleString()}`;
  const type = details.propertyType || "N/A";
  const beds = details.propertyBedrooms || 0;
  const baths = details.propertyWashrooms || details.propertyBathrooms || 0;
  
  const getAreaValue = (area: any) => {
    if (!area) return 0;
    if (typeof area === 'object' && area.value !== undefined) return area.value;
    return area;
  };
  const sqft = getAreaValue(details.propertyArea || details.propertyBuiltUpArea);
  const description = details.propertyDescription || "No description provided.";
  const features = details.propertyFeatures || details.propertyAmenities || ["Central A/C", "Balcony", "Shared Pool", "Security"];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] dark:bg-[#091711] pt-32 sm:pt-36 pb-16 transition-colors">
      
      {/* Top Breadcrumb & Status */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}`} className="hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors">Properties</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 dark:text-white font-bold">{propertyInfo.PID || propertyInfo._id}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#5CD284]/10 text-[#1A3626] dark:text-[#c9a14b] px-4 py-1.5 rounded-full border border-[#5CD284]/20">
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
          <div className="bg-white dark:bg-[#102418] p-2 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-[#1A3626]">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden mb-2 bg-gray-100 dark:bg-[#091711] group">
              <Image
                src={images[activeImage] || images[0]}
                alt="Property"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Carousel Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-[#1A3626] dark:text-[#c9a14b] rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-[#1A3626] dark:text-[#c9a14b] rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto global-green-scrollbar pb-2">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-[#1A3626] dark:border-[#c9a14b] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-[#1A3626]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold text-gray-900 dark:text-white mb-2 leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {title}
                </h1>
                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-[15px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{location}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
                      if (navigator.share) {
                        navigator.share({ title: title, url: shareUrl }).catch(console.error);
                      } else if (shareUrl) {
                        navigator.clipboard.writeText(shareUrl);
                        addToast("Link Copied", "Property link copied to clipboard successfully!", "success");
                      }
                    }}
                    className="flex items-center gap-1.5 hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors bg-gray-100 dark:bg-[#102418]/80 px-3 py-1 rounded-full text-[13px] font-bold"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>

                  {isAuthenticated && isBuyer && (
                    <button 
                      onClick={handleToggleFavourite}
                      disabled={isFavouriting}
                      className="flex items-center gap-1.5 hover:text-[#1A3626] dark:hover:text-[#c9a14b] transition-colors bg-gray-100 dark:bg-[#102418]/80 px-3 py-1 rounded-full text-[13px] font-bold cursor-pointer"
                    >
                      {isFavouriting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      ) : (
                        <Heart className={`w-4 h-4 ${isFavourited ? 'fill-rose-500 text-rose-500' : ''}`} />
                      )}
                      {isFavourited ? 'Saved' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <div className="shrink-0 bg-green-50 dark:bg-[#102418]/80 px-5 py-3 rounded-2xl border border-green-100 dark:border-[#1A3626]">
                <p className="text-[13px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">{propertyInfo.currentHighestOffer ? 'Highest Offer' : 'Asking Price'}</p>
                <p className="text-[24px] font-bold text-[#1A3626] dark:text-[#c9a14b] tabular-nums">
                  {price}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-[#1A3626] mb-8 bg-gray-50 dark:bg-[#102418]/30 rounded-2xl px-6">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Building2 className="w-4 h-4"/> Type</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{type}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-gray-200 dark:border-[#1A3626] pl-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Bed className="w-4 h-4"/> Bedrooms</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{beds}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-gray-200 dark:border-[#1A3626] pl-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Bath className="w-4 h-4"/> Bathrooms</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{baths}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-gray-200 dark:border-[#1A3626] pl-4">
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Square className="w-4 h-4"/> Area (Sqft)</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">{sqft}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {propertyInfo.listingPurpose && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Purpose</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.listingPurpose}</span>
                  </div>
                )}
                {propertyInfo.propertyCategory && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Category</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.propertyCategory}</span>
                  </div>
                )}
                {propertyInfo.propertyPlan && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Property Plan</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.propertyPlan}</span>
                  </div>
                )}
                {propertyInfo.rentalPeriod && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Rental Period</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.rentalPeriod.replace('_', ' ')}</span>
                  </div>
                )}
                {propertyInfo.permitNumber && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Permit Number</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.permitNumber}</span>
                  </div>
                )}
                {propertyInfo.referenceNumber && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Reference No</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.referenceNumber}</span>
                  </div>
                )}
                {propertyInfo.unitNumber && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Unit Number</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.unitNumber}</span>
                  </div>
                )}
                {propertyInfo.parkingSpaces !== undefined && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Parking Spaces</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.parkingSpaces}</span>
                  </div>
                )}
                {propertyInfo.furnishingStatus && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Furnished</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.furnishingStatus.replace('_', ' ')}</span>
                  </div>
                )}
                {propertyInfo.availability && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-[#1A3626]">
                    <span className="text-gray-500 dark:text-gray-400 text-[14px]">Availability</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-[14px]">{propertyInfo.availability}</span>
                  </div>
                )}
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
            
            <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-[#1A3626]">
              <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-2">Interested in this property?</h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-6">Contact the agent directly for more information or to arrange a viewing.</p>
              {propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber ? (
                <a 
                  href={`https://wa.me/${(propertyInfo.sellerInfo?.whatsappNumber || propertyInfo.whatsappNumber).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-[15px] hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 mb-3 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Agent
                </a>
              ) : null}

              {propertyInfo.sellerInfo?.phone ? (
                <a 
                  href={`tel:${propertyInfo.sellerInfo.phone}`}
                  className="w-full py-4 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-xl font-bold text-[15px] hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-3 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Call Agent
                </a>
              ) : (
                <button 
                  onClick={() => addToast("Unavailable", "Agent phone number not available", "warning")}
                  className="w-full py-4 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] rounded-xl font-bold text-[15px] hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-3 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Call Agent
                </button>
              )}
              
              {propertyInfo.sellerInfo?.email ? (
                <a 
                  href={`mailto:${propertyInfo.sellerInfo.email}`}
                  className="w-full py-4 bg-transparent border-2 border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] rounded-xl font-bold text-[15px] hover:bg-gray-50 dark:hover:bg-[#163321]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> Email Agent
                </a>
              ) : (
                <button 
                  onClick={() => addToast("Unavailable", "Agent email not available", "warning")}
                  className="w-full py-4 bg-transparent border-2 border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] rounded-xl font-bold text-[15px] hover:bg-gray-50 dark:hover:bg-[#163321]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> Email Agent
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
