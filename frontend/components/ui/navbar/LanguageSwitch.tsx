"use client";

import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { Ubuntu } from "next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type LanguageSwitchProps = {
  locale: string;
};

export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  const pathname = usePathname();
  const nextLocale = locale === "en" ? "sv" : "en";

  return (
    <div className="hidden md:block">
      <Link
        href={pathname}
        locale={nextLocale}
        className={cn(
          locale === "en" ? "text-primary" : "text-gray-500",
          "hover:text-primary rounded-full bg-gray-200 px-2 py-2 font-medium text-black",
          ubuntu.className,
        )}
      >
        {locale === "en" ? "Sv" : "En"}
      </Link>
    </div>
  );
}
