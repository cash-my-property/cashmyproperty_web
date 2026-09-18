"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (location: string, latitude?: number | null, longitude?: number | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Search area, community, building in UAE...",
  className = "",
  required = false,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if ((window as any).google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-places-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-places-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => setIsLoaded(true));
    }
  }, []);

  const handlePlaceSelect = useCallback(() => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();

    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const addressName = place.formatted_address || place.name || inputRef.current?.value || "";

      onChange(addressName, lat, lng);
    } else if (inputRef.current) {
      onChange(inputRef.current.value, null, null);
    }
  }, [onChange]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || (window as any).google?.maps?.places === undefined) return;

    if (!autocompleteRef.current) {
      const google = (window as any).google;
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ae" }, // Restrict to United Arab Emirates
        fields: ["formatted_address", "name", "geometry"],
      });

      autocomplete.addListener("place_changed", handlePlaceSelect);
      autocompleteRef.current = autocomplete;
    }
  }, [isLoaded, handlePlaceSelect]);

  return (
    <div className="relative w-full">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
        {isLoaded ? (
          <MapPin className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3626] dark:focus:ring-[#c9a14b] transition-all text-sm ${className}`}
      />
    </div>
  );
}
