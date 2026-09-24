"use client";

import Link from "next/link";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import Dirham from "@/components/Dirham";
import PropertyCardImageCarousel from "@/components/listings/PropertyCardImageCarousel";
import PropertySellerCardStrip from "@/components/listings/PropertySellerCardStrip";
import { extractPropertyImages } from "@/utils/imageUrl";

interface PropertyListCardProps {
  item: any;
  locale: string;
  priority?: boolean;
}

export default function PropertyListCard({
  item,
  locale,
  priority = false,
}: PropertyListCardProps) {
  const details = item.propertyDetails || item || {};
  let title = item.title || details.propertyTitle || "Untitled Property";
  title = title.length > 30 ? title.slice(0, 30) : title;
  const rawLocation =
    typeof details.propertyLocation === "string"
      ? details.propertyLocation
      : details.propertyLocation?.city || "Dubai, UAE";
  const formattedLocation = (() => {
    const words = rawLocation.trim().split(/\s+/);
    return words.length > 8 ? words.slice(0, 8).join(" ") + "..." : rawLocation;
  })();

  const images = extractPropertyImages(item);
  const beds = item.specs?.beds || details.propertyBedrooms || 0;
  const baths =
    item.specs?.washrooms || details.propertyWashrooms || details.propertyBathrooms || 0;
  const area = item.area?.value
    ? `${item.area.value} ${item.area.unit || "sqft"}`
    : details.propertyArea?.value
    ? `${details.propertyArea.value} ${details.propertyArea.unit || "sqft"}`
    : `${details.propertyBuiltUpArea || 0} sqft`;
  const price =
    item.price?.amount || details.propertyPrice?.amount || details.propertyPrice || 0;
  const type = details.propertyType || "Property";
  const seller = item.sellerInfo || details.sellerInfo || item.seller || details.seller;
  const isRent =
    (item.listingPurpose || details.listingPurpose) === "RENT";
  const rentalPeriod = item.rentalPeriod || details.rentalPeriod;

  const rentalPeriodLabel = rentalPeriod
    ? rentalPeriod === "PER_YEAR"
      ? "yr"
      : rentalPeriod === "PER_MONTH"
      ? "mo"
      : rentalPeriod === "PER_WEEK"
      ? "wk"
      : rentalPeriod === "PER_DAY"
      ? "day"
      : rentalPeriod.replace("PER_", "").toLowerCase()
    : "";

  return (
    <Link
      href={`/${locale}/simple-listings/${item._id || item.id}`}
      className="bg-white dark:bg-[#102418] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col md:flex-row group cursor-pointer"
    >
      {/* Left Column: Image Carousel (Edge-to-edge on card boundaries) */}
      <div className="w-full md:w-[280px] lg:w-[330px] shrink-0 h-[210px] sm:h-[230px] md:h-auto md:min-h-[220px] relative overflow-hidden">
        <PropertyCardImageCarousel
          images={images}
          alt={title}
          priority={priority}
          aspectClass="h-full w-full min-h-[210px] md:min-h-[220px]"
          badge={
            <div className="bg-[#1A3626]/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {item.status || "Active"}
            </div>
          }
        />
      </div>

      {/* Right Column: Details & Actions */}
      <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4 lg:p-5 min-w-0">
        <div>
          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-[18px] sm:text-[20px] text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors">
              {title}
            </h3>
            <span className="font-bold text-[20px] sm:text-[23px] text-gray-900 dark:text-[#c9a14b] leading-none whitespace-nowrap flex items-baseline shrink-0">
              <Dirham className="mr-1 text-[18px] sm:text-[21px]" /> {price.toLocaleString()}
              {isRent && rentalPeriodLabel && (
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 lowercase">
                  /{rentalPeriodLabel}
                </span>
              )}
            </span>
          </div>

          {/* Location */}
          <p
            title={rawLocation}
            className="text-[#1A3626] dark:text-[#c9a14b] text-[13px] font-medium flex items-center gap-1.5 mb-2.5 line-clamp-1"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{formattedLocation}</span>
          </p>

          {/* Specs: Beds, Baths, Area */}
          <div className="flex items-center gap-4 sm:gap-6 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
              <Bed className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
              <span>{beds} Beds</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
              <Bath className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
              <span>{baths} Baths</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
              <Square className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />
              <span>{area}</span>
            </div>
          </div>

          {/* Property Meta Grid */}
          <div className="bg-[#F4F5F7] dark:bg-[#091711] rounded-xl p-1.5 sm:p-2 grid grid-cols-3 divide-x divide-gray-300 dark:divide-[#1A3626] mb-1 max-w-md">
            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[#1A3626] dark:text-[#c9a14b] text-[9.5px] font-bold uppercase tracking-wider mb-0.5">
                Category
              </span>
              <span className="text-gray-900 dark:text-white text-[11px] font-bold uppercase truncate w-full">
                {details.propertyCategory || "Residential"}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[#1A3626] dark:text-[#c9a14b] text-[9.5px] font-bold uppercase tracking-wider mb-0.5">
                Type
              </span>
              <span className="text-gray-900 dark:text-white text-[11px] font-bold uppercase truncate w-full">
                {type}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[#1A3626] dark:text-[#c9a14b] text-[9.5px] font-bold uppercase tracking-wider mb-0.5">
                Status
              </span>
              <span className="text-gray-900 dark:text-white text-[11px] font-bold uppercase truncate w-full">
                {item.status || "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Seller / Agent Action Strip (Pinned to bottom) with proper CTA buttons */}
        <div className="mt-2">
          <PropertySellerCardStrip
            seller={seller}
            propertyTitle={title}
            variant="cta"
          />
        </div>
      </div>
    </Link>
  );
}
