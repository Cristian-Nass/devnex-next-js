import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { getTranslations } from "next-intl/server";
import OurServices from "@/components/main-sections/OurServices";
import About from "@/components/main-sections/About";
import Contact from "@/components/main-sections/Contact";
import Products from "@/components/main-sections/Products";
import { getSiteUrl } from "@/lib/seo";
import Footer from "@/components/main-sections/Footer";
import HeroSection from "@/components/main-sections/HeroSection";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type HomePageProps = {
  params?: Promise<{ locale: string }> | { locale: string };
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale ?? "en";
  const t = await getTranslations({ locale, namespace: "HomePageSeo" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords"),
    alternates: {
      canonical: `/${locale}/home`,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}/home`,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale ?? "en";
  const t = await getTranslations("HomePage");
  const servicesT = await getTranslations({ locale, namespace: "OurServices" });
  const siteUrl = getSiteUrl();
  const homeUrl = `${siteUrl}/${locale}/home`;
  const localeName = locale === "sv" ? "sv-SE" : "en-US";
  const organizationName = "Devnex";
  const serviceIds = ["mobile", "web", "uiux", "cloud", "database", "api"] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: organizationName,
        url: siteUrl,
        email: t("contactEmail"),
      },
      {
        "@type": "WebSite",
        name: organizationName,
        url: siteUrl,
        inLanguage: localeName,
      },
      {
        "@type": "WebPage",
        name: t("title"),
        description: t("description"),
        url: homeUrl,
        inLanguage: localeName,
        isPartOf: {
          "@type": "WebSite",
          name: organizationName,
          url: siteUrl,
        },
      },
      ...serviceIds.map((id) => ({
        "@type": "Service",
        serviceType: servicesT(`${id}.title`),
        description: servicesT(`${id}.description`),
        provider: {
          "@type": "Organization",
          name: organizationName,
          url: siteUrl,
        },
      })),
    ],
  };

  return (
    <main className="w-full snap-y snap-mandatory" id="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection locale={locale} />
      <OurServices />
      <Products locale={locale} />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
