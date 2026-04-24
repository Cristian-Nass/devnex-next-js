import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

type NavigationBarProps = {
  locale: string;
};

export function NavigationBar({ locale }: NavigationBarProps) {
  const languages = ["en", "sv"];

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/20 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href={`/${locale}`} className="text-base font-semibold">
                  Devnex
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {languages.map((lang) => {
              const isActive = lang === locale;

              return (
                <NavigationMenuItem key={lang}>
                  <NavigationMenuLink
                    asChild
                    className={`px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                        : ""
                    }`}
                  >
                    <Link href={`/${lang}`}>{lang.toUpperCase()}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
