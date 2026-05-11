import { create } from 'zustand';
import type { Block, BlockType, Page, Row, SiteData, Theme } from '@/lib/site-types';
import { devtools } from 'zustand/middleware';

function uid(): string {
  return crypto.randomUUID().slice(0, 8);
}

interface BuilderState {
  siteId: string | null;
  siteName: string;
  published: boolean;
  theme: Theme;
  pages: Page[];
  currentPageId: string | null;
  selectedBlockId: string | null;
  isDirty: boolean;

  loadSite: (id: string, name: string, data: SiteData, published?: boolean) => void;
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

  addBlock: (rowId: string, type: BlockType, defaultProps: Record<string, unknown>) => void;
  updateBlock: (blockId: string, props: Record<string, unknown>) => void;
  deleteBlock: (blockId: string) => void;
  setBlockColSpan: (blockId: string, colSpan: number) => void;
  moveBlockInRow: (rowId: string, activeId: string, overId: string) => void;
  moveBlockBetweenRows: (blockId: string, fromRowId: string, toRowId: string, overBlockId?: string) => void;
  selectBlock: (blockId: string | null) => void;

  getSiteData: () => SiteData;
  markSaved: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  devtools((set, get) => ({
    siteId: null,
    siteName: '',
    published: false,
    theme: { primaryColor: '#3B82F6', fontFamily: 'Inter' },
    pages: [],
    currentPageId: null,
    selectedBlockId: null,
    isDirty: false,

    loadSite(id, name, data, published = false) {
      set({
        siteId: id,
        siteName: name,
        published,
        theme: data.theme ?? { primaryColor: '#3B82F6', fontFamily: 'Inter' },
        pages: data.pages ?? [],
        currentPageId: data.pages?.[0]?.pageId ?? null,
        selectedBlockId: null,
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
      set({ currentPageId: pageId, selectedBlockId: null });
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
      const newRow: Row = { rowId: `row-${uid()}`, blocks: [] };
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? { ...p, rows: [...p.rows, newRow] }
            : p,
        ),
        isDirty: true,
      }));
    },

    deleteRow(rowId) {
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? { ...p, rows: p.rows.filter((r) => r.rowId !== rowId) }
            : p,
        ),
        selectedBlockId: null,
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

    addBlock(rowId, type, defaultProps) {
      const newBlock: Block = {
        blockId: `block-${uid()}`,
        type,
        colSpan: type === 'hero' ? 12 : 6,
        props: defaultProps,
      };
      set((s) => ({
        pages: s.pages.map((p) =>
          p.pageId === s.currentPageId
            ? {
              ...p,
              rows: p.rows.map((r) =>
                r.rowId === rowId
                  ? { ...r, blocks: [...r.blocks, newBlock] }
                  : r,
              ),
            }
            : p,
        ),
        selectedBlockId: newBlock.blockId,
        isDirty: true,
      }));
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

    getSiteData(): SiteData {
      const { theme, pages } = get();
      return { theme, pages };
    },

    markSaved() {
      set({ isDirty: false });
    },
  })));
