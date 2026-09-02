"use client";

import { useState } from "react";
import { X, Building, MapPin, Bed, Bath, Maximize, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, FileText, Phone } from "lucide-react";
import Image from "next/image";

interface PropertyDetailModalProps {
  property: any;
  onClose: () => void;
}

export default function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  if (!property) return null;

  // Extract images safely
  const rawImages = Array.isArray(property.images) && property.images.length > 0 
    ? property.images 
    : (Array.isArray(property.propertyImages) && property.propertyImages.length > 0 
        ? property.propertyImages 
        : (property.image ? [property.image] : []));

  const imagesList = rawImages.map((img: any) => typeof img === "string" ? img : (img?.url || ""));

  const activeImageSrc = imagesList[activeImageIdx] || null;

  // Extract basic details
  const title = property.title || property.propertyTitle || "Untitled Property";
  const location = property.location || property.propertyLocation || "N/A";
  const propertyId = property.propertyId || property.listingId || property.id || "N/A";
  const status = property.status || "PENDING";

  // Price formatting
  const rawPrice = property.price?.amount || property.pricing?.price?.amount || property.price || 0;
  const formattedPrice = typeof rawPrice === "number" ? rawPrice.toLocaleString() : Number(rawPrice || 0).toLocaleString();

  // Specs
  const beds = property.specs?.beds || property.details?.bedrooms || property.propertyBedrooms || "N/A";
  const baths = property.specs?.washrooms || property.details?.washrooms || property.propertyBathrooms || property.propertyWashrooms || "N/A";
  
  const areaVal = property.area?.value || property.details?.area?.value || property.propertyArea?.value || property.propertyArea || 0;
  const areaUnit = property.area?.unit || property.details?.area?.unit || property.propertyArea?.unit || "sqft";
  const areaFormatted = areaVal ? `${areaVal} ${areaUnit}` : "N/A";

  const dateAdded = property.createdAt ? new Date(property.createdAt).toLocaleDateString() : "N/A";
  const description = property.description || property.propertyDescription || "No description provided.";
  const purpose = property.listingPurpose || property.purpose || null;
  const category = property.propertyCategory || property.category || null;
  const plan = property.propertyPlan || null;
  const type = property.propertyType || null;
  const whatsapp = property.whatsappNumber || null;
  const rejectionReason = property.rejectionReason || property.reason || null;

  // Status Badge Helper
  const getStatusBadge = () => {
    switch (status) {
      case "ACTIVE":
      case "APPROVED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">Active</span>;
      case "PENDING":
      case "AWAITING":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Pending Review</span>;
      case "REJECTED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#102418] rounded-[28px] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-[#1A3626] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1A3626] bg-gray-50/50 dark:bg-[#091711]/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Property Details</h2>
            {getStatusBadge()}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/60 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          
          {/* Rejection Reason Alert if rejected */}
          {status === "REJECTED" && rejectionReason && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-0.5">Rejection Reason:</span>
                <p>{rejectionReason}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Image Gallery & Specs Grid (5 cols on md+) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#1A3626] group bg-gray-100 dark:bg-[#091711]">
                {activeImageSrc ? (
                  <>
                    <Image
                      src={activeImageSrc}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                    {imagesList.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIdx(prev => (prev === 0 ? imagesList.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-black/60 hover:bg-white text-gray-900 dark:text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveImageIdx(prev => (prev === imagesList.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-black/60 hover:bg-white text-gray-900 dark:text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {imagesList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {imagesList.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-12 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIdx === idx 
                          ? "border-[#1A3626] dark:border-[#c9a14b] scale-95 shadow" 
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="Thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Specs Pills Row */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50/90 dark:bg-[#091711] p-2.5 rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] text-center">
                  <Bed className="w-4 h-4 text-[#1A3626] dark:text-[#5CD284] mb-1" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Beds</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{beds}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] text-center">
                  <Bath className="w-4 h-4 text-[#1A3626] dark:text-[#5CD284] mb-1" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Baths</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{baths}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] text-center">
                  <Maximize className="w-4 h-4 text-[#1A3626] dark:text-[#5CD284] mb-1" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Area</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-full">{areaFormatted}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Price, Attributes & Description (7 cols on md+) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              
              {/* Title & Price Card */}
              <div className="bg-gray-50/80 dark:bg-[#091711]/60 p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />
                  <span className="truncate font-medium">{location}</span>
                </div>
                <div className="mt-1 pt-2.5 border-t border-gray-200/60 dark:border-[#1A3626] flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase">Price</span>
                  <span className="text-lg sm:text-xl font-extrabold text-[#1A3626] dark:text-[#5CD284]">
                    AED {formattedPrice}
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50/60 dark:bg-[#091711]/40 p-3 rounded-2xl border border-gray-100 dark:border-[#1A3626] text-xs">
                <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626]">
                  <span className="text-gray-400 font-medium">Property ID:</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate">{propertyId}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626]">
                  <span className="text-gray-400 font-medium">Added On:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{dateAdded}</span>
                </div>
                {purpose && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626]">
                    <span className="text-gray-400 font-medium">Purpose:</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase">{purpose}</span>
                  </div>
                )}
                {category && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626]">
                    <span className="text-gray-400 font-medium">Category:</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase">{category}</span>
                  </div>
                )}
                {plan && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626]">
                    <span className="text-gray-400 font-medium">Plan:</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase">{plan}</span>
                  </div>
                )}
                {type && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626]">
                    <span className="text-gray-400 font-medium">Type:</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase">{type}</span>
                  </div>
                )}
                {whatsapp && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-[#102418] border border-gray-100/80 dark:border-[#1A3626] col-span-2">
                    <span className="text-gray-400 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#5CD284]" /> WhatsApp:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{whatsapp}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-gray-50/60 dark:bg-[#091711]/40 p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-900 dark:text-white">Description</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                  {description}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50/50 dark:bg-[#091711]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-100 dark:hover:bg-[#163321] transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
