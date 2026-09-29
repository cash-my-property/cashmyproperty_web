/**
 * Formatter utilities for property types, categories, plans, furnishing, rental periods, and amenities.
 */

const PROPERTY_TYPE_MAP: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  TOWNHOUSE: "Townhouse",
  PENTHOUSE: "Penthouse",
  COMPOUND: "Compound",
  DUPLEX: "Duplex",
  FULL_FLOOR: "Full Floor",
  HALF_FLOOR: "Half Floor",
  BUILDING: "Whole Building",
  WHOLE_BUILDING: "Whole Building",
  LAND: "Land",
  BULK_RENT_UNIT: "Bulk Rent Unit",
  BULK_SALE_UNIT: "Bulk Sale Unit",
  BULK_UNIT: "Bulk Unit",
  BUNGALOW: "Bungalow",
  HOTEL_APARTMENT: "Hotel Apartment",
  OFFICES: "Office Space",
  OFFICE: "Office Space",
  RETAIL: "Retail",
  WAREHOUSE: "Warehouse",
  SHOP: "Shop",
  SHOWROOM: "Showroom",
  SHOW_ROOM: "Showroom",
  FACTORY: "Factory",
  LABOR_CAMP: "Labor Camp",
  STAFF_ACCOMMODATION: "Staff Accommodation",
  BUSINESS_CENTRE: "Business Centre",
  CO_WORKING_SPACE: "Co-working Space",
  COWORKING_SPACE: "Co-working Space",
  FARM: "Farm",
  COMMERCIAL_VILLA: "Commercial Villa",
  COMMERCIAL_LAND: "Commercial Land",
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial"
};

const AMENITY_MAP: Record<string, string> = {
  BALCONY: "Balcony",
  BARBECUE_AREA: "Barbecue Area",
  BUILT_IN_WARDROBES: "Built in Wardrobes",
  CENTRAL_AC: "Central A/C",
  CENTRAL_A_C: "Central A/C",
  COVERED_PARKING: "Covered Parking",
  PRIVATE_GYM: "Private Gym",
  PRIVATE_JACUZZI: "Private Jacuzzi",
  KITCHEN_APPLIANCES: "Kitchen Appliances",
  MAIDS_ROOM: "Maids Room",
  PETS_ALLOWED: "Pets Allowed",
  PRIVATE_GARDEN: "Private Garden",
  PRIVATE_POOL: "Private Pool",
  SHARED_POOL: "Shared Pool",
  STUDY: "Study",
  VIEW_OF_WATER: "View of Water",
  SECURITY: "Security",
  CONCIERGE: "Concierge",
  SHARED_SPA: "Shared Spa",
  SHARED_GYM: "Shared Gym",
  MAID_SERVICE: "Maid Service",
  WALK_IN_CLOSET: "Walk-in Closet",
  VIEW_OF_LANDMARK: "View of Landmark",
  CHILDRENS_PLAY_AREA: "Children's Play Area",
  CHILDREN_PLAY_AREA: "Children's Play Area",
  LOBBY_IN_BUILDING: "Lobby in Building",
  CHILDRENS_POOL: "Children's Pool",
  VASTU_COMPLIANT: "Vastu-compliant",
  NETWORKED: "Networked",
  DINING_IN_BUILDING: "Dining in building",
  CONFERENCE_ROOM: "Conference room"
};

export const toTitleCase = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatPropertyType = (type?: string | null): string => {
  if (!type) return "Property";
  const upper = type.toUpperCase().trim();
  if (PROPERTY_TYPE_MAP[upper]) {
    return PROPERTY_TYPE_MAP[upper];
  }
  return toTitleCase(type);
};

export const formatPropertyCategory = (category?: string | null): string => {
  if (!category) return "Residential";
  const upper = category.toUpperCase().trim();
  if (upper === "RESIDENTIAL") return "Residential";
  if (upper === "COMMERCIAL") return "Commercial";
  return toTitleCase(category);
};

export const formatPropertyPlan = (plan?: string | null): string => {
  if (!plan) return "Ready";
  const upper = plan.toUpperCase().trim();
  if (upper === "READY") return "Ready";
  if (upper === "OFF_PLAN" || upper === "OFFPLAN") return "Off-Plan";
  return toTitleCase(plan);
};

export const formatListingPurpose = (purpose?: string | null): string => {
  if (!purpose) return "Sale";
  const upper = purpose.toUpperCase().trim();
  if (upper === "RENT") return "Rent";
  if (upper === "SALE") return "Sale";
  return toTitleCase(purpose);
};

export const formatFurnishingStatus = (status?: string | null): string => {
  if (!status) return "Unfurnished";
  const upper = status.toUpperCase().trim();
  if (upper === "NOT_FURNISHED" || upper === "UNFURNISHED") return "Unfurnished";
  if (upper === "SEMI" || upper === "SEMI_FURNISHED") return "Semi Furnished";
  if (upper === "FULL" || upper === "FURNISHED" || upper === "FULLY_FURNISHED") return "Furnished";
  return toTitleCase(status);
};

export const formatRentalPeriod = (period?: string | null): string => {
  if (!period) return "";
  const upper = period.toUpperCase().trim();
  if (upper === "PER_YEAR") return "Yearly";
  if (upper === "PER_MONTH") return "Monthly";
  if (upper === "PER_WEEK") return "Weekly";
  if (upper === "PER_DAY") return "Daily";
  return toTitleCase(period.replace(/^PER_/i, ""));
};

export const formatRentalPeriodShort = (period?: string | null): string => {
  if (!period) return "";
  const upper = period.toUpperCase().trim();
  if (upper === "PER_YEAR") return "yr";
  if (upper === "PER_MONTH") return "mo";
  if (upper === "PER_WEEK") return "wk";
  if (upper === "PER_DAY") return "day";
  return period.replace(/^PER_/i, "").toLowerCase();
};

export const formatAmenity = (amenity?: string | null): string => {
  if (!amenity) return "";
  const upper = amenity.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  if (AMENITY_MAP[upper]) {
    return AMENITY_MAP[upper];
  }
  // If already formatted nicely with spaces or special chars
  if (amenity.includes(" ") && /[a-z]/.test(amenity)) {
    return amenity;
  }
  return toTitleCase(amenity);
};

export const formatAvailability = (availability?: string | null): string => {
  if (!availability) return "Immediately";
  const trimmed = availability.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "immediate" || lower === "immediately" || lower === "vacant") {
    return "Immediately";
  }
  // Check if it's a date e.g. YYYY-MM-DD
  const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    try {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return `From ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
      }
    } catch {}
  }
  return trimmed;
};

export const formatAuctionRemainingTime = (
  endTime?: string | Date | null,
  startTime?: string | Date | null,
  status?: string
): { label: string; isEnded: boolean; isUpcoming: boolean } | null => {
  if (!endTime && !startTime) return null;

  const now = Date.now();

  if (status === "UPCOMING" && startTime) {
    const startMs = new Date(startTime).getTime();
    if (startMs > now) {
      const diff = startMs - now;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (d > 0) return { label: `Starts in ${d}d ${h}h`, isEnded: false, isUpcoming: true };
      if (h > 0) return { label: `Starts in ${h}h ${m}m`, isEnded: false, isUpcoming: true };
      return { label: `Starts in ${m}m`, isEnded: false, isUpcoming: true };
    }
  }

  if (endTime) {
    const endMs = new Date(endTime).getTime();
    if (isNaN(endMs)) return null;

    const diff = endMs - now;
    if (diff <= 0) {
      return { label: "Ended", isEnded: true, isUpcoming: false };
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (d > 0) {
      return { label: `Ends in ${d}d ${h}h ${m}m`, isEnded: false, isUpcoming: false };
    }
    if (h > 0) {
      return { label: `Ends in ${h}h ${m}m`, isEnded: false, isUpcoming: false };
    }
    return { label: `Ends in ${m}m`, isEnded: false, isUpcoming: false };
  }

  return null;
};

