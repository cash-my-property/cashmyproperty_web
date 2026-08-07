"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-white dark:bg-[#0A101C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
      </div>
    );
  }

  // Prevent flashing the auth forms before redirect finishes
  if (isAuthenticated) return null;

  return <>{children}</>;
}
