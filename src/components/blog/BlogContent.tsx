"use client";

import { sanitizeHtml } from "@/utils/sanitizeHtml";

// CMS ka HTML DOMPurify se saaf karke (XSS). Sirf browser mein chalta hai — BlogArticle ise
// next/dynamic (ssr: false) se load karta hai, isliye server/client HTML mismatch nahi hota.
export default function BlogContent({ html }: { html: string }) {
  return <div className="blog-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
