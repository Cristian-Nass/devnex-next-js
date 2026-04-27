import Link from "next/link";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const navigationLinks = [
  { label: "Home", href: "/en/home" },
  { label: "Services", href: "/en/home#services" },
  { label: "Products", href: "/en/home#products" },
  { label: "About", href: "/en/home#about" },
  { label: "Contact", href: "/en/home#contact" },
];

const Footer = () => {
  return (
    <footer className="snap-start scroll-mt-24 bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div className="space-y-4">
            <h3 className={cn("text-2xl font-bold", ubuntu.className)}>Devnex</h3>
            <p className={cn("text-slate-300 max-w-sm", ubuntu.className)}>
              Modern websites and digital products designed to help your business grow with speed, style, and
              reliability.
            </p>
          </div>

          <div>
            <h4 className={cn("text-lg font-semibold mb-4", ubuntu.className)}>Quick Links</h4>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2">
                {navigationLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-slate-300 hover:text-white transition-colors duration-200 underline-offset-4 hover:underline",
                        ubuntu.className
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className={cn("text-lg font-semibold", ubuntu.className)}>Get in Touch</h4>
            <a
              href="mailto:hello@devnex.se"
              className={cn("inline-block text-slate-300 hover:text-white transition-colors", ubuntu.className)}
            >
              hello@devnex.se
            </a>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Devnex on LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <span className="text-sm font-semibold">in</span>
              </a>
              <a
                href="#"
                aria-label="Devnex on GitHub"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <span className="text-sm font-semibold">gh</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className={cn("text-sm text-slate-300", ubuntu.className)}>
            &copy; {new Date().getFullYear()} Devnex. All rights reserved.
          </p>
          <p className={cn("text-sm text-slate-300", ubuntu.className)}>Built with care for modern businesses.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;