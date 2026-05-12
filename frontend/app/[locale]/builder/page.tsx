'use client';

import { useEffect, useState } from 'react';
import { GlobeIcon, Link2Icon, ArrowLeftIcon } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { apiCreateSite, apiGetMySites } from '@/lib/api-sites';
import type { ProvisioningType } from '@/lib/site-types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Choice = null | ProvisioningType;

export default function BuilderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState<Choice>(null);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [gtmContainerId, setGtmContainerId] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiGetMySites()
      .then((sites) => {
        if (cancelled) return;
        if (sites.length >= 1) {
          router.replace(`/builder/${sites[0].id}`);
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load sites');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleNameChange(val: string) {
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }

  function resetForm() {
    setName('');
    setSlug('');
    setCustomDomain('');
    setMetaTitle('');
    setMetaDescription('');
    setGtmContainerId('');
  }

  async function handleConfirm() {
    if (!choice) return;
    if (!name.trim() || !slug.trim()) {
      toast.error('Site name and slug are required');
      return;
    }
    if (choice === 'CUSTOM_DOMAIN' && !customDomain.trim()) {
      toast.error('Enter your custom domain');
      return;
    }

    setCreating(true);
    try {
      const site = await apiCreateSite({
        name: name.trim(),
        slug: slug.trim(),
        provisioningType: choice,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        gtmContainerId: gtmContainerId.trim() || undefined,
        customDomain:
          choice === 'CUSTOM_DOMAIN' ? customDomain.trim().toLowerCase() : undefined,
      });
      toast.success('Site created');
      router.push(`/builder/${site.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create site');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20 text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!choice) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create your site</h1>
            <p className="mt-2 text-muted-foreground">
              Choose how your site will be served. You can have one site per account.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-2 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Link2Icon className="h-5 w-5" />
                </div>
                <CardTitle>Subdomain</CardTitle>
                <CardDescription>
                  Host on a subdomain of our platform. Fast to set up — point DNS later if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>SSL and routing on our edge</li>
                  <li>Unique slug for your tenant URL</li>
                  <li>Best for demos and MVPs</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setChoice('SUBDOMAIN')}>
                  Continue with subdomain
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <GlobeIcon className="h-5 w-5" />
                </div>
                <CardTitle>Custom domain</CardTitle>
                <CardDescription>
                  Bring your own domain. You will configure DNS when you go live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Branded URL (e.g. www.yourbusiness.com)</li>
                  <li>Same builder and publishing flow</li>
                  <li>DNS verification in production</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setChoice('CUSTOM_DOMAIN')}
                >
                  Continue with custom domain
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const subdomainBase =
    process.env.NEXT_PUBLIC_PLATFORM_SUBDOMAIN_BASE ?? 'sites.example.com';

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto max-w-lg px-4">
        <button
          type="button"
          onClick={() => {
            setChoice(null);
            resetForm();
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <h1 className="mb-2 text-2xl font-bold">
          {choice === 'SUBDOMAIN' ? 'Subdomain site' : 'Custom domain site'}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {choice === 'SUBDOMAIN'
            ? `Example hosted URL: https://${slug || 'your-slug'}.${subdomainBase}`
            : 'Enter your domain. You can change DNS instructions later from site settings.'}
        </p>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site name</Label>
            <Input
              id="site-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My coffee shop"
            />
            <p className="text-xs text-muted-foreground">
              Must be unique (not used by another site), ignoring spaces and letter case.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-slug">Slug</Label>
            <Input
              id="site-slug"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }
              placeholder="my-coffee-shop"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {choice === 'CUSTOM_DOMAIN' && (
            <div className="space-y-2">
              <Label htmlFor="custom-domain">Custom domain</Label>
              <Input
                id="custom-domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="www.example.com"
                className="font-mono text-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta title (optional)</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Overrides browser tab title when set"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-desc">Meta description (optional)</Label>
            <textarea
              id="meta-desc"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Short description for search and social previews"
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gtm">Google Tag Manager container ID (optional)</Label>
            <Input
              id="gtm"
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleConfirm} disabled={creating}>
              {creating ? 'Creating…' : 'Create site & open builder'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setChoice(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
