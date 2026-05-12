'use client';

import { useState } from 'react';
import { GlobeIcon } from 'lucide-react';
import { useWebBuilderStore } from '@/stores/useWebBuilderStore';
import { PagesMenu } from './PagesMenu';

export function BuilderToolbar() {
  const {
    siteName,
    siteSlug,
    published,
    setSiteName,
    isDirty,
  } = useWebBuilderStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const subdomainBase = process.env.NEXT_PUBLIC_PLATFORM_SUBDOMAIN_BASE ?? '';
  const liveUrl =
    published && siteSlug && subdomainBase
      ? `https://${siteSlug}-${subdomainBase}`
      : null;

  function startEditingName() {
    setNameInput(siteName);
    setEditingName(true);
  }

  function commitName() {
    if (nameInput.trim()) setSiteName(nameInput.trim());
    setEditingName(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-3">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') setEditingName(false);
              }}
              className="rounded-md border bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <button
              onClick={startEditingName}
              className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-accent"
              title="Click to rename"
              type="button"
            >
              {siteName || 'Untitled Site'}
            </button>
          )}
          {isDirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              Unsaved
            </span>
          )}
      </div>

      <PagesMenu />

      <div className="flex items-center gap-2">
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            <GlobeIcon className="h-3.5 w-3.5" />
            View site
          </a>
        )}
      </div>
    </header>
  );
}
