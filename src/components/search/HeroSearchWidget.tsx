"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X, SlidersHorizontal, MapPin, Building, User, Building2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";

interface HeroSearchWidgetProps {
  onSearch?: (filters: any) => void;
  initialTab?: string;
  variant?: "HERO" | "DRAWER";
  showTabs?: boolean;
}

// Shapes of GET /public/v2/search-filters and GET /public/v2/search-suggestions
interface FilterOption {
  value: string;
  label: string;
}

interface FilterDef {
  key: string;
  label: string;
  type: "single" | "multi" | "range";
  options?: FilterOption[];
  range?: { min: number; max: number };
}

interface FilterConfig {
  key: string;
  placeholder: string;
  filters: FilterDef[];
}

interface SuggestionState {
  locations: { name: string; count: number }[];
  properties: { title: string; count: number; listingId?: string; location?: string; propertyType?: string; price?: number }[];
  agents: { agentId: string; name: string; officeName?: string | null; isVerified?: boolean; listingCount: number }[];
  companies: { name: string; agentCount: number; listingCount: number }[];
}

const EMPTY_SUGGESTIONS: SuggestionState = { locations: [], properties: [], agents: [], companies: [] };

// Which dropdowns each tab shows (mirrors the "Filters per tab" table of the search v2 docs)
const TAB_FILTERS: Record<string, string[]> = {
  RENT: ["category", "propertyType", "beds", "baths", "price", "amenities", "furnishing", "rentalPeriod"],
  BUY: ["category", "propertyType", "beds", "baths", "price", "amenities", "area", "furnishing"],
  NEW_PROJECTS: ["category", "propertyType", "beds", "price", "amenities"],
  AGENTS: ["segment", "propertyType", "language", "nationality"],
};

const toOptions = (values: string[]): FilterOption[] => values.map((v) => ({ value: v, label: v }));

// Static option lists only used until (or if) /v2/search-filters answers
const FALLBACK_BEDS = toOptions(["Studio", "1", "2", "3", "4", "5", "6", "7+"]);
const FALLBACK_BATHS = toOptions(["1", "2", "3", "4", "5", "6", "7+"]);
const FALLBACK_CATEGORIES: FilterOption[] = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
];
const FALLBACK_FURNISHING: FilterOption[] = [
  { value: "FULL", label: "Furnished" },
  { value: "SEMI", label: "Partly furnished" },
  { value: "NOT_FURNISHED", label: "Unfurnished" },
];
const FALLBACK_RENTAL_PERIODS: FilterOption[] = [
  { value: "PER_YEAR", label: "Yearly" },
  { value: "PER_MONTH", label: "Monthly" },
  { value: "PER_WEEK", label: "Weekly" },
  { value: "PER_DAY", label: "Daily" },
];
const FALLBACK_SEGMENTS: FilterOption[] = [
  { value: "RESIDENTIAL_SALE", label: "Residential For Sale" },
  { value: "RESIDENTIAL_RENT", label: "Residential For Rent" },
  { value: "COMMERCIAL_SALE", label: "Commercial For Sale" },
  { value: "COMMERCIAL_RENT", label: "Commercial For Rent" },
];
const FALLBACK_LANGUAGES = toOptions(["English", "Arabic", "Hindi", "Urdu", "Russian", "French", "German", "Spanish"]);
const FALLBACK_NATIONALITIES = toOptions(["Emirati", "Indian", "British", "Pakistani", "Egyptian", "Russian", "Canadian", "Lebanese"]);

const labelOf = (options: FilterOption[], value: string) => options.find((o) => o.value === value)?.label || value;

const summarize = (options: FilterOption[], values: string[], empty: string) => {
  if (values.length === 0) return empty;
  const first = labelOf(options, values[0]);
  return values.length === 1 ? first : `${first} +${values.length - 1}`;
};

const csvList = (raw: string | null | undefined) => (raw || "").split(",").map((s) => s.trim()).filter(Boolean);

export default function HeroSearchWidget({ onSearch, initialTab = "BUY", variant = "HERO", showTabs = true }: HeroSearchWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionState>(EMPTY_SUGGESTIONS);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);

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

  // Inline Dropdown States (for HERO mode via React Portal to prevent clipping)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);

  const toggleDropdown = (dropdownName: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
      setDropdownCoords(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const popupWidth = dropdownName === "propertyType" ? 360 : dropdownName === "amenities" ? 380 : dropdownName === "deliveryDate" ? 280 : 320;
      let left = rect.left + window.scrollX;
      if (left + popupWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - popupWidth - 16);
      }
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 8,
        left: left,
      });
      setActiveDropdown(dropdownName);
    }
  };

  useEffect(() => {
    if (!activeDropdown) return;
    const handleResize = () => {
      setActiveDropdown(null);
      setDropdownCoords(null);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeDropdown]);

  // Filter States (values are the raw API values from /v2/search-filters)
  const [selectedCategory, setSelectedCategory] = useState<string>("RESIDENTIAL");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [selectedBaths, setSelectedBaths] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState<string>("");
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAllTypes, setShowAllTypes] = useState<boolean>(false);

  // Agents specific filter states
  const [agentSubTab, setAgentSubTab] = useState<"AGENTS" | "COMPANIES">("AGENTS");
  const [selectedAgentSegment, setSelectedAgentSegment] = useState<string>("RESIDENTIAL_SALE");
  const [selectedAgentLanguage, setSelectedAgentLanguage] = useState<string>("");
  const [selectedAgentNationality, setSelectedAgentNationality] = useState<string>("");

  // Buy specific sub-tabs (All, Off-plan, Ready)
  const [buySubTab, setBuySubTab] = useState<"ALL" | "OFF_PLAN" | "READY">("ALL");

  // Dropdown definitions loaded from GET /public/v2/search-filters
  const [filterConfig, setFilterConfig] = useState<FilterConfig | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close inline dropdowns & autocomplete on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest('[data-dropdown-popup="true"]')
      ) {
        setActiveDropdown(null);
        setDropdownCoords(null);
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAgentTab = activeTab === "AGENTS";
  // The Companies sub-tab is its own `tab` value for the search API
  const apiTab = isAgentTab && agentSubTab === "COMPANIES" ? "COMPANIES" : activeTab;
  const plan = activeTab === "BUY" && buySubTab !== "ALL" ? buySubTab : "";
  const configCategory = isAgentTab ? "" : selectedCategory;
  const configKey = `${apiTab}|${configCategory}|${plan}`;
  // Ignore a config that was loaded for another tab / category / plan while the new one is in flight
  const activeConfig = filterConfig?.key === configKey ? filterConfig : null;

  const hasFilter = (key: string) => (TAB_FILTERS[activeTab] || []).includes(key);
  const findFilter = (key: string) => activeConfig?.filters.find((f) => f.key === key);
  const optionsOf = (key: string, fallback: FilterOption[] = []) => findFilter(key)?.options || fallback;

  const propertyTypes = optionsOf("propertyType");
  const amenityOptions = optionsOf("amenities");
  const categoryOptions = optionsOf("category", FALLBACK_CATEGORIES);
  const bedOptions = optionsOf("beds", FALLBACK_BEDS);
  const bathOptions = optionsOf("baths", FALLBACK_BATHS);
  const furnishingOptions = optionsOf("furnishing", FALLBACK_FURNISHING);
  const rentalPeriodOptions = optionsOf("rentalPeriod", FALLBACK_RENTAL_PERIODS);
  const segmentOptions = optionsOf("segment", FALLBACK_SEGMENTS);
  const languageOptions = optionsOf("language", FALLBACK_LANGUAGES);
  const nationalityOptions = optionsOf("nationality", FALLBACK_NATIONALITIES);
  const priceRange = findFilter("price")?.range;
  const areaRange = findFilter("area")?.range;

  // Load the dropdown definitions whenever the tab / category / plan changes
  useEffect(() => {
    let cancelled = false;
    api
      .get("/public/v2/search-filters", {
        params: { tab: apiTab, ...(configCategory ? { category: configCategory } : {}), ...(plan ? { plan } : {}) },
      })
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const filters: FilterDef[] = res.data.filters || [];
        setFilterConfig({ key: configKey, placeholder: res.data.searchPlaceholder || "", filters });

        // Drop selections the new tab / category / plan no longer offers
        const prune = (key: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
          const allowed = filters.find((f) => f.key === key)?.options?.map((o) => o.value);
          if (!allowed) return;
          setter((prev) => (prev.every((v) => allowed.includes(v)) ? prev : prev.filter((v) => allowed.includes(v))));
        };
        prune("propertyType", setSelectedPropertyTypes);
        prune("amenities", setSelectedAmenities);
      })
      .catch((err) => console.error("Search filters error:", err));
    return () => {
      cancelled = true;
    };
  }, [configKey]);

  // Rebuild the widget from the URL so a refresh / back navigation shows the filters behind the results
  const urlKey = searchParams?.toString() || "";
  useEffect(() => {
    if (!showTabs || !searchParams) return;
    const get = (key: string) => searchParams.get(key) || "";
    const purpose = (get("listingPurpose") || get("purpose")).toUpperCase();
    const urlTab = get("tab").toUpperCase();
    const urlPlan = get("propertyPlan").toUpperCase();

    let tab: string | null = null;
    if (TAB_FILTERS[urlTab]) tab = urlTab;
    else if (purpose === "RENT") tab = "RENT";
    else if (purpose === "SALE" || purpose === "BUY") tab = "BUY";
    else if (urlPlan === "OFF_PLAN") tab = "NEW_PROJECTS";
    if (tab) setActiveTab(tab);
    setBuySubTab(tab === "BUY" && (urlPlan === "OFF_PLAN" || urlPlan === "READY") ? urlPlan : "ALL");

    setSelectedCategory((get("propertyCategory") || get("category") || "RESIDENTIAL").toUpperCase());
    setSelectedPropertyTypes(csvList(get("propertyType")).map((v) => v.toUpperCase()));
    setSelectedBeds(csvList(get("beds")));
    setSelectedBaths(csvList(get("baths")));
    setMinPrice(get("minPrice"));
    setMaxPrice(get("maxPrice"));
    setMinArea(get("minArea"));
    setMaxArea(get("maxArea"));
    setSelectedAmenities(csvList(get("amenities")));
    setSelectedFurnishing(csvList(get("furnishing")).map((v) => v.toUpperCase()));
    setSelectedRentalPeriod(get("rentalPeriod").toUpperCase());

    const location = get("location") || get("propertyLocation");
    if (location) {
      setSelectedLocation(location);
      setSearchQuery(location);
    } else {
      setSelectedLocation(null);
      setSearchQuery(get("search"));
    }
  }, [urlKey, showTabs]);

  // Selected filters in the search v2 vocabulary — sent with suggestions and reused for the listing URL
  const buildFilterParams = () => {
    const params: Record<string, string> = {};
    const setCsv = (key: string, values: string[]) => {
      if (values.length) params[key] = values.join(",");
    };

    if (isAgentTab) {
      params.segment = selectedAgentSegment;
      setCsv("propertyType", selectedPropertyTypes);
      if (selectedAgentLanguage) params.language = selectedAgentLanguage;
      if (selectedAgentNationality) params.nationality = selectedAgentNationality;
      return params;
    }

    params.category = selectedCategory;
    if (plan) params.plan = plan;
    setCsv("propertyType", selectedPropertyTypes);
    if (hasFilter("beds")) setCsv("beds", selectedBeds);
    if (hasFilter("baths")) setCsv("baths", selectedBaths);
    if (hasFilter("price")) {
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
    }
    if (hasFilter("area")) {
      if (minArea) params.minArea = minArea;
      if (maxArea) params.maxArea = maxArea;
    }
    if (hasFilter("amenities")) setCsv("amenities", selectedAmenities);
    if (hasFilter("furnishing")) setCsv("furnishing", selectedFurnishing);
    if (hasFilter("rentalPeriod") && selectedRentalPeriod) params.rentalPeriod = selectedRentalPeriod;
    return params;
  };

  const filterParams = buildFilterParams();
  const filterParamsKey = JSON.stringify(filterParams);

  // 300ms debounced type-ahead. An empty box that has focus shows popular locations (per the v2 docs);
  // the currently selected filters are sent along so suggestions only cover listings that exist for them.
  useEffect(() => {
    if (!inputFocused || selectedLocation) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsFetchingSuggestions(true);
        const res = await api.get("/public/v2/search-suggestions", {
          params: { tab: apiTab, q: searchQuery.trim(), limit: 5, ...filterParams },
        });
        if (cancelled) return;

        if (res.data?.success && res.data?.suggestions) {
          const s = res.data.suggestions;
          setSuggestions({
            locations: s.locations || [],
            properties: s.properties || [],
            agents: s.agents || [],
            companies: s.companies || [],
          });
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputFocused, searchQuery, selectedLocation, apiTab, filterParamsKey]);

  const closeSuggestions = () => {
    setShowDropdown(false);
    setInputFocused(false);
  };

  const handleSelectLocation = (name: string) => {
    setSelectedLocation(name);
    setSearchQuery(name);
    closeSuggestions();
  };

  const handleSelectProperty = (title: string) => {
    setSelectedLocation(null);
    setSearchQuery(title);
    closeSuggestions();
  };

  const handleSelectAgent = (agentId: string) => {
    closeSuggestions();
    router.push(`/${locale}/sellers/${agentId}`);
  };

  const handleSelectCompany = (name: string) => {
    setSelectedLocation(null);
    setSearchQuery(name);
    closeSuggestions();
    router.push(`/${locale}/sellers?search=${encodeURIComponent(name)}`);
  };

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    setSuggestions(EMPTY_SUGGESTIONS);
    setShowDropdown(false);
  };

  const getSearchPlaceholder = () => {
    if (activeConfig?.placeholder) return activeConfig.placeholder;
    if (!showTabs) return "City, community or building";
    switch (activeTab) {
      case "RENT":
        return "Search properties for rent (City, community, building)...";
      case "BUY":
        return "Search properties for buy / auctions (City, community, building)...";
      case "NEW_PROJECTS":
        return "Location, project or developer";
      case "TRANSACTIONS":
        return "Search property transactions (Building, community, area)...";
      case "AGENTS":
        return "Search agents & agencies (Name, area, language)...";
      default:
        return "City, community or building";
    }
  };

  const handleExecuteSearch = () => {
    const filterPayload = {
      tab: activeTab,
      query: searchQuery,
      location: selectedLocation,
      category: selectedCategory,
      // Single value kept for callers written before multi-select (auctions page)
      propertyType: selectedPropertyTypes[0] || "ALL",
      propertyTypes: selectedPropertyTypes,
      bedrooms: selectedBeds,
      bathrooms: selectedBaths,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      rentalPeriod: selectedRentalPeriod,
      furnishing: selectedFurnishing,
      amenities: selectedAmenities,
    };

    const params = new URLSearchParams();
    params.append("tab", activeTab);

    // Pass location or free text search
    if (selectedLocation) {
      params.append("propertyLocation", selectedLocation);
      params.append("location", selectedLocation);
    } else if (searchQuery.trim()) {
      params.append("search", searchQuery.trim());
    }

    // Listing endpoints call these listingPurpose / propertyCategory / propertyPlan
    if (isAgentTab) {
      params.append("purpose", selectedAgentSegment.endsWith("_RENT") ? "RENT" : "SALE");
    } else if (activeTab === "RENT") {
      params.append("listingPurpose", "RENT");
    } else {
      params.append("listingPurpose", "SALE");
      if (activeTab === "NEW_PROJECTS") params.append("propertyPlan", "OFF_PLAN");
    }

    const renamed: Record<string, string> = { category: "propertyCategory", plan: "propertyPlan" };
    Object.entries(filterParams).forEach(([key, value]) => params.append(renamed[key] || key, value));

    if (showTabs) {
      if (activeTab === "AGENTS") {
        router.push(`/${locale}/sellers?${params.toString()}`);
      } else if (activeTab === "TRANSACTIONS") {
        router.push(`/${locale}/transactions?${params.toString()}`);
      } else {
        router.push(`/${locale}/listings?${params.toString()}`);
      }
    } else if (onSearch) {
      onSearch(filterPayload);
    } else {
      router.push(`/${locale}/listings?${params.toString()}`);
    }
  };

  const toggleIn = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const bedsBathsLabel = () => {
    if (selectedBeds.length === 0 && selectedBaths.length === 0) {
      return activeTab === "NEW_PROJECTS" ? "Bedrooms" : "Beds & Baths";
    }
    const beds = selectedBeds.length ? `${selectedBeds.join(", ")}${selectedBeds.length === 1 && selectedBeds[0] === "Studio" ? "" : " Beds"}` : "";
    const baths = selectedBaths.length ? `${selectedBaths.join(", ")} Baths` : "";
    return [beds, baths].filter(Boolean).join(" • ");
  };

  const pillClass = (active: boolean) =>
    `px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
      active
        ? "border-[#3D3799] bg-[#EEEDFE] text-[#3D3799] dark:bg-[#163321] dark:text-[#c9a14b]"
        : "border-gray-300 dark:border-[#1A3626] bg-white dark:bg-[#091711] text-gray-700 dark:text-gray-200 hover:border-gray-400"
    }`;

  const chipClass = (selected: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
      selected
        ? "bg-[#EEEDFE] text-[#3D3799] border border-[#3D3799] dark:bg-[#163321] dark:text-[#c9a14b]"
        : "bg-white dark:bg-[#091711] border border-gray-200/90 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-50"
    }`;

  const menuItemClass = (selected: boolean) =>
    `w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      selected
        ? "bg-[#EEEDFE] text-[#3D3799] dark:bg-[#163321] dark:text-[#c9a14b]"
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#163321]"
    }`;

  const closeDropdown = () => {
    setActiveDropdown(null);
    setDropdownCoords(null);
  };

  const renderPill = (name: string, label: string, isActive: boolean) => (
    <div className="relative shrink-0" key={name}>
      <button type="button" onClick={(e) => toggleDropdown(name, e)} className={pillClass(isActive || activeDropdown === name)}>
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === name ? "rotate-180" : ""}`} />
      </button>
    </div>
  );

  const renderPopup = (name: string, widthClass: string, children: React.ReactNode, padding = "p-5 gap-4") =>
    activeDropdown === name &&
    dropdownCoords &&
    mounted &&
    createPortal(
      <div
        data-dropdown-popup="true"
        style={{ top: `${dropdownCoords.top}px`, left: `${dropdownCoords.left}px` }}
        className={`absolute z-[99999] ${widthClass} bg-white dark:bg-[#102418] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-gray-200 dark:border-[#1A3626] ${padding} flex flex-col animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>,
      document.body
    );

  const renderApplyButton = (label = "Apply") => (
    <button
      type="button"
      onClick={closeDropdown}
      className="w-full py-2.5 bg-[#EF3C3C] hover:bg-[#E52E2E] text-white rounded-2xl font-bold text-sm cursor-pointer mt-1"
    >
      {label}
    </button>
  );

  const renderLoadingOrEmpty = () => (
    <span className="text-sm text-gray-500 dark:text-gray-400">{activeConfig ? "No options available" : "Loading options..."}</span>
  );

  const hasSuggestions =
    suggestions.locations.length > 0 ||
    suggestions.properties.length > 0 ||
    suggestions.agents.length > 0 ||
    suggestions.companies.length > 0;

  const listingsLabel = (n: number) => `${n} ${n === 1 ? "listing" : "listings"}`;

  const suggestionRowClass =
    "px-3.5 py-2.5 hover:bg-gray-100/80 dark:hover:bg-[#163321] cursor-pointer flex items-center justify-between rounded-xl text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 transition-colors";
  const suggestionBadgeClass =
    "text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-[#091711] px-2 py-0.5 rounded-full shrink-0 ml-2";
  const suggestionHeaderClass =
    "text-[10px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase px-3 pt-1 flex items-center gap-1.5";

  const renderSuggestionRow = (key: string, icon: React.ReactNode, title: string, subtitle: string | undefined, badge: string, onClick: () => void) => (
    <div key={key} onClick={onClick} className={suggestionRowClass}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <div className="min-w-0 flex flex-col">
          <span className="truncate">{title}</span>
          {subtitle && <span className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400">{subtitle}</span>}
        </div>
      </div>
      <span className={suggestionBadgeClass}>{badge}</span>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 relative z-50" ref={containerRef}>
      
      {/* 1. Top Category Tabs Pill Bar (Rendered ONLY when showTabs is true) */}
      {showTabs && (
        <div className="bg-white/95 dark:bg-[#091711]/95 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-[#1A3626] flex items-center justify-center gap-1 sm:gap-2 flex-wrap relative z-50">
          {[
            { label: "Rent", key: "RENT" },
            { label: "Buy", key: "BUY" },
            { label: "New projects", key: "NEW_PROJECTS" },
            { label: "Agents", key: "AGENTS" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#EEEDFE] text-[#3D3799] dark:bg-[#c9a14b] dark:text-[#1A3626] shadow-sm scale-105"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 2. Main Capsule Search Bar Card */}
      <div className="w-full bg-white dark:bg-[#102418] rounded-[32px] p-4 sm:p-5 shadow-2xl border border-gray-100 dark:border-[#1A3626] flex flex-col gap-3.5 relative z-40">
        
        {/* BUY Sub-Tabs Header (Rendered ONLY when BUY tab is active, matching Property Finder) */}
        {activeTab === "BUY" && (
          <div className="flex items-center gap-6 border-b border-gray-100 dark:border-[#1A3626] pb-2 px-1">
            {[
              { label: "All", value: "ALL" },
              { label: "Off-plan", value: "OFF_PLAN" },
              { label: "Ready", value: "READY" },
            ].map((sub) => (
              <button
                key={sub.value}
                type="button"
                onClick={() => setBuySubTab(sub.value as any)}
                className={`pb-2 font-bold text-xs sm:text-sm transition-all cursor-pointer relative ${
                  buySubTab === sub.value
                    ? "text-[#3D3799] dark:text-[#c9a14b] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#3D3799] dark:after:bg-[#c9a14b]"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Agents Sub-Tabs Header (Rendered ONLY when AGENTS tab is active) */}
        {activeTab === "AGENTS" && (
          <div className="flex items-center gap-6 border-b border-gray-100 dark:border-[#1A3626] pb-2 px-1">
            <button
              type="button"
              onClick={() => setAgentSubTab("AGENTS")}
              className={`pb-2 font-bold text-xs sm:text-sm transition-all cursor-pointer relative ${
                agentSubTab === "AGENTS"
                  ? "text-[#3D3799] dark:text-[#c9a14b] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#3D3799] dark:after:bg-[#c9a14b]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              }`}
            >
              Agents
            </button>
            <button
              type="button"
              onClick={() => setAgentSubTab("COMPANIES")}
              className={`pb-2 font-bold text-xs sm:text-sm transition-all cursor-pointer relative ${
                agentSubTab === "COMPANIES"
                  ? "text-[#3D3799] dark:text-[#c9a14b] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#3D3799] dark:after:bg-[#c9a14b]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              }`}
            >
              Companies
            </button>
          </div>
        )}

        {/* Search Input, Filters Trigger Button & Red Search Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">

          {/* Main Input Field with Autocomplete Suggestions Dropdown */}
          <div className="flex-1 relative w-full">
            <div className="flex items-center bg-gray-50/90 dark:bg-[#091711] rounded-full px-5 py-3.5 w-full border border-gray-200/80 dark:border-[#1A3626] focus-within:border-[#3D3799] dark:focus-within:border-[#c9a14b] transition-all">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedLocation(null);
                  setInputFocused(true);
                }}
                onFocus={() => {
                  setInputFocused(true);
                  if (hasSuggestions) setShowDropdown(true);
                }}
                onBlur={closeSuggestions}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    closeSuggestions();
                    handleExecuteSearch();
                  }
                }}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base font-medium"
              />
              {isFetchingSuggestions && (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-2 shrink-0" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLocation(null);
                    setSuggestions(EMPTY_SUGGESTIONS);
                    setShowDropdown(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white ml-2 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categorized Autocomplete Dropdown (mouse-down is swallowed so the input keeps focus while a row is clicked) */}
            {showDropdown && hasSuggestions && (
              <div
                data-dropdown-popup="true"
                onMouseDown={(e) => e.preventDefault()}
                className="absolute left-0 right-0 top-full mt-2.5 bg-white dark:bg-[#102418] shadow-2xl rounded-2xl border border-gray-200/90 dark:border-[#1A3626] p-3 z-[100] max-h-80 overflow-y-auto custom-scrollbar flex flex-col gap-3"
              >
                {/* Locations Section */}
                {suggestions.locations.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className={suggestionHeaderClass}>
                      <MapPin className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#5CD284]" />
                      <span>{searchQuery.trim() ? "Locations" : "Popular locations"}</span>
                    </span>
                    {suggestions.locations.map((loc) =>
                      renderSuggestionRow(
                        `loc-${loc.name}`,
                        <MapPin className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />,
                        loc.name,
                        undefined,
                        listingsLabel(loc.count),
                        () => handleSelectLocation(loc.name)
                      )
                    )}
                  </div>
                )}

                {/* Properties / Projects Section */}
                {suggestions.properties.length > 0 && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                    <span className={suggestionHeaderClass}>
                      <Building className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#5CD284]" />
                      <span>Properties & Projects</span>
                    </span>
                    {suggestions.properties.map((prop) =>
                      renderSuggestionRow(
                        `prop-${prop.listingId || prop.title}`,
                        <Building className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />,
                        prop.title,
                        [prop.location, prop.propertyType].filter(Boolean).join(" • ") || undefined,
                        prop.count > 1 ? listingsLabel(prop.count) : "Property",
                        () => handleSelectProperty(prop.title)
                      )
                    )}
                  </div>
                )}

                {/* Agents Section */}
                {suggestions.agents.length > 0 && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                    <span className={suggestionHeaderClass}>
                      <User className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#5CD284]" />
                      <span>Agents</span>
                    </span>
                    {suggestions.agents.map((agent) =>
                      renderSuggestionRow(
                        `agent-${agent.agentId}`,
                        <User className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />,
                        agent.name,
                        agent.officeName || undefined,
                        listingsLabel(agent.listingCount),
                        () => handleSelectAgent(agent.agentId)
                      )
                    )}
                  </div>
                )}

                {/* Companies Section */}
                {suggestions.companies.length > 0 && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                    <span className={suggestionHeaderClass}>
                      <Building2 className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#5CD284]" />
                      <span>Agencies & Companies</span>
                    </span>
                    {suggestions.companies.map((comp) =>
                      renderSuggestionRow(
                        `comp-${comp.name}`,
                        <Building2 className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b] shrink-0" />,
                        comp.name,
                        `${comp.agentCount} ${comp.agentCount === 1 ? "agent" : "agents"}`,
                        listingsLabel(comp.listingCount),
                        () => handleSelectCompany(comp.name)
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Red Search CTA Button (Property Finder Style) */}
            <button
              onClick={handleExecuteSearch}
              className="w-full sm:w-auto px-8 sm:px-9 py-3.5 bg-[#EF3C3C] hover:bg-[#E52E2E] text-white font-bold text-sm sm:text-base rounded-full transition-all duration-300 shadow-md hover:shadow-lg shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills Row for RENT / BUY / NEW PROJECTS (order follows the v2 filter definitions) */}
        {!isAgentTab && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 py-1 pt-2 border-t border-gray-100 dark:border-[#1A3626] relative z-30">
            {renderPill("category", labelOf(categoryOptions, selectedCategory), true)}
            {renderPill("propertyType", summarize(propertyTypes, selectedPropertyTypes, "Property type"), selectedPropertyTypes.length > 0)}
            {renderPill("bedsBaths", bedsBathsLabel(), selectedBeds.length > 0 || selectedBaths.length > 0)}
            {renderPill(
              "price",
              minPrice || maxPrice
                ? `${minPrice ? `${minPrice} AED` : "0"} - ${maxPrice ? `${maxPrice} AED` : "Any"}`
                : "Price",
              !!(minPrice || maxPrice || selectedRentalPeriod)
            )}
            {renderPill("amenities", selectedAmenities.length > 0 ? `Amenities (${selectedAmenities.length})` : "Amenities", selectedAmenities.length > 0)}
            {hasFilter("area") &&
              renderPill(
                "area",
                minArea || maxArea
                  ? `${minArea ? `${minArea}` : "0"} - ${maxArea ? `${maxArea}` : "Any"} sqft`
                  : "Area (sqft)",
                !!(minArea || maxArea)
              )}
            {hasFilter("furnishing") &&
              renderPill("furnishing", summarize(furnishingOptions, selectedFurnishing, "Furnishing"), selectedFurnishing.length > 0)}
          </div>
        )}

        {/* Quick Filter Pills Row for AGENTS Tab */}
        {isAgentTab && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 py-1 pt-2 border-t border-gray-100 dark:border-[#1A3626] relative z-30">
            {renderPill("agentSegment", labelOf(segmentOptions, selectedAgentSegment), true)}
            {renderPill("propertyType", summarize(propertyTypes, selectedPropertyTypes, "Property type"), selectedPropertyTypes.length > 0)}
            {renderPill("agentLanguage", selectedAgentLanguage || "Language", !!selectedAgentLanguage)}
            {renderPill("agentNationality", selectedAgentNationality || "Nationality", !!selectedAgentNationality)}
          </div>
        )}

      </div>

      {/* INLINE FILTER DROPDOWN POPUPS (Rendered via React Portal onto document.body) */}
      {renderPopup(
        "propertyType",
        "w-[340px] sm:w-[400px]",
        <>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">Property type</h4>

          <div className="flex flex-wrap gap-2.5 max-h-[340px] overflow-y-auto custom-scrollbar p-0.5">
            {propertyTypes.length === 0
              ? renderLoadingOrEmpty()
              : (showAllTypes ? propertyTypes : propertyTypes.slice(0, 7)).map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => toggleIn(setSelectedPropertyTypes, item.value)}
                    className={chipClass(selectedPropertyTypes.includes(item.value))}
                  >
                    {item.label}
                  </button>
                ))}
          </div>

          {propertyTypes.length > 7 && (
            <button
              type="button"
              onClick={() => setShowAllTypes(!showAllTypes)}
              className="self-start text-sm font-bold text-[#3D3799] dark:text-[#c9a14b] border border-[#3D3799]/40 dark:border-[#c9a14b]/40 rounded-2xl px-5 py-2 hover:bg-[#EEEDFE]/40 transition-colors cursor-pointer mt-1"
            >
              {showAllTypes ? "View less" : "View more"}
            </button>
          )}

          {renderApplyButton()}
        </>
      )}

      {renderPopup(
        "bedsBaths",
        "w-80 sm:w-96",
        <>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3">Bedrooms</h4>
            <div className="flex flex-wrap gap-2">
              {bedOptions.map((b) => (
                <button
                  type="button"
                  key={b.value}
                  onClick={() => toggleIn(setSelectedBeds, b.value)}
                  className={chipClass(selectedBeds.includes(b.value))}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {hasFilter("baths") && (
            <div>
              <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-2.5">Bathrooms</label>
              <div className="flex flex-wrap gap-2">
                {bathOptions.map((b) => (
                  <button
                    type="button"
                    key={b.value}
                    onClick={() => toggleIn(setSelectedBaths, b.value)}
                    className={chipClass(selectedBaths.includes(b.value))}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {renderApplyButton()}
        </>
      )}

      {renderPopup(
        "price",
        "w-[340px] sm:w-[380px]",
        <>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">Price</h4>

          {/* Inputs Row with dash separator matching screenshot */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              placeholder={priceRange ? `Min. ${priceRange.min.toLocaleString()} AED` : "Min. Price (AED)"}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-white dark:bg-[#091711] border border-gray-300 dark:border-[#1A3626] rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-[#3D3799] placeholder:text-gray-400 font-normal"
            />
            <span className="text-gray-500 font-bold text-lg">—</span>
            <input
              type="number"
              min={0}
              placeholder={priceRange ? `Max. ${priceRange.max.toLocaleString()} AED` : "Max. Price (AED)"}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-white dark:bg-[#091711] border border-gray-300 dark:border-[#1A3626] rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-[#3D3799] placeholder:text-gray-400 font-normal"
            />
          </div>

          {/* Rental Period (RENT only). Nothing selected = every period; click a selected one again to clear it */}
          {hasFilter("rentalPeriod") && (
            <div className="flex flex-col gap-2 mt-1">
              <h5 className="text-sm font-bold text-gray-900 dark:text-white">Rental Period</h5>
              <div className="flex flex-wrap gap-2">
                {rentalPeriodOptions.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setSelectedRentalPeriod(selectedRentalPeriod === period.value ? "" : period.value)}
                    className={chipClass(selectedRentalPeriod === period.value)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {renderApplyButton()}
        </>
      )}

      {/* Area Popover Portal (Matching Property Finder screenshot) */}
      {renderPopup(
        "area",
        "w-[320px] sm:w-[360px]",
        <>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">Area</h4>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              placeholder={areaRange ? `Min. ${areaRange.min.toLocaleString()}` : "Min. Area"}
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="w-full bg-white dark:bg-[#091711] border border-gray-300 dark:border-[#1A3626] rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-[#3D3799] placeholder:text-gray-400 font-normal"
            />
            <span className="text-gray-500 font-bold text-lg">—</span>
            <input
              type="number"
              min={0}
              placeholder={areaRange ? `Max. ${areaRange.max.toLocaleString()}` : "Max. Area"}
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              className="w-full bg-white dark:bg-[#091711] border border-gray-300 dark:border-[#1A3626] rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-[#3D3799] placeholder:text-gray-400 font-normal"
            />
          </div>

          {renderApplyButton()}
        </>
      )}

      {renderPopup(
        "amenities",
        "w-80 sm:w-96",
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Amenities</h4>
            {selectedAmenities.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAmenities([])}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
            {amenityOptions.length === 0
              ? renderLoadingOrEmpty()
              : amenityOptions.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.value);
                  return (
                    <button
                      type="button"
                      key={amenity.value}
                      onClick={() => toggleIn(setSelectedAmenities, amenity.value)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#EEEDFE] text-[#3D3799] border-[#3D3799] dark:bg-[#163321] dark:text-[#c9a14b] font-bold"
                          : "bg-gray-50 dark:bg-[#091711] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <span>{amenity.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#3D3799] dark:text-[#c9a14b]" />}
                    </button>
                  );
                })}
          </div>
          {renderApplyButton(`Apply (${selectedAmenities.length} selected)`)}
        </>
      )}

      {renderPopup(
        "furnishing",
        "w-80",
        <>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">Furnishing</h4>
          <div className="flex flex-wrap gap-2">
            {furnishingOptions.map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => toggleIn(setSelectedFurnishing, item.value)}
                className={chipClass(selectedFurnishing.includes(item.value))}
              >
                {item.label}
              </button>
            ))}
          </div>
          {renderApplyButton()}
        </>
      )}

      {renderPopup(
        "category",
        "w-52",
        <>
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value);
                closeDropdown();
              }}
              className={menuItemClass(selectedCategory === cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </>,
        "p-2 gap-1"
      )}

      {renderPopup(
        "agentSegment",
        "w-56",
        <>
          {segmentOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setSelectedAgentSegment(item.value);
                closeDropdown();
              }}
              className={menuItemClass(selectedAgentSegment === item.value)}
            >
              {item.label}
            </button>
          ))}
        </>,
        "p-2 gap-1"
      )}

      {renderPopup(
        "agentLanguage",
        "w-56",
        <>
          {[{ value: "", label: "All Languages" }, ...languageOptions].map((lang) => (
            <button
              key={lang.value || "all"}
              type="button"
              onClick={() => {
                setSelectedAgentLanguage(lang.value);
                closeDropdown();
              }}
              className={menuItemClass(selectedAgentLanguage === lang.value)}
            >
              {lang.label}
            </button>
          ))}
        </>,
        "p-2 gap-1 max-h-72 overflow-y-auto custom-scrollbar"
      )}

      {renderPopup(
        "agentNationality",
        "w-56",
        <>
          {[{ value: "", label: "All Nationalities" }, ...nationalityOptions].map((nat) => (
            <button
              key={nat.value || "all"}
              type="button"
              onClick={() => {
                setSelectedAgentNationality(nat.value);
                closeDropdown();
              }}
              className={menuItemClass(selectedAgentNationality === nat.value)}
            >
              {nat.label}
            </button>
          ))}
        </>,
        "p-2 gap-1 max-h-72 overflow-y-auto custom-scrollbar"
      )}

    </div>
  );
}
