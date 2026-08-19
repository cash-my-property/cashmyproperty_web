"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Heart, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.favorites;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {content.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] flex flex-col items-center justify-center min-h-[420px] p-12 text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-rose-400 dark:text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Saved Properties Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
          Browse our live auctions and direct listings, then save your favorite properties here to keep track of them.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${locale}/listings`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Building2 className="w-4 h-4" /> Browse Auctions <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/simple-listings`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors"
          >
            Browse Direct Listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
