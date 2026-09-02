"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Shield, SlidersHorizontal, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";

interface HeroSearchWidgetProps {
  onSearch?: (filters: any) => void;
  initialTab?: string;
}

export default function HeroSearchWidget({ onSearch, initialTab = "BUY" }: HeroSearchWidgetProps) {
  const router = useRouter();
  const { locale } = useDictionary();

  // Top Tabs State
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Search Input State
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown States
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

  // Close dropdowns on outside click
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

      {/* 2. Main Search Bar Card */}
      <div className="w-full bg-white dark:bg-[#102418] rounded-[32px] p-3 sm:p-5 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col gap-3.5 relative z-40">
        
        {/* Main Search Input & Emerald Green Search Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
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

          <button
            onClick={handleExecuteSearch}
            className="w-full sm:w-auto px-9 py-3.5 bg-[#1A3626] hover:bg-[#12261a] dark:bg-[#c9a14b] dark:hover:bg-[#b38d3f] text-white dark:text-[#1A3626] font-bold text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl shrink-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Search</span>
          </button>
        </div>

        {/* 3. Bottom Filter Pills Row (Using flex-wrap so dropdowns are NEVER clipped by overflow-x) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 relative z-50">
          
          {/* Filter 1: Property Type */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "propertyType" ? null : "propertyType");
              }}
              className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedPropertyType !== "ALL"
                  ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b]"
                  : "bg-gray-50 dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <span>{propertyTypes.find(t => t.value === selectedPropertyType)?.label || "Property type"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "propertyType" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "propertyType" && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-[380px] bg-white dark:bg-[#102418] rounded-[28px] shadow-2xl border border-gray-200 dark:border-[#1A3626] z-[999] p-5 text-xs flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1A3626] pb-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Property type</span>
                  {selectedPropertyType !== "ALL" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPropertyType("ALL");
                      }}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Capsule Pills Grid (Shows half initially, full when View More is clicked) */}
                <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto custom-scrollbar pr-1 py-1">
                  {(showAllTypes ? propertyTypes : propertyTypes.slice(0, 7)).map((item) => {
                    const isSelected = selectedPropertyType === item.value;
                    return (
                      <button
                        type="button"
                        key={item.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPropertyType(item.value);
                        }}
                        className={`px-4 py-2 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] font-bold shadow-sm scale-105"
                            : "bg-white dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:border-[#1A3626] dark:hover:border-[#c9a14b]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#1A3626] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTypes(!showAllTypes);
                    }}
                    className="px-5 py-2 border border-[#1A3626] dark:border-[#c9a14b] rounded-full text-[#1A3626] dark:text-[#c9a14b] font-bold text-xs hover:bg-green-50 dark:hover:bg-[#163321] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{showAllTypes ? "View less" : "View more"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllTypes ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter 2: Bedrooms & Bathrooms */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "bedsBaths" ? null : "bedsBaths");
              }}
              className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedBeds !== "ANY" || selectedBaths !== "ANY"
                  ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b]"
                  : "bg-gray-50 dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <span>
                {selectedBeds !== "ANY" || selectedBaths !== "ANY"
                  ? `${selectedBeds !== "ANY" ? `${selectedBeds} Beds` : ""} ${selectedBaths !== "ANY" ? `${selectedBaths} Baths` : ""}`
                  : "Beds & Baths"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "bedsBaths" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "bedsBaths" && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-[360px] bg-white dark:bg-[#102418] rounded-[28px] shadow-2xl border border-gray-200 dark:border-[#1A3626] z-[999] p-5 text-xs flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                <div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white block mb-2.5">Bedrooms</span>
                  <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map((b) => {
                      const isSelected = selectedBeds === b;
                      return (
                        <button
                          type="button"
                          key={b}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBeds(b);
                          }}
                          className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] font-bold shadow-sm scale-105"
                              : "bg-white dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:border-[#1A3626] dark:hover:border-[#c9a14b]"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                  <span className="font-bold text-sm text-gray-900 dark:text-white block mb-2.5">Bathrooms</span>
                  <div className="flex flex-wrap gap-2">
                    {bathroomOptions.map((b) => {
                      const isSelected = selectedBaths === b;
                      return (
                        <button
                          type="button"
                          key={b}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBaths(b);
                          }}
                          className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b] font-bold shadow-sm scale-105"
                              : "bg-white dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:border-[#1A3626] dark:hover:border-[#c9a14b]"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter 3: Min / Max Price */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "price" ? null : "price");
              }}
              className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                minPrice || maxPrice
                  ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b]"
                  : "bg-gray-50 dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <span>
                {minPrice || maxPrice
                  ? `${minPrice ? `Min: AED ${Number(minPrice).toLocaleString()}` : ""} ${maxPrice ? `Max: AED ${Number(maxPrice).toLocaleString()}` : ""}`.trim()
                  : "Price"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "price" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "price" && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#102418] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1A3626] z-[999] p-4 text-xs flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Price Range (AED)</span>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Min / Max Inputs */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min. Price"
                    value={minPrice}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, "");
                      setMinPrice(clean);
                    }}
                    className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max. Price"
                    value={maxPrice}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, "");
                      setMaxPrice(clean);
                    }}
                    className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
                  />
                </div>

                {/* Validation message if Min > Max */}
                {minPrice && maxPrice && Number(minPrice) > Number(maxPrice) && (
                  <p className="text-[11px] text-rose-500 font-semibold leading-tight">
                    * Min price cannot exceed Max price
                  </p>
                )}

                {/* Quick Presets */}
                <div className="flex flex-col gap-1 pt-1 border-t border-gray-100 dark:border-[#1A3626]">
                  <span className="text-[11px] text-gray-400 font-bold uppercase mb-1">Quick Ranges</span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinPrice(preset.min);
                          setMaxPrice(preset.max);
                        }}
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Auto-fix if min > max
                    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
                      const temp = minPrice;
                      setMinPrice(maxPrice);
                      setMaxPrice(temp);
                    }
                    setActiveDropdown(null);
                  }}
                  className="w-full py-2 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] rounded-xl font-bold cursor-pointer mt-1"
                >
                  Apply Price
                </button>
              </div>
            )}
          </div>

          {/* Filter 4: Rental Period */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "rentalPeriod" ? null : "rentalPeriod");
              }}
              className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedRentalPeriod !== "Yearly"
                  ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b]"
                  : "bg-gray-50 dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <span>{selectedRentalPeriod}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "rentalPeriod" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "rentalPeriod" && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#102418] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1A3626] z-[999] p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                {rentalPeriodOptions.map((period) => (
                  <button
                    type="button"
                    key={period}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRentalPeriod(period);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      selectedRentalPeriod === period
                        ? "bg-green-50 dark:bg-[#163321] text-[#1A3626] dark:text-[#c9a14b] font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-[#163321] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{period}</span>
                    {selectedRentalPeriod === period && <Check className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter 5: Category (Residential / Commercial) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "category" ? null : "category");
              }}
              className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory !== "RESIDENTIAL"
                  ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b]"
                  : "bg-white dark:bg-[#091711] border-[#1A3626]/40 dark:border-[#c9a14b]/40 text-[#1A3626] dark:text-[#c9a14b]"
              }`}
            >
              <span>{selectedCategory === "RESIDENTIAL" ? "Residential" : "Commercial"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "category" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "category" && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#102418] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1A3626] z-[999] p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                {[
                  { label: "Residential", value: "RESIDENTIAL" },
                  { label: "Commercial", value: "COMMERCIAL" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(item.value);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      selectedCategory === item.value
                        ? "bg-green-50 dark:bg-[#163321] text-[#1A3626] dark:text-[#c9a14b] font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-[#163321] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedCategory === item.value && <Check className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter 6: Amenities */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "amenities" ? null : "amenities");
              }}
              className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedAmenities.length > 0
                  ? "bg-green-50 dark:bg-[#163321] border-[#1A3626] dark:border-[#c9a14b] text-[#1A3626] dark:text-[#c9a14b]"
                  : "bg-gray-50 dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              <span>{selectedAmenities.length > 0 ? `Amenities (${selectedAmenities.length})` : "Amenities"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "amenities" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "amenities" && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#102418] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1A3626] z-[999] p-4 text-xs flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Select Amenities</span>
                <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {allAmenities.map((amenity) => (
                    <button
                      type="button"
                      key={amenity}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAmenity(amenity);
                      }}
                      className={`px-3 py-2 rounded-xl text-left font-medium border transition-colors cursor-pointer flex items-center justify-between ${
                        selectedAmenities.includes(amenity)
                          ? "bg-green-50 dark:bg-[#163321] text-[#1A3626] dark:text-[#c9a14b] border-[#1A3626] font-bold"
                          : "bg-gray-50 dark:bg-[#091711] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1A3626]"
                      }`}
                    >
                      <span className="truncate">{amenity}</span>
                      {selectedAmenities.includes(amenity) && <Check className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(null);
                  }}
                  className="w-full py-2 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] rounded-xl font-bold mt-2 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
