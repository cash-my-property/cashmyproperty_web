"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";

interface HeroSearchWidgetProps {
  onSearch?: (filters: any) => void;
  initialTab?: string;
  variant?: "HERO" | "DRAWER";
}

export default function HeroSearchWidget({ onSearch, initialTab = "BUY", variant = "HERO" }: HeroSearchWidgetProps) {
  const router = useRouter();
  const { locale } = useDictionary();

  // Mount state for React Portal
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Top Tabs State
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Search Input State
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer Animation States (for 60fps silky open AND exit transition)
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [isDrawerAnimating, setIsDrawerAnimating] = useState<boolean>(false);

  const openDrawer = () => {
    setIsDrawerVisible(true);
    setTimeout(() => {
      setIsDrawerAnimating(true);
    }, 30);
  };

  const closeDrawer = () => {
    setIsDrawerAnimating(false);
    setTimeout(() => {
      setIsDrawerVisible(false);
    }, 700);
  };

  // Inline Dropdown States (for HERO mode)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("RESIDENTIAL");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("ALL");
  const [selectedBeds, setSelectedBeds] = useState<string>("ANY");
  const [selectedBaths, setSelectedBaths] = useState<string>("ANY");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState<string>("Yearly");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAllTypes, setShowAllTypes] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close inline dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const handleExecuteSearch = () => {
    const filterPayload = {
      tab: activeTab,
      query: searchQuery,
      category: selectedCategory,
      propertyType: selectedPropertyType,
      bedrooms: selectedBeds,
      bathrooms: selectedBaths,
      minPrice,
      maxPrice,
      rentalPeriod: selectedRentalPeriod,
      amenities: selectedAmenities,
    };

    if (onSearch) {
      onSearch(filterPayload);
    } else {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedPropertyType !== "ALL") params.append("propertyType", selectedPropertyType);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedBeds !== "ANY") params.append("bedrooms", selectedBeds);
      if (selectedBaths !== "ANY") params.append("bathrooms", selectedBaths);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (selectedRentalPeriod) params.append("rentalPeriod", selectedRentalPeriod);

      const targetPath = activeTab === "BUY" ? `/${locale}/auctions` : `/${locale}/listings`;
      router.push(`${targetPath}?${params.toString()}`);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "RESIDENTIAL") count++;
    if (selectedPropertyType !== "ALL") count++;
    if (selectedBeds !== "ANY") count++;
    if (selectedBaths !== "ANY") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (selectedRentalPeriod !== "Yearly") count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    return count;
  };

  const propertyTypes = [
    { label: "All Property Types", value: "ALL" },
    { label: "Apartment", value: "APARTMENT" },
    { label: "Villa", value: "VILLA" },
    { label: "Townhouse", value: "TOWNHOUSE" },
    { label: "Penthouse", value: "PENTHOUSE" },
    { label: "Compound", value: "COMPOUND" },
    { label: "Duplex", value: "DUPLEX" },
    { label: "Full Floor", value: "FULL_FLOOR" },
    { label: "Half Floor", value: "HALF_FLOOR" },
    { label: "Whole Building", value: "WHOLE_BUILDING" },
    { label: "Bulk Rent Unit", value: "BULK_RENT_UNIT" },
    { label: "Bungalow", value: "BUNGALOW" },
    { label: "Hotel & Hotel Apartment", value: "HOTEL_APARTMENT" },
  ];

  const bedroomOptions = ["ANY", "Studio", "1", "2", "3", "4", "5", "6", "7", "7+"];
  const bathroomOptions = ["ANY", "1", "2", "3", "4", "5", "6", "7", "7+"];
  const rentalPeriodOptions = ["Yearly", "Monthly", "Weekly", "Daily"];

  const allAmenities = [
    "Balcony",
    "Barbecue Area",
    "Built in Wardrobes",
    "Central A/C",
    "Covered Parking",
    "Private Gym",
    "Private Jacuzzi",
    "Kitchen Appliances",
    "Maids Room",
    "Pets Allowed",
    "Private Garden",
    "Private Pool",
    "Shared Pool",
    "Study",
    "View of Water",
    "Security",
    "Concierge",
    "Shared Spa",
    "Shared Gym",
    "Maid Service",
    "Walk-in Closet",
    "View of Landmark",
    "Children's Play Area",
    "Lobby in Building",
    "Children's Pool",
    "Vastu-compliant",
    "Networked",
    "Dining in building",
    "Conference room"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4 relative z-50" ref={containerRef}>
      
      {/* 1. Top Category Tabs Pill Bar */}
      <div className="bg-white/95 dark:bg-[#091711]/95 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-[#1A3626] flex items-center justify-center gap-1 sm:gap-2 flex-wrap relative z-50">
        {[
          { label: "Rent", key: "RENT" },
          { label: "Buy", key: "BUY" },
          { label: "New projects", key: "NEW_PROJECTS" },
          { label: "Transactions", key: "TRANSACTIONS" },
          { label: "Agents", key: "AGENTS" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-md scale-105"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Main Capsule Search Bar Card */}
      <div className="w-full bg-white dark:bg-[#102418] rounded-[32px] p-3 sm:p-4 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col gap-3.5 relative z-40">
        
        {/* Search Input, Filters Trigger Button & Emerald Green Search Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Main Input Field */}
          <div className="flex-1 flex items-center bg-gray-50/90 dark:bg-[#091711] rounded-full px-5 py-3.5 w-full border border-gray-200/80 dark:border-[#1A3626] focus-within:border-[#5CD284] transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="City, community or building"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleExecuteSearch(); }}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Filters Trigger Button (Opens Left Slide-over Banner/Drawer) */}
            <button
              type="button"
              onClick={openDrawer}
              className="flex-1 sm:flex-initial px-5 py-3.5 bg-gray-100 hover:bg-gray-200/80 dark:bg-[#163321] dark:hover:bg-[#1f472e] border border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm rounded-full transition-all duration-200 shadow-sm shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#1A3626] dark:text-[#5CD284]" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-extrabold text-[11px] flex items-center justify-center ml-0.5">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Search CTA Button */}
            <button
              onClick={handleExecuteSearch}
              className="flex-1 sm:flex-initial px-8 sm:px-9 py-3.5 bg-[#1A3626] hover:bg-[#12261a] dark:bg-[#c9a14b] dark:hover:bg-[#b38d3f] text-white dark:text-[#1A3626] font-bold text-sm sm:text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Search</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. LEFT SLIDE-OVER DRAWER BANNER (Rendered via React Portal with 700ms silky entry and exit transition) */}
      {isDrawerVisible && mounted && createPortal(
        <div 
          className={`fixed inset-0 z-[99998] bg-black/65 backdrop-blur-xs transition-opacity duration-700 ease-in-out ${
            isDrawerAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
        >
          <div
            className={`fixed top-0 left-0 bottom-0 z-[99999] w-full sm:w-[380px] md:w-[420px] lg:w-[25vw] min-w-[320px] bg-white dark:bg-[#102418] border-r border-gray-200 dark:border-[#1A3626] shadow-[20px_0_60px_rgba(0,0,0,0.3)] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDrawerAnimating ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1A3626] bg-gray-50/50 dark:bg-[#091711]/50">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-[#1A3626] dark:text-[#5CD284]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filter Properties</h2>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#1A3626]/10 dark:bg-[#c9a14b]/15 text-[#1A3626] dark:text-[#c9a14b]">
                    {getActiveFilterCount()} active
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-200/60 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content Dashboard */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6 text-xs">
              
              {/* Section 1: Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Residential", value: "RESIDENTIAL" },
                    { label: "Commercial", value: "COMMERCIAL" },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat.value
                          ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] shadow-sm"
                          : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3626]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Property Type */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Property Type</label>
                  {selectedPropertyType !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => setSelectedPropertyType("ALL")}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(showAllTypes ? propertyTypes : propertyTypes.slice(0, 7)).map((item) => {
                    const isSelected = selectedPropertyType === item.value;
                    return (
                      <button
                        type="button"
                        key={item.value}
                        onClick={() => setSelectedPropertyType(item.value)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] font-bold shadow-sm"
                            : "bg-white dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:border-[#1A3626]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllTypes(!showAllTypes)}
                  className="self-start mt-1 text-xs font-bold text-[#1A3626] dark:text-[#5CD284] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{showAllTypes ? "Show less" : "Show more property types"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllTypes ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Section 3: Bedrooms & Bathrooms */}
              <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                <div>
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-2">Bedrooms</label>
                  <div className="flex flex-wrap gap-1.5">
                    {bedroomOptions.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setSelectedBeds(b)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          selectedBeds === b
                            ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] border-[#1A3626]"
                            : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1A3626]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-2">Bathrooms</label>
                  <div className="flex flex-wrap gap-1.5">
                    {bathroomOptions.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setSelectedBaths(b)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          selectedBaths === b
                            ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] border-[#1A3626]"
                            : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1A3626]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Price Range (AED) */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Price Range (AED)</label>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Clear Price
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min. Price"
                    value={minPrice}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max. Price"
                    value={maxPrice}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "< 1M AED", min: "", max: "1000000" },
                    { label: "1M - 3M AED", min: "1000000", max: "3000000" },
                    { label: "3M - 5M AED", min: "3000000", max: "5000000" },
                    { label: "5M+ AED", min: "5000000", max: "" },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => { setMinPrice(preset.min); setMaxPrice(preset.max); }}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer text-center ${
                        minPrice === preset.min && maxPrice === preset.max
                          ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] border-[#1A3626]"
                          : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1A3626] hover:bg-gray-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 5: Rental Period */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Rental Period</label>
                <div className="flex flex-wrap gap-1.5">
                  {rentalPeriodOptions.map((period) => (
                    <button
                      type="button"
                      key={period}
                      onClick={() => setSelectedRentalPeriod(period)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selectedRentalPeriod === period
                          ? "bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] border-[#1A3626]"
                          : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1A3626]"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 6: Amenities */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Amenities ({selectedAmenities.length})
                  </label>
                  {selectedAmenities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities([])}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {allAmenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] font-bold"
                            : "bg-white dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#1A3626] dark:text-[#c9a14b]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Drawer Footer - Done / Apply Button */}
            <div className="p-4 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#091711] flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("RESIDENTIAL");
                  setSelectedPropertyType("ALL");
                  setSelectedBeds("ANY");
                  setSelectedBaths("ANY");
                  setMinPrice("");
                  setMaxPrice("");
                  setSelectedRentalPeriod("Yearly");
                  setSelectedAmenities([]);
                }}
                className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-gray-100 dark:hover:bg-[#163321] transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => {
                  // Validate price if min > max
                  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
                    const temp = minPrice;
                    setMinPrice(maxPrice);
                    setMaxPrice(temp);
                  }
                  handleExecuteSearch();
                  closeDrawer();
                }}
                className="flex-1 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Done</span>
                <Check className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
