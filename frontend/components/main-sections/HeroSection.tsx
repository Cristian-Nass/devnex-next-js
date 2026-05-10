import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { Ubuntu } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
type HeroSectionProps = {
  locale: string;
};

export default async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations("HomePage");
  return (
    <section
      className="relative isolate w-full min-h-screen snap-start scroll-mt-24"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[url('/background-svg.svg')] bg-cover bg-right-bottom bg-no-repeat"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] p-10">
        <div className="absolute right-1/10 top-1/2 h-auto w-1/3 -translate-y-1/2 flex justify-end pointer-events-none opacity-0 transition-opacity duration-1000 sm:opacity-20 md:opacity-50 lg:opacity-100">
          <Image
            src="/hero-img.png"
            alt="Hero Image"
            width={700}
            height={700}
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <div className="mb-32 flex flex-col items-center justify-center gap-4 text-center">
          <h1
            id="hero-heading"
            className={cn(
              "text-3xl sm:text-6xl font-bold text-gray-900 tracking-tight main-title-animation",
              ubuntu.className,
            )}
          >
            {t("title")} <br /> <span className="text-primary">{t("titleTwo")}</span>
          </h1>
          <p
            className={cn(
              "text-lg sm:text-2xl text-left lg:text-center font-medium text-gray-500 max-w-3xl pt-4 subtitle-animation ",
              ubuntu.className,
            )}
          >
            {t("description")}
            <br />
            {t("descriptionTwo")}
          </p>
          <div className="flex items-center gap-2 sm:gap-8 sm:flex-row flex-col">
            <Button
              variant="default"
              className={cn(
                "text-lg text-center py-6 mt-8 w-56 cursor-pointer left-button-animation",
                ubuntu.className,
              )}
              size="lg"
              asChild
            >
              <Link href={`/${locale}/home#contact`}>{t("getStarted")}</Link>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "text-lg text-center py-6 mt-0 sm:mt-8 w-56 cursor-pointer right-button-animation",
                ubuntu.className,
              )}
              size="lg"
              asChild
            >
              <Link href={`/${locale}/home#services`}>
                {t("exploreOurServices")}
              </Link>
            </Button>
          </div>
          <p
            className={cn(
              "mt-2 text-sm sm:text-base text-gray-600 trust-line-animation",
              ubuntu.className,
            )}
          >
            {t("trustLine")}
          </p>
        </div>
      </div>
      <div className={cn(
        "absolute sm:bottom-40 bottom-30 sm:left-1/2 sm:transform sm:-translate-x-1/2 text-2xl lg:text-4xl font-bold text-gray-700 text-center",
        ubuntu.className
      )}>
        AI-Powered Development by Experienced Developers
      </div>
 
    </section>
  );
}
