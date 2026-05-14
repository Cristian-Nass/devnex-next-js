import type { Site, SiteSummary, ProvisioningType } from "@netmart/builder-core/editor";
import type { SiteData } from "@netmart/builder-core";

/**
 * Same-origin client for the web-builder's own `/api/sites/*` routes.
 *
 * Unlike the original `netmart/frontend/lib/api-sites.ts`, no Bearer token
 * is attached here — authentication rides on the `netmart_session` cookie
 * set by the platform during login, which is automatically forwarded with
 * every fetch on the same origin.
 */

const API_BASE = "/api/sites";

async function extractError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { message?: string | string[] };
  if (Array.isArray(data.message)) return data.message.join(", ");
  return data.message ?? `Request failed (${res.status})`;
}

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await extractError(res));
  // 204 No Content returns no body — DELETE uses it.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiGetMySites(): Promise<SiteSummary[]> {
  return jsonFetch<SiteSummary[]>(API_BASE);
}

export function apiGetSite(id: string): Promise<Site> {
  return jsonFetch<Site>(`${API_BASE}/${encodeURIComponent(id)}`);
}

export interface CreateSitePayload {
  name: string;
  slug: string;
  provisioningType: ProvisioningType;
  metaTitle?: string;
  metaDescription?: string;
  gtmContainerId?: string;
  customDomain?: string;
}

export function apiCreateSite(payload: CreateSitePayload): Promise<Site> {
  return jsonFetch<Site>(API_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface UpdateSitePayload {
  name?: string;
  data?: SiteData;
  published?: boolean;
  provisioningType?: ProvisioningType;
  metaTitle?: string;
  metaDescription?: string;
  gtmContainerId?: string;
  customDomain?: string;
}

export function apiUpdateSite(id: string, payload: UpdateSitePayload): Promise<Site> {
  return jsonFetch<Site>(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function apiPublishSubdomain(id: string): Promise<Site> {
  return jsonFetch<Site>(`${API_BASE}/${encodeURIComponent(id)}/publish`, {
    method: "POST",
  });
}

export async function apiDeleteSite(id: string): Promise<void> {
  await jsonFetch<void>(`${API_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
