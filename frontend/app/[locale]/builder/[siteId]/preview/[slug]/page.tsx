'use client';

import {use, useEffect, useMemo, useState} from 'react';
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
  const decodedSlug = decodeURIComponent(slug);
  const {
    siteId: storeSiteId,
    pages,
    loadSite,
    setCurrentPage,
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

  const page = useMemo(
    () => pages.find((candidate) => candidate.slug === decodedSlug),
    [decodedSlug, pages],
  );

  useEffect(() => {
    if (page) setCurrentPage(page.pageId);
  }, [page, setCurrentPage]);

  return (
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
  );
}