"use client";

import { useEffect, use } from 'react';
import { useLocale } from 'next-intl';
import { apiGetSite } from '@/lib/api-sites';
import { useBuilderStore } from '@/stores/builder-store';
import { BuilderToolbar } from '@/components/builder/editor/BuilderToolbar';
import { BlockPanel } from '@/components/builder/editor/BlockPanel';
import { BuilderCanvas } from '@/components/builder/editor/BuilderCanvas';
import { PropsPanel } from '@/components/builder/editor/PropsPanel';
import { BLOCK_DEFAULTS } from '@/components/builder/blocks/registry';
import type { BlockType } from '@/lib/site-types';
import { toast } from 'sonner';

interface BuilderEditorPageProps {
  params: Promise<{ siteId: string }>;
}

export default function BuilderEditorPage({ params }: BuilderEditorPageProps) {
  const { siteId } = use(params);
  const locale = useLocale();
  const { loadSite, getCurrentPage, addRow, addBlock } = useBuilderStore();

  useEffect(() => {
    apiGetSite(siteId)
      .then((site) => loadSite(site.id, site.name, site.data, site.published))
      .catch(() => toast.error('Failed to load site'));
  }, [siteId, loadSite]);

  const page = getCurrentPage();
  const hasRows = (page?.rows.length ?? 0) > 0;

  function handleAddFromPanel(type: BlockType) {
    const page = getCurrentPage();
    if (!page) return;
    let targetRowId = page.rows[page.rows.length - 1]?.rowId;
    if (!targetRowId) {
      addRow();
      const updatedPage = useBuilderStore.getState().getCurrentPage();
      targetRowId = updatedPage?.rows[0]?.rowId ?? '';
    }
    if (targetRowId) {
      addBlock(targetRowId, type, BLOCK_DEFAULTS[type]);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BuilderToolbar locale={locale} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <BuilderCanvas
          leftSidebar={
            <BlockPanel onAddToRow={handleAddFromPanel} hasRows={hasRows} />
          }
        />
        <PropsPanel />
      </div>
    </div>
  );
}
