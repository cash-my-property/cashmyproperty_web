"use client";

import Link from "next/link";
import { Bed, Bath, Square, MapPin, Clock } from "lucide-react";
import Dirham from "@/components/Dirham";
import PropertyCardImageCarousel from "@/components/listings/PropertyCardImageCarousel";
import PropertySellerCardStrip from "@/components/listings/PropertySellerCardStrip";
import { extractPropertyImages } from "@/utils/imageUrl";
import { useDictionary } from "@/components/DictionaryProvider";
import { 
  formatPropertyType, 
  formatPropertyCategory, 
  formatPropertyPlan, 
  formatRentalPeriodShort,
  formatAuctionRemainingTime
} from "@/utils/formatters";

interface PropertyGridCardProps {
  item: any;
  locale: string;
  priority?: boolean;
  href?: string;
  isAuction?: boolean;
}

export default function PropertyGridCard({
  item,
  locale,
  priority = false,
  href,
  isAuction = false,
}: PropertyGridCardProps) {
  const { dict } = useDictionary();
  const pc = dict.propertyCards;
  const details = item.propertyDetails || item || {};
  const title = item.title || details.propertyTitle || "Untitled Property";
  const rawLocation =
    typeof details.propertyLocation === "string"
      ? details.propertyLocation
      : details.propertyLocation?.city || "Dubai, UAE";
  const formattedLocation = (() => {
    const words = rawLocation.trim().split(/\s+/);
    return words.length > 8 ? words.slice(0, 8).join(" ") + "..." : rawLocation;
  })();

  const images = extractPropertyImages(item);
  const beds = item.specs?.beds || details.propertyBedrooms || item.propertyBedrooms || details.bedrooms || 0;
  const baths =
    item.specs?.washrooms || details.propertyWashrooms || details.propertyBathrooms || item.propertyWashrooms || item.propertyBathrooms || details.bathrooms || 0;
  
  const getAreaVal = (a: any) => typeof a === 'object' ? a?.value || 0 : (a || 0);
  const areaVal = getAreaVal(item.area) || getAreaVal(details.propertyArea) || details.propertyBuiltUpArea || 0;
  const area = `${areaVal} sqft`;

  const highestBid = item.currentHighestBid || (typeof item.currentHighestOffer === 'object' ? item.currentHighestOffer?.amount : item.currentHighestOffer);
  const fallbackPrice = details.propertyPrice?.amount || details.propertyPrice || item.price?.amount || item.price || item.startPrice || 0;
  const price = highestBid || fallbackPrice;

  const type = formatPropertyType(details.propertyType || item.propertyType);
  const category = formatPropertyCategory(details.propertyCategory || item.propertyCategory);
  const plan = formatPropertyPlan(details.propertyPlan || item.propertyPlan || item.status);
  const trakheesiAgency =
    details.propertyDocuments?.propertyTrakheesi?.agencyName ||
    item.propertyDocuments?.propertyTrakheesi?.agencyName ||
    "";
  const rawSeller = item.sellerInfo || details.sellerInfo || item.sellerId || item.seller || details.seller;
  const seller = typeof rawSeller === "object"
    ? {
        ...rawSeller,
        agentId: rawSeller?.agentId || rawSeller?._id || rawSeller?.id || (typeof item.sellerId === "string" ? item.sellerId : undefined),
        name: rawSeller?.name || rawSeller?.fullName || trakheesiAgency || (item.sellerInfo?.isVerified || item.isVerified ? "Verified Seller" : ""),
        officeName: rawSeller?.officeName || trakheesiAgency || null,
        isVerified: Boolean(item.isVerified || item.sellerInfo?.isVerified || rawSeller?.isVerified),
      }
    : (trakheesiAgency || item.isVerified || item.sellerInfo?.isVerified
      ? {
          agentId: typeof item.sellerId === "string" ? item.sellerId : undefined,
          name: trakheesiAgency || "Verified Seller",
          officeName: trakheesiAgency || "Verified Partner",
          isVerified: Boolean(item.isVerified || item.sellerInfo?.isVerified),
        }
      : null);
  const isRent =
    (item.listingPurpose || details.listingPurpose) === "RENT";
  const rentalPeriod = item.rentalPeriod || details.rentalPeriod;
  const rentalPeriodLabel = formatRentalPeriodShort(rentalPeriod);

  const isAuctionItem = isAuction || item.endTime !== undefined || item.currentHighestBid !== undefined;
  const targetHref = href || (isAuctionItem 
    ? `/${locale}/auctions/${item._id || item.id}`
    : `/${locale}/simple-listings/${item._id || item.id}`);

  const remainingTime = isAuctionItem 
    ? formatAuctionRemainingTime(item.endTime, item.startTime, item.status) 
    : null;

  const topRightBadgeElement = remainingTime ? (
    <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/15">
      <Clock className="w-3.5 h-3.5 text-[#5CD284]" />
      <span>{remainingTime.label}</span>
    </div>
  ) : null;

  const badgeElement = isAuctionItem ? (
    item.status === "UPCOMING" ? (
      <div className="flex items-center gap-1.5 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span>{pc?.upcoming || "Upcoming"}</span>
      </div>
    ) : (
      <div className="flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>{pc?.liveOffer || "Live Offer"}</span>
      </div>
    )
  ) : (
    <div className="bg-[#1A3626]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
      {item.status || pc?.active || "Active"}
    </div>
  );

  return (
    <Link
      href={targetHref}
      className="bg-white dark:bg-[#102418] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-[#1A3626] hover:border-[#5CD284]/40 transition-all duration-300 flex flex-col p-2 group block cursor-pointer"
    >
      <PropertyCardImageCarousel
        images={images}
        alt={title}
        priority={priority}
        aspectClass="h-[240px] rounded-2xl"
        badge={badgeElement}
        topRightBadge={topRightBadgeElement}
      />

      <div className="p-4 pt-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-[19px] text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-[#5CD284] transition-colors">
            {title}
          </h3>
          <span className="font-extrabold text-[20px] text-[#1A3626] dark:text-[#c9a14b] leading-none whitespace-nowrap flex items-baseline shrink-0">
            <Dirham className="mr-1 text-[18px] text-[#1A3626] dark:text-[#c9a14b]" /> {price.toLocaleString()}
            {isRent && rentalPeriodLabel && (
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 lowercase">
                /{rentalPeriodLabel}
              </span>
            )}
          </span>
        </div>

        <p
          title={rawLocation}
          className="text-gray-500 dark:text-gray-400 text-[12.5px] font-medium flex items-center gap-1.5 mb-3.5 line-clamp-1"
        >
          <MapPin className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />
          <span className="truncate">{formattedLocation}</span>
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
            <Bed className="w-4 h-4 text-[#5CD284]" /> {beds}
          </div>
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
            <Bath className="w-4 h-4 text-[#5CD284]" /> {baths}
          </div>
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
            <Square className="w-3.5 h-3.5 text-[#5CD284]" /> {area}
          </div>
        </div>

        {/* Property Meta Grid */}
        <div className="bg-[#F4F5F7] dark:bg-[#091711] rounded-2xl p-2.5 grid grid-cols-3 divide-x divide-gray-200 dark:divide-[#1A3626] mb-1">
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[#1A3626] dark:text-[#5CD284] text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
              {pc?.category || "Category"}
            </span>
            <span className="text-gray-900 dark:text-white text-[12px] font-bold truncate w-full">
              {category}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[#1A3626] dark:text-[#5CD284] text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
              {pc?.type || "Type"}
            </span>
            <span className="text-gray-900 dark:text-white text-[12px] font-bold truncate w-full">
              {type}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[#1A3626] dark:text-[#5CD284] text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
              {pc?.status || "Status"}
            </span>
            <span className="text-gray-900 dark:text-white text-[12px] font-bold truncate w-full">
              {plan}
            </span>
          </div>
        </div>

        {/* Seller / Agent Info & Action CTAs Strip (Simple Listings Only) */}
        {!isAuctionItem && (
          <div className="mt-auto">
            <PropertySellerCardStrip seller={seller} propertyTitle={title} />
          </div>
        )}
      </div>
    </Link>
  );
}
