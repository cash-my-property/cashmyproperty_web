import type { Metadata } from "next";
import PlatformGuideClient from "@/components/guide/PlatformGuideClient";

export const metadata: Metadata = {
  title: "How to Use Cash My Property - Official Platform Guide",
  description: "Comprehensive step-by-step master guide to buying, selling, live auctions, digital contract signing, and role permissions on Cash My Property UAE.",
};

export default function GuidePage() {
  return <PlatformGuideClient />;
}
