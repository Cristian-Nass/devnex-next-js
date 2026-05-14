"use client";

import { useState } from 'react';
import { PlusIcon, Trash2Icon, EditIcon, XIcon, CheckIcon } from 'lucide-react';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';

export function PagesMenu() {
  const {
    pages,
    currentPageId,
    navigationBar,
    setCurrentPage,
    addPage,
    deletePage,
    updatePageLabel,
  } = useWebBuilderStore();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[navigationBar.justify];

  function handleAdd() {
    const label = newLabel.trim() || 'New Page';
    const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    addPage(label, slug || `page-${Date.now()}`);
    setNewLabel('');
    setAdding(false);
  }

  function handleEditPageButton(pageId: string) {
    const page = pages.find((p) => p.pageId === pageId);
    if (!page) return;
    setAdding(false);
    setEditingPageId(pageId);
    setEditLabel(page.label);
    setCurrentPage(pageId);
  }

  function handleSavePageEdit() {
    if (!editingPageId) return;
    const label = editLabel.trim();
    if (!label) return;
    updatePageLabel(editingPageId, label);
    setEditingPageId(null);
    setEditLabel('');
  }

  function handleCancelPageEdit() {
    setEditingPageId(null);
    setEditLabel('');
  }

  return (
    <div
      className="flex w-full items-center gap-1 overflow-x-auto"
      style={{ justifyContent }}
    >
      {pages.map((page) => (
        <div key={page.pageId} className="group relative flex items-center">
          {page.pageId === editingPageId ? (
            <div className="flex items-center gap-1 overflow-hidden group-hover:overflow-visible">
              <input
                autoFocus
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePageEdit();
                  if (e.key === 'Escape') handleCancelPageEdit();
                }}
                placeholder="Page name"
                className="h-7 w-28 rounded-md border bg-background px-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleSavePageEdit}
                className="rounded-md px-2 py-1 text-xs cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: navigationBar.buttonColor,
                  color: navigationBar.textColor,
                }}
              >
                <CheckIcon className="h-4 w-3" />
              </button>
              <button
                type="button"
                onClick={handleCancelPageEdit}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer hover:bg-red-500"
              >
                <XIcon className="h-4 w-3" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentPage(page.pageId)}
                className={`cursor-pointer rounded-md text-sm font-medium transition-colors items-center py-2 px-4 ${
                  currentPageId === page.pageId
                    ? ''
                    : 'hover:bg-black/10'
                }`}
                style={{
                  backgroundColor:
                    currentPageId === page.pageId
                      ? navigationBar.buttonColor
                      : undefined,
                  color: navigationBar.textColor,
                }}
              >
                {page.label}
              </button>
              {pages.length >= 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => deletePage(page.pageId)}
                    className="absolute -left-1 -top-[-20px] hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:flex cursor-pointer"
                    title="Delete page"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditPageButton(page.pageId)}
                    className="absolute -right-1 -top-[-20px] hidden rounded-full bg-green-500 p-0.5 text-destructive-foreground group-hover:flex cursor-pointer"
                    title="Edit page"
                  >
                    <EditIcon className="h-3 w-3" />
                  </button>
                </>
              )}
            </>
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
            className="h-7 w-28 rounded-md border bg-background px-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleAdd}
            className="rounded-md px-2 py-1 text-xs hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: navigationBar.buttonColor,
              color: navigationBar.textColor,
            }}
          >
            <CheckIcon className="h-4 w-3" />
          </button>
          <button
            onClick={() => setAdding(false)}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground cursor-pointer bg-red-500 hover:bg-red-600 text-white"
          >
            <XIcon className="h-4 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-black/10"
          style={{color: navigationBar.textColor}}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Page
        </button>
      )}
    </div>
  );
}
