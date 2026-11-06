import { redirect } from "next/navigation";

// Purana legacy contract detail page (/buyer/my-contracts/:id) hata diya gaya. CMP Connect RTO API
// mein single-contract endpoint nahi hai; contract status aur dobara upload offer page pe hota hai.
// next.config.ts redirect bhi yahi karta hai — yeh fallback hai.
export default async function ContractDetailRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/contracts`);
}
