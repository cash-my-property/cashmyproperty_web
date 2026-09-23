import { redirect } from "next/navigation";

export default async function PublicPropertyRedirectPage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await props.params;
  redirect(`/${locale}/auctions/${id}`);
}
