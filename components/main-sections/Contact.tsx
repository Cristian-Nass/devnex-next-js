import { Ubuntu } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function Contact() {
  const t = await getTranslations("HomePage");

  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl min-h-screen snap-start scroll-mt-24 px-6 py-16 flex items-center"
      aria-labelledby="contact-heading"
    >
      <div>
      <h2 id="contact-heading" className={cn("text-3xl font-bold text-gray-900", ubuntu.className)}>
        {t("contactHeading")}
      </h2>
      <p className={cn("mt-4 text-lg text-gray-700 max-w-3xl", ubuntu.className)}>{t("contactDescription")}</p>
      <address className={cn("mt-6 not-italic text-gray-700", ubuntu.className)}>{t("contactEmail")}</address>
      </div>
    </section>
  );
}
