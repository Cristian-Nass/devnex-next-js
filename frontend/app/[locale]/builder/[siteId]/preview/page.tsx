'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from '@/i18n/routing';
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
  const router = useRouter();
  const { siteId: storeSiteId, pages, loadSite } = useWebBuilderStore();
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

  useEffect(() => {
    if (!hydrated) return;
    const firstPageSlug = pages[0]?.slug;
    if (firstPageSlug) {
      router.replace(`/builder/${siteId}/preview/${firstPageSlug}`);
    }
  }, [hydrated, pages, router, siteId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <p className="text-center text-sm text-muted-foreground">
        {!hydrated || pages.length > 0
          ? 'Loading preview…'
          : 'No page to show yet.'}
      </p>
    </main>
  );
}
