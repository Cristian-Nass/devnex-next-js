"use client";

import type { ReactNode } from 'react';
import type { CollisionDetection } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  useDndContext,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon, GripHorizontalIcon } from 'lucide-react';
import { BLOCK_DEFAULTS, BLOCK_LABELS, BLOCK_REGISTRY } from '@/components/builder/blocks/registry';
import type { Block, BlockType, Row } from '@/lib/site-types';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { EditBlock } from './EditBlock';

/** Prefer blocks / palette over row shells so the pointer targets the grid, not the outer row box. */
const canvasCollisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  if (hits.length > 0) {
    const nonRow = hits.filter((c) => !String(c.id).startsWith('row-'));
    return nonRow.length > 0 ? nonRow : hits;
  }
  return closestCenter(args);
};

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableBlock({ block, isSelected, onSelect, onDelete }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.blockId,
      data: { type: 'block', block },
    });

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    gridColumn: `span ${block.colSpan}`,
    opacity: isDragging ? 0.2 : 1,
    backgroundColor: String(block.props.bgColor ?? 'transparent'),
  };

  const Component = BLOCK_REGISTRY[block.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-lg ring-2 transition-all ${
        isSelected ? 'ring-primary' : 'ring-transparent hover:ring-primary/40'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1/2 top-1 z-10 flex -translate-x-1/2 cursor-grab touch-none rounded bg-primary/80 px-1.5 py-0.5 text-primary-foreground opacity-70 hover:opacity-100 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripHorizontalIcon className="h-3 w-3" />
      </div>

      <div className="absolute right-1 top-1 z-10 hidden items-center gap-1 group-hover:flex">
        <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
          {BLOCK_LABELS[block.type]}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded bg-destructive p-0.5 text-destructive-foreground"
        >
          <Trash2Icon className="h-3 w-3" />
        </button>
      </div>

      <Component {...block.props} />
    </div>
  );
}

interface EmptyColumnSlotProps {
  rowId: string;
  columnIndex: number;
  colSpan: number;
  isSelected: boolean;
  onSelect: () => void;
}

function EmptyColumnSlot({
  rowId,
  columnIndex,
  colSpan,
  isSelected,
  onSelect,
}: EmptyColumnSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${rowId}-${columnIndex}`,
    data: { type: 'column', rowId, columnIndex },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ gridColumn: `span ${colSpan}` }}
      onClick={onSelect}
      className={`flex h-20 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10 text-primary'
          : isOver
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-muted-foreground/30'
      }`}
    >
      Drag a block here or click &ldquo;+ add&rdquo; in the panel
    </div>
  );
}

interface RowContainerProps {
  row: Row;
  rowIndex: number;
  totalRows: number;
}

function RowContainer({ row, rowIndex, totalRows }: RowContainerProps) {
  const {
    selectedBlockId,
    selectedColumn,
    selectBlock,
    selectColumn,
    deleteBlock,
    moveRow,
    deleteRow,
    getCurrentPage,
  } = useWebBuilderStore();
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const { active, over, collisions } = useDndContext();
  const page = getCurrentPage();

  const blockIds = row.blocks.map((b) => b.blockId);
  const columnCount = Math.max(1, row.columns ?? row.blocks.length);
  const columnSpan = Math.max(1, Math.floor(12 / columnCount));

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: row.rowId,
    data: { type: 'row', rowId: row.rowId },
  });

  const activeIdStr = active?.id != null ? String(active.id) : '';
  const paletteDrag = activeIdStr.startsWith('panel-');

  const activeSourceRowId =
    activeIdStr.startsWith('block-') && page
      ? page.rows.find((r) => r.blocks.some((b) => b.blockId === activeIdStr))
          ?.rowId ?? null
      : null;
  const crossRowBlockDrag =
    activeSourceRowId != null && activeSourceRowId !== row.rowId;

  /** Row shell + empty placeholder: `isOver` alone can miss; also match global `over` / collision list. */
  const hitsThisRow =
    isOver ||
    (over?.id != null && String(over.id) === row.rowId) ||
    (collisions?.some((c) => String(c.id) === row.rowId) ?? false);

  const rowDropHighlight =
    hitsThisRow && (paletteDrag || crossRowBlockDrag);

  return (
    <div
      ref={setDropRef}
      style={{ backgroundColor: row.bgColor ?? 'transparent' }}
      className={`group/row relative rounded-xl border-2 border-dashed p-3 transition-colors ${
        rowDropHighlight
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/20 hover:border-muted-foreground/40'
      }`}
    >
      <div
        className={`absolute bottom-0 left-3 z-10 translate-y-1/2 items-center gap-1 ${
          editMenuOpen ? 'flex' : 'hidden group-hover/row:flex'
        }`}
      >
        <button
          type="button"
          onClick={() => deleteRow(row.rowId)}
          className="rounded bg-background p-1 shadow hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
          title="Delete row"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </button>
        <button
          disabled={rowIndex === 0}
          onClick={() => moveRow(row.rowId, 'up')}
          className="rounded bg-background p-1 shadow hover:bg-accent disabled:opacity-30 cursor-pointer"
          title="Move row up"
          type="button"
        >
          <ChevronUpIcon className="h-3.5 w-3.5" />
        </button>
        <button
          disabled={rowIndex === totalRows - 1}
          onClick={() => moveRow(row.rowId, 'down')}
          className="rounded bg-background p-1 shadow hover:bg-accent disabled:opacity-30 cursor-pointer"
          title="Move row down"
          type="button"
        >
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </button>
        <EditBlock row={row} onOpenChange={setEditMenuOpen} />
      </div>

      <SortableContext items={blockIds} strategy={horizontalListSortingStrategy}>
        <div className="grid grid-cols-12 gap-3">
          {Array.from({ length: columnCount }).map((_, columnIndex) => {
            const block = row.blocks.find(
              (candidate, index) => (candidate.columnIndex ?? index) === columnIndex,
            );

            return block ? (
              <SortableBlock
                key={block.blockId}
                block={{ ...block, colSpan: columnSpan, columnIndex }}
                isSelected={selectedBlockId === block.blockId}
                onSelect={() => {
                  selectColumn(row.rowId, columnIndex);
                  selectBlock(block.blockId);
                }}
                onDelete={() => deleteBlock(block.blockId)}
              />
            ) : (
              <EmptyColumnSlot
                key={`${row.rowId}-${columnIndex}`}
                rowId={row.rowId}
                columnIndex={columnIndex}
                colSpan={columnSpan}
                isSelected={
                  selectedColumn?.rowId === row.rowId &&
                  selectedColumn.columnIndex === columnIndex
                }
                onSelect={() => selectColumn(row.rowId, columnIndex)}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}

function BuilderCanvasSkeleton() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" aria-busy="true" aria-label="Loading editor">
      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className="flex w-56 shrink-0 flex-col gap-2 border-r bg-background p-4">
          <div className="mb-2 h-3 w-16 rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted/80" />
          ))}
        </aside>
        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div className="h-24 w-full rounded-xl border-2 border-dashed border-muted bg-muted/30" />
          <div className="h-10 w-full rounded-lg border border-dashed border-muted bg-muted/20" />
        </main>
      </div>
    </div>
  );
}

interface BuilderCanvasDndProps {
  leftSidebar: ReactNode;
}

/** Renders only on the client so @dnd-kit accessibility IDs match (avoids hydration mismatch). */
function BuilderCanvasDnd({ leftSidebar }: BuilderCanvasDndProps) {
  const {
    getCurrentPage,
    addRow,
    addBlock,
    addBlockToColumn,
    moveBlockInRow,
    moveBlockBetweenRows,
  } = useWebBuilderStore();

  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [activeBlockType, setActiveBlockType] = useState<BlockType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const page = getCurrentPage();

  function findRowForBlock(blockId: string): string | null {
    if (!page) return null;
    for (const row of page.rows) {
      if (row.blocks.some((b) => b.blockId === blockId)) return row.rowId;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.origin === 'panel') {
      setActiveBlockType(data.blockType as BlockType);
    } else if (data?.type === 'block') {
      setActiveBlock(data.block as Block);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveBlock(null);
    setActiveBlockType(null);

    if (!over || !page) return;

    const activeData = active.data.current;
    const overId = String(over.id);

    if (activeData?.origin === 'panel') {
      const blockType = activeData.blockType as BlockType;
      const overData = over.data.current;

      if (overData?.type === 'column') {
        addBlockToColumn(
          String(overData.rowId),
          Number(overData.columnIndex),
          blockType,
          BLOCK_DEFAULTS[blockType],
        );
        return;
      }

      const targetRow = page.rows.find(
        (r) => r.rowId === overId || r.blocks.some((b) => b.blockId === overId),
      );
      if (targetRow) {
        addBlock(targetRow.rowId, blockType, BLOCK_DEFAULTS[blockType]);
      } else if (page.rows.length === 0) {
        addRow();
        const updatedPage = useWebBuilderStore.getState().getCurrentPage();
        const newRow = updatedPage?.rows[0];
        if (newRow) addBlock(newRow.rowId, blockType, BLOCK_DEFAULTS[blockType]);
      }
      return;
    }

    if (activeData?.type === 'block') {
      const blockId = String(active.id);
      const fromRowId = findRowForBlock(blockId);
      if (!fromRowId) return;
      if (overId === blockId) return;

      const droppedOnRow = page.rows.find((r) => r.rowId === overId);
      if (droppedOnRow && droppedOnRow.rowId !== fromRowId) {
        moveBlockBetweenRows(blockId, fromRowId, droppedOnRow.rowId);
        return;
      }

      const overBlockRow = findRowForBlock(overId);
      if (overBlockRow && overBlockRow !== fromRowId) {
        moveBlockBetweenRows(blockId, fromRowId, overBlockRow, overId);
        return;
      }

      if (overBlockRow === fromRowId && blockId !== overId) {
        moveBlockInRow(fromRowId, blockId, overId);
      }
    }
  }

  const overlayBlock =
    activeBlock ??
    (activeBlockType
      ? {
          blockId: 'preview',
          type: activeBlockType,
          colSpan: 6,
          props: BLOCK_DEFAULTS[activeBlockType],
        }
      : null);
  const OverlayComponent = overlayBlock ? BLOCK_REGISTRY[overlayBlock.type] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={canvasCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1">
          {leftSidebar}
          <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            {!page ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                No page selected.
              </div>
            ) : (
              <>
                {page.rows.map((row, i) => (
                  <RowContainer
                    key={row.rowId}
                    row={row}
                    rowIndex={i}
                    totalRows={page.rows.length}
                  />
                ))}

                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Row
                </button>
              </>
            )}
          </main>
        </div>

        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {OverlayComponent && overlayBlock && (
            <div className="pointer-events-none w-[min(92vw,56rem)] max-w-full rounded-lg shadow-2xl ring-2 ring-primary opacity-95">
              <OverlayComponent {...overlayBlock.props} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

interface BuilderCanvasProps {
  leftSidebar: ReactNode;
}

export function BuilderCanvas({ leftSidebar }: BuilderCanvasProps) {
  const [dndMounted, setDndMounted] = useState(false);

  useEffect(() => {
    setDndMounted(true);
  }, []);

  if (!dndMounted) {
    return <BuilderCanvasSkeleton />;
  }

  return <BuilderCanvasDnd leftSidebar={leftSidebar} />;
}
