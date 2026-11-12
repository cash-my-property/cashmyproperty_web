import PropertyDetailClient from "@/components/listings/PropertyDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";
import { Suspense } from "react";
import { API_URL, PUBLIC_API_PREFIX } from "@/lib/api";

// Backend images [{ url }] bhejta hai (pehle string[] tha)
type ImageLike = string | { url?: string };

// CMP Connect Public Listings API (GET /listings/:ref). Purana /public/property-details fallback hata diya.
async function getPropertyData(id: string) {
  try {
    const res = await fetch(`${API_URL}${PUBLIC_API_PREFIX}/listings/${encodeURIComponent(id)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Error fetching property data on server:", err);
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const propertyInfo = await getPropertyData(params.id);

  if (!propertyInfo) {
    return {
      title: isAr
        ? "العقار غير متاح | كاش ماي بروبرتي"
        : "Property Not Available | Cash My Property",
      description: isAr
        ? "هذا العقار لم يعد متاحاً."
        : "This property is no longer available.",
    };
  }

  const title = isAr
    ? propertyInfo.titleAr || propertyInfo.title || "تفاصيل العقار"
    : propertyInfo.title || propertyInfo.propertyDetails?.propertyTitle || "Property Details";

  const rawDesc = isAr
    ? propertyInfo.descriptionAr || propertyInfo.description || "استكشف العقارات المعتمدة في دولة الإمارات العربية المتحدة."
    : propertyInfo.description || propertyInfo.propertyDetails?.propertyDescription || "Explore verified real estate properties in UAE.";
  const desc = rawDesc.substring(0, 160);

  const images =
    propertyInfo.images?.length > 0
      ? propertyInfo.images.map((i: ImageLike) => (typeof i === "string" ? i : i?.url)).filter(Boolean)
      : propertyInfo.propertyDetails?.propertyImages?.map((i: ImageLike) =>
          typeof i === "string" ? i : i.url
        ) || (propertyInfo.coverImage ? [propertyInfo.coverImage] : []);

  const price =
    propertyInfo.price ||
    propertyInfo.propertyPrice?.amount ||
    propertyInfo.propertyPrice ||
    0;
  const currency = propertyInfo.currency || propertyInfo.propertyPrice?.currency || "AED";

  const siteUrl = "https://cashmyproperty.com";
  const canonicalUrl = `${siteUrl}/${params.locale}/listings/${encodeURIComponent(params.id)}`;

  return {
    title: isAr ? `${title} | كاش ماي بروبرتي` : `${title} | Cash My Property`,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/listings/${encodeURIComponent(params.id)}`,
        ar: `${siteUrl}/ar/listings/${encodeURIComponent(params.id)}`,
      },
    },
    openGraph: {
      title: `${title} | Cash My Property`,
      description: desc,
      url: canonicalUrl,
      siteName: "Cash My Property",
      locale: isAr ? "ar_AE" : "en_US",
      type: "article",
      images: images.length > 0 ? [{ url: images[0], width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Cash My Property`,
      description: desc,
      images: images.length > 0 ? [images[0]] : [],
    },
    other: {
      "price": String(price),
      "priceCurrency": currency,
    },
  };
}

export default async function PropertyDetailPage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const params = await props.params;
  const initialData = await getPropertyData(params.id);

  const isAr = params.locale === "ar";
  const title = isAr
    ? initialData?.titleAr || initialData?.title || "Property"
    : initialData?.title || initialData?.propertyDetails?.propertyTitle || "Property";
  const desc = isAr
    ? initialData?.descriptionAr || initialData?.description || "Real estate property in UAE"
    : initialData?.description || initialData?.propertyDetails?.propertyDescription || "Real estate property in UAE";

  const images =
    initialData?.images?.length > 0
      ? initialData.images.map((i: ImageLike) => (typeof i === "string" ? i : i?.url)).filter(Boolean)
      : initialData?.propertyDetails?.propertyImages?.map((i: ImageLike) =>
          typeof i === "string" ? i : i.url
        ) || (initialData?.coverImage ? [initialData.coverImage] : []);

  const price =
    initialData?.price ||
    initialData?.propertyPrice?.amount ||
    initialData?.propertyPrice ||
    0;
  const currency = initialData?.currency || initialData?.propertyPrice?.currency || "AED";
  const purpose = initialData?.purpose || initialData?.listingPurpose || "SALE";

  const jsonLdData = initialData
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": title,
        "description": desc,
        "url": `https://cashmyproperty.com/${params.locale}/listings/${encodeURIComponent(params.id)}`,
        "image": images,
        "datePosted": initialData.publishedAt || initialData.createdAt,
        "offers": {
          "@type": "Offer",
          "price": price,
          "priceCurrency": currency,
          "availability": "https://schema.org/InStock",
          "businessFunction": purpose === "RENT" ? "https://schema.org/LeaseOut" : "https://schema.org/Sell",
        },
        "category": initialData.category || initialData.propertyCategory,
        "propertyType": initialData.typeLabel || initialData.type || initialData.propertyType,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": initialData.locationParts?.[0] || initialData.location || undefined,
          "addressRegion": initialData.locationParts?.[1] || undefined,
          "addressCountry": "AE",
        },
        ...(initialData.coordinates?.latitude && initialData.coordinates?.longitude
          ? {
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": initialData.coordinates.latitude,
                "longitude": initialData.coordinates.longitude,
              },
            }
          : {}),
        ...(initialData.bedrooms ? { "numberOfBedrooms": Number(initialData.bedrooms) || initialData.bedrooms } : {}),
        ...(initialData.bathrooms ? { "numberOfBathroomsTotal": Number(initialData.bathrooms) || initialData.bathrooms } : {}),
        ...(initialData.area
          ? {
              "floorSize": {
                "@type": "QuantitativeValue",
                "value": initialData.area,
                "unitText": initialData.areaUnit || "sqft",
              },
            }
          : {}),
        ...(initialData.agent
          ? {
              "author": {
                "@type": "Person",
                "name": initialData.agent.name,
                "jobTitle": initialData.agent.position || "Licensed Property Broker",
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      <Suspense fallback={null}>
        <PropertyDetailClient
          id={params.id}
          initialData={initialData}
          locale={params.locale}
        />
      </Suspense>
    </>
  );
}
