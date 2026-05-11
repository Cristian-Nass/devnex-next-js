import type { Site, SiteData, SiteSummary } from './site-types';
import { getToken } from './api-auth';

function normalizeApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
    'http://localhost:5000/api';
  if (/\/api$/i.test(raw)) return raw;
  return `${raw}/api`;
}

const API_URL = normalizeApiBaseUrl();

async function authHeaders(): Promise<HeadersInit> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function extractError(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({})) as { message?: string };
  if (Array.isArray(data.message)) return data.message.join(', ');
  return data.message ?? `Request failed (${res.status})`;
}

export async function apiGetMySites(): Promise<SiteSummary[]> {
  const res = await fetch(`${API_URL}/sites`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function apiGetSite(id: string): Promise<Site> {
  const res = await fetch(`${API_URL}/sites/${id}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function apiGetPublicSite(id: string): Promise<Site> {
  const res = await fetch(`${API_URL}/sites/public/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function apiCreateSite(name: string, slug: string): Promise<Site> {
  const res = await fetch(`${API_URL}/sites`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function apiUpdateSite(
  id: string,
  payload: { name?: string; data?: SiteData; published?: boolean },
): Promise<Site> {
  const res = await fetch(`${API_URL}/sites/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function apiDeleteSite(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/sites/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(await extractError(res));
}
