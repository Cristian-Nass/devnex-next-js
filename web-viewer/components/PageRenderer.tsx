import type { Page } from '@/lib/site-types';
import { BlockRenderer } from './blocks/registry';

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
          }}
        >
          {row.blocks.map((block) => (
            <div
              key={block.blockId}
              style={{ gridColumn: `span ${Math.min(12, Math.max(1, block.colSpan))}` }}
            >
              <BlockRenderer type={block.type} props={block.props} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
