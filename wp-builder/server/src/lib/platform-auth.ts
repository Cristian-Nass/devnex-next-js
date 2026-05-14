import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config.js";

/**
 * Inline introspect helper for the wp-builder Fastify control plane.
 *
 * Mirrors the contract of `@netmart/auth-client` (which is the canonical
 * helper for the Next.js sibling apps) so the user shape stays identical
 * across services. Inlined here because wp-builder/server lives outside
 * the root npm workspace and consuming the workspace package would force
 * a build pipeline change. Both implementations call the same endpoint:
 *
 *   GET ${PLATFORM_API_URL}/auth/introspect
 *
 * with the inbound request's `Cookie` (and optionally `Authorization`)
 * header forwarded verbatim.
 */
export type PlatformUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  roles: Array<{ role: { name: string } }>;
};

export class UnauthorizedError extends Error {
  statusCode = 401 as const;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Read identity headers from a Fastify request — `cookie` (always) and,
 * optionally, `authorization` so a Bearer token from a server-to-server
 * caller works too. The `netmart_session` cookie is the primary path.
 */
function extractAuthHeaders(req: FastifyRequest): {
  cookie: string | null;
  authorization: string | null;
} {
  const headers = req.headers ?? {};
  const cookieHeader = headers.cookie;
  const authHeader = headers.authorization;
  return {
    cookie: typeof cookieHeader === "string" ? cookieHeader : null,
    authorization: typeof authHeader === "string" ? authHeader : null,
  };
}

async function introspect(
  cookie: string | null,
  authorization: string | null,
): Promise<PlatformUser> {
  if (!cookie && !authorization) {
    throw new UnauthorizedError("No session cookie or bearer token on request");
  }

  const base = env.PLATFORM_API_URL.replace(/\/+$/, "");
  const forwarded: Record<string, string> = {};
  if (cookie) forwarded.cookie = cookie;
  if (authorization) forwarded.authorization = authorization;

  const res = await fetch(`${base}/auth/introspect`, {
    method: "GET",
    headers: forwarded,
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(`Introspect failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as PlatformUser;
}

/**
 * Fastify decorator. Use as a `preHandler` on protected routes:
 *
 *   app.get("/sites", { preHandler: [app.authenticate] }, ...)
 *
 * On success, attaches `req.user: PlatformUser`. On failure, sends a
 * `401 Unauthorized` JSON body and leaves the route handler unreached.
 */
export async function authenticate(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { cookie, authorization } = extractAuthHeaders(req);
    const user = await introspect(cookie, authorization);
    (req as FastifyRequest & { user: PlatformUser }).user = user;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      reply.code(401).send({ error: err.message });
      return;
    }
    req.log.error({ err }, "platform introspect failed");
    reply.code(502).send({ error: "Identity service unreachable" });
  }
}
