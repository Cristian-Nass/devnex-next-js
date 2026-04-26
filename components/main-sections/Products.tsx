import { Ubuntu } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function Products() {
  const t = await getTranslations("Products");
  const rawProducts = t.raw("products");
  const products = Array.isArray(rawProducts)
    ? rawProducts.filter(
        (product): product is { name: string; description: string } =>
          typeof product === "object" &&
          product !== null &&
          "name" in product &&
          "description" in product &&
          typeof product.name === "string" &&
          typeof product.description === "string"
      )
    : [];

  return (
    <section
      id="products"
      className="mx-auto w-full max-w-6xl min-h-screen snap-start scroll-mt-24 px-6 py-16 flex items-center"
      aria-labelledby="products-heading"
    >
      <div>
      <h2 id="products-heading" className={cn("text-3xl font-bold text-gray-900", ubuntu.className)}>
        {t("heading")}
      </h2>
      <p className={cn("mt-4 text-lg text-gray-700 max-w-3xl", ubuntu.className)}>{t("subheading")}</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <article key={product.name} className="rounded-lg border border-gray-200 p-5">
            <h3 className={cn("text-xl font-semibold text-gray-900", ubuntu.className)}>{product.name}</h3>
            <p className={cn("mt-2 text-gray-700", ubuntu.className)}>{product.description}</p>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
