import createMiddleware from "next-intl/middleware";
import type { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest): NextResponse {
  const response = intlMiddleware(request) as NextResponse;

  // Behind nginx-proxy + Cloudflare the Host header can carry a default port
  // (e.g. `devnex.arvidn.dev:80`) while X-Forwarded-Proto is `https`, which
  // leaks into next-intl redirects as `https://devnex.arvidn.dev:80/sv`.
  // Strip default web ports from any absolute Location header.
  const location = response.headers.get("location");
  if (location) {
    const cleaned = location.replace(
      /^(https?:\/\/[^/:?#]+):(?:80|443)(?=\/|$|\?|#)/,
      "$1",
    );
    if (cleaned !== location) {
      response.headers.set("location", cleaned);
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
