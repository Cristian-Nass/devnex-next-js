import { Ubuntu } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function About() {
  const t = await getTranslations("HomePage");

  return (
    <section
      id="about"
      className="mx-auto w-full max-w-6xl min-h-screen snap-start scroll-mt-24 px-6 py-16 flex items-center"
      aria-labelledby="about-heading"
    >
      <div>
        <h2 id="about-heading" className={cn("text-3xl font-bold text-gray-900", ubuntu.className)}>
          {t("aboutHeading")}
        </h2>
        <p className={cn("mt-4 text-lg text-gray-700 max-w-3xl", ubuntu.className)}>
          {t("aboutDescription")}
        </p>

        <div className="mt-8 max-w-4xl rounded-xl border border-gray-200 bg-white p-6 md:p-8">
          <h3 className={cn("text-2xl font-bold text-gray-900", ubuntu.className)}>
            {t("aboutGoalHeading")}
          </h3>
          <p className={cn("mt-3 text-base md:text-lg text-gray-700", ubuntu.className)}>
            {t("aboutGoalIntro")}
          </p>
          <ul className="mt-4 space-y-3">
            <li className={cn("flex items-start text-base md:text-lg text-gray-700", ubuntu.className)}>
              <span className="mr-2 h-2 w-2 rounded-full bg-cyan-700" style={{ marginTop: "10px" }} aria-hidden="true" />
              <span>{t("aboutGoalPoint1")}</span>
            </li>
            <li className={cn("flex items-start text-base md:text-lg text-gray-700", ubuntu.className)}>
              <span className="mr-2 h-2 w-2 rounded-full bg-cyan-700" style={{ marginTop: "10px" }} aria-hidden="true" />
              <span>{t("aboutGoalPoint2")}</span>
            </li>
            <li className={cn("flex items-start text-base md:text-lg text-gray-700", ubuntu.className)}>
              <span className="mr-2 h-2 w-2 rounded-full bg-cyan-700" style={{ marginTop: "10px" }} aria-hidden="true" />
              <span>{t("aboutGoalPoint3")}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
