"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are in the dashboard route
  const isDashboard = pathname.includes("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
