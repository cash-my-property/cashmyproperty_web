import type { Metadata } from "next";
import { Suspense } from "react";
import CompanyDirectory from "@/components/directory/CompanyDirectory";

// CMP Connect GET /agencies (backend 4728f57)
export const metadata: Metadata = {
  title: "Verified Real Estate Agencies in the UAE | Cash My Property",
  description: "Browse CMP-verified agencies across the UAE with their live listings and agents.",
};

export default function AgenciesDirectoryPage() {
  return (
    <Suspense>
      <CompanyDirectory type="AGENCY" />
    </Suspense>
  );
}
