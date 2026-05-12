'use client';

import { useEffect, useState } from 'react';
import { SettingsIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { apiDeleteSite, apiGetSite, apiUpdateSite } from '@/lib/api-sites';
import type { ProvisioningType, Site } from '@/lib/site-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SiteSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  siteId: string | null;
  onSaved?: (site: Site) => void;
}

export function SiteSettingsDialog({
  open,
  onClose,
  siteId,
  onSaved,
}: SiteSettingsDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [provisioningType, setProvisioningType] =
    useState<ProvisioningType>('SUBDOMAIN');
  const [customDomain, setCustomDomain] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [gtmContainerId, setGtmContainerId] = useState('');

  useEffect(() => {
    if (!open || !siteId) return;
    setLoading(true);
    apiGetSite(siteId)
      .then((site: Site) => {
        setName(site.name);
        setSlug(site.slug);
        setProvisioningType(site.provisioningType ?? 'SUBDOMAIN');
        setCustomDomain(site.customDomain ?? '');
        setMetaTitle(site.metaTitle ?? '');
        setMetaDescription(site.metaDescription ?? '');
        setGtmContainerId(site.gtmContainerId ?? '');
      })
      .catch(() => toast.error('Failed to load site settings'))
      .finally(() => setLoading(false));
  }, [open, siteId]);

  async function handleSave() {
    if (!siteId) return;
    if (!name.trim()) {
      toast.error('Site name is required');
      return;
    }
    if (provisioningType === 'CUSTOM_DOMAIN' && !customDomain.trim()) {
      toast.error('Custom domain is required for this provisioning type');
      return;
    }
    setSaving(true);
    try {
      const updated = await apiUpdateSite(siteId, {
        name: name.trim(),
        provisioningType,
        customDomain: customDomain.trim(),
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        gtmContainerId: gtmContainerId.trim(),
      });
      toast.success('Site settings saved');
      onSaved?.(updated);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!siteId) return;
    if (!confirm('Delete this site permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await apiDeleteSite(siteId);
      toast.success('Site deleted');
      onClose();
      router.push('/builder');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <SettingsIcon className="h-4 w-4" />
            Site settings
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ss-name">Site name</Label>
                <Input
                  id="ss-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Unique across all sites (case-insensitive).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ss-slug">Slug</Label>
                <Input id="ss-slug" value={slug} disabled className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">
                  Slug is fixed after creation (used internally and for subdomain routing).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ss-prov">Provisioning</Label>
                <select
                  id="ss-prov"
                  value={provisioningType}
                  onChange={(e) =>
                    setProvisioningType(e.target.value as ProvisioningType)
                  }
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                >
                  <option value="SUBDOMAIN">Subdomain</option>
                  <option value="CUSTOM_DOMAIN">Custom domain</option>
                </select>
              </div>

              {provisioningType === 'CUSTOM_DOMAIN' && (
                <div className="space-y-2">
                  <Label htmlFor="ss-domain">Custom domain</Label>
                  <Input
                    id="ss-domain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="www.example.com"
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ss-meta-title">Meta title</Label>
                <Input
                  id="ss-meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ss-meta-desc">Meta description</Label>
                <textarea
                  id="ss-meta-desc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ss-gtm">GTM container ID</Label>
                <Input
                  id="ss-gtm"
                  value={gtmContainerId}
                  onChange={(e) => setGtmContainerId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting || loading}
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            {deleting ? 'Deleting…' : 'Delete site'}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button type="button" size="sm" disabled={saving || loading} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
