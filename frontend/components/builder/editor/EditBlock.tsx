"use client";

import { useState } from 'react';
import { MinusIcon, PencilIcon, PlusIcon } from 'lucide-react';
import type { Row } from '@/lib/site-types';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { Button } from '@/components/ui/button';

interface EditBlockProps {
  row: Row;
  onOpenChange?: (open: boolean) => void;
}

export function EditBlock({ row, onOpenChange }: EditBlockProps) {
  const { selectBlock, setRowBackgroundColor } = useWebBuilderStore();
  const [open, setOpen] = useState(false);
  const firstBlock = row.blocks[0];
  const rowBgColor = row.bgColor ?? '#ffffff';

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
          className="absolute left-0 top-full mt-2 w-36 rounded-md border bg-background p-2 shadow-lg flex flex-row items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
            <input
              type="color"
              value={rowBgColor}
              onChange={(e) => setRowBackgroundColor(row.rowId, e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border p-0.5"
            />
            <Button variant="outline" className="w-8 h-8 cursor-pointer">
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-8 h-8 cursor-pointer">
              <MinusIcon className="h-4 w-4" />
            </Button>

        </div>
      )}
    </div>
  );
}
