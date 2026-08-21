"use client";

import { useState, useEffect } from "react";
import { useDictionary } from "@/components/DictionaryProvider";
import { Heart, Building2, ArrowRight, MapPin, Loader2, Trash2, Tag, Gavel } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

export default function FavoritesPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.favorites;

  const [favourites, setFavourites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);

  const fetchFavourites = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/buyer/favourites?limit=100");
      console.log("Raw Favourites Response:", res.data);
      setFavourites(res.data.data || []);
    } catch (err: any) {
      console.error("Error fetching favorites", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRemoveFavourite = async (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsRemovingId(item.favouriteId);
      await api.put("/buyer/favourites", {
        _id: item.listingId,
        listingType: item.listingType,
        isFavourited: false
      });
      setFavourites((prev) => prev.filter((fav) => fav.favouriteId !== item.favouriteId));
    } catch (err) {
      console.error("Error removing favorite", err);
    } finally {
      setIsRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden border border-gray-100 dark:border-[#1A3626] p-2 animate-pulse shadow-sm h-[380px]">
              <div className="h-[200px] rounded-[20px] bg-gray-200 dark:bg-[#163321] w-full" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-[#163321] rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-[#163321] rounded w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-[#163321] rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Temporary Debug Info Panel */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
        <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-500 mb-2">DEBUG MODE: API Raw Response</h4>
        <pre className="text-[11px] text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono bg-white dark:bg-black/20 p-3 rounded-lg border border-gray-200/50 dark:border-white/5">
          {JSON.stringify(favourites, null, 2)}
        </pre>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {content.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
      </div>

      {favourites.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] flex flex-col items-center justify-center min-h-[420px] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-rose-400 dark:text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{content.noFavorites}</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
            {content.noFavoritesSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/${locale}/listings`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0a1c13] font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Building2 className="w-4 h-4" /> {content.browseAuctions} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/listings`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors"
            >
              {content.browseDirectListings} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Grid of Favourites */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((item) => {
            const isRegular = item.listingType === "REGULAR";
            const detailPath = isRegular 
              ? `/${locale}/auctions/${item.listingId}` 
              : `/${locale}/simple-listings/${item.listingId}`;
            
            const image = item.propertyImages?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
            const location = typeof item.propertyLocation === 'string' ? item.propertyLocation : (item.propertyLocation?.city || "Dubai");
            const price = isRegular
              ? (item.currentHighestBid || item.propertyPrice?.amount || item.propertyPrice || 0)
              : (item.propertyPrice?.amount || item.propertyPrice || 0);

            return (
              <Link 
                href={detailPath} 
                key={item.favouriteId} 
                className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group relative block cursor-pointer"
              >
                <div className="relative h-[200px] overflow-hidden rounded-[20px] bg-gray-100 dark:bg-[#091711] w-full">
                  <Image
                    src={image}
                    alt={item.propertyTitle || "Property"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 bg-white/95 dark:bg-[#102418]/95 backdrop-blur-md px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md text-[#1A3626] dark:text-[#c9a14b]">
                    {isRegular ? (
                      <>
                        <Gavel className="w-3.5 h-3.5" /> Auction
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5" /> Direct Deal
                      </>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveFavourite(e, item)}
                    disabled={isRemovingId === item.favouriteId}
                    className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-[#102418]/90 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer z-10"
                  >
                    {isRemovingId === item.favouriteId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-4 pt-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[18px] text-gray-900 dark:text-white leading-tight line-clamp-2 mb-2 min-h-[44px]">
                    {item.propertyTitle || "Untitled Property"}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-[13px] font-medium flex items-center gap-1.5 mb-4">
                    <MapPin className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {location}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#1A3626] flex items-center justify-between">
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      {isRegular ? "Highest Bid" : "Price"}
                    </span>
                    <span className="font-bold text-[20px] text-[#1A3626] dark:text-[#c9a14b] leading-none">
                      Ð {price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
