import type { Metadata } from "next";
import BlogArticle from "@/components/blog/BlogArticle";
import JsonLd from "@/components/seo/JsonLd";
import { API_URL, PUBLIC_API_PREFIX } from "@/lib/api";
import type { PublicBlogDetail } from "@/services/connectPublicService";

// CMP Connect GET /blogs/:slug (backend 3a443ea) — server pe fetch (SEO metadata + JSON-LD)
async function getBlog(slug: string): Promise<PublicBlogDetail | null> {
  try {
    const res = await fetch(`${API_URL}${PUBLIC_API_PREFIX}/blogs/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.error("Error fetching blog post on server:", err);
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const blog = await getBlog(id);
  if (!blog) return { title: "Article not found | Cash My Property", robots: { index: false, follow: true } };
  const title = blog.seo?.metaTitle || `${blog.title} | Cash My Property`;
  const description = (blog.seo?.metaDescription || blog.excerpt || "").slice(0, 160);
  return {
    title,
    description,
    keywords: blog.seo?.keywords,
    openGraph: { type: "article", title, description, publishedTime: blog.publishedAt, images: blog.coverImage ? [{ url: blog.coverImage }] : [] },
    twitter: { card: "summary_large_image", title, description, images: blog.coverImage ? [blog.coverImage] : [] },
  };
}

export default async function BlogDetailPage(props: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await props.params;
  const blog = await getBlog(id);
  return (
    <>
      {blog && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            description: blog.excerpt || undefined,
            image: blog.coverImage || undefined,
            datePublished: blog.publishedAt,
            author: blog.author ? { "@type": "Person", name: blog.author } : { "@type": "Organization", name: "Cash My Property" },
            publisher: { "@type": "Organization", name: "Cash My Property" },
          }}
        />
      )}
      <BlogArticle blog={blog} />
    </>
  );
}
