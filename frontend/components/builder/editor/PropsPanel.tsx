"use client";

import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { BLOCK_LABELS, BLOCK_PROP_SCHEMA } from '@/components/builder/blocks/registry';
import type { Block } from '@/lib/site-types';

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
  const { pages, selectedBlockId, updateBlock, setBlockColSpan, selectBlock } =
    useWebBuilderStore();

  if (!selectedBlockId) {
    return (
      <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Properties
        </p>
        <p className="text-sm text-muted-foreground">
          Select a block to edit its properties.
        </p>
      </aside>
    );
  }

  const block = findSelectedBlock(pages, selectedBlockId);
  if (!block) return null;

  const schema = BLOCK_PROP_SCHEMA[block.type];

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {BLOCK_LABELS[block.type]}
        </p>
        <button
          onClick={() => selectBlock(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {schema.map((field) => {
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

      <div className="border-t pt-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Column Span (1–12)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={12}
              value={block.colSpan}
              onChange={(e) =>
                setBlockColSpan(block.blockId, Number(e.target.value))
              }
              className="flex-1"
            />
            <span className="w-6 text-right text-sm font-semibold">
              {block.colSpan}
            </span>
          </div>
        </label>
      </div>
    </aside>
  );
}
