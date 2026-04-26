export type MenuItem = {
  id: "home" | "services" | "about" | "contact" | "products";
  label: string;
  href: string;
};

type MenuLabels = {
  home: string;
  services: string;
  about: string;
  contact: string;
  products: string;
};

export function getMenuItems(locale: string, labels: MenuLabels): MenuItem[] {
  return [
    { id: "home", label: labels.home, href: `/${locale}/home` },
    { id: "services", label: labels.services, href: `/${locale}/home#services` },
    { id: "products", label: labels.products, href: `/${locale}/home#products` },
    { id: "about", label: labels.about, href: `/${locale}/home#about` },
    { id: "contact", label: labels.contact, href: `/${locale}/home#contact` },
  ];
}
