import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  IntrospectConfigError,
  UnauthorizedError,
  hasRole as coreHasRole,
  introspectSession,
  type PlatformUser,
} from "@netmart/auth-client";

export { UnauthorizedError, IntrospectConfigError } from "@netmart/auth-client";
export type { PlatformUser } from "@netmart/auth-client";

const PLATFORM_FRONTEND_URL =
  process.env.NEXT_PUBLIC_PLATFORM_FRONTEND_URL ?? "http://localhost:3000";

/**
 * Server Component / Server Action helper. Pulls the request headers via
 * `next/headers`, forwards them to netmart's introspect endpoint, and
 * `redirect()`s to the platform login if no valid session exists.
 *
 * For Route Handlers, pass the `Request` directly to
 * `@netmart/auth-client`'s `requireUser(req)` instead.
 */
export async function requireUser(): Promise<PlatformUser> {
  const h = await headers();
  try {
    return await introspectSession({
      cookie: h.get("cookie"),
      authorization: h.get("authorization"),
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      const pathname = h.get("x-pathname") ?? "/";
      const url = new URL(`/en/login`, PLATFORM_FRONTEND_URL);
      url.searchParams.set("redirectTo", pathname);
      redirect(url.toString());
    }
    throw err;
  }
}

/**
 * Anon-tolerant version: returns null on missing/invalid session instead
 * of redirecting. Use in pages that have a public preview state.
 */
export async function getUserOrNull(): Promise<PlatformUser | null> {
  const h = await headers();
  try {
    return await introspectSession({
      cookie: h.get("cookie"),
      authorization: h.get("authorization"),
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

export function hasRole(user: PlatformUser, name: string): boolean {
  return coreHasRole(user, name);
}
