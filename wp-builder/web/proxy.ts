import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

// `createMiddleware` is next-intl's helper for the locale-routing layer.
// It still works inside Next 16's `proxy.ts` convention — Next just looks
// for the filename + exported function name, not the library's API.
const intlMiddleware = createMiddleware(routing);

const SESSION_COOKIE = "netmart_session";
const PLATFORM_FRONTEND_URL =
  process.env.NEXT_PUBLIC_PLATFORM_FRONTEND_URL ?? "http://localhost:3000";

const PUBLIC_PREFIXES = ["/_next", "/favicon", "/robots", "/sitemap"];

function stripLocale(pathname: string): string {
  const match = /^\/(en|sv)(\/|$)/.exec(pathname);
  if (!match) return pathname;
  const rest = pathname.slice(match[1].length + 1);
  return rest.length > 0 ? rest : "/";
}

function isPublicPath(pathname: string): boolean {
  const bare = stripLocale(pathname);
  return PUBLIC_PREFIXES.some(
    (p) => bare === p || bare.startsWith(p + "/") || bare.startsWith(p),
  );
}

function buildLoginRedirect(req: NextRequest, locale: string): NextResponse {
  const back = `${req.nextUrl.origin}${req.nextUrl.pathname}${req.nextUrl.search}`;
  const url = new URL(`/${locale}/login`, PLATFORM_FRONTEND_URL);
  url.searchParams.set("redirectTo", back);
  return NextResponse.redirect(url);
}

/**
 * Next 16 `proxy` (formerly `middleware`). Runs before every matched route:
 *
 *   1. next-intl handles locale negotiation / `/` → `/en` redirects.
 *   2. We gate everything else on the cross-subdomain `netmart_session`
 *      cookie issued by netmart's backend on login.
 */
export function proxy(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const intlReq = new NextRequest(request.nextUrl, { headers: requestHeaders });
  const intlRes = intlMiddleware(intlReq) as NextResponse;

  if (intlRes.status >= 300 && intlRes.status < 400) return intlRes;
  if (isPublicPath(request.nextUrl.pathname)) return intlRes;
  if (request.cookies.has(SESSION_COOKIE)) return intlRes;

  const localeFromPath = request.nextUrl.pathname.split("/")[1];
  const locale = (routing.locales as readonly string[]).includes(localeFromPath)
    ? localeFromPath
    : routing.defaultLocale;

  return buildLoginRedirect(request, locale);
}

export const config = {
  matcher: "/((?!_next|favicon|robots|sitemap|.*\\..*).*)",
};
