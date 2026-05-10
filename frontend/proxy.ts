import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  // Behind a reverse-proxy (nginx-proxy + Cloudflare) the Host header can
  // include `:80` while X-Forwarded-Proto is `https`, so next-intl builds
  // redirect URLs like https://devnex.arvidn.dev:80/sv. Strip the port when
  // it is a default port for the forwarded protocol.
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "";
  const defaultPort = proto === "https" ? "443" : "80";
  const cleanHost = host.replace(new RegExp(`:${defaultPort}$`), "");

  if (cleanHost === host) {
    return intlMiddleware(request) as NextResponse;
  }

  const cleanUrl = new URL(request.url);
  cleanUrl.host = cleanHost;
  cleanUrl.port = "";

  const patched = new NextRequest(cleanUrl, {
    headers: (() => {
      const h = new Headers(request.headers);
      h.set("host", cleanHost);
      return h;
    })(),
    method: request.method,
    body: request.body,
  });

  return intlMiddleware(patched) as NextResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
