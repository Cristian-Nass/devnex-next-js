import type { Page } from '@/lib/site-types';
import { BlockRenderer } from '@/components/builder/blocks/registry';

interface PageRendererProps {
  page: Page;
}

export function PageRenderer({ page }: PageRendererProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {page.rows.map((row) => (
        <div
          key={row.rowId}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gap: 16,
            backgroundColor: row.bgColor ?? 'transparent',
            borderRadius: 12,
          }}
        >
          {Array.from({
            length: Math.max(1, row.columns ?? row.blocks.length),
          }).map((_, columnIndex) => {
            const columnCount = Math.max(1, row.columns ?? row.blocks.length);
            const columnSpan = Math.max(1, Math.floor(12 / columnCount));
            const columnBlocks = row.blocks.filter(
              (block, index) => (block.columnIndex ?? index) === columnIndex,
            );

            return (
              <div
                key={`${row.rowId}-${columnIndex}`}
                style={{
                  gridColumn: `span ${columnSpan}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {columnBlocks.map((block) => (
                  <div
                    key={block.blockId}
                    style={{
                      backgroundColor: String(block.props.bgColor ?? 'transparent'),
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <BlockRenderer type={block.type} props={block.props} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
