import Link from "next/link"
import { LanguageSwitch } from "./LanguageSwitch";

type NavigationBarProps = {
  locale: string;
};

export function NavigationBar({ locale }: NavigationBarProps) {

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/20 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="text-base font-semibold">
          Devnex
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageSwitch locale={locale} />
        </nav>
      </div>
    </header>
  );
}
