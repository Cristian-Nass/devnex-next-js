'use client';

import {use, useEffect, useMemo, useState} from 'react';
import {useLocale} from 'next-intl';
import {ArrowLeftIcon} from 'lucide-react';
import {Link} from '@/i18n/routing';
import {PageRenderer} from '@/components/builder/viewer/PageRenderer';
import {apiGetSite} from '@/lib/api-sites';
import {useWebBuilderStore} from '@/stores/useWebBuilderStore';
import {toast} from 'sonner';

interface BuilderPreviewSlugPageProps {
  params: Promise<{siteId: string; slug: string}>;
}

export default function BuilderPreviewSlugPage({
  params,
}: BuilderPreviewSlugPageProps) {
  const {siteId, slug} = use(params);
  const locale = useLocale();
  const decodedSlug = decodeURIComponent(slug);
  const {
    siteId: storeSiteId,
    siteName,
    pages,
    navigationBar,
    loadSite,
    setCurrentPage,
  } = useWebBuilderStore();
  const [hydrated, setHydrated] = useState(false);
  const headerMaxWidth = {
    full: undefined,
    big: '1440px',
    medium: '1024px',
  }[navigationBar.width];
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[navigationBar.justify];

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

  const page = useMemo(
    () => pages.find((candidate) => candidate.slug === decodedSlug),
    [decodedSlug, pages],
  );

  useEffect(() => {
    if (page) setCurrentPage(page.pageId);
  }, [page, setCurrentPage]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        className="mx-auto h-14 w-full shrink-0 border-b"
        style={{
          backgroundColor: navigationBar.backgroundColor,
          color: navigationBar.textColor,
          maxWidth: headerMaxWidth,
        }}
      >
        <div className="flex h-full w-full items-center justify-between gap-4 px-4">
          <span className="shrink-0 truncate text-sm font-semibold">
            {siteName || 'Preview'}
          </span>

          {hydrated && pages.length > 0 && (
            <nav
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
              style={{justifyContent}}
            >
              {pages.map((candidate) => (
                <Link
                  key={candidate.pageId}
                  href={`/builder/${siteId}/preview/${candidate.slug}`}
                  className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/10"
                  style={{
                    backgroundColor:
                      candidate.slug === decodedSlug
                        ? navigationBar.buttonColor
                        : undefined,
                    color: navigationBar.textColor,
                  }}
                >
                  {candidate.label}
                </Link>
              ))}
            </nav>
          )}

          <Link
            href={`/builder/${siteId}`}
            locale={locale}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-black/10"
            style={{color: navigationBar.textColor}}
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8">
        {!hydrated ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : !page ? (
          <p className="text-center text-sm text-muted-foreground">
            Page not found.
          </p>
        ) : (
          <PageRenderer page={page} />
        )}
      </main>
    </div>
  );
}