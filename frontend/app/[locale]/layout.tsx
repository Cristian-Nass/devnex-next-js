import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NavigationBar } from "@/components/ui/navbar/NavigationBar";
import { AuthStateSync } from "@/components/auth/auth-state-sync";

type Props = {
  children: React.ReactNode;
  params?: Promise<{ locale: string }> | { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale;

  if (!locale || !hasLocale(routing.locales, locale)) {
    return {};
  }

  const languages = Object.fromEntries(
    routing.locales.map((currentLocale) => [currentLocale, `/${currentLocale}`])
  );

  return {
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale;

  if (!locale || !hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <AuthStateSync />
      <NavigationBar locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
