"use client";

import { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';

export function PagesMenu() {
  const { pages, currentPageId, setCurrentPage, addPage, deletePage } =
    useWebBuilderStore();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  function handleAdd() {
    const label = newLabel.trim() || 'New Page';
    const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    addPage(label, slug || `page-${Date.now()}`);
    setNewLabel('');
    setAdding(false);
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {pages.map((page) => (
        <div key={page.pageId} className="group relative flex items-center">
          <button
            onClick={() => setCurrentPage(page.pageId)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentPageId === page.pageId
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {page.label}
          </button>
          {pages.length > 1 && (
            <button
              onClick={() => deletePage(page.pageId)}
              className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:flex"
              title="Delete page"
            >
              <Trash2Icon className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="Page name"
            className="h-7 w-28 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleAdd}
            className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Page
        </button>
      )}
    </div>
  );
}
