"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function SellerDetailRedirectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/agents/${id}`);
  }, [locale, id, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-sm text-gray-500 font-semibold">Redirecting to Agent Profile...</p>
    </div>
  );
}
