"use client";

import { useDraggable } from "@dnd-kit/core";
import { BLOCK_ICONS, BLOCK_LABELS } from "@netmart/builder-core/editor";
import type { BlockType } from "@netmart/builder-core";
import { PlusIcon } from "lucide-react";
import HeaderSetting from "./HeaderSetting";

const BLOCK_TYPES: BlockType[] = ["hero", "card", "text", "image", "cta"];

interface DraggableBlockTypeProps {
  type: BlockType;
}

function DraggableBlockType({ type }: DraggableBlockTypeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel-${type}`,
    data: { origin: "panel", blockType: type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-primary hover:bg-accent active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <span className="text-base">{BLOCK_ICONS[type]}</span>
      <span>{BLOCK_LABELS[type]}</span>
    </div>
  );
}

interface BlockPanelProps {
  onAddToRow?: (type: BlockType) => void;
  hasRows: boolean;
}

export function BlockPanel({ onAddToRow, hasRows }: BlockPanelProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r bg-background p-4">
      <details className="mb-1">
        <summary className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary">
          Header
        </summary>
        <HeaderSetting />
      </details>
      <details className="mb-1">
        <summary className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary">
          Blocks
        </summary>
        {BLOCK_TYPES.map((type) => (
          <div key={type} className="flex flex-row">
            <div className="flex-1">
              <DraggableBlockType type={type} />
            </div>
            {onAddToRow && hasRows && (
              <button
                onClick={() => onAddToRow(type)}
                className="rounded px-2 py-0.5 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {!hasRows && (
          <p className="mt-4 text-xs text-muted-foreground">
            Add a row first, then drag blocks onto it.
          </p>
        )}
      </details>
    </aside>
  );
}
