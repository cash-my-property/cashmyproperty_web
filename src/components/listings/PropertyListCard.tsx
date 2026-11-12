"use client";

import { useState } from "react";
import Link from "next/link";
import { Bed, Bath, Square, MapPin, Clock, Heart } from "lucide-react";
import Dirham from "@/components/Dirham";
import RtoStatusBadge from "@/components/listings/RtoStatusBadge";
import PropertyCardImageCarousel from "@/components/listings/PropertyCardImageCarousel";
import PropertySellerCardStrip from "@/components/listings/PropertySellerCardStrip";
import { extractPropertyImages } from "@/utils/imageUrl";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import connectPublicService from "@/services/connectPublicService";
import { 
  formatPropertyType, 
  formatPropertyCategory, 
  formatPropertyPlan, 
  formatRentalPeriodShort,
  formatAuctionRemainingTime
} from "@/utils/formatters";

interface PropertyListCardProps {
  item: any;
  locale: string;
  priority?: boolean;
  href?: string;
  isAuction?: boolean;
}

export default function PropertyListCard({
  item,
  locale,
  priority = false,
  href,
  isAuction = false,
}: PropertyListCardProps) {
  const { dict } = useDictionary();
  const { isAuthenticated } = useAuth();
  const pc = dict.propertyCards;
  const details = item.propertyDetails || item || {};
  const isAr = locale === "ar";
  const rawTitle = isAr
    ? (item.titleAr || details.propertyTitleAr || details.titleAr || item.title || details.propertyTitle || "عقار بدون عنوان")
    : (item.title || details.propertyTitle || "Untitled Property");
  const title = rawTitle.length > 35 ? rawTitle.slice(0, 35) + "..." : rawTitle;
  const rawLocation =
    typeof details.propertyLocation === "string"
      ? details.propertyLocation
      : details.propertyLocation?.city || item.location || "";
  const formattedLocation = (() => {
    const words = rawLocation.trim().split(/\s+/);
    return words.length > 8 ? words.slice(0, 8).join(" ") + "..." : rawLocation;
  })();

  const images = extractPropertyImages(item);
  const beds = item.bedrooms || item.specs?.beds || details.propertyBedrooms || item.propertyBedrooms || details.bedrooms || 0;
  const baths =
    item.bathrooms || item.specs?.washrooms || details.propertyWashrooms || details.propertyBathrooms || item.propertyWashrooms || item.propertyBathrooms || details.bathrooms || 0;
  
  const getAreaVal = (a: any) => typeof a === 'object' ? a?.value || 0 : (a || 0);
  const areaVal = getAreaVal(item.area) || getAreaVal(details.propertyArea) || details.propertyBuiltUpArea || 0;
  const area = `${areaVal} ${item.areaUnit || details.areaUnit || "sqft"}`;

  const highestBid = item.currentHighestBid || (typeof item.currentHighestOffer === 'object' ? item.currentHighestOffer?.amount : item.currentHighestOffer);
  const fallbackPrice = details.propertyPrice?.amount || details.propertyPrice || item.price?.amount || item.price || item.startPrice || 0;
  const price = highestBid || fallbackPrice;

  const type = formatPropertyType(item.typeLabel || item.type || details.propertyType || item.propertyType, locale);
  const category = formatPropertyCategory(item.category || details.propertyCategory || item.propertyCategory, locale);
  const plan = formatPropertyPlan(item.plan || details.propertyPlan || item.propertyPlan || item.status, locale);
  const trakheesiAgency =
    details.propertyDocuments?.propertyTrakheesi?.agencyName ||
    item.propertyDocuments?.propertyTrakheesi?.agencyName ||
    item.company?.name ||
    "";
  const rawSeller = item.agent || item.sellerInfo || details.sellerInfo || item.sellerId || item.seller || details.seller;
  const seller = typeof rawSeller === "object"
    ? {
        ...rawSeller,
        agentId: rawSeller?.id || rawSeller?.agentId || rawSeller?._id || (typeof item.sellerId === "string" ? item.sellerId : undefined),
        name: rawSeller?.name || rawSeller?.fullName || trakheesiAgency || (item.sellerInfo?.isVerified || item.isVerified ? "Verified Seller" : ""),
        thumbnail: rawSeller?.photo || rawSeller?.thumbnail,
        officeName: item.company?.name || rawSeller?.officeName || trakheesiAgency || null,
        isVerified: Boolean(item.isVerified || rawSeller?.brnVerified || item.sellerInfo?.isVerified || rawSeller?.isVerified),
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
    (item.purpose || item.listingPurpose || details.listingPurpose) === "RENT";
  const rentalPeriod = item.rentalPeriod || details.rentalPeriod;
  const rentalPeriodLabel = formatRentalPeriodShort(rentalPeriod, locale);

  const isAuctionItem = isAuction || item.endTime !== undefined || item.currentHighestBid !== undefined;
  const listingRef = item.ref || item.listingRef || item._id || item.id;
  const targetHref = href || (isAuctionItem 
    ? `/${locale}/auctions/${item._id || item.id}`
    : `/${locale}/listings/${listingRef}`);

  const remainingTime = isAuctionItem 
    ? formatAuctionRemainingTime(item.endTime, item.startTime, item.status) 
    : null;

  const [isFav, setIsFav] = useState(Boolean(item.isFavourited));

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = `/${locale}/login`;
      return;
    }
    const nextState = !isFav;
    setIsFav(nextState);
    try {
      await connectPublicService.setFavourite(listingRef, nextState);
    } catch (err) {
      setIsFav(!nextState);
    }
  };

  const topRightBadgeElement = remainingTime ? (
    <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/15">
      <Clock className="w-3.5 h-3.5 text-[#5CD284]" />
      <span>{remainingTime.label}</span>
    </div>
  ) : (
    <button
      type="button"
      onClick={handleToggleFav}
      aria-label={isFav ? "Remove from favourites" : "Save to favourites"}
      className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
    >
      <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : "text-white"}`} />
    </button>
  );

  const badgeElement = isAuctionItem ? (
    <RtoStatusBadge status={item.status} />
  ) : (
    <div className="bg-[#1A3626]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
      {item.status || pc?.active || "Active"}
    </div>
  );

  return (
    <Link
      href={targetHref}
      className="bg-white dark:bg-[#102418] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-[#1A3626] hover:border-[#5CD284]/40 transition-all duration-300 flex flex-col md:flex-row p-2 group block cursor-pointer"
    >
      <div className="w-full md:w-[280px] shrink-0">
        <PropertyCardImageCarousel
          images={images}
          alt={title}
          priority={priority}
          aspectClass="h-[220px] md:h-full min-h-[220px] rounded-2xl"
          badge={badgeElement}
          topRightBadge={topRightBadgeElement}
        />
      </div>

      <div className="p-4 pt-5 md:py-4 md:px-6 flex flex-col flex-1 justify-between">
        <div>
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

          {rawLocation && (
          <p
            title={rawLocation}
            className="text-gray-500 dark:text-gray-400 text-[12.5px] font-medium flex items-center gap-1.5 mb-3.5 line-clamp-1"
          >
            <MapPin className="w-3.5 h-3.5 text-[#5CD284] shrink-0" />
            <span className="truncate">{formattedLocation}</span>
          </p>
          )}

          <div className="flex items-center gap-4 mb-4">
            {!!beds && (
            <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
              <Bed className="w-4 h-4 text-[#5CD284]" /> {beds}
            </div>
            )}
            {!!baths && (
            <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
              <Bath className="w-4 h-4 text-[#5CD284]" /> {baths}
            </div>
            )}
            {!!areaVal && (
            <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-900 dark:text-white">
              <Square className="w-4 h-4 text-[#5CD284]" /> {area}
            </div>
            )}
          </div>

          {/* Property Meta Grid */}
          <div className="bg-[#F4F5F7] dark:bg-[#091711] rounded-2xl p-2.5 grid grid-cols-3 divide-x divide-gray-200 dark:divide-[#1A3626] mb-3">
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
        </div>

        {/* Seller / Agent Info & Action CTAs Strip */}
        {!isAuctionItem && (
          <div className="mt-auto">
            <PropertySellerCardStrip
              seller={seller}
              propertyTitle={title}
              variant="cta"
              listingRef={listingRef}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
