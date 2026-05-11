"use client";

import { useEffect, useState } from 'react';
import { PlusIcon, ExternalLinkIcon, Trash2Icon, GlobeIcon } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { apiCreateSite, apiDeleteSite, apiGetMySites } from '@/lib/api-sites';
import type { SiteSummary } from '@/lib/site-types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function BuilderDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    apiGetMySites()
      .then(setSites)
      .catch(() => toast.error('Failed to load sites'))
      .finally(() => setLoading(false));
  }, []);

  function handleNameChange(val: string) {
    setNewName(val);
    setNewSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }

  async function handleCreate() {
    if (!newName.trim() || !newSlug.trim()) return;
    setCreating(true);
    try {
      const site = await apiCreateSite(newName.trim(), newSlug.trim());
      toast.success('Site created!');
      router.push(`/builder/${site.id}` as any);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create site');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await apiDeleteSite(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
      toast.success('Site deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Websites</h1>
            <p className="mt-1 text-muted-foreground">
              Build, edit and publish your websites
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New Website
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Create New Website</h2>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Site Name</span>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Awesome Website"
                  className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Slug (URL identifier)</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) =>
                    setNewSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    )
                  }
                  placeholder="my-awesome-website"
                  className="rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim() || !newSlug.trim()}
                >
                  {creating ? 'Creating…' : 'Create'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowCreate(false); setNewName(''); setNewSlug(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading…</div>
        ) : sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/30 py-16 text-center">
            <GlobeIcon className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No websites yet. Create one!</p>
            <Button onClick={() => setShowCreate(true)} variant="outline">
              Create your first website
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{site.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      /{site.slug}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      site.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {site.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Updated{' '}
                  {new Date(site.updatedAt).toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/builder/${site.id}` as any)}
                  >
                    Edit
                  </Button>
                  <a
                    href={`/${locale}/sites/${site.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(site.id, site.name)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
