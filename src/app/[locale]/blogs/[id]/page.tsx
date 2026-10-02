import { redirect } from "next/navigation";

export default async function BlogsSlugRedirectPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { locale, id } = await params;
  redirect(`/${locale}/blog/${id}`);
}
