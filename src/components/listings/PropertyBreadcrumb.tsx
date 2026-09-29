"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface PropertyBreadcrumbProps {
  locale: string;
  basePath?: string; // e.g. "/listings", "/auctions"
  propertyType?: string;
  propertyCategory?: string;
  listingPurpose?: string;
  location?: string;
  title: string;
  accentColor?: "emerald" | "gold"; // emerald for auction/properties, gold for simple listings
}

const formatTypePlural = (type?: string, category?: string) => {
  if (!type && !category) return "Properties";
  const t = (type || "").toUpperCase().replace(/_/g, " ");
  if (t.includes("APARTMENT") || t.includes("FLAT")) return "Apartments";
  if (t.includes("VILLA")) return "Villas";
  if (t.includes("TOWNHOUSE")) return "Townhouses";
  if (t.includes("PENTHOUSE")) return "Penthouses";
  if (t.includes("DUPLEX")) return "Duplexes";
  if (t.includes("COMPOUND")) return "Compounds";
  if (t.includes("HOTEL APARTMENT")) return "Hotel Apartments";
  if (t.includes("OFFICE")) return "Offices";
  if (t.includes("RETAIL") || t.includes("SHOP")) return "Retail";
  if (t.includes("WAREHOUSE")) return "Warehouses";
  if (t.includes("LAND") || t.includes("PLOT")) return "Plots";
  if (t.includes("COMMERCIAL")) return "Commercial";
  if (t) return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  if (category === "COMMERCIAL") return "Commercial";
  return "Properties";
};

const parseLocationSegments = (loc?: string): string[] => {
  if (!loc) return [];
  const rawSegments = loc
    .split(/[,،]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !["uae", "united arab emirates", "u.a.e.", "emirates"].includes(s.toLowerCase()));

  if (rawSegments.length <= 1) return rawSegments;

  const emirates = ["dubai", "abu dhabi", "sharjah", "ajman", "ras al khaimah", "fujairah", "umm al quwain"];
  const lastIdx = rawSegments.length - 1;
  
  // If last element is an Emirate (e.g. ["The Meadows", "Emirates Living", "Dubai"]),
  // reorder from broader Emirate -> Area -> Sub-community to match Property Finder
  if (lastIdx > 0 && emirates.includes(rawSegments[lastIdx].toLowerCase())) {
    const emirate = rawSegments[lastIdx];
    const otherParts = rawSegments.slice(0, lastIdx);
    return [emirate, ...otherParts];
  }

  return rawSegments;
};

export default function PropertyBreadcrumb({
  locale,
  basePath,
  propertyType,
  propertyCategory,
  listingPurpose,
  location,
  title,
  accentColor = "emerald"
}: PropertyBreadcrumbProps) {
  const effectiveBasePath = basePath || `/${locale}/listings`;
  const typeLabel = formatTypePlural(propertyType, propertyCategory);
  const locationSegments = parseLocationSegments(location);

  const hoverClass = accentColor === "gold" 
    ? "hover:text-[#1A3626] dark:hover:text-[#c9a14b]" 
    : "hover:text-[#5CD284]";

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
        {/* 1. Home Icon */}
        <li className="flex items-center">
          <Link 
            href={`/${locale}`} 
            aria-label="Home"
            className={`inline-flex items-center text-gray-500 dark:text-gray-400 ${hoverClass} transition-colors p-1 -m-1 rounded-md`}
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </Link>
        </li>

        <li className="flex items-center text-gray-400 dark:text-gray-600">
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </li>

        {/* 2. Property Type / Category */}
        <li className="flex items-center">
          <Link 
            href={`${effectiveBasePath}?propertyType=${encodeURIComponent(propertyType || "")}`}
            className={`${hoverClass} transition-colors whitespace-nowrap`}
          >
            {typeLabel}
          </Link>
        </li>

        {/* 3. Location Segments (Emirate -> Area -> Community) */}
        {locationSegments.map((segment, idx) => (
          <React.Fragment key={`${segment}-${idx}`}>
            <li className="flex items-center text-gray-400 dark:text-gray-600">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </li>
            <li className="flex items-center">
              <Link
                href={`${effectiveBasePath}?location=${encodeURIComponent(segment)}`}
                className={`${hoverClass} transition-colors whitespace-nowrap capitalize`}
                title={`Properties in ${segment}`}
              >
                {segment}
              </Link>
            </li>
          </React.Fragment>
        ))}

        {/* 4. Active Property Title */}
        <li className="flex items-center text-gray-400 dark:text-gray-600">
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </li>
        <li className="flex items-center min-w-0 max-w-[180px] sm:max-w-[280px] md:max-w-[420px] lg:max-w-[500px]">
          <span 
            className="text-gray-900 dark:text-white font-bold truncate select-text" 
            title={title}
          >
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
}
