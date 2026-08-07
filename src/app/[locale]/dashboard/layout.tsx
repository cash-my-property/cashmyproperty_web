"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-[#F8F9FA] dark:bg-[#0A101C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
      </div>
    );
  }

  if (!isAuthenticated) return null; // prevent flashing content before redirect

  return (
    <div className="flex w-full min-h-screen bg-[#F8F9FA] dark:bg-[#0A101C]">
      {/* Sidebar - fixed on desktop */}
      <div className="hidden lg:block fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col lg:ltr:pl-64 lg:rtl:pr-64">
        <DashboardHeader />
        
        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
