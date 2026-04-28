import type { Metadata } from "next";
import Link from "next/link";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import OurServices from "@/components/main-sections/OurServices";
import About from "@/components/main-sections/About";
import Contact from "@/components/main-sections/Contact";
import Products from "@/components/main-sections/Products";
import { getSiteUrl } from "@/lib/seo";
import Footer from "@/components/main-sections/Footer";

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
      <section
        className="w-full max-w-[1440px] p-10 mx-auto min-h-screen snap-start scroll-mt-24 flex items-center justify-center"
        aria-labelledby="hero-heading"
      >
      {/* <section
        className="w-full max-w-[1440px] p-10 mx-auto min-h-screen snap-start scroll-mt-24 flex items-center justify-center bg-gradient-to-b from-white to-gray-50"
        aria-labelledby="hero-heading"
      > */}

        <div className="flex flex-col items-center justify-center mb-32 gap-4 text-center">
          <h1
            id="hero-heading"
            className={cn(
              "text-4xl sm:text-6xl font-bold text-center text-gray-900 tracking-tight main-title-animation",
              ubuntu.className
            )}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "text-lg sm:text-2xl text-center font-medium text-gray-500 max-w-3xl pt-4 subtitle-animation",
              ubuntu.className
            )}
          >
            {t("description")}
            <br />
            {t("descriptionTwo")}
          </p>
          <div className="flex items-center gap-8 sm:flex-row flex-col">
            <Button
              variant="default"
              className={cn(
                "text-lg text-center py-6 mt-8 w-56 cursor-pointer left-button-animation",
                ubuntu.className
              )}
              size="lg"
              asChild
            >
              <Link href={`/${locale}/home#contact`}>{t("getStarted")}</Link>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "text-lg text-center py-6 mt-8 w-56 cursor-pointer right-button-animation",
                ubuntu.className
              )}
              size="lg"
              asChild
            >
              <Link href={`/${locale}/home#services`}>{t("exploreOurServices")}</Link>
            </Button>
          </div>
          <p className={cn("mt-2 text-sm sm:text-base text-gray-600 trust-line-animation", ubuntu.className)}>
            {t("trustLine")}
          </p>
        </div>
      </section>
      <OurServices />
      <Products locale={locale} />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
