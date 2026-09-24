"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyCardImageCarouselProps {
  images: (string | { url?: string })[];
  alt: string;
  priority?: boolean;
  aspectClass?: string;
  badge?: React.ReactNode;
  topRightBadge?: React.ReactNode;
  children?: React.ReactNode;
}

import { getOptimizedImageUrl } from "@/utils/imageUrl";

export default function PropertyCardImageCarousel({
  images,
  alt,
  priority = false,
  aspectClass = "h-[240px]",
  badge,
  topRightBadge,
  children,
}: PropertyCardImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize and optimize image urls
  const safeImages: string[] = Array.isArray(images) && images.length > 0
    ? images
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter((url): url is string => Boolean(url))
        .map(getOptimizedImageUrl)
    : ["/property-placeholder.svg"];

  const effectiveImages = safeImages.length > 0 ? safeImages : ["/property-placeholder.svg"];
  const total = effectiveImages.length;

  const currentImageSrc = failedIndices[currentIndex]
    ? "/property-placeholder.svg"
    : effectiveImages[currentIndex] || effectiveImages[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-[#091711] ${aspectClass}`}>
      <Image
        src={currentImageSrc}
        alt={`${alt} - image ${currentIndex + 1}`}
        fill
        priority={priority && currentIndex === 0}
        loading={priority && currentIndex === 0 ? undefined : "lazy"}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoaded(true)}
        onError={() => setFailedIndices((prev) => ({ ...prev, [currentIndex]: true }))}
        className={`object-cover group-hover:scale-105 transition-all duration-500 ${
          isLoaded || (priority && currentIndex === 0) ? "opacity-100" : "opacity-80"
        }`}
      />

      {/* Optional Badges & Overlays */}
      {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}
      {topRightBadge && <div className="absolute top-3 right-3 z-10">{topRightBadge}</div>}
      {children}

      {/* Forward / Backward Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg z-20 hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg z-20 hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
            {effectiveImages.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-3.5 bg-white shadow-sm" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
            {total > 5 && (
              <span className="text-[9px] text-white/90 font-bold ml-0.5">+{total - 5}</span>
            )}
          </div>

          {/* Photo Count Badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIndex + 1}/{total}
          </div>
        </>
      )}
    </div>
  );
}
