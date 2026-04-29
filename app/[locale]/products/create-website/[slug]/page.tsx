import { selectedPlan } from "@/tools/selectedPlan";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import type { Metadata } from "next";
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type CreateWebsitePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CreateWebsitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = selectedPlan(slug);
  const description = Array.isArray(plan.description)
    ? plan.description.join(" ")
    : plan.description;

  return {
    title: `${plan.name} Website Plan | Devnex`,
    description,
    alternates: {
      canonical: `/products/create-website/${slug}`,
    },
  };
}

const CreateWebsitePage = async ({ params }: CreateWebsitePageProps) => {
  const { slug } = await params;

  const plan = selectedPlan(slug);

  return (
    <main className="min-h-screen bg-cyan-800 py-16 md:py-20">
      <article className="container mx-auto px-4 pt-24 text-gray-100 sm:px-6 lg:px-8">
        <header>
          <h1 className={cn("mb-4 text-left text-4xl font-bold", ubuntu.className)}>
            {plan.name} Plan
          </h1>
          <div className={cn("mb-10 space-y-2 text-left text-lg", ubuntu.className)}>
            {Array.isArray(plan.description) ? (
              plan.description.map((sentence, index) => <p key={index}>{sentence}</p>)
            ) : (
              <p>{plan.description}</p>
            )}
          </div>
        </header>

        <section aria-labelledby="plan-features-heading">
          <h2 id="plan-features-heading" className={cn("mb-4 text-2xl font-semibold", ubuntu.className)}>
            Included Features
          </h2>
          <ul className={cn("space-y-2 text-left", ubuntu.className)}>
            {Object.entries(plan.features).map(([key, value]) => (
              <li key={key} className="flex items-start gap-2">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
  
};

export default CreateWebsitePage;