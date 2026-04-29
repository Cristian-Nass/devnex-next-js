import { selectedPlan } from "@/tools/selectedPlan";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type CreateWebsitePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CreateWebsitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = selectedPlan(slug);
  const t = await getTranslations("CreateWebsiteDetails");
  const description = plan.descriptionKeys.map((key) => t(key)).join(" ");
  const planName = t(plan.nameKey);

  return {
    title: t("metaTitle", { plan: planName }),
    description,
    alternates: {
      canonical: `/products/create-website/${slug}`,
    },
  };
}

const CreateWebsitePage = async ({ params }: CreateWebsitePageProps) => {
  const { slug } = await params;
  const t = await getTranslations("CreateWebsiteDetails");
  const plan = selectedPlan(slug);
  const planName = t(plan.nameKey);

  return (
    <main className="min-h-screen bg-cyan-800 py-16 md:py-20">
      <article className="container mx-auto px-4 pt-24 text-gray-100 sm:px-6 lg:px-8">
        <header>
          <h1 className={cn("mb-4 text-left text-4xl font-bold", ubuntu.className)}>
            {t("planTitle", { plan: planName })}
          </h1>
          <div className={cn("mb-10 space-y-2 text-left text-lg", ubuntu.className)}>
            {plan.descriptionKeys.map((key) => (
              <p key={key}>{t(key)}</p>
            ))}
          </div>
        </header>

        <section aria-labelledby="plan-features-heading">
          <h2 id="plan-features-heading" className={cn("mb-4 text-2xl font-semibold", ubuntu.className)}>
            {t("includedFeatures")}
          </h2>
          <ul className={cn("space-y-2 text-left", ubuntu.className)}>
            {plan.featureKeys.map((key) => (
              <li key={key} className="flex items-start gap-2">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
  
};

export default CreateWebsitePage;