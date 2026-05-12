'use client';

import { useEffect, use, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { PageRenderer } from '@/components/builder/viewer/PageRenderer';
import { apiGetSite } from '@/lib/api-sites';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { toast } from 'sonner';

interface BuilderLivePreviewPageProps {
  params: Promise<{ siteId: string }>;
}

export default function BuilderLivePreviewPage({
  params,
}: BuilderLivePreviewPageProps) {
  const { siteId } = use(params);
  const locale = useLocale();
  const {
    siteId: storeSiteId,
    siteName,
    getCurrentPage,
    pages,
    currentPageId,
    setCurrentPage,
    loadSite,
  } = useWebBuilderStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (storeSiteId === siteId) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    apiGetSite(siteId)
      .then((site) => {
        if (cancelled) return;
        loadSite(site.id, site.name, site.data, {
          published: site.published,
          provisioningType: site.provisioningType,
          slug: site.slug,
        });
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load site');
          setHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, storeSiteId, loadSite]);

  const page = getCurrentPage();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href={`/builder/${siteId}`}
          locale={locale}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to editor
        </Link>
        <span className="text-muted-foreground">|</span>
        <span className="truncate text-sm font-medium">
          {siteName || 'Preview'}
        </span>
      </header>

      {hydrated && pages.length > 1 && (
        <nav className="flex flex-wrap items-center gap-1 border-b px-4 py-2">
          {pages.map((p) => (
            <button
              key={p.pageId}
              type="button"
              onClick={() => setCurrentPage(p.pageId)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent ${
                p.pageId === currentPageId
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </nav>
      )}

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8">
        {!hydrated ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : !page ? (
          <p className="text-center text-sm text-muted-foreground">
            No page to show yet.
          </p>
        ) : (
          <PageRenderer page={page} />
        )}
      </main>
    </div>
  );
}
