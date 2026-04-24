import Link from "next/link"

type NavigationBarProps = {
  locale: string;
};

export function NavigationBar({ locale }: NavigationBarProps) {
  const languages = ["en", "sv"];

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/20 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="text-base font-semibold">
          Devnex
        </Link>

        <nav className="flex items-center gap-2">
          {languages.map((lang) => {
            const isActive = lang === locale;

            return (
              <Link
                key={lang}
                href={`/${lang}`}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    : "border border-black/20 hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
                }`}
              >
                {lang.toUpperCase()}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
