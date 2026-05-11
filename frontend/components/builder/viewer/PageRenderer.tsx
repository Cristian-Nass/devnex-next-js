import type {Page} from '@/lib/site-types';
import {BlockRenderer} from '@/components/builder/blocks/registry';

interface PageRendererProps {
  page: Page;
}

export function PageRenderer({page}: PageRendererProps) {
  return (
    <div className="flex flex-col gap-6">
      {page.rows.map((row) => (
        <div key={row.rowId} className="grid grid-cols-12 gap-4">
          {row.blocks.map((block) => (
            <div
              key={block.blockId}
              style={{gridColumn: `span ${block.colSpan}`}}>
              <BlockRenderer type={block.type} props={block.props} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
