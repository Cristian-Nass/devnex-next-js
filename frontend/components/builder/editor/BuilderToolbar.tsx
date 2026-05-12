'use client';

import { useState } from 'react';
import {
  EyeIcon,
  SaveIcon,
  CheckIcon,
  Loader2Icon,
  SettingsIcon,
  GlobeIcon,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useBuilderStore } from '@/stores/builder-store';
import { apiUpdateSite } from '@/lib/api-sites';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PagesMenu } from './PagesMenu';
import { SiteSettingsDialog } from './SiteSettingsDialog';

interface BuilderToolbarProps {
  locale: string;
}

export function BuilderToolbar({ locale }: BuilderToolbarProps) {
  const {
    siteId,
    siteName,
    setSiteName,
    isDirty,
    getSiteData,
    markSaved,
    loadSite,
  } = useBuilderStore();
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function handleSave() {
    if (!siteId) return;
    setSaving(true);
    try {
      await apiUpdateSite(siteId, {
        name: siteName.trim() || undefined,
        data: getSiteData(),
      });
      markSaved();
      toast.success('Saved!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function startEditingName() {
    setNameInput(siteName);
    setEditingName(true);
  }

  function commitName() {
    if (nameInput.trim()) setSiteName(nameInput.trim());
    setEditingName(false);
  }

  return (
    <>
      <SiteSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        siteId={siteId}
        onSaved={(site) => {
          loadSite(site.id, site.name, getSiteData(), {
            published: site.published,
            provisioningType: site.provisioningType,
            slug: site.slug,
          });
        }}
      />
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
        <div className="flex items-center gap-3">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') setEditingName(false);
              }}
              className="rounded-md border bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <button
              onClick={startEditingName}
              className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-accent"
              title="Click to rename"
              type="button"
            >
              {siteName || 'Untitled Site'}
            </button>
          )}
          {isDirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              Unsaved
            </span>
          )}
        </div>

        <PagesMenu />

        <div className="flex items-center gap-2">
          {siteId && (
            <a
              href={`/${locale}/sites/${siteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
              title="Open public site (SSR viewer)"
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              View site
            </a>
          )}
          {siteId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              Site settings
            </Button>
          )}
          {siteId && (
            <Link
              href={`/builder/${siteId}/preview`}
              locale={locale}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <EyeIcon className="h-3.5 w-3.5" />
              Preview
            </Link>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
          >
            {saving ? (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
            ) : isDirty ? (
              <SaveIcon className="h-3.5 w-3.5" />
            ) : (
              <CheckIcon className="h-3.5 w-3.5" />
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>
    </>
  );
}
