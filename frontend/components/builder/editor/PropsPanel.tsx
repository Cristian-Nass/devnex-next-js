"use client";

import { useState } from 'react';
import {
  EyeIcon,
  SaveIcon,
  CheckIcon,
  Loader2Icon,
  SettingsIcon,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { BLOCK_LABELS, BLOCK_PROP_SCHEMA } from '@/components/builder/blocks/registry';
import type { Block } from '@/lib/site-types';
import { apiUpdateSite } from '@/lib/api-sites';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SiteSettingsDialog } from './SiteSettingsDialog';

function findSelectedBlock(pages: ReturnType<typeof useWebBuilderStore.getState>['pages'], blockId: string): Block | null {
  for (const page of pages) {
    for (const row of page.rows) {
      for (const block of row.blocks) {
        if (block.blockId === blockId) return block;
      }
    }
  }
  return null;
}

export function PropsPanel() {
  const locale = useLocale();
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    pages,
    selectedBlockId,
    updateBlock,
    selectBlock,
    siteId,
    siteName,
    isDirty,
    getSiteData,
    markSaved,
    loadSite,
  } = useWebBuilderStore();

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

  const block =
    selectedBlockId ? findSelectedBlock(pages, selectedBlockId) : null;

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
      <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-l bg-background">
        <div className="shrink-0 space-y-2 border-b border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Site
          </p>
          <div className="flex flex-col gap-2">
            {siteId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon className="h-3.5 w-3.5 shrink-0" />
                Site settings
              </Button>
            ) : null}
            {siteId ? (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                <Link href={`/builder/${siteId}/preview`} locale={locale}>
                  <EyeIcon className="h-3.5 w-3.5 shrink-0" />
                  Preview
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleSave}
              disabled={saving || !isDirty || !siteId}
            >
              {saving ? (
                <Loader2Icon className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : isDirty ? (
                <SaveIcon className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <CheckIcon className="h-3.5 w-3.5 shrink-0" />
              )}
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {!selectedBlockId && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Properties
              </p>
              <p className="text-sm text-muted-foreground">
                Select a block to edit its properties.
              </p>
            </>
          )}
          {selectedBlockId && !block && (
            <p className="text-sm text-muted-foreground">Block not found.</p>
          )}
          {selectedBlockId && block && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {BLOCK_LABELS[block.type]}
                </p>
                <button
                  type="button"
                  onClick={() => selectBlock(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {BLOCK_PROP_SCHEMA[block.type].map((field) => {
                  const value = (block.props[field.key] ?? '') as string;
                  return (
                    <label key={field.key} className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {field.label}
                      </span>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            updateBlock(block.blockId, { [field.key]: e.target.value })
                          }
                          rows={3}
                          className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={value}
                          onChange={(e) =>
                            updateBlock(block.blockId, { [field.key]: e.target.value })
                          }
                          className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'color' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) =>
                              updateBlock(block.blockId, { [field.key]: e.target.value })
                            }
                            className="h-8 w-10 cursor-pointer rounded border p-0.5"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              updateBlock(block.blockId, { [field.key]: e.target.value })
                            }
                            className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ) : (
                        <input
                          type={field.type === 'url' ? 'url' : 'text'}
                          value={value}
                          onChange={(e) =>
                            updateBlock(block.blockId, { [field.key]: e.target.value })
                          }
                          className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
