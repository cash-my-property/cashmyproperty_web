"use client";

import { useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SellersRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams ? searchParams.toString() : "";
    const target = `/${locale}/agents${q ? `?${q}` : ""}`;
    router.replace(target);
  }, [locale, router, searchParams]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-sm text-gray-500 font-semibold">Redirecting to Find Agents...</p>
    </div>
  );
}
