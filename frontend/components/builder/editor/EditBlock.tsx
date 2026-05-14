"use client";

import { useState } from 'react';
import { EraserIcon, MinusIcon, PencilIcon, PlusIcon } from 'lucide-react';
import type { Row } from '@/lib/site-types';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { Button } from '@/components/ui/button';

interface EditBlockProps {
  row: Row;
  onOpenChange?: (open: boolean) => void;
}

export function EditBlock({ row, onOpenChange }: EditBlockProps) {
  const { addColumn, removeColumn, selectBlock, setRowBackgroundColor } = useWebBuilderStore();
  const [open, setOpen] = useState(false);
  const firstBlock = row.blocks[0];
  const rowBg = row.bgColor ?? 'transparent';
  const rowBgPickerValue =
    /^#[0-9A-Fa-f]{6}$/i.test(rowBg) ? rowBg : '#e5e7eb';

  function setMenuOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (firstBlock) selectBlock(firstBlock.blockId);
          setMenuOpen(!open);
        }}
        className={`rounded p-1 shadow cursor-pointer ${
          open
            ? 'bg-green-500 text-white'
            : 'bg-background hover:bg-green-500'
        }`}
        title="Edit row block"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-fit rounded-md border bg-green-100 p-2 shadow-sm flex flex-row items-center gap-2"
          style={{ boxShadow: '2px 2px 2px rgba(1, 1, 1, 0.5)', border:'1px solid rgb(255, 255, 255)' }}
          onClick={(e) => e.stopPropagation()}
        >
            <input
              type="color"
              value={rowBgPickerValue}
              onChange={(e) => setRowBackgroundColor(row.rowId, e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
              aria-label="Row background color"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 w-10 shrink-0 cursor-pointer"
              title="Remove row background"
              aria-label="Remove row background"
              onClick={() => setRowBackgroundColor(row.rowId, 'transparent')}
            >
              <EraserIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-8 h-8 cursor-pointer"
              onClick={() => addColumn(row.rowId)}
              title="Add column"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-8 h-8 cursor-pointer"
              onClick={() => removeColumn(row.rowId)}
              title="Remove column"
            >
              <MinusIcon className="h-4 w-4" />
            </Button>

        </div>
      )}
    </div>
  );
}
