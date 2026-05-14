import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [builder] = await Promise.all([
    import(`../messages/${locale}/builder.json`),
  ]);

  return {
    locale,
    messages: {
      ...builder.default,
    },
  };
});
