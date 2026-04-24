const DEFAULT_SITE_URL = "https://devnex.app";

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = rawUrl && rawUrl.length > 0 ? rawUrl : DEFAULT_SITE_URL;
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

