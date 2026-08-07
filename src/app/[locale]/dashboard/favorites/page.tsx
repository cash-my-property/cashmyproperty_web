"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Search, Filter, Heart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FavoritesPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.favorites;

  const favorites = [
    {
      id: "PROP-8239",
      property: "Luxury Villa in Palm Jumeirah",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      price: "4,500,000 Ð",
      beds: 5,
      baths: 6,
      sqft: "8,500",
      status: "Active Auction"
    },
    {
      id: "PROP-8102",
      property: "Downtown Penthouse",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      price: "3,500,000 Ð",
      beds: 3,
      baths: 4,
      sqft: "4,200",
      status: "Standard Listing"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {content.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-xl w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search favorites..."
            className="w-full bg-transparent border-none outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 w-full sm:w-auto transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((prop) => (
          <div key={prop.id} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-gray-100 dark:border-slate-800">
            <div className="relative h-48 w-full overflow-hidden">
              <Image 
                src={prop.image} 
                alt={prop.property}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-white transition-colors shadow-sm">
                <Heart className="w-4 h-4 fill-current" />
              </button>
              <div className="absolute top-4 left-4 bg-[#1A3626]/90 dark:bg-[#5CD284]/90 backdrop-blur-sm text-white dark:text-[#1A3626] px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
                {prop.status}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{prop.property}</h3>
              <p className="text-xl font-bold text-[#1A3626] dark:text-[#5CD284] mb-4">{prop.price}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-4 mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">{prop.beds}</span> Beds
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">{prop.baths}</span> Baths
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">{prop.sqft}</span> Sqft
                </div>
              </div>

              <Link 
                href={`/${locale}/listings/${prop.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-[#1A3626] dark:text-[#5CD284] font-bold text-[13px] hover:bg-green-50 dark:hover:bg-[#5CD284]/10 transition-colors"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
