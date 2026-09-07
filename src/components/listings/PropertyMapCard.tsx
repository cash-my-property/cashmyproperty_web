"use client";

import { MapPin, ExternalLink, Navigation, Layers } from "lucide-react";

interface PropertyMapCardProps {
  coordinates?: {
    latitude?: number | string | null;
    longitude?: number | string | null;
    lat?: number | string | null;
    lng?: number | string | null;
  } | [number, number] | null;
  location?: string;
  title?: string;
}

export default function PropertyMapCard({ coordinates, location, title }: PropertyMapCardProps) {
  let lat: number | null = null;
  let lng: number | null = null;

  // Extract lat and lng flexibly from various possible backend formats
  if (coordinates) {
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const first = Number(coordinates[0]);
      const second = Number(coordinates[1]);
      if (!isNaN(first) && !isNaN(second)) {
        if (first > 50 && first < 60) {
          lng = first;
          lat = second;
        } else {
          lat = first;
          lng = second;
        }
      }
    } else if (typeof coordinates === "object" && coordinates !== null) {
      const coordObj = coordinates as Record<string, any>;
      const rawLat = coordObj.latitude ?? coordObj.lat;
      const rawLng = coordObj.longitude ?? coordObj.lng;
      if (rawLat !== undefined && rawLat !== null && rawLng !== undefined && rawLng !== null) {
        const parsedLat = Number(rawLat);
        const parsedLng = Number(rawLng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng) && (parsedLat !== 0 || parsedLng !== 0)) {
          lat = parsedLat;
          lng = parsedLng;
        }
      }
    }
  }

  const hasValidCoordinates = lat !== null && lng !== null;
  const displayLocation = location || "Dubai, United Arab Emirates";

  // Google Maps embed URL
  const embedUrl = hasValidCoordinates
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(displayLocation + ", Dubai, UAE")}&z=14&output=embed`;

  // External Google Maps redirection URL
  const externalMapUrl = hasValidCoordinates
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLocation)}`;

  return (
    <div className="bg-white dark:bg-[#102418] rounded-[28px] p-5 sm:p-6 border border-gray-200/80 dark:border-[#1A3626] shadow-xl hover:shadow-2xl transition-all duration-500 space-y-4 relative overflow-hidden group">
      
      {/* Top Accent Gradient Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A3626] via-[#5CD284] to-[#c9a14b]" />

      {/* Ambient Radial Glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#5CD284]/10 dark:bg-[#c9a14b]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#1A3626] to-[#102418] dark:from-[#c9a14b]/20 dark:to-[#163321] text-[#5CD284] dark:text-[#c9a14b] border border-white/10 dark:border-[#c9a14b]/30 shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">Location & Map</h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CD284] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5CD284]"></span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[210px]" title={displayLocation}>
              {displayLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Perfect Square Google Map Box with Glass Overlays */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-[#1A3626] shadow-inner bg-gray-900 group/map">
        
        <iframe
          title={title ? `Map for ${title}` : "Property Location Map"}
          src={embedUrl}
          className="w-full h-full border-0 group-hover/map:scale-105 transition-transform duration-700 filter saturate-[1.1] contrast-[1.05]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Top Control Overlay Tag */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg border border-white/10 pointer-events-none">
          <Layers className="w-3 h-3 text-[#c9a14b]" />
          <span>Interactive Map</span>
        </div>

        {/* Bottom Floating Address Bar */}
        <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-white text-[11px] font-semibold flex items-center justify-between shadow-xl border border-white/15 pointer-events-none">
          <span className="truncate pr-2 text-white/95">{displayLocation}</span>
          <Navigation className="w-4 h-4 text-[#5CD284] shrink-0 animate-bounce" />
        </div>
      </div>

      {/* External Map Action Button */}
      <a
        href={externalMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 bg-gradient-to-r from-[#1A3626] to-[#102418] hover:from-[#163321] hover:to-[#1A3626] dark:from-[#102418] dark:to-[#163321] dark:hover:from-[#163321] dark:hover:to-[#1A3626] text-white font-bold text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(92,210,132,0.25)] dark:hover:shadow-[0_0_20px_rgba(201,161,75,0.25)] border border-white/15 dark:border-[#c9a14b]/30 group/btn"
      >
        <ExternalLink className="w-4 h-4 text-[#5CD284] dark:text-[#c9a14b] group-hover/btn:scale-110 transition-transform" />
        <span>Open Direct Google Maps</span>
      </a>
    </div>
  );
}
