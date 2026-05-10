import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [marketing, navigation, services, products, registration] =
    await Promise.all([
      import(`../messages/${locale}/marketing.json`),
      import(`../messages/${locale}/navigation.json`),
      import(`../messages/${locale}/services.json`),
      import(`../messages/${locale}/products.json`),
      import(`../messages/${locale}/registration.json`),
    ]);

  return {
    locale,
    messages: {
      ...marketing.default,
      ...navigation.default,
      ...services.default,
      ...products.default,
      ...registration.default,
    },
  };
});
