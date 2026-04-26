import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../button";
import { Ubuntu } from 'next/font/google'
import { getTranslations } from "next-intl/server";
import { getMenuItems } from "./menuItems";
const ubuntu = Ubuntu({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
})
type MainMenuBarProps = {
    locale: string;
    className?: string;
}

export async function MainMenuBar({ locale, className }: MainMenuBarProps) {
    const t = await getTranslations("NavigationBar");
    const menuItems = getMenuItems(locale, {
        home: t("home"),
        services: t("services"),
        about: t("about"),
        contact: t("contact"),
    });
  return (
    <nav className={cn("flex items-center gap-2", className)} aria-label={t("navLabel")}>
      {menuItems.map((item) => (
        <Button variant="ghost" size="lg" key={item.id} asChild>
            <Link href={item.href} prefetch={false} className={cn("text-base font-medium", ubuntu.className)}>{item.label}</Link>
        </Button>
    ))}
  </nav>
);
};

export default MainMenuBar;