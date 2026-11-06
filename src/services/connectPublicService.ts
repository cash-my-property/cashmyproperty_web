import api, { PUBLIC_API_PREFIX } from "@/lib/api";

export interface PublicListingCard {
  id: string;
  ref: string;
  title: string;
  titleAr?: string | null;
  purpose: "SALE" | "RENT" | string;
  category: "RESIDENTIAL" | "COMMERCIAL" | string;
  plan?: "READY" | "OFF_PLAN" | string;
  type: string;
  typeLabel?: string;
  price: number | null;
  currency: string;
  rentalPeriod?: string | null;
  bedrooms?: string | number | null;
  bathrooms?: string | number | null;
  area?: number | null;
  areaUnit?: string;
  builtUpArea?: number | null;
  furnishing?: string | null;
  location?: string;
  locationParts?: string[];
  coverImage?: string | null;
  photoCount?: number;
  hasVideo?: boolean;
  hasTour?: boolean;
  publishedAt?: string;
  company?: {
    type: "AGENCY" | "DEVELOPER" | string;
    id: string;
    name: string;
    logo?: string | null;
    orn?: string | null;
  } | null;
  agent?: {
    id: string;
    name: string;
    photo?: string | null;
    position?: string | null;
    languages?: string[];
    nationality?: string | null;
    experienceSince?: number | null;
    brn?: string | null;
    brnVerified?: boolean | null;
    about?: string | null;
  } | null;
  isFavourited?: boolean;
}

export interface PublicPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PublicHomeData {
  featured: PublicListingCard[];
  communities: Array<{
    name: string;
    count: number;
    forSale: number;
    forRent: number;
    coverImage?: string | null;
  }>;
  totals: {
    live: number;
    forSale: number;
    forRent: number;
    agencies: number;
  };
}

export interface PublicFilterOptions {
  purposes: string[];
  categories: string[];
  plans: string[];
  rentalPeriods: string[];
  furnishing: string[];
  typeLabels: Record<string, string>;
  amenities: {
    RESIDENTIAL: string[];
    COMMERCIAL: string[];
  };
  sorts: string[];
}

export interface PublicFilterCounts {
  total: number;
  purpose?: Record<string, number>;
  category?: Record<string, number>;
  plan?: Record<string, number>;
  type?: Record<string, number>;
  furnishing?: Record<string, number>;
  beds?: Record<string, number>;
}

export interface PublicSearchSuggestions {
  locations: Array<{ name: string; count: number }>;
  listings: Array<{ id: string; ref: string; title: string; location: string }>;
  companies: Array<{
    type: "AGENCY" | "DEVELOPER" | string;
    id: string;
    name: string;
    logo?: string | null;
    orn?: string | null;
  }>;
}

export interface PublicListingDetail extends PublicListingCard {
  titleAr?: string | null;
  description?: string;
  descriptionAr?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
  parkingSpaces?: number | null;
  availability?: string | null;
  unitNumber?: string | null;
  referenceNumber?: string | null;
  permitNumber?: string | null;
  downPayment?: number | null;
  amenities?: string[];
  images?: string[];
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  floorPlan?: { url: string; label: string } | null;
  contactChannels?: ("CALL" | "WHATSAPP" | "EMAIL")[];
  similar?: PublicListingCard[];
}

export interface ContactLeadResult {
  channel: "CALL" | "WHATSAPP" | "EMAIL";
  agent: PublicListingCard["agent"];
  phone?: string | null;
  whatsapp?: string | null;
  whatsappUrl?: string | null;
  email?: string | null;
  emailSubject?: string;
  message?: string;
}


export interface PublicAgent {
  id: string;
  name: string;
  photo?: string | null;
  position?: string | null;
  languages?: string[];
  nationality?: string | null;
  experienceSince?: number | null;
  brn?: string | null;
  brnVerified?: boolean | null;
  about?: string | null;
  company?: {
    type: "AGENCY" | "DEVELOPER" | string;
    id?: string;
    name: string;
    logo?: string | null;
    orn?: string | null;
  } | null;
  listings?: {
    total: number;
    forSale: number;
    forRent: number;
  };
  /** Backend 4832d23: list + profile dono pe (null = agent ne add nahi kiya → button chhupao) */
  contact?: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
  } | null;
  /** Profile only (4832d23): CLAIMED transactions se */
  deals?: {
    closed: number;
    sold: number;
    rented: number;
    totalValue: number;
    currency: string;
  };
  /** Purane naam (compatibility) — listings.total / deals.closed jaise hi */
  liveListings?: number;
  closedDeals?: number;
  joinedAt?: string;
}

export interface PublicTrackRecord {
  id: string;
  outcome: "SOLD" | "RENTED";
  date?: string;
  price?: number;
  currency?: string;
  property?: {
    ref?: string;
    title?: string;
    location?: string;
    locationParts?: string[];
    type?: string;
    typeLabel?: string;
    bedrooms?: string | number;
    area?: number;
    areaUnit?: string;
    coverImage?: string | null;
  };
  agent?: PublicListingCard["agent"];
  company?: PublicListingCard["company"];
}

export interface PublicCompanyDetail {
  type: "AGENCY" | "DEVELOPER";
  id: string;
  name: string;
  logo?: string | null;
  orn?: string | null;
  emirate?: string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  liveListings: number;
  agents: Array<PublicListingCard["agent"]>;
}

export const connectPublicService = {
  // 15. Home data
  async getHome(): Promise<PublicHomeData> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/home`);
    return res.data?.data;
  },

  // 16. Options
  async getOptions(): Promise<PublicFilterOptions> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/options`);
    return res.data?.data;
  },

  // 17. Search Results / Listings
  async getListings(params: Record<string, any> = {}): Promise<{
    data: PublicListingCard[];
    pagination: PublicPagination;
  }> {
    const cleanParams: Record<string, any> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all" && v !== "ALL") {
        cleanParams[k] = v;
      }
    });
    const res = await api.get(`${PUBLIC_API_PREFIX}/listings`, { params: cleanParams });
    return res.data;
  },

  // 18. Filter counts
  async getFilterCounts(params: Record<string, any> = {}): Promise<PublicFilterCounts> {
    const cleanParams: Record<string, any> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all" && v !== "ALL") {
        cleanParams[k] = v;
      }
    });
    const res = await api.get(`${PUBLIC_API_PREFIX}/filter-counts`, { params: cleanParams });
    return res.data?.data;
  },

  // 19. Search suggestions
  async getSearchSuggestions(query: string): Promise<PublicSearchSuggestions> {
    if (!query || query.trim().length < 2) {
      return { locations: [], listings: [], companies: [] };
    }
    const res = await api.get(`${PUBLIC_API_PREFIX}/search-suggestions`, {
      params: { q: query.trim() },
    });
    return res.data?.data || { locations: [], listings: [], companies: [] };
  },

  // 20. Property detail page
  async getListingDetail(ref: string): Promise<PublicListingDetail> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/listings/${encodeURIComponent(ref)}`);
    return res.data?.data;
  },

  // 21. Contact Agent (Call / WhatsApp / Email lead tap)
  async contactListing(
    ref: string,
    channel: "CALL" | "WHATSAPP" | "EMAIL",
    message?: string
  ): Promise<ContactLeadResult> {
    const res = await api.post(
      `${PUBLIC_API_PREFIX}/listings/${encodeURIComponent(ref)}/contact`,
      { channel, ...(message && { message }) }
    );
    return res.data?.data;
  },

  // 22. Company profile (Agency or Developer)
  async getAgency(id: string): Promise<PublicCompanyDetail> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/agencies/${id}`);
    return res.data?.data;
  },

  async getDeveloper(id: string): Promise<PublicCompanyDetail> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/developers/${id}`);
    return res.data?.data;
  },

  // 23. Find agents
  async getAgents(params: Record<string, any> = {}): Promise<{
    data: PublicAgent[];
    pagination: PublicPagination;
  }> {
    const cleanParams: Record<string, any> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all" && v !== "ALL") {
        cleanParams[k] = v;
      }
    });
    const res = await api.get(`${PUBLIC_API_PREFIX}/agents`, { params: cleanParams });
    return res.data;
  },

  // 24. Agent track record
  async getAgentTrackRecord(
    id: string,
    params: { outcome?: "SOLD" | "RENTED"; page?: number; limit?: number } = {}
  ): Promise<{
    data: PublicTrackRecord[];
    summary: { sold: number; rented: number; soldValue: number };
    pagination: PublicPagination;
  }> {
    const cleanParams: Record<string, any> = {};
    if (params.outcome === "SOLD" || params.outcome === "RENTED") {
      cleanParams.outcome = params.outcome;
    }
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    const res = await api.get(`${PUBLIC_API_PREFIX}/agents/${id}/track-record`, { params: cleanParams });
    return res.data;
  },

  // 25. Agent page
  async getAgent(id: string): Promise<PublicAgent> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/agents/${id}`);
    return res.data?.data;
  },

  // 26 & 27. Favourites
  async getFavourites(params: { page?: number; limit?: number } = {}): Promise<{
    data: PublicListingCard[];
    pagination: PublicPagination;
  }> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/me/favourites`, { params });
    return res.data;
  },

  async setFavourite(ref: string, saved: boolean): Promise<{
    id: string;
    ref: string;
    isFavourited: boolean;
  }> {
    const res = await api.put(`${PUBLIC_API_PREFIX}/me/favourites/${encodeURIComponent(ref)}`, {
      saved,
    });
    return res.data?.data;
  },


  // ── Backend 4728f57 / 3a443ea / 7d83c9b: directories, transactions, blog, contact, notifications ──

  // Agencies / developers directory (search, sort: mostListings | nameAsc | newest)
  async getCompanies(
    type: "AGENCY" | "DEVELOPER",
    params: { search?: string; sort?: string; page?: number; limit?: number } = {}
  ): Promise<{ data: PublicCompanyCard[]; pagination: PublicPagination }> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/${type === "AGENCY" ? "agencies" : "developers"}`, { params: clean(params) });
    return res.data;
  },

  // Dubai-wide confirmed (CLAIMED) deals register
  async getTransactions(
    params: { outcome?: "SOLD" | "RENTED"; location?: string; page?: number; limit?: number } = {}
  ): Promise<{ data: PublicTrackRecord[]; pagination: PublicPagination }> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/transactions`, { params: clean(params) });
    return res.data;
  },

  // Blog (website only, read-only)
  async getBlogs(params: { search?: string; category?: string; page?: number; limit?: number } = {}): Promise<{
    data: PublicBlogCard[];
    pagination: PublicPagination;
  }> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/blogs`, { params: clean(params) });
    return res.data;
  },
  async getBlogCategories(): Promise<{ name: string; count: number }[]> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/blogs/categories`);
    return res.data?.data || [];
  },
  async getBlog(slug: string): Promise<PublicBlogDetail> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/blogs/${encodeURIComponent(slug)}`);
    return res.data?.data;
  },

  // Contact Us (guest ya logged-in)
  async contactUs(body: { fullName: string; email: string; mobile?: string; subject?: string; message: string }): Promise<{
    id: string;
    receivedAt: string;
  }> {
    const res = await api.post(`${PUBLIC_API_PREFIX}/contact-us`, body);
    return res.data?.data;
  },

  // Notifications (login)
  async getNotifications(params: { page?: number; limit?: number } = {}): Promise<{
    data: PublicNotification[];
    pagination?: PublicPagination;
  }> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/me/notifications`, { params: clean(params) });
    return res.data;
  },
  async getUnreadNotificationCount(): Promise<number> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/me/notifications/unread-count`);
    return res.data?.data?.unread ?? 0;
  },
  async markNotificationRead(id: string) {
    await api.patch(`${PUBLIC_API_PREFIX}/me/notifications/${encodeURIComponent(id)}/read`);
  },
  async markAllNotificationsRead() {
    await api.patch(`${PUBLIC_API_PREFIX}/me/notifications/read-all`);
  },
  async deleteNotification(id: string) {
    await api.delete(`${PUBLIC_API_PREFIX}/me/notifications/${encodeURIComponent(id)}`);
  },
  async clearNotifications() {
    await api.delete(`${PUBLIC_API_PREFIX}/me/notifications/clear-all`);
  },
};

const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "ALL"));

export interface PublicCompanyCard {
  id: string;
  type: "AGENCY" | "DEVELOPER";
  name: string;
  logo: string | null;
  orn: string | null;
  emirate: string | null;
  listings: { total: number; forSale: number; forRent: number };
  agents: number;
  joinedAt: string;
}

export interface PublicBlogCard {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  author: string | null;
  publishedAt: string;
}

export interface PublicBlogDetail extends PublicBlogCard {
  content: string;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string[] } | null;
  related: PublicBlogCard[];
}

export interface PublicNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  /** Deep link: website ke liye `url` (e.g. /real-time-offers/:id, /listings/:ref) */
  data: { url?: string; screen?: string; auctionId?: string; listingRef?: string; [k: string]: unknown };
  read: boolean;
  at: string;
}

export default connectPublicService;

