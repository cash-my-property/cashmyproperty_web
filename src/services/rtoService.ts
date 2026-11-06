import api, { PUBLIC_API_PREFIX } from "@/lib/api";

/**
 * Real Time Offer (RTO) — buyer side, CMP Connect public API.
 * Docs: /docs (Website API) → "Buyer side · Real Time Offer" (12 APIs).
 * Pehle yeh flow legacy /buyer/* + /public/* endpoints pe tha jo public portal users ko 401 dete the.
 */

const RTO = `${PUBLIC_API_PREFIX}/real-time-offers`;

export type RtoStatus = "UPCOMING" | "ACTIVE" | "PAUSED" | "SOLD" | "NOT_SOLD" | "ENDED" | string;
export type RtoSort = "ending_soon" | "newest" | "price_asc" | "price_desc" | "popular";
export type RtoContractStatus = "NOT_SIGNED" | "PENDING" | "APPROVED" | "REJECTED";
export type RtoMyOfferStatus = "LEADING" | "OUTBID" | "WON" | "LOST" | string;

export interface RtoCard {
  id: string;
  rtoRef: string;
  title: string;
  location: string;
  category: string;
  plan: string;
  type: string;
  typeLabel: string;
  bedrooms: string | null;
  washrooms: string | null;
  area: number | null;
  areaUnit: string;
  coverImage: string | null;
  company: { id?: string; name: string; logo: string | null } | null;
  status: RtoStatus;
  startTime: string;
  endTime: string | null;
  startPrice: number;
  currentPrice: number;
  offers: number;
  currency: string;
  /** SOLD | NOT_SOLD (status SOLD_FAIL ka UI naam); results list + detail */
  result?: "SOLD" | "NOT_SOLD" | null;
  finalPrice?: number | null;
}

/** Backend f5c0f7e se images [{ url }] (watermarked); purane responses mein string[] tha */
export type RtoImage = string | { url: string };

export interface RtoDetail extends RtoCard {
  description: string | null;
  images: RtoImage[];
  amenities: string[];
  builtUpArea: number | null;
  coordinates: { latitude: number; longitude: number } | null;
  trakheesiNumber: string | null;
  minimumOffer: number;
  finalPrice: number | null;
  myContract: {
    contractId: string;
    status: RtoContractStatus;
    rejectionReason: string | null;
    signedAt: string | null;
  } | null;
  myOffer: { amount: number; status: RtoMyOfferStatus } | null;
  leading: boolean;
  /** Backend 4728f57: true = broker ki apni agency ki property (offer/contract mana) */
  ownAgency?: boolean;
  can: { signContract: boolean; placeOffer: boolean };
}

export interface RtoLiveState {
  id: string;
  status: RtoStatus;
  currentPrice: number;
  offers: number;
  startTime: string;
  endTime: string | null;
  finalPrice: number | null;
  serverTime: string;
}

export interface RtoOfferHistory {
  total: number;
  offers: { buyer: string; amount: number; at: string }[];
}

export const RTO_REQUIRED_DOCS = [
  "signedContract",
  "passportDocument",
  "propertyCheque",
  "propertyUndertakingLetter",
  "buyerESignature",
] as const;

export interface RtoContractInfo {
  status: RtoContractStatus;
  contractId: string | null;
  rejectionReason: string | null;
  signedAt: string | null;
  submissionNumber: number;
  canSign: boolean;
  required: string[];
  optional: string[];
  labels: Record<string, string>;
  rules: { maxSizeBytes: number; allowedFormats: string[] };
}

export interface RtoUploadSignature {
  id: string;
  document: { signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string };
}

export interface RtoUploadedDoc {
  url: string;
  public_id: string;
  fileName?: string;
}

export interface RtoPlaceOfferResult {
  auctionId: string;
  currentHighestBid: number;
  endTime: string | null;
  bidCounter: number;
  extended: boolean;
  yourOffer: number;
  leading: boolean;
}

export interface RtoMyOffer extends RtoCard {
  myOffer: number;
  myOfferStatus: RtoMyOfferStatus;
  offersPlaced: number;
  lastOfferAt: string;
}

export interface RtoMyContract {
  contractId: string;
  id: string;
  status: RtoContractStatus;
  rejectionReason: string | null;
  submissionNumber: number;
  signedAt: string | null;
  reviewedAt: string | null;
  property: { rtoRef: string; title: string; location: string; coverImage: string | null };
}

export interface RtoPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface RtoListParams {
  search?: string;
  sort?: RtoSort;
  page?: number;
  limit?: number;
}

/**
 * Backend kabhi doc se alag status bhejta hai (unsold offer ke liye "SOLD_FAIL", doc mein "NOT_SOLD").
 * Ek jagah normalize karo taake badge, countdown, polling aur panel sab final state pehchanein.
 */
const STATUS_ALIASES: Record<string, RtoStatus> = { SOLD_FAIL: "NOT_SOLD", NOT_SOLD: "NOT_SOLD", UNSOLD: "NOT_SOLD", FAILED: "NOT_SOLD", COMPLETED: "SOLD" };
export const normalizeRtoStatus = (status?: string | null): RtoStatus => (status ? STATUS_ALIASES[status] || status : "ACTIVE");
const withStatus = <T extends { status?: RtoStatus }>(x: T): T => (x ? { ...x, status: normalizeRtoStatus(x.status) } : x);

const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

async function list(tab: "live" | "upcoming" | "results", params: RtoListParams = {}) {
  const res = await api.get<{ data: RtoCard[]; pagination: RtoPagination }>(`${RTO}/${tab}`, { params: clean(params) });
  return { data: (res.data.data || []).map(withStatus), pagination: res.data.pagination };
}

export const rtoService = {
  // 32-34. Lists (public)
  getLive: (params?: RtoListParams) => list("live", params),
  getUpcoming: (params?: RtoListParams) => list("upcoming", params),
  getResults: (params?: RtoListParams) => list("results", params),

  // 35. Offer page (optional login → myContract / myOffer / can.*)
  async getDetail(id: string): Promise<RtoDetail> {
    const res = await api.get(`${RTO}/${encodeURIComponent(id)}`);
    return withStatus(res.data.data);
  },

  // 36. Offer history (names hidden; "You" for own offers)
  async getOfferHistory(id: string): Promise<RtoOfferHistory> {
    const res = await api.get(`${RTO}/${encodeURIComponent(id)}/offers`);
    return res.data.data;
  },

  // 37. Live price — poll every 3–5s on the offer page
  async getLiveState(id: string): Promise<RtoLiveState> {
    const res = await api.get(`${RTO}/${encodeURIComponent(id)}/live`);
    return withStatus(res.data.data);
  },

  // 38. My contract status + required documents (buyer login)
  async getContract(id: string): Promise<RtoContractInfo> {
    const res = await api.get(`${RTO}/${encodeURIComponent(id)}/contract`);
    return res.data.data;
  },

  // 39. Cloudinary signature for contract documents (folder locked to offer + buyer)
  async getContractUploadSignature(id: string): Promise<RtoUploadSignature> {
    const res = await api.get(`${RTO}/${encodeURIComponent(id)}/contract/upload-signature`);
    return res.data.data;
  },

  // 40. Sign contract → PENDING (CMP reviews)
  async signContract(
    id: string,
    body: { documents: Record<string, RtoUploadedDoc>; emiratesIdExpiry?: string; brokerCardExpiry?: string }
  ): Promise<{ contractId: string; status: RtoContractStatus; submissionNumber: number; signedAt: string }> {
    const res = await api.post(`${RTO}/${encodeURIComponent(id)}/sign-contract`, body);
    return res.data.data;
  },

  // 41. Place an offer (live + APPROVED contract + amount > current price). 409 = someone was faster.
  async placeOffer(id: string, amount: number): Promise<RtoPlaceOfferResult> {
    const res = await api.post(`${RTO}/${encodeURIComponent(id)}/place-offer`, { amount });
    return res.data.data;
  },

  // 42-43. Account
  async getMyOffers(): Promise<RtoMyOffer[]> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/me/offers`);
    return (res.data.data || []).map(withStatus);
  },
  async getMyContracts(): Promise<RtoMyContract[]> {
    const res = await api.get(`${PUBLIC_API_PREFIX}/me/contracts`);
    return res.data.data || [];
  },
};

/**
 * Contract document ko signed Cloudinary upload se bhejta hai (Next ke through nahi —
 * file seedha Cloudinary jati hai). Return: sign-contract body ke liye { url, public_id, fileName }.
 */
export async function uploadRtoDocument(sig: RtoUploadSignature["document"], file: File): Promise<RtoUploadedDoc> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  // PDF bhi allowed hai — "auto" resource type image + raw dono le leta hai
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
  return { url: json.secure_url, public_id: json.public_id, fileName: file.name };
}

/** RtoImage (string ya { url }) → URL */
export const imageUrl = (img?: RtoImage | null): string | undefined => (typeof img === "string" ? img : img?.url) || undefined;

/** RTO card → shared PropertyGridCard / PropertyListCard ka item shape */
export function rtoCardToGridItem(card: RtoCard) {
  return {
    ...card,
    _id: card.id,
    bathrooms: card.washrooms,
    currentHighestBid: card.finalPrice ?? card.currentPrice,
    startPrice: card.startPrice,
  };
}

/** Axios error se backend ka message (`{ status: "error", message }`) */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || fallback;
}
