import AgencyDetailClient from "@/components/agencies/AgencyDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";
import { Suspense } from "react";

async function getAgencyData(id: string) {
  try {
    const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://testapi.cmpdubai.com')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/auth$/i, '');
    const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

    const res = await fetch(`${API_URL}/cmpConnect/public/agencies/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
    return null;
  } catch (err) {
    console.error("Error fetching agency data on server:", err);
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const agency = await getAgencyData(params.id);

  if (!agency) {
    return {
      title: isAr
        ? "الوكالة غير موجودة | كاش ماي بروبرتي"
        : "Agency Not Found | Cash My Property",
      description: isAr
        ? "ملف الوكالة العقارية غير متوفر."
        : "This agency profile could not be found.",
    };
  }

  const name = agency.name || "Real Estate Agency";
  const ornInfo = agency.orn ? ` (ORN: ${agency.orn})` : "";
  const emirate = agency.emirate || "Dubai";

  const title = isAr
    ? `${name}${ornInfo} - وكالة عقارية معتمدة في ${emirate} | كاش ماي بروبرتي`
    : `${name}${ornInfo} - Verified Real Estate Agency in ${emirate} | Cash My Property`;

  const desc = isAr
    ? `استعرض العقارات المعروضة وفريق الوسطاء المعتمدين لدى ${name}${ornInfo} في ${emirate}، الإمارات العربية المتحدة.`
    : `Explore verified properties, brokers roster, and track record of ${name}${ornInfo} in ${emirate}, UAE.`;

  const siteUrl = "https://cashmyproperty.com";
  const canonicalUrl = `${siteUrl}/${params.locale}/agencies/${encodeURIComponent(params.id)}`;
  const images = agency.logo ? [{ url: agency.logo, width: 600, height: 600, alt: name }] : [];

  return {
    title,
    description: desc.substring(0, 160),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/agencies/${encodeURIComponent(params.id)}`,
        ar: `${siteUrl}/ar/agencies/${encodeURIComponent(params.id)}`,
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
      images: agency.logo ? [agency.logo] : [],
    },
  };
}

export default async function AgencyDetailPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const agency = await getAgencyData(params.id);

  const siteUrl = "https://cashmyproperty.com";
  const agencyUrl = `${siteUrl}/${params.locale}/agencies/${encodeURIComponent(params.id)}`;

  const jsonLdData = agency
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": agency.name,
        "image": agency.logo || undefined,
        "url": agency.website || agencyUrl,
        ...(agency.phone ? { "telephone": agency.phone } : {}),
        ...(agency.email ? { "email": agency.email } : {}),
        "address": {
          "@type": "PostalAddress",
          ...(agency.address ? { "streetAddress": agency.address } : {}),
          "addressLocality": agency.emirate || "Dubai",
          "addressCountry": "AE",
        },
        ...(agency.orn
          ? {
              "identifier": {
                "@type": "PropertyValue",
                "name": "ORN",
                "value": agency.orn,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      <Suspense fallback={null}>
        <AgencyDetailClient
          id={params.id}
          initialData={agency}
          locale={params.locale}
        />
      </Suspense>
    </>
  );
}
