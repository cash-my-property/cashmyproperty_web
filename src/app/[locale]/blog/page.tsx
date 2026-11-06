import type { Metadata } from "next";
import { Suspense } from "react";
import BlogList from "@/components/blog/BlogList";

// CMP Connect GET /blogs (backend 3a443ea)
export const metadata: Metadata = {
  title: "Real Estate Blog — Market Insights & Guides | Cash My Property",
  description: "Dubai and UAE property market updates, area guides and buying tips from the Cash My Property team.",
};

export default function BlogPage() {
  return (
    <Suspense>
      <BlogList />
    </Suspense>
  );
}
