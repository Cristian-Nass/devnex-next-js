import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Ubuntu } from 'next/font/google'
import { cn } from "@/lib/utils";
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})
// List of service IDs
const serviceIds = [
  "mobile",
  "web",
  "uiux",
  "cloud",
  "database",
  "api",
] as const;

// Static SVG icons for each service
const serviceIcons: Record<(typeof serviceIds)[number], ReactNode> = {
  mobile: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  ),
  web: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  uiux: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ),
  cloud: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  ),
  database: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  api: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
};

// Next.js server component for rendering the Our Services section
export default async function OurServices() {
  const t = await getTranslations("OurServices");

  // Safe translation fetch per service
  const services = serviceIds.map((id) => {
    const rawFeatures = t.raw(`${id}.features`);
    return {
      icon: serviceIcons[id],
      title: t(`${id}.title`),
      description: t(`${id}.description`),
      // "features" is defined as an array in messages, so use raw values.
      features: Array.isArray(rawFeatures)
        ? rawFeatures.filter((feature): feature is string => typeof feature === "string")
        : [],
    };
  });

  return (
    <section id="services" className="min-h-screen snap-start scroll-mt-24 py-16 md:py-20 lg:py-24 bg-gray-50 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className={cn("text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4", ubuntu.className)}>
            {t("heading")}
          </h2>
          <p className={cn("text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4", ubuntu.className)}>
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title?.toString() || index}
              className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 hover:border-primary transition-all duration-300 hover:-translate-y-2 group cursor-default"
            >
              <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className={cn("text-2xl font-bold text-gray-900 mb-3", ubuntu.className)}>{service.title}</h3>
              <p className={cn("text-gray-600 mb-4", ubuntu.className)}>{service.description}</p>
              <ul className="space-y-2">
                {(Array.isArray(service.features) ? service.features : []).map((feature, idx) => (
                  <li key={idx} className={cn("flex items-center text-gray-700", ubuntu.className)}>
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className={cn("text-gray-700", ubuntu.className)}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
