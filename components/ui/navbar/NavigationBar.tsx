import Link from "next/link"
import { LanguageSwitch } from "./LanguageSwitch";
import { Ubuntu } from 'next/font/google'
import { cn } from "@/lib/utils";
import MainMenuBar from "./MainMenuBar";
import { MenuIcon } from "lucide-react";

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type NavigationBarProps = {
  locale: string;
};

export function NavigationBar({ locale }: NavigationBarProps) {

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/20 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className={cn("text-2xl font-semibold", ubuntu.className)}>
          Devnex
        </Link>

        <div className="flex items-center gap-2 w-full">
          <MainMenuBar locale={locale} className="mx-auto hidden md:block" />
          <LanguageSwitch locale={locale} />
          <div className="ml-auto flex items-center md:hidden">
            <MenuIcon className="w-6 h-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
}
