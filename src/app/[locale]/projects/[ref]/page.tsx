import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import ProjectDetailClient from "@/components/projects/ProjectDetailClient";
import { PUBLIC_API_PREFIX } from "@/lib/api";
import type { PublicProjectDetail } from "@/services/connectPublicService";

// New Project page — CMP Connect GET /projects/:ref (server pe, SEO ke liye)
const rawUrl = (process.env.NEXT_PUBLIC_API_URL || "https://testapi.cmpdubai.com").trim().replace(/\/+$/, "").replace(/\/auth$/i, "");
const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

async function getProject(ref: string): Promise<PublicProjectDetail | null> {
  try {
    const res = await fetch(`${API_URL}${PUBLIC_API_PREFIX}/projects/${encodeURIComponent(ref)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Error fetching project on server:", err);
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ locale: string; ref: string }> }): Promise<Metadata> {
  const { locale, ref } = await props.params;
  const isAr = locale === "ar";
  const p = await getProject(ref);
  if (!p) {
    return {
      title: isAr ? "المشروع غير متوفر | كاش ماي بروبرتي" : "Project Not Found | Cash My Property",
      robots: { index: false },
    };
  }
  const place = [p.community, p.emirate].filter(Boolean).join(", ");
  const dev = p.developer?.name ? (isAr ? ` من ${p.developer.name}` : ` by ${p.developer.name}`) : "";
  const title = `${p.name}${place ? ` – ${place}` : ""}${dev} | ${isAr ? "كاش ماي بروبرتي" : "Cash My Property"}`;
  const description = (
    p.description ||
    (isAr
      ? `${p.name}${dev}${place ? ` في ${place}` : ""}.${p.fromPrice ? ` الأسعار تبدأ من ${p.fromPrice.toLocaleString()} درهم.` : ""}`
      : `${p.name}${dev}${place ? ` in ${place}` : ""}.${p.fromPrice ? ` Prices from AED ${p.fromPrice.toLocaleString()}.` : ""}${p.deliveryLabel ? ` Handover ${p.deliveryLabel}.` : ""}`)
  ).slice(0, 160);
  const image = p.coverPhoto || p.photos?.[0]?.url;
  return {
    title,
    description,
    alternates: { languages: { en: `/en/projects/${encodeURIComponent(ref)}`, ar: `/ar/projects/${encodeURIComponent(ref)}` } },
    openGraph: { title, description, type: "website", locale: isAr ? "ar_AE" : "en_US", ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProjectPage(props: { params: Promise<{ locale: string; ref: string }> }) {
  const { locale, ref } = await props.params;
  const p = await getProject(ref);

  const jsonLd = p
    ? {
        "@context": "https://schema.org",
        "@type": "Residence",
        name: p.name,
        description: p.description || undefined,
        image: (p.photos?.map((ph) => ph.url) || (p.coverPhoto ? [p.coverPhoto] : [])).slice(0, 6),
        address: {
          "@type": "PostalAddress",
          addressLocality: p.community || undefined,
          addressRegion: p.emirate || undefined,
          addressCountry: "AE",
        },
        ...(p.geo ? { geo: { "@type": "GeoCoordinates", latitude: p.geo.lat, longitude: p.geo.lng } } : {}),
        ...(p.fromPrice
          ? { offers: { "@type": "AggregateOffer", lowPrice: p.fromPrice, priceCurrency: "AED", availability: p.status === "SOLD_OUT" ? "https://schema.org/SoldOut" : "https://schema.org/InStock" } }
          : {}),
        ...(p.developer?.name ? { brand: { "@type": "Organization", name: p.developer.name } } : {}),
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ProjectDetailClient project={p} locale={locale} />
    </>
  );
}
