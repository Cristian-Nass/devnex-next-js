import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSitePayload } from '@/lib/fetch-site';
import { PageRenderer } from '@/components/PageRenderer';

function requestedPageSlug(segments: string[] | undefined): string | null {
  if (!segments || segments.length === 0) return null;
  return segments.join('/');
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: segments } = await params;
  const site = await getSitePayload();
  if (!site) notFound();

  const requested = requestedPageSlug(segments);
  const defaultRoot =
    site.data.pages.find((p) => p.slug === 'home') ?? site.data.pages[0] ?? null;
  const page = requested
    ? site.data.pages.find((p) => p.slug === requested)
    : defaultRoot;
  if (!page) notFound();

  const slug = page.slug;
  const accent = site.data.theme.primaryColor;

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 64px' }}>
      <header style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{site.tenantKey}</span>
        <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {site.data.pages.map((p) => (
            <Link
              key={p.pageId}
              href={
                defaultRoot && p.pageId === defaultRoot.pageId
                  ? '/'
                  : p.slug === 'home'
                    ? '/'
                    : `/${p.slug}`
              }
              style={{
                fontSize: '0.95rem',
                color: p.slug === slug ? accent : '#475569',
                fontWeight: p.slug === slug ? 700 : 500,
              }}>
              {p.label}
            </Link>
          ))}
        </nav>
      </header>
      <PageRenderer page={page} />
    </main>
  );
}
