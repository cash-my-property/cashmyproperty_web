import DeveloperDetailClient from "@/components/developers/DeveloperDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";
import { Suspense } from "react";

async function getDeveloperData(id: string) {
  try {
    const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://testapi.cmpdubai.com')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/auth$/i, '');
    const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

    const res = await fetch(`${API_URL}/cmpConnect/public/developers/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
    return null;
  } catch (err) {
    console.error("Error fetching developer data on server:", err);
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const developer = await getDeveloperData(params.id);

  if (!developer) {
    return {
      title: isAr
        ? "المطور غير موجود | كاش ماي بروبرتي"
        : "Developer Not Found | Cash My Property",
      description: isAr
        ? "ملف المطور العقاري غير متوفر."
        : "This property developer could not be found.",
    };
  }

  const name = developer.name || "Property Developer";
  const emirate = developer.emirate || "";

  const title = isAr
    ? `${name} - شركة تطوير عقاري في ${emirate || "الإمارات"} | كاش ماي بروبرتي`
    : `${name} - Master Property Developer in ${emirate || "the UAE"} | Cash My Property`;

  const desc = isAr
    ? `اكتشف المشاريع العقارية الجاهزة وقيد الإنشاء لشركة ${name} في ${emirate ? `${emirate} ودولة الإمارات` : "دولة الإمارات"}.`
    : `Discover master planned ready and off-plan development projects by ${name} in ${emirate ? `${emirate} and the UAE` : "the UAE"}.`;

  const siteUrl = "https://cashmyproperty.com";
  const canonicalUrl = `${siteUrl}/${params.locale}/developers/${encodeURIComponent(params.id)}`;
  const images = developer.logo ? [{ url: developer.logo, width: 600, height: 600, alt: name }] : [];

  return {
    title,
    description: desc.substring(0, 160),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/developers/${encodeURIComponent(params.id)}`,
        ar: `${siteUrl}/ar/developers/${encodeURIComponent(params.id)}`,
      },
    },
    openGraph: {
      title,
      description: desc.substring(0, 160),
      url: canonicalUrl,
      siteName: "Cash My Property",
      locale: isAr ? "ar_AE" : "en_US",
      type: "profile",
      images,
    },
    twitter: {
      card: "summary",
      title,
      description: desc.substring(0, 160),
      images: developer.logo ? [developer.logo] : [],
    },
  };
}

export default async function DeveloperDetailPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const developer = await getDeveloperData(params.id);

  const siteUrl = "https://cashmyproperty.com";
  const developerUrl = `${siteUrl}/${params.locale}/developers/${encodeURIComponent(params.id)}`;

  const jsonLdData = developer
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": developer.name,
        "image": developer.logo || undefined,
        "url": developer.website || developerUrl,
        ...(developer.phone ? { "telephone": developer.phone } : {}),
        ...(developer.email ? { "email": developer.email } : {}),
        "address": {
          "@type": "PostalAddress",
          ...(developer.address ? { "streetAddress": developer.address } : {}),
          "addressLocality": developer.emirate || undefined,
          "addressCountry": "AE",
        },
        "knowsAbout": "Real Estate Development",
      }
    : null;

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      <Suspense fallback={null}>
        <DeveloperDetailClient
          id={params.id}
          initialData={developer}
          locale={params.locale}
        />
      </Suspense>
    </>
  );
}
