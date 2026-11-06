import type { Metadata } from "next";
import { Suspense } from "react";
import CompanyDirectory from "@/components/directory/CompanyDirectory";

// CMP Connect GET /developers (backend 4728f57)
export const metadata: Metadata = {
  title: "Verified Real Estate Developers in the UAE | Cash My Property",
  description: "Browse CMP-verified developers across the UAE with their live listings and agents.",
};

export default function DevelopersDirectoryPage() {
  return (
    <Suspense>
      <CompanyDirectory type="DEVELOPER" />
    </Suspense>
  );
}
