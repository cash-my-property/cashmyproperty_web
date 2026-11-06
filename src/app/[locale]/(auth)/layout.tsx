"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { getSafeNextPath } from "@/lib/authHint";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { locale } = useDictionary();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // ?next= (proxy/session-expiry redirect se) ho to wahin wapas, warna home
      router.replace(getSafeNextPath(locale));
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-white dark:bg-[#091711]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
      </div>
    );
  }

  // Prevent flashing the auth forms before redirect finishes
  if (isAuthenticated) return null;

  return <>{children}</>;
}
