import { cn } from "@/lib/utils";
import Link from "next/link";

type LanguageSwitchProps = {
  locale: string;
};

export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  return (
    <div>
      <Link href={`/${locale === "en" ? "sv" : "en"}`} className={cn(locale === "en" ? "text-primary" : "text-gray-500", "hover:text-primary")}>
      {locale === "en" ? "Svenska" : "English"}
    </Link>
    </div>
  );
}