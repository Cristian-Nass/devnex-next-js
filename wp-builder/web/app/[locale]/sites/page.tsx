import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { SitesDashboard } from "@/components/sites/SitesDashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Sites",
};

export default async function SitesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale);

  return <SitesDashboard />;
}
