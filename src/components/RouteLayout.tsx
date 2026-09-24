"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import dynamic from "next/dynamic";

const FloatingGuideWidget = dynamic(() => import("@/components/guide/FloatingGuideWidget"), {
  ssr: false,
});

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are in the dashboard route
  const isDashboard = pathname.includes("/dashboard");

  if (isDashboard) {
    return (
      <>
        {children}
        <FloatingGuideWidget />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      {children}
      <Footer />
      <FloatingGuideWidget />
    </>
  );
}
