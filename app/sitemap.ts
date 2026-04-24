import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${siteUrl}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });

    entries.push({
      url: `${siteUrl}/${locale}/home`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  return entries;
}

