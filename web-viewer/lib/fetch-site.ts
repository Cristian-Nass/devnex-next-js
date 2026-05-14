import { cache } from 'react';
import { headers } from 'next/headers';
import type { SitePayload } from './site-types';

export async function getResolvedHostname(): Promise<string> {
  const h = await headers();
  return (h.get('x-tenant-host') ?? h.get('host') ?? 'localhost').trim();
}

function apiBase(): string {
  return (process.env.SITE_API_URL ?? 'http://127.0.0.1:5000/api').replace(/\/$/, '');
}

export const getSitePayload = cache(async (): Promise<SitePayload | null> => {
  const hostname = await getResolvedHostname();
  const url = `${apiBase()}/sites/public/by-host/${encodeURIComponent(hostname)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as SitePayload;
  } catch {
    return null;
  }
});
