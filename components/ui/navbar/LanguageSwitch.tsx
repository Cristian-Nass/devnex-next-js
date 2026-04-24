import { cn } from "@/lib/utils";
import Link from "next/link";
import { Ubuntu } from 'next/font/google'
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})
type LanguageSwitchProps = {
  locale: string;
};

export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  return (
    <div className="hidden md:block">
      <Link href={`/${locale === "en" ? "sv" : "en"}`} className={cn(locale === "en" ? "text-primary" : "text-gray-500", "hover:text-primary bg-gray-200 text-black px-2 py-2 rounded-full font-medium", ubuntu.className)}>
      {locale === "en" ? "Sv" : "En"}
    </Link>
    </div>
  );
}