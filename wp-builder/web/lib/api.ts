import { WP_BUILDER_API_URL } from "./env";

/**
 * Cross-origin fetch wrapper for the wp-builder Fastify API.
 *
 *   - Always sends credentials so the `netmart_session` cookie travels.
 *   - Adds `Content-Type: application/json` for JSON bodies.
 *   - Surfaces server-side `{ error }` strings as `Error.message`.
 *
 * Use from Client Components / event handlers. For Server Components fetch
 * data via `requireUser()` + a server-side `apiFetch`, not this helper.
 */
function parseErrorBody(body: unknown): string {
  if (!body || typeof body !== "object") return "Request failed";
  const o = body as { error?: unknown; message?: unknown };
  if (typeof o.error === "string") return o.error;
  if (typeof o.message === "string") return o.message;
  return "Request failed";
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http")
    ? path
    : `${WP_BUILDER_API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) {
    return undefined as T;
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseErrorBody(body));
  }
  return body as T;
}

export type SiteRow = {
  id: string;
  slug: string;
  fqdn: string;
  status: "PENDING" | "PROVISIONING" | "READY" | "FAILED";
  wpAdminUsername: string | null;
  provisionError: string | null;
  diskQuotaGb: number;
  diskUsageBytes: string;
  createdAt: string;
  updatedAt: string;
};

export type Meta = { rootDomain: string };
