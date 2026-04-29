import { selectedPlan } from "@/tools/selectedPlan";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type CreateWebsitePageProps = {
  params: Promise<{
    slug: string;
  }>;
};


const CreateWebsitePage = async ({ params }: CreateWebsitePageProps) => {
  const { slug } = await params;

  const plan = selectedPlan(slug);

  return (
    <section id="plans" className="min-h-screen snap-start scroll-mt-24 py-16 md:py-20 bg-cyan-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-gray-100">
        <h1 className={cn("text-4xl font-bold text-left mb-4 pt-28", ubuntu.className)}>{plan.name}</h1>
        <p className={cn("text-lg text-left mb-4 pb-12", ubuntu.className)}>{plan.description}</p>
        <ul className={cn("list-none text-left text-gray-100 space-y-1.5 h-full", ubuntu.className)}>
            {Object.entries(plan.features).map(([key, value]) => (
                <li key={key} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />{value}
                </li>
            ))} <br />
        </ul>
        </div>
    </section>
  )
  
};

export default CreateWebsitePage;