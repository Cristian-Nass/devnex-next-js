import type { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';

/**
 * Cross-subdomain session cookie shared with all SaaS products
 * (builder.netmart.se, wp.netmart.se, ...). Issued by netmart/backend on
 * login; consumed locally by `JwtStrategy` and remotely by sibling apps
 * through `GET /api/auth/introspect`.
 */
export const SESSION_COOKIE_NAME = 'netmart_session';

/** Parses a single named cookie from `req.headers.cookie` without needing cookie-parser. */
export function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

/**
 * Cookie attributes shared between `setSessionCookie` and `clearSessionCookie`
 * so the browser treats them as the same cookie. SameSite=Lax is sufficient
 * because all consumers share the `netmart.se` registrable domain.
 */
function baseCookieOptions(config: ConfigService): CookieOptions {
  const domain = config.get<string>('COOKIE_DOMAIN')?.trim();
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

/** JWT lifetimes are strings like "7d"; this turns them into ms for cookie maxAge. */
function parseExpiryMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  if (!match) return 7 * 86_400_000;
  const units: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return Number(match[1]) * units[match[2]];
}

export function setSessionCookie(
  res: Response,
  config: ConfigService,
  token: string,
): void {
  const expiresIn = config.get<string>('JWT_EXPIRATION', '7d');
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions(config),
    maxAge: parseExpiryMs(expiresIn),
  });
}

export function clearSessionCookie(
  res: Response,
  config: ConfigService,
): void {
  // `res.clearCookie` must mirror the attributes used when setting the cookie,
  // otherwise the browser will treat it as a different cookie and leave the
  // original in place.
  res.clearCookie(SESSION_COOKIE_NAME, baseCookieOptions(config));
}
