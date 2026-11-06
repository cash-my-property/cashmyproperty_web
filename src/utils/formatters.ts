/**
 * Formatter utilities for property types, categories, plans, furnishing, rental periods, and amenities.
 * Supports bilingual formatting (English & Arabic).
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

const PROPERTY_TYPE_MAP_AR: Record<string, string> = {
  APARTMENT: "شقة",
  VILLA: "فيلا",
  TOWNHOUSE: "تاون هاوس",
  PENTHOUSE: "بنتهاوس",
  COMPOUND: "مجمع سكني",
  DUPLEX: "دوبلكس",
  FULL_FLOOR: "طابق كامل",
  HALF_FLOOR: "نصف طابق",
  BUILDING: "مبنى بالكامل",
  WHOLE_BUILDING: "مبنى بالكامل",
  LAND: "أرض",
  BULK_RENT_UNIT: "وحدات للإيجار بالجملة",
  BULK_SALE_UNIT: "وحدات للبيع بالجملة",
  BULK_UNIT: "وحدات بالجملة",
  BUNGALOW: "بنغلو",
  HOTEL_APARTMENT: "شقة فندقية",
  OFFICES: "مكتب",
  OFFICE: "مكتب",
  RETAIL: "محل تجاري",
  WAREHOUSE: "مستودع",
  SHOP: "متجر",
  SHOWROOM: "صالة عرض",
  SHOW_ROOM: "صالة عرض",
  FACTORY: "مصنع",
  LABOR_CAMP: "سكن عمال",
  STAFF_ACCOMMODATION: "سكن موظفين",
  BUSINESS_CENTRE: "مركز أعمال",
  CO_WORKING_SPACE: "مساحة عمل مشتركة",
  COWORKING_SPACE: "مساحة عمل مشتركة",
  FARM: "مزرعة",
  COMMERCIAL_VILLA: "فيلا تجارية",
  COMMERCIAL_LAND: "أرض تجارية",
  RESIDENTIAL: "سكني",
  COMMERCIAL: "تجاري"
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

const AMENITY_MAP_AR: Record<string, string> = {
  BALCONY: "شرفة",
  BARBECUE_AREA: "منطقة شواء",
  BUILT_IN_WARDROBES: "خزائن مدمجة",
  CENTRAL_AC: "تكييف مركزي",
  CENTRAL_A_C: "تكييف مركزي",
  COVERED_PARKING: "موقف سيارات مغطى",
  PRIVATE_GYM: "صالة رياضية خاصة",
  PRIVATE_JACUZZI: "جاكوزي خاص",
  KITCHEN_APPLIANCES: "أجهزة المطبخ",
  MAIDS_ROOM: "غرفة خادمة",
  PETS_ALLOWED: "يسمح بالحيوانات الأليفة",
  PRIVATE_GARDEN: "حديقة خاصة",
  PRIVATE_POOL: "مسبح خاص",
  SHARED_POOL: "مسبح مشترك",
  STUDY: "غرفة دراسة",
  VIEW_OF_WATER: "إطلالة على الماء",
  SECURITY: "أمن وحراسة",
  CONCIERGE: "خدمة كونسيرج",
  SHARED_SPA: "سبا مشترك",
  SHARED_GYM: "صالة رياضية مشتركة",
  MAID_SERVICE: "خدمة تنظيف",
  WALK_IN_CLOSET: "خزانة ملابس واسعة",
  VIEW_OF_LANDMARK: "إطلالة على معلم بارز",
  CHILDRENS_PLAY_AREA: "منطقة لعب للأطفال",
  CHILDREN_PLAY_AREA: "منطقة لعب للأطفال",
  LOBBY_IN_BUILDING: "بهو في المبنى",
  CHILDRENS_POOL: "مسبح للأطفال",
  VASTU_COMPLIANT: "متوافق مع فاستو",
  NETWORKED: "مجهز بشبكة إنترنت",
  DINING_IN_BUILDING: "مطاعم في المبنى",
  CONFERENCE_ROOM: "قاعة مؤتمرات"
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

export const formatPropertyType = (type?: string | null, locale?: string): string => {
  if (!type) return locale === "ar" ? "عقار" : "Property";
  const upper = type.toUpperCase().trim();
  if (locale === "ar" && PROPERTY_TYPE_MAP_AR[upper]) {
    return PROPERTY_TYPE_MAP_AR[upper];
  }
  if (PROPERTY_TYPE_MAP[upper]) {
    return PROPERTY_TYPE_MAP[upper];
  }
  return toTitleCase(type);
};

export const formatPropertyCategory = (category?: string | null, locale?: string): string => {
  if (!category) return locale === "ar" ? "سكني" : "Residential";
  const upper = category.toUpperCase().trim();
  if (upper === "RESIDENTIAL") return locale === "ar" ? "سكني" : "Residential";
  if (upper === "COMMERCIAL") return locale === "ar" ? "تجاري" : "Commercial";
  return toTitleCase(category);
};

export const formatPropertyPlan = (plan?: string | null, locale?: string): string => {
  if (!plan) return locale === "ar" ? "جاهز" : "Ready";
  const upper = plan.toUpperCase().trim();
  if (upper === "READY") return locale === "ar" ? "جاهز" : "Ready";
  if (upper === "OFF_PLAN" || upper === "OFFPLAN") return locale === "ar" ? "على المخطط" : "Off-Plan";
  return toTitleCase(plan);
};

export const formatListingPurpose = (purpose?: string | null, locale?: string): string => {
  if (!purpose) return locale === "ar" ? "للبيع" : "Sale";
  const upper = purpose.toUpperCase().trim();
  if (upper === "RENT") return locale === "ar" ? "للإيجار" : "Rent";
  if (upper === "SALE") return locale === "ar" ? "للبيع" : "Sale";
  return toTitleCase(purpose);
};

export const formatFurnishingStatus = (status?: string | null, locale?: string): string => {
  if (!status) return locale === "ar" ? "غير مفروش" : "Unfurnished";
  const upper = status.toUpperCase().trim();
  if (upper === "NOT_FURNISHED" || upper === "UNFURNISHED") return locale === "ar" ? "غير مفروش" : "Unfurnished";
  if (upper === "SEMI" || upper === "SEMI_FURNISHED") return locale === "ar" ? "مفروش جزئياً" : "Semi Furnished";
  if (upper === "FULL" || upper === "FURNISHED" || upper === "FULLY_FURNISHED") return locale === "ar" ? "مفروش" : "Furnished";
  return toTitleCase(status);
};

export const formatRentalPeriod = (period?: string | null, locale?: string): string => {
  if (!period) return "";
  const upper = period.toUpperCase().trim();
  if (upper === "PER_YEAR") return locale === "ar" ? "سنوياً" : "Yearly";
  if (upper === "PER_MONTH") return locale === "ar" ? "شهرياً" : "Monthly";
  if (upper === "PER_WEEK") return locale === "ar" ? "أسبوعياً" : "Weekly";
  if (upper === "PER_DAY") return locale === "ar" ? "يومياً" : "Daily";
  return toTitleCase(period.replace(/^PER_/i, ""));
};

export const formatRentalPeriodShort = (period?: string | null, locale?: string): string => {
  if (!period) return "";
  const upper = period.toUpperCase().trim();
  if (upper === "PER_YEAR") return locale === "ar" ? "سنة" : "yr";
  if (upper === "PER_MONTH") return locale === "ar" ? "شهر" : "mo";
  if (upper === "PER_WEEK") return locale === "ar" ? "أسبوع" : "wk";
  if (upper === "PER_DAY") return locale === "ar" ? "يوم" : "day";
  return period.replace(/^PER_/i, "").toLowerCase();
};

export const formatAmenity = (amenity?: string | null, locale?: string): string => {
  if (!amenity) return "";
  const upper = amenity.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  if (locale === "ar" && AMENITY_MAP_AR[upper]) {
    return AMENITY_MAP_AR[upper];
  }
  if (AMENITY_MAP[upper]) {
    return AMENITY_MAP[upper];
  }
  if (amenity.includes(" ") && /[a-z]/.test(amenity)) {
    return amenity;
  }
  return toTitleCase(amenity);
};

export const formatAvailability = (availability?: string | null, locale?: string): string => {
  if (!availability) return locale === "ar" ? "فوراً" : "Immediately";
  const trimmed = availability.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "immediate" || lower === "immediately" || lower === "vacant") {
    return locale === "ar" ? "فوراً" : "Immediately";
  }
  const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    try {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return locale === "ar"
          ? `ابتداءً من ${d.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}`
          : `From ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
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

export const formatBlogDate = (dateStr?: string | Date | null, locale: string = "en"): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(d);
  } catch {
    return String(dateStr);
  }
};
