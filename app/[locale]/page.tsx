import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <main className="w-full max-w-4xl rounded-2xl border border-black/10 bg-white p-10 shadow-sm dark:border-white/20 dark:bg-black">
        <p className="mb-2 text-sm opacity-70">{t("currentLocale", { locale })}</p>
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-base opacity-80">{t("description")}</p>
        <div className="mt-6 flex items-center gap-2">
          <span className="text-sm opacity-70">{t("switchLabel")}:</span>
          {["en", "sv"].map((lang) => {
            const isActive = lang === locale;

            return (
              <Link
                key={lang}
                href={`/${lang}`}
                className={`rounded-md px-3 py-1 text-sm transition ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-black/20 hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
                }`}
              >
                {lang.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
