import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../button";
import { Ubuntu } from 'next/font/google'
import { getTranslations } from "next-intl/server";
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
    const menuItems = [
        {
            label: t("home"),
            id: "home",
            href: `/${locale}`,
        },
        {
            label: t("services"),
            id: "services",
            href: `/${locale}`,
        },
        {
            label: t("about"),
            id: "about",
            href: `/${locale}`,
        },
        {
            label: t("contact"),
            id: "contact",
            href: `/${locale}`,
        },
    ]
  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {menuItems.map((item) => (
        <Button variant="ghost" size="lg" key={item.id} asChild>
            <Link href={item.href} prefetch={false} className={cn("text-base font-medium", ubuntu.className)}>{item.label}</Link>
        </Button>
    ))}
  </nav>
);
};

export default MainMenuBar;