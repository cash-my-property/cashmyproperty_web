import AgentProfileClient from "@/components/agents/AgentProfileClient";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";
import { Suspense } from "react";

async function getAgentData(id: string) {
  try {
    const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://testapi.cmpdubai.com')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/auth$/i, '');
    const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

    const res = await fetch(`${API_URL}/cmpConnect/public/agents/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
    return null;
  } catch (err) {
    console.error("Error fetching agent data on server:", err);
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const agent = await getAgentData(params.id);

  if (!agent) {
    return {
      title: isAr
        ? "الوسيط غير موجود | كاش ماي بروبرتي"
        : "Agent Not Found | Cash My Property",
      description: isAr
        ? "ملف الوسيط العقاري غير متوفر."
        : "This agent profile could not be found.",
    };
  }

  const name = agent.name || "Real Estate Broker";
  const companyName = agent.company?.name ? ` at ${agent.company.name}` : "";
  const companyNameAr = agent.company?.name ? ` في ${agent.company.name}` : "";
  const brnInfo = agent.brn ? ` (BRN: ${agent.brn})` : "";

  const title = isAr
    ? `${name}${companyNameAr} - وسيط عقاري معتمد | كاش ماي بروبرتي`
    : `${name}${companyName} - Verified Real Estate Broker | Cash My Property`;

  const rawDesc = isAr
    ? `${name} وسيط عقاري مرخص وموثق${companyNameAr} في دبي والإمارات${brnInfo}. استعرض العقارات المعروضة وسجل الصفقات المنجزة.`
    : `${name} is a licensed and verified real estate broker${companyName} in Dubai & UAE${brnInfo}. View active property listings and confirmed track record.`;
  const desc = (agent.about || rawDesc).substring(0, 160);

  const siteUrl = "https://cashmyproperty.com";
  const canonicalUrl = `${siteUrl}/${params.locale}/agents/${encodeURIComponent(params.id)}`;
  const images = agent.photo ? [{ url: agent.photo, width: 600, height: 600, alt: name }] : [];

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/agents/${encodeURIComponent(params.id)}`,
        ar: `${siteUrl}/ar/agents/${encodeURIComponent(params.id)}`,
      },
    },
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName: "Cash My Property",
      locale: isAr ? "ar_AE" : "en_US",
      type: "profile",
      images,
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
      images: agent.photo ? [agent.photo] : [],
    },
  };
}

export default async function AgentProfilePage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const agent = await getAgentData(params.id);

  const siteUrl = "https://cashmyproperty.com";
  const agentUrl = `${siteUrl}/${params.locale}/agents/${encodeURIComponent(params.id)}`;

  const jsonLdData = agent
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": agent.name,
        "image": agent.photo || undefined,
        "description": agent.about || `${agent.name} is a licensed property broker in UAE.`,
        "url": agentUrl,
        "jobTitle": agent.position || "Licensed Property Broker",
        ...(agent.company
          ? {
              "worksFor": {
                "@type": "Organization",
                "name": agent.company.name,
                "logo": agent.company.logo || undefined,
              },
            }
          : {}),
        ...(agent.brn
          ? {
              "identifier": {
                "@type": "PropertyValue",
                "name": "BRN",
                "value": agent.brn,
              },
            }
          : {}),
        ...(agent.languages && agent.languages.length > 0
          ? { "knowsLanguage": agent.languages }
          : {}),
        ...(agent.nationality ? { "nationality": agent.nationality } : {}),
      }
    : null;

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      <Suspense fallback={null}>
        <AgentProfileClient
          id={params.id}
          initialData={agent}
          locale={params.locale}
        />
      </Suspense>
    </>
  );
}
