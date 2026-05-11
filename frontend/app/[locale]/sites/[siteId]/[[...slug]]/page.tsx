import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageRenderer } from '@/components/builder/viewer/PageRenderer';
import type { SiteData } from '@/lib/site-types';

function normalizeApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
    'http://localhost:5000/api';
  if (/\/api$/i.test(raw)) return raw;
  return `${raw}/api`;
}

interface SiteViewerPageProps {
  params: Promise<{ locale: string; siteId: string; slug?: string[] }>;
}

async function fetchSite(
  siteId: string,
): Promise<{ name: string; data: SiteData } | null> {
  try {
    const res = await fetch(`${normalizeApiBaseUrl()}/sites/public/${siteId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: SiteViewerPageProps): Promise<Metadata> {
  const { siteId } = await params;
  const site = await fetchSite(siteId);
  return { title: site?.name ?? 'Site' };
}

export default async function SiteViewerPage({ params }: SiteViewerPageProps) {
  const { locale, siteId, slug } = await params;
  const site = await fetchSite(siteId);

  if (!site) notFound();

  const pageSlug = slug?.[0] ?? 'home';
  const page =
    site.data.pages.find((p) => p.slug === pageSlug) ?? site.data.pages[0];

  if (!page) notFound();

  const pageSlugResolved = page.slug;

  return (
    <div className="min-h-screen bg-background">
      {site.data.pages.length > 1 && (
        <nav className="flex items-center gap-1 border-b px-6 py-3">
          {site.data.pages.map((p) => (
            <a
              key={p.pageId}
              href={
                p.slug === pageSlugResolved
                  ? '#'
                  : p.slug === 'home'
                    ? `/${locale}/sites/${siteId}`
                    : `/${locale}/sites/${siteId}/${p.slug}`
              }
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent ${
                p.slug === pageSlugResolved
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {p.label}
            </a>
          ))}
        </nav>
      )}

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <PageRenderer page={page} />
      </main>
    </div>
  );
}
