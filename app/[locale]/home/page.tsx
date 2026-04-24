import { Ubuntu } from 'next/font/google'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button';
import OurServices from '@/components/main-sections/OurServices';
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})
export default async function HomePage() {
  const t = await getTranslations("HomePage");
  return (
    <div className="w-full">
      <main className="w-full max-w-[1440px] p-10 mx-auto min-h-[calc(100vh-0px)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center mb-32 gap-4">
          <h1
            className={cn(
              "text-6xl font-bold text-center text-white sm:text-6xl text-4xl",
              "stroke-black",
              "stroke-1",
              ubuntu.className
            )}
            style={{
              WebkitTextStroke: "1px #000",
              color: "#ededed", // Tailwind gray-300
            }}
          >
            {t("title")}
          </h1>
          <p className={cn("text-3xl text-center sm:text-3xl text-base font-medium text-gray-500", ubuntu.className)}>{t("description")}</p>
          <div className="flex items-center gap-8 sm:flex-row flex-col"> 

          <Button variant="outline" className={cn("text-lg text-center py-6 mt-8 w-56 cursor-pointer", ubuntu.className)} size="lg">
            {t("getStarted")}
          </Button>
          <Button variant="outline" className={cn("text-lg text-center py-6 mt-8 w-56 cursor-pointer", ubuntu.className)} size="lg">
            {t("exploreOurServices")}
          </Button>
          </div>
        </div>
      </main>
      <OurServices />
    </div>
  );
}
