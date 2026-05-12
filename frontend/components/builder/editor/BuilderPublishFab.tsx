'use client';

import {useState} from 'react';
import {Loader2Icon, RocketIcon, ExternalLinkIcon} from 'lucide-react';
import {useWebBuilderStore} from '@/stores/useWebBuilderStore';
import {apiPublishSubdomain} from '@/lib/api-sites';
import {toast} from 'sonner';

export function BuilderPublishFab() {
  const {siteId, siteSlug, provisioningType, published, getSiteData, loadSite} =
    useWebBuilderStore();
  const [publishing, setPublishing] = useState(false);

  const subdomainBase =
    process.env.NEXT_PUBLIC_PLATFORM_SUBDOMAIN_BASE ?? 'arvidn.dev';
  const liveUrl =
    siteSlug && subdomainBase
      ? `https://${siteSlug}-web.${subdomainBase}`
      : null;

  if (!siteId || provisioningType !== 'SUBDOMAIN') return null;

  async function handlePublish() {
    if (!siteId) return;
    setPublishing(true);
    try {
      const site = await apiPublishSubdomain(siteId);
      loadSite(site.id, site.name, getSiteData(), {
        published: site.published,
        provisioningType: site.provisioningType,
        slug: site.slug,
      });
      toast.success(
        liveUrl ? `Published! Your site is live at ${liveUrl}` : 'Published!',
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <div className="pointer-events-none fixed bottom-5 right-5 z-50">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-600 py-2 pl-4 pr-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/25">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Live
          </span>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs hover:bg-white/25">
              {liveUrl.replace('https://', '')}
              <ExternalLinkIcon className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        disabled={publishing}
        onClick={handlePublish}
        title={liveUrl ? `Publish to ${liveUrl}` : 'Publish site'}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:cursor-pointer hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70">
        {publishing ? (
          <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <RocketIcon className="h-4 w-4 shrink-0" />
        )}
        {publishing ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  );
}
