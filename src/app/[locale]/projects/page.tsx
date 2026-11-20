import { Suspense } from "react";
import type { Metadata } from "next";
import ProjectsClient from "@/components/projects/ProjectsClient";

// New Projects — CMP Connect GET /projects (developer projects, backend c966a75)
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const title = isAr
    ? "المشاريع الجديدة والعقارات على الخارطة في الإمارات | كاش ماي بروبرتي"
    : "New Projects & Off-Plan Developments in the UAE | Cash My Property";
  const description = isAr
    ? "استكشف المشاريع الجديدة والعقارات على الخارطة من مطوّرين مسجّلين: أسعار الإطلاق، خطط الدفع، ومواعيد التسليم."
    : "Explore new launches and off-plan projects from DLD-registered developers: launch prices, payment plans and handover dates.";
  return {
    title,
    description,
    alternates: { languages: { en: "/en/projects", ar: "/ar/projects" } },
    openGraph: { title, description, type: "website", locale: isAr ? "ar_AE" : "en_US" },
  };
}

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsClient />
    </Suspense>
  );
}
