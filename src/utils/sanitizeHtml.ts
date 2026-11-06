import DOMPurify from "dompurify";

// CMS/API se aane wale rich-text HTML ko render se pehle saaf karta hai (XSS protection).
// Scripts, event handlers (onerror, onclick...), javascript: URLs, iframes/forms hata deta hai.
// Sirf browser mein chalta hai; server pe (window nahi) empty string return hota hai.
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined" || !dirty) return "";

  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "iframe", "form", "input", "button", "object", "embed"],
  });

  // Naye tab mein khulne wale links ko reverse-tabnabbing se bachao
  const container = document.createElement("div");
  container.innerHTML = clean;
  container.querySelectorAll('a[target="_blank"]').forEach((a) => a.setAttribute("rel", "noopener noreferrer"));
  return container.innerHTML;
}
