import { create } from 'zustand';
import type {
  Block,
  BlockType,
  NavigationBar,
  Page,
  Row,
  SiteData,
  Theme,
  ProvisioningType,
} from '@/lib/site-types';
import { devtools } from 'zustand/middleware';

type SelectedColumn = {
  rowId: string;
  columnIndex: number;
};

function uid(): string {
  return crypto.randomUUID().slice(0, 8);
}

export type LoadSiteMeta = {
  published?: boolean;
  provisioningType?: ProvisioningType;
  slug?: string;
};

const DEFAULT_NAVIGATION_BAR: NavigationBar = {
  backgroundColor: '#d6d6d6',
  textColor: '#000000',
  buttonColor: '#FFFFFF',
  justify: 'center',
  width: 'full',
};

interface WebBuilderStateType {
  navigationBar: NavigationBar;
  setNavigationBar: (navigationBar: Partial<NavigationBar>) => void;
  siteId: string | null;
  siteName: string;
  siteSlug: string;
  provisioningType: ProvisioningType;
  published: boolean;
  theme: Theme;
  pages: Page[];
  currentPageId: string | null;
  selectedBlockId: string | null;
  selectedColumn: SelectedColumn | null;
  isDirty: boolean;

  loadSite: (id: string, name: string, data: SiteData, meta?: LoadSiteMeta) => void;
  setSiteName: (name: string) => void;
  setTheme: (theme: Partial<Theme>) => void;

  getCurrentPage: () => Page | undefined;
  setCurrentPage: (pageId: string) => void;
  addPage: (label: string, slug: string) => void;
  deletePage: (pageId: string) => void;
  updatePageLabel: (pageId: string, label: string) => void;

  addRow: () => void;
  deleteRow: (rowId: string) => void;
  moveRow: (rowId: string, direction: 'up' | 'down') => void;
  setRowBackgroundColor: (rowId: string, bgColor: string) => void;
  addColumn: (rowId: string) => void;
  removeColumn: (rowId: string) => void;

  addBlock: (rowId: string, type: BlockType, defaultProps: Record<string, unknown>) => void;
  addBlockToColumn: (rowId: string, columnIndex: number, type: BlockType, defaultProps: Record<string, unknown>) => void;
  updateBlock: (blockId: string, props: Record<string, unknown>) => void;
  deleteBlock: (blockId: string) => void;
  setBlockColSpan: (blockId: string, colSpan: number) => void;
  moveBlockInRow: (rowId: string, activeId: string, overId: string) => void;
  moveBlockBetweenRows: (blockId: string, fromRowId: string, toRowId: string, overBlockId?: string) => void;
  selectBlock: (blockId: string | null) => void;
  selectColumn: (rowId: string, columnIndex: number) => void;

  getSiteData: () => SiteData;
  markSaved: () => void;
}

export const useWebBuilderStore = create<WebBuilderStateType>()(
  devtools((set, get) => ({
    navigationBar: DEFAULT_NAVIGATION_BAR,
    setNavigationBar(navigationBar) {
      set((s) => ({
        navigationBar: { ...s.navigationBar, ...navigationBar },
        isDirty: true,
      }));
    },
    siteId: null,
    siteName: '',
    siteSlug: '',
    provisioningType: 'SUBDOMAIN',
    published: false,
    theme: { primaryColor: '#3B82F6', fontFamily: 'Inter' },
    pages: [],
    currentPageId: null,
    selectedBlockId: null,
    selectedColumn: null,
    isDirty: false,

    loadSite(id, name, data, meta) {
      set({
        siteId: id,
        siteName: name,
        siteSlug: meta?.slug ?? '',
        provisioningType: meta?.provisioningType ?? 'SUBDOMAIN',
        published: meta?.published ?? false,
        theme: data.theme ?? { primaryColor: '#3B82F6', fontFamily: 'Inter' },
        navigationBar: { ...DEFAULT_NAVIGATION_BAR, ...data.navigationBar },
        pages: data.pages ?? [],
        currentPageId: data.pages?.[0]?.pageId ?? null,
        selectedBlockId: null,
        selectedColumn: null,
        isDirty: false,
      });
    },

    setSiteName(name) {
      set({ siteName: name, isDirty: true });
    },

    setTheme(partial) {
      set((s) => ({ theme: { ...s.theme, ...partial }, isDirty: true }));
    },

    getCurrentPage() {
      const { pages, currentPageId } = get();
      return pages.find((p) => p.pageId === currentPageId);
    },

    setCurrentPage(pageId) {
      set({ currentPageId: pageId, selectedBlockId: null, selectedColumn: null });
    },

    addPage(label, slug) {
      const newPage: Page = {
        pageId: `page-${uid()}`,
        slug,
        label,
        rows: [],
      };
      set((s) => ({
        pages: [...s.pages, newPage],
        currentPageId: newPage.pageId,
        isDirty: true,
      }));
    },

    deletePage(pageId) {
      set((s) => {
        const remaining = s.pages.filter((p) => p.pageId !== pageId);
        return {
          pages: remaining,
          currentPageId:
            s.currentPageId === pageId
              ? (remaining[0]?.pageId ?? null)
              : s.currentPageId,
          isDirty: true,
        };
      });
    },

    updatePageLabel(pageId, label) {
      set((s) => ({
        pages: s.pages.map((p) => (p.pageId === pageId ? { ...p, label } : p)),
        isDirty: true,
      }));
    },

    addRow() {
      const newRow: Row = { rowId: `row-${uid()}`, columns: 1, blocks: [] };
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? { ...p, rows: [...p.rows, newRow] }
            : p,
        ),
        isDirty: true,
      }));
    },

    addColumn(rowId) {
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? {
                ...p,
                rows: p.rows.map((r) => {
                  if (r.rowId !== rowId) return r;
                  const columns = Math.min(4, (r.columns ?? Math.max(1, r.blocks.length)) + 1);
                  const colSpan = Math.max(1, Math.floor(12 / columns));

                  return {
                    ...r,
                    columns,
                    blocks: r.blocks.map((block, index) => ({
                      ...block,
                      colSpan,
                      columnIndex: block.columnIndex ?? index,
                    })),
                  };
                }),
              }
            : p,
        ),
        isDirty: true,
      }));
    },

    removeColumn(rowId) {
      set((s) => {
        let removedBlockId: string | null = null;
        let removedColumnIndex: number | null = null;
        let changed = false;

        const pages = s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? {
                ...p,
                rows: p.rows.map((r) => {
                  if (r.rowId !== rowId) return r;

                  const columns = r.columns ?? Math.max(1, r.blocks.length);
                  if (columns <= 1) return r;

                  changed = true;
                  removedColumnIndex = columns - 1;
                  const nextColumns = columns - 1;
                  const colSpan = Math.max(1, Math.floor(12 / nextColumns));
                  const blocks = r.blocks
                    .filter((block, index) => {
                      const blockColumnIndex = block.columnIndex ?? index;
                      if (blockColumnIndex === removedColumnIndex) {
                        removedBlockId = block.blockId;
                        return false;
                      }
                      return true;
                    })
                    .map((block, index) => ({
                      ...block,
                      colSpan,
                      columnIndex: Math.min(block.columnIndex ?? index, nextColumns - 1),
                    }));

                  return {
                    ...r,
                    columns: nextColumns,
                    blocks,
                  };
                }),
              }
            : p,
        );

        if (!changed) return {};

        return {
          pages,
          selectedBlockId:
            removedBlockId && s.selectedBlockId === removedBlockId
              ? null
              : s.selectedBlockId,
          selectedColumn:
            s.selectedColumn?.rowId === rowId &&
            removedColumnIndex != null &&
            s.selectedColumn.columnIndex >= removedColumnIndex
              ? { rowId, columnIndex: Math.max(0, removedColumnIndex - 1) }
              : s.selectedColumn,
          isDirty: true,
        };
      });
    },

    deleteRow(rowId) {
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? { ...p, rows: p.rows.filter((r) => r.rowId !== rowId) }
            : p,
        ),
        selectedBlockId: null,
        selectedColumn: s.selectedColumn?.rowId === rowId ? null : s.selectedColumn,
        isDirty: true,
      }));
    },

    moveRow(rowId, direction) {
      set((s) => {
        const page = s.pages.find((p) => p.pageId === s.currentPageId);
        if (!page) return {};
        const idx = page.rows.findIndex((r) => r.rowId === rowId);
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= page.rows.length) return {};
        const rows = [...page.rows];
        [rows[idx], rows[newIdx]] = [rows[newIdx], rows[idx]];
        return {
          pages: s.pages.map((p) =>
            p.pageId === s.currentPageId ? { ...p, rows } : p,
          ),
          isDirty: true,
        };
      });
    },

    setRowBackgroundColor(rowId, bgColor) {
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? {
                ...p,
                rows: p.rows.map((r) =>
                  r.rowId === rowId ? { ...r, bgColor } : r,
                ),
              }
            : p,
        ),
        isDirty: true,
      }));
    },

    addBlock(rowId, type, defaultProps) {
      const newBlock: Block = {
        blockId: `block-${uid()}`,
        type,
        colSpan: 12,
        props: defaultProps,
      };
      set((s) => {
        let added = false;
        let addedColumnIndex = 0;

        const pages = s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? {
                ...p,
                rows: p.rows.map((r) => {
                  if (r.rowId !== rowId) return r;

                  const columns = r.columns ?? Math.max(1, r.blocks.length + 1);
                  if (r.blocks.length >= columns) return r;

                  added = true;
                  const colSpan = Math.max(1, Math.floor(12 / columns));
                  const usedColumns = new Set(
                    r.blocks.map((block, index) => block.columnIndex ?? index),
                  );
                  const columnIndex =
                    Array.from({ length: columns }).findIndex((_, index) => !usedColumns.has(index));
                  if (columnIndex === -1) return r;
                  addedColumnIndex = columnIndex;

                  return {
                    ...r,
                    columns,
                    blocks: [...r.blocks, { ...newBlock, colSpan, columnIndex }],
                  };
                }),
              }
            : p,
        );

        if (!added) return {};

        return {
          pages,
          selectedBlockId: newBlock.blockId,
          selectedColumn: { rowId, columnIndex: addedColumnIndex },
          isDirty: true,
        };
      });
    },

    addBlockToColumn(rowId, columnIndex, type, defaultProps) {
      const newBlock: Block = {
        blockId: `block-${uid()}`,
        type,
        colSpan: 12,
        props: defaultProps,
      };

      set((s) => {
        let added = false;

        const pages = s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? {
                ...p,
                rows: p.rows.map((r) => {
                  if (r.rowId !== rowId) return r;

                  const columns = r.columns ?? Math.max(1, r.blocks.length);
                  if (columnIndex < 0 || columnIndex >= columns) return r;

                  added = true;
                  const colSpan = Math.max(1, Math.floor(12 / columns));

                  return {
                    ...r,
                    columns,
                    blocks: [
                      ...r.blocks.map((block, index) => ({
                        ...block,
                        colSpan,
                        columnIndex: block.columnIndex ?? index,
                      })),
                      { ...newBlock, colSpan, columnIndex },
                    ],
                  };
                }),
              }
            : p,
        );

        if (!added) return {};

        return {
          pages,
          selectedBlockId: newBlock.blockId,
          selectedColumn: { rowId, columnIndex },
          isDirty: true,
        };
      });
    },

    updateBlock(blockId, props) {
      set((s) => ({
        pages: s.pages.map((p) => ({
          ...p,
          rows: p.rows.map((r) => ({
            ...r,
            blocks: r.blocks.map((b) =>
              b.blockId === blockId ? { ...b, props: { ...b.props, ...props } } : b,
            ),
          })),
        })),
        isDirty: true,
      }));
    },

    deleteBlock(blockId) {
      set((s) => ({
        pages: s.pages.map((p) => ({
          ...p,
          rows: p.rows.map((r) => ({
            ...r,
            blocks: r.blocks.filter((b) => b.blockId !== blockId),
          })),
        })),
        selectedBlockId: s.selectedBlockId === blockId ? null : s.selectedBlockId,
        isDirty: true,
      }));
    },

    setBlockColSpan(blockId, colSpan) {
      set((s) => ({
        pages: s.pages.map((p) => ({
          ...p,
          rows: p.rows.map((r) => ({
            ...r,
            blocks: r.blocks.map((b) =>
              b.blockId === blockId ? { ...b, colSpan } : b,
            ),
          })),
        })),
        isDirty: true,
      }));
    },

    moveBlockInRow(rowId, activeId, overId) {
      set((s) => ({
        pages: s.pages.map((p) => ({
          ...p,
          rows: p.rows.map((r) => {
            if (r.rowId !== rowId) return r;
            const from = r.blocks.findIndex((b) => b.blockId === activeId);
            const to = r.blocks.findIndex((b) => b.blockId === overId);
            if (from === -1 || to === -1) return r;
            const blocks = [...r.blocks];
            const [moved] = blocks.splice(from, 1);
            blocks.splice(to, 0, moved);
            return { ...r, blocks };
          }),
        })),
        isDirty: true,
      }));
    },

    moveBlockBetweenRows(blockId, fromRowId, toRowId, overBlockId) {
      set((s) => {
        let movingBlock: Block | undefined;
        const pages = s.pages.map((p) => ({
          ...p,
          rows: p.rows.map((r) => {
            if (r.rowId !== fromRowId) return r;
            movingBlock = r.blocks.find((b) => b.blockId === blockId);
            return { ...r, blocks: r.blocks.filter((b) => b.blockId !== blockId) };
          }),
        }));
        if (!movingBlock) return {};
        const block = movingBlock;
        return {
          pages: pages.map((p) => ({
            ...p,
            rows: p.rows.map((r) => {
              if (r.rowId !== toRowId) return r;
              if (overBlockId) {
                const overIdx = r.blocks.findIndex((b) => b.blockId === overBlockId);
                if (overIdx !== -1) {
                  const blocks = [...r.blocks];
                  blocks.splice(overIdx, 0, block);
                  return { ...r, blocks };
                }
              }
              return { ...r, blocks: [...r.blocks, block] };
            }),
          })),
          isDirty: true,
        };
      });
    },

    selectBlock(blockId) {
      set({ selectedBlockId: blockId });
    },

    selectColumn(rowId, columnIndex) {
      set({ selectedColumn: { rowId, columnIndex }, selectedBlockId: null });
    },

    getSiteData(): SiteData {
      const { theme, navigationBar, pages } = get();
      return { theme, navigationBar, pages };
    },

    markSaved() {
      set({ isDirty: false });
    },
  })));
