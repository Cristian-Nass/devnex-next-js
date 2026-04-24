import type { Metadata } from "next";
import Link from "next/link";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import OurServices from "@/components/main-sections/OurServices";

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

  return (
    <main className="w-full" id="home">
      <section
        className="w-full max-w-[1440px] p-10 mx-auto min-h-[calc(100vh-0px)] flex items-center justify-center"
        aria-labelledby="hero-heading"
      >
        <div className="flex flex-col items-center justify-center mb-32 gap-4 text-center">
          <h1
            id="hero-heading"
            className={cn(
              "text-6xl font-bold text-center text-white sm:text-6xl text-4xl",
              "stroke-black",
              "stroke-1",
              ubuntu.className
            )}
            style={{
              WebkitTextStroke: "1px #000",
              color: "#ededed",
            }}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "text-3xl text-center sm:text-3xl text-base font-medium text-gray-500",
              ubuntu.className
            )}
          >
            {t("description")}
          </p>
          <div className="flex items-center gap-8 sm:flex-row flex-col">
            <Button
              variant="outline"
              className={cn(
                "text-lg text-center py-6 mt-8 w-56 cursor-pointer",
                ubuntu.className
              )}
              size="lg"
              asChild
            >
              <Link href={`/${locale}#contact`}>{t("getStarted")}</Link>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "text-lg text-center py-6 mt-8 w-56 cursor-pointer",
                ubuntu.className
              )}
              size="lg"
              asChild
            >
              <Link href={`/${locale}#services`}>{t("exploreOurServices")}</Link>
            </Button>
          </div>
        </div>
      </section>
      <OurServices />
      <section id="about" className="mx-auto w-full max-w-6xl px-6 py-16" aria-labelledby="about-heading">
        <h2 id="about-heading" className={cn("text-3xl font-bold text-gray-900", ubuntu.className)}>
          {t("aboutHeading")}
        </h2>
        <p className={cn("mt-4 text-lg text-gray-700 max-w-3xl", ubuntu.className)}>{t("aboutDescription")}</p>
      </section>
      <section id="contact" className="mx-auto w-full max-w-6xl px-6 pb-20" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className={cn("text-3xl font-bold text-gray-900", ubuntu.className)}>
          {t("contactHeading")}
        </h2>
        <p className={cn("mt-4 text-lg text-gray-700 max-w-3xl", ubuntu.className)}>{t("contactDescription")}</p>
        <address className={cn("mt-6 not-italic text-gray-700", ubuntu.className)}>{t("contactEmail")}</address>
      </section>
    </main>
  );
}
