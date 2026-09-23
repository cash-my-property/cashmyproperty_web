import { redirect } from "next/navigation";

export default async function PublicSimplePropertyRedirectPage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await props.params;
  redirect(`/${locale}/simple-listings/${id}`);
}
