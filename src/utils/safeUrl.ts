/**
 * API / CRM se aaya external link (website, tour, floor plan, video) — sirf http(s) chalega.
 * `javascript:`, `data:`, `vbscript:` waghera null → link render hi nahi hota (stored XSS se bachao).
 * Scheme ke bina ("example.com") ho to https lagaya jata hai.
 */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
