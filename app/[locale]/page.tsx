import { getTranslations } from "next-intl/server";

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
      </main>
    </div>
  );
}
