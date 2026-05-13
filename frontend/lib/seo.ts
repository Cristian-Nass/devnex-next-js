const DEFAULT_SITE_URL = "https://www.netmart.se";

export function getSiteUrl() {
  const rawUrl = process.env.FRONTEND_URL?.trim();
  const siteUrl = rawUrl && rawUrl.length > 0 ? rawUrl : DEFAULT_SITE_URL;
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

