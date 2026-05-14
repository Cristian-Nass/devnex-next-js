"use client";

import { useEffect, use } from "react";
import { Ubuntu } from "next/font/google";
import { toast } from "sonner";
import { BLOCK_DEFAULTS } from "@netmart/builder-core/editor";
import type { BlockType } from "@netmart/builder-core";
import { apiGetSite } from "@/lib/api-sites";
import { useWebBuilderStore } from "@/stores/useWebBuilderStore";
import { BuilderToolbar } from "@/components/builder/editor/BuilderToolbar";
import { BuilderPublishFab } from "@/components/builder/editor/BuilderPublishFab";
import { BlockPanel } from "@/components/builder/editor/BlockPanel";
import { BuilderCanvas } from "@/components/builder/editor/BuilderCanvas";
import { PropsPanel } from "@/components/builder/editor/PropsPanel";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface BuilderEditorPageProps {
  params: Promise<{ siteId: string }>;
}

export default function BuilderEditorPage({ params }: BuilderEditorPageProps) {
  const { siteId } = use(params);
  const { loadSite, getCurrentPage, addRow, addBlock } = useWebBuilderStore();

  useEffect(() => {
    apiGetSite(siteId)
      .then((site) =>
        loadSite(site.id, site.name, site.data, {
          published: site.published,
          provisioningType: site.provisioningType,
          slug: site.slug,
        }),
      )
      .catch(() => toast.error("Failed to load site"));
  }, [siteId, loadSite]);

  const page = getCurrentPage();
  const hasRows = (page?.rows.length ?? 0) > 0;

  function handleAddFromPanel(type: BlockType) {
    const page = getCurrentPage();
    if (!page) return;
    let targetRowId = page.rows[page.rows.length - 1]?.rowId;
    if (!targetRowId) {
      addRow();
      const updatedPage = useWebBuilderStore.getState().getCurrentPage();
      targetRowId = updatedPage?.rows[0]?.rowId ?? "";
    }
    if (targetRowId) {
      addBlock(targetRowId, type, BLOCK_DEFAULTS[type]);
    }
  }

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${ubuntu.className}`}>
      <BuilderToolbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <BuilderCanvas
          leftSidebar={
            <BlockPanel onAddToRow={handleAddFromPanel} hasRows={hasRows} />
          }
        />
        <PropsPanel />
      </div>
      <BuilderPublishFab />
    </div>
  );
}
