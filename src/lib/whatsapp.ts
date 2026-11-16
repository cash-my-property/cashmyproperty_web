/**
 * Listing ke liye WhatsApp message — dostana text + property ka link (listing ID / CLID nahi).
 * Backend ka `whatsappUrl` ("Hi, I am interested in CLID-XXXX (...)") istemal nahi hota; backend sirf number deta hai,
 * aur contact API pehle ki tarah call hoti hai taake agency CRM mein lead save ho.
 */

/** Property page ka poora link — jis site pe user hai (staging / production) usi ka domain */
export function listingPageUrl(locale: string, ref: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/${locale}/listings/${encodeURIComponent(ref)}`;
}

export function listingWhatsAppText({
  agentName,
  title,
  url,
  locale,
}: {
  agentName?: string | null;
  title?: string | null;
  url: string;
  locale: string;
}): string {
  const first = (agentName || "").trim().split(/\s+/)[0];
  const name = first && first.toLowerCase() !== "agent" ? first : "";
  const cleanTitle = (title || "").trim();

  if (locale === "ar") {
    const property = cleanTitle ? `العقار "${cleanTitle}"` : "هذا العقار";
    return `مرحباً${name ? ` ${name}` : ""}،\nأنا مهتم بـ${property} المعروض على Cash My Property. هل ما زال متاحاً؟ أرغب في معرفة المزيد من التفاصيل.\n\n${url}`;
  }
  const property = cleanTitle ? `your property "${cleanTitle}"` : "your property";
  return `Hi${name ? ` ${name}` : ""},\nI'm interested in ${property} on Cash My Property. Is it still available? I'd love to know more details.\n\n${url}`;
}

/** wa.me link; number na ho to null */
export function whatsappLink(number: string | null | undefined, text: string): string | null {
  const digits = (number || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}
