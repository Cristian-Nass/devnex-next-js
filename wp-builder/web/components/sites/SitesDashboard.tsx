"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api, type Meta, type SiteRow } from "@/lib/api";

const POLL_INTERVAL_MS = 4_000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

function formatGb(bytes: string): string {
  const gb = Number(BigInt(bytes)) / (1024 * 1024 * 1024);
  return gb < 0.1 ? "<0.1" : gb.toFixed(1);
}

function statusTone(status: SiteRow["status"]): string {
  switch (status) {
    case "READY":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400";
    case "PROVISIONING":
    case "PENDING":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400";
    case "FAILED":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function UsageBar({ site }: { site: SiteRow }) {
  const t = useTranslations("WpBuilder");
  const usedGb = Number(BigInt(site.diskUsageBytes)) / (1024 * 1024 * 1024);
  const pct = Math.min(100, (usedGb / site.diskQuotaGb) * 100);
  const over = pct >= 100;
  const warn = pct >= 90;
  return (
    <div
      className="space-y-1"
      title={t("diskUsedTitle", {
        used: formatGb(site.diskUsageBytes),
        quota: site.diskQuotaGb,
      })}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            over
              ? "bg-destructive"
              : warn
                ? "bg-amber-500"
                : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={cn(
          "text-xs text-muted-foreground",
          over && "text-destructive",
          warn && !over && "text-amber-700 dark:text-amber-400",
        )}
      >
        {formatGb(site.diskUsageBytes)} / {site.diskQuotaGb} GB
        {over ? ` · ${t("diskOverQuota")}` : ""}
      </p>
    </div>
  );
}

export function SitesDashboard() {
  const t = useTranslations("WpBuilder");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [quotaDraft, setQuotaDraft] = useState<Record<string, string>>({});
  const [quotaSaving, setQuotaSaving] = useState<string | null>(null);

  const pollStartRef = useRef<number | null>(null);

  const loadSites = useCallback(async () => {
    const data = await api<{ sites: SiteRow[] }>("/api/sites");
    setSites(data.sites);
  }, []);

  useEffect(() => {
    api<Meta>("/api/public/meta")
      .then(setMeta)
      .catch(() => setMeta({ rootDomain: "your-domain.com" }));
  }, []);

  useEffect(() => {
    loadSites().catch((err) =>
      toast.error(err instanceof Error ? err.message : t("errors.loadFailed")),
    );
  }, [loadSites, t]);

  useEffect(() => {
    const needsPoll = sites.some(
      (s) => s.status === "PENDING" || s.status === "PROVISIONING",
    );

    if (!needsPoll) {
      pollStartRef.current = null;
      setPollTimedOut(false);
      return;
    }

    if (pollStartRef.current === null) {
      pollStartRef.current = Date.now();
    }

    if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
      setPollTimedOut(true);
      return;
    }

    const id = window.setInterval(() => {
      void loadSites().catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [sites, loadSites]);

  async function createSite(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api("/api/sites", {
        method: "POST",
        body: JSON.stringify({ slug }),
      });
      setSlug("");
      toast.success(t("success.created"));
      await loadSites();
    } catch (ex) {
      toast.error(
        ex instanceof Error ? ex.message : t("errors.createFailed"),
      );
    } finally {
      setCreating(false);
    }
  }

  async function deleteSite(s: SiteRow) {
    const ok = window.confirm(t("deleteConfirm", { slug: s.slug }));
    if (!ok) return;
    setDeletingId(s.id);
    try {
      await api(`/api/sites/${encodeURIComponent(s.id)}`, { method: "DELETE" });
      toast.success(t("success.deleted", { slug: s.slug }));
      await loadSites();
    } catch (ex) {
      toast.error(
        ex instanceof Error ? ex.message : t("errors.deleteFailed"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function updateQuota(s: SiteRow) {
    const raw = quotaDraft[s.id];
    const gb = parseInt(raw ?? String(s.diskQuotaGb), 10);
    if (!gb || gb < 1 || gb > 500) {
      toast.error(t("errors.quotaRange"));
      return;
    }
    setQuotaSaving(s.id);
    try {
      await api(`/api/sites/${encodeURIComponent(s.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ diskQuotaGb: gb }),
      });
      toast.success(t("success.quotaUpdated", { slug: s.slug, gb }));
      setQuotaDraft((d) => {
        const n = { ...d };
        delete n[s.id];
        return n;
      });
      await loadSites();
    } catch (ex) {
      toast.error(
        ex instanceof Error ? ex.message : t("errors.quotaUpdateFailed"),
      );
    } finally {
      setQuotaSaving(null);
    }
  }

  const preview =
    slug.trim() && meta
      ? `${slug.trim().toLowerCase().replace(/\s+/g, "-")}-${meta.rootDomain}`
      : "";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("createHeading")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={createSite}
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="slug">{t("slugLabel")}</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t("slugPlaceholder")}
                autoComplete="off"
                required
              />
              {preview ? (
                <p className="text-xs text-muted-foreground">
                  {t("previewPrefix")}:{" "}
                  <code className="font-mono text-foreground">
                    https://{preview}
                  </code>
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              disabled={creating || deletingId !== null}
              size="lg"
            >
              {creating ? t("creating") : t("createSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sitesHeading")}</CardTitle>
          {pollTimedOut ? (
            <CardDescription className="text-destructive">
              {t("pollTimedOut")}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noSites")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {sites.map((s) => {
                const draftGb = quotaDraft[s.id] ?? String(s.diskQuotaGb);
                const draftChanged = parseInt(draftGb, 10) !== s.diskQuotaGb;
                return (
                  <li key={s.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-base">{s.slug}</strong>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                              statusTone(s.status),
                            )}
                          >
                            {t(`status.${s.status}`)}
                          </span>
                        </div>
                        <a
                          href={`https://${s.fqdn}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
                        >
                          https://{s.fqdn}
                          <ExternalLink className="size-3" />
                        </a>
                        {s.wpAdminUsername ? (
                          <p className="text-xs text-muted-foreground">
                            {t("wpAdminUserLabel")}:{" "}
                            <code className="font-mono">
                              {s.wpAdminUsername}
                            </code>
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={
                          deletingId !== null || s.status === "PROVISIONING"
                        }
                        onClick={() => void deleteSite(s)}
                      >
                        <Trash2 className="size-3.5" />
                        {deletingId === s.id ? t("deleting") : t("delete")}
                      </Button>
                    </div>

                    {s.provisionError ? (
                      <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {s.provisionError}
                      </p>
                    ) : null}

                    {s.status === "READY" ? <UsageBar site={s} /> : null}

                    <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`quota-${s.id}`}>
                          {t("diskQuotaLabel")}
                        </Label>
                        <Input
                          id={`quota-${s.id}`}
                          type="number"
                          min={1}
                          max={500}
                          value={draftGb}
                          onChange={(e) =>
                            setQuotaDraft((d) => ({
                              ...d,
                              [s.id]: e.target.value,
                            }))
                          }
                          className="w-28"
                        />
                      </div>
                      {draftChanged ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={quotaSaving === s.id}
                          onClick={() => void updateQuota(s)}
                        >
                          {quotaSaving === s.id
                            ? t("savingQuota")
                            : t("updateQuota")}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
