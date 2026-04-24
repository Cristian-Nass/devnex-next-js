import Link from "next/link"
import { LanguageSwitch } from "./LanguageSwitch";
import { Ubuntu } from 'next/font/google'
import { cn } from "@/lib/utils";
import MainMenuBar from "./MainMenuBar";
import { MenuIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type NavigationBarProps = {
  locale: string;
};

export async function NavigationBar({ locale }: NavigationBarProps) {
  const t = await getTranslations("NavigationBar");
  const mobileMenuItems = [
    { id: "home", label: t("home"), href: `/${locale}/home#home` },
    { id: "services", label: t("services"), href: `/${locale}/home#services` },
    { id: "about", label: t("about"), href: `/${locale}/home#about` },
    { id: "contact", label: t("contact"), href: `/${locale}/home#contact` },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/20 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className={cn("text-2xl font-semibold", ubuntu.className)}>
          Devnex
        </Link>

        <div className="flex items-center gap-2 w-full">
          <MainMenuBar locale={locale} className="mx-auto hidden md:block" />
          <LanguageSwitch locale={locale} />
          <details className="ml-auto relative md:hidden">
            <summary
              className="list-none rounded-lg border border-gray-200 bg-white p-2 text-gray-700 cursor-pointer"
              aria-label={t("navLabel")}
            >
              <MenuIcon className="w-6 h-6" />
            </summary>
            <nav
              className="absolute right-0 mt-3 min-w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              aria-label={t("navLabel")}
            >
              {mobileMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100",
                    ubuntu.className
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
