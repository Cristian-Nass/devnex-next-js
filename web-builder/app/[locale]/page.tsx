import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * The locale root currently just hops the user into the builder. When we
 * port the dashboard pages it will render the sites list directly.
 */
export default async function LocaleHome({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/builder`);
}
