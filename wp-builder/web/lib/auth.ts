import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getUserOrNull as introspectOrNull,
  hasRole as hasPlatformRole,
  requireUser as introspectRequire,
  UnauthorizedError,
  type PlatformUser,
} from "@netmart/auth-client";

/**
 * Server-side identity helpers for wp-builder/web. Thin wrapper around
 * `@netmart/auth-client` so route handlers / Server Components don't have
 * to assemble headers manually.
 */

const PLATFORM_FRONTEND_URL =
  process.env.NEXT_PUBLIC_PLATFORM_FRONTEND_URL ?? "http://localhost:3000";

async function buildHeaders(): Promise<{
  cookie: string | null;
  authorization: string | null;
}> {
  const h = await headers();
  return {
    cookie: h.get("cookie"),
    authorization: h.get("authorization"),
  };
}

export type { PlatformUser } from "@netmart/auth-client";

/**
 * Use in Server Components: throws if the user is not signed in. Falls
 * through to a `redirect(...)` to netmart's login page so the proxy gate
 * never has to deal with anonymous visitors making it past locale resolution.
 */
export async function requireUser(locale = "en"): Promise<PlatformUser> {
  try {
    return await introspectRequire(await buildHeaders());
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      const back = encodeURIComponent("/");
      redirect(`${PLATFORM_FRONTEND_URL}/${locale}/login?redirectTo=${back}`);
    }
    throw err;
  }
}

export async function getUserOrNull(): Promise<PlatformUser | null> {
  return introspectOrNull(await buildHeaders());
}

export function hasRole(user: PlatformUser, name: string): boolean {
  return hasPlatformRole(user, name);
}
