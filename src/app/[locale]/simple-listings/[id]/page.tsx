import { redirect } from "next/navigation";

// Purani "simple listing" (legacy /public/simple-property-details) hata di gayi.
// Saari listings ab CMP Connect pe hain: /listings/[ref] (na mile to wahan "no longer available").
export default async function LegacySimpleListingRedirect(props: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await props.params;
  redirect(`/${locale}/listings/${encodeURIComponent(id)}`);
}
