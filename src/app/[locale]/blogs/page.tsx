import { redirect } from "next/navigation";

export default async function BlogsRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/blog`);
}
