/**
 * Identity helper used by sibling SaaS apps (web-builder, wp-builder, ...)
 * to verify the caller against netmart's `/api/auth/introspect`.
 *
 * Two flavours:
 *   - `requireUser(req)`   — throws `UnauthorizedError` on missing/invalid auth.
 *   - `getUserOrNull(req)` — returns `null` instead of throwing (anon-tolerant).
 *
 * Both accept Next-style `Request`, raw `Headers`, or a plain
 * `{ cookie, authorization }` object so the helper is runtime-agnostic
 * (Node, Edge, Workers).
 */

export type PlatformUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | Date | null;
  createdAt: string | Date;
  roles: Array<{ role: { name: string } }>;
};

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class IntrospectConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntrospectConfigError';
  }
}

export type IntrospectOptions = {
  /**
   * Absolute base URL of netmart's API including the `/api` prefix
   * (e.g. `https://api.netmart.se/api`). Falls back to
   * `process.env.PLATFORM_API_URL`.
   */
  platformApiUrl?: string;
  /** Override fetch (useful for tests / custom runtimes). */
  fetch?: typeof fetch;
};

type HeaderAccessor = { get(name: string): string | null };
type RequestLike =
  | Request
  | { headers: HeaderAccessor | Record<string, string | undefined> }
  | { cookie?: string | null; authorization?: string | null }
  | Headers;

type ForwardedHeaders = {
  cookie: string | null;
  authorization: string | null;
};

function isHeaderAccessor(value: unknown): value is HeaderAccessor {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { get?: unknown }).get === 'function'
  );
}

function extractHeaders(input: RequestLike): ForwardedHeaders {
  if (typeof Headers !== 'undefined' && input instanceof Headers) {
    return {
      cookie: input.get('cookie'),
      authorization: input.get('authorization'),
    };
  }
  if (
    typeof input === 'object' &&
    input !== null &&
    'headers' in input &&
    (input as { headers: unknown }).headers
  ) {
    const headers = (input as { headers: HeaderAccessor | Record<string, string | undefined> })
      .headers;
    if (isHeaderAccessor(headers)) {
      return {
        cookie: headers.get('cookie'),
        authorization: headers.get('authorization'),
      };
    }
    const lower: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(headers)) {
      lower[k.toLowerCase()] = v;
    }
    return {
      cookie: lower.cookie ?? null,
      authorization: lower.authorization ?? null,
    };
  }
  const flat = input as { cookie?: string | null; authorization?: string | null };
  return {
    cookie: flat.cookie ?? null,
    authorization: flat.authorization ?? null,
  };
}

function resolvePlatformApiUrl(opts: IntrospectOptions | undefined): string {
  const raw = opts?.platformApiUrl ?? process.env.PLATFORM_API_URL;
  if (!raw) {
    throw new IntrospectConfigError(
      'PLATFORM_API_URL is not set. Point it at netmart’s API base, e.g. http://localhost:5000/api.',
    );
  }
  return raw.replace(/\/+$/, '');
}

/**
 * Low-level: introspect by raw cookie / authorization header values. Prefer
 * `requireUser` in route handlers.
 */
export async function introspectSession(
  headers: { cookie?: string | null; authorization?: string | null },
  opts?: IntrospectOptions,
): Promise<PlatformUser> {
  const cookie = headers.cookie ?? null;
  const authorization = headers.authorization ?? null;
  // No identity at all — skip the network call.
  if (!cookie && !authorization) {
    throw new UnauthorizedError('No session cookie or bearer token on request');
  }

  const base = resolvePlatformApiUrl(opts);
  const fetchFn = opts?.fetch ?? fetch;

  const forwarded: Record<string, string> = {};
  if (cookie) forwarded.cookie = cookie;
  if (authorization) forwarded.authorization = authorization;

  const res = await fetchFn(`${base}/auth/introspect`, {
    method: 'GET',
    headers: forwarded,
    // Identity must never come from a stale CDN/edge cache.
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(`Introspect failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as PlatformUser;
}

/** Throws `UnauthorizedError` if the caller is not signed in. */
export async function requireUser(
  input: RequestLike,
  opts?: IntrospectOptions,
): Promise<PlatformUser> {
  return introspectSession(extractHeaders(input), opts);
}

/** Returns null on missing/invalid auth; rethrows on infrastructure errors. */
export async function getUserOrNull(
  input: RequestLike,
  opts?: IntrospectOptions,
): Promise<PlatformUser | null> {
  try {
    return await requireUser(input, opts);
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

/** Convenience: did the introspected user collect this role? */
export function hasRole(user: PlatformUser, name: string): boolean {
  return user.roles.some((r) => r.role.name === name);
}
