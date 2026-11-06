import type { Metadata } from "next";
import RtoDetailClient from "@/components/rto/RtoDetailClient";
import { API_URL, PUBLIC_API_PREFIX } from "@/lib/api";
import { imageUrl, normalizeRtoStatus, type RtoDetail } from "@/services/rtoService";

// Real Time Offer page — CMP Connect public RTO API (GET /real-time-offers/:id).
// Server pe guest view (SEO + pehla render); login wala data (myContract / can.*) client lata hai,
// aur price / countdown client `/live` polling se taaza rehta hai.
async function getOffer(id: string): Promise<RtoDetail | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  try {
    const res = await fetch(`${API_URL}${PUBLIC_API_PREFIX}/real-time-offers/${id}`, { next: { revalidate: 15 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ? { ...json.data, status: normalizeRtoStatus(json.data.status) } : null;
  } catch (err) {
    console.error("Error fetching Real Time Offer on server:", err);
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const offer = await getOffer(id);
  if (!offer) {
    return { title: "Offer Not Found | Cash My Property", description: "This Real Time Offer is no longer available." };
  }
  const title = `${offer.title} | Real Time Offer | Cash My Property`;
  const description = (offer.description || `Real Time Offer in ${offer.location}. Starting at AED ${offer.startPrice.toLocaleString()}.`).slice(0, 160);
  const image = imageUrl(offer.images?.[0]) || offer.coverImage;
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [{ url: image }] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default async function AuctionDetailPage(props: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await props.params;
  const initialData = await getOffer(id);
  return <RtoDetailClient id={id} initialData={initialData} locale={locale} />;
}
