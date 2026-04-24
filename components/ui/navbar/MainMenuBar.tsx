import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../button";
import { Ubuntu } from 'next/font/google'
const ubuntu = Ubuntu({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
})
type MainMenuBarProps = {
    locale: string;
    className?: string;
}

const MainMenuBar = ({ locale, className }: MainMenuBarProps) => {
    const menuItems = [
        {
            label: "Home",
            href: `/${locale}`,
        },
        {
            label: "About",
            href: `/${locale}/about`,
        },
        {
            label: "Contact",
            href: `/${locale}/contact`,
        },
    ]
  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {menuItems.map((item) => (
        <Button variant="ghost" size="lg" key={item.href} asChild>
            <Link href={item.href} locale={locale} prefetch={false} className={cn("text-base font-medium", ubuntu.className)}>{item.label}</Link>
        </Button>
    ))}
  </nav>
);
};

export default MainMenuBar;