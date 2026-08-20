import AuctionDetailClient from "@/components/listings/AuctionDetailClient";
import { Metadata } from "next";

async function getPropertyData(id: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/auth', '') || 'https://testapi.cmpdubai.com/api';
    const res = await fetch(`${API_URL}/public/property-details/${id}`, {
      next: { revalidate: 60 } // cache for 60 seconds
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Error fetching property data on server:", err);
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const propertyInfo = await getPropertyData(params.id);
  if (!propertyInfo) {
    return {
      title: "Auction Not Found | Cash My Property",
      description: "This auction property could not be found."
    };
  }

  const details = propertyInfo.propertyDetails || {};
  const title = details.propertyTitle || "Untitled Property";
  const desc = details.propertyDescription || "Explore live offers and digital real estate auctions on Cash My Property UAE.";
  const images = details.propertyImages?.length > 0 ? details.propertyImages.map((i: any) => i.url) : [];

  return {
    title: `${title} | Cash My Property`,
    description: desc.substring(0, 160),
    openGraph: {
      title: `${title} | Cash My Property`,
      description: desc.substring(0, 160),
      images: images.length > 0 ? [{ url: images[0] }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Cash My Property`,
      description: desc.substring(0, 160),
      images: images.length > 0 ? [images[0]] : []
    }
  };
}

export default async function AuctionDetailPage(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;
  const initialData = await getPropertyData(params.id);

  return (
    <AuctionDetailClient
      id={params.id}
      initialData={initialData}
      locale={params.locale}
    />
  );
}
