const RESERVED = new Set([
  "www",
  "api",
  "admin",
  "mail",
  "ftp",
  "cdn",
  "static",
  "app",
  "dashboard",
  "wp",
  "mysql",
  "db",
  "ssh",
  "smtp",
  "imap",
  "pop",
  "root",
  "support",
  "help",
  "status",
  "billing",
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateSlug(slug: string): string | null {
  // DNS label is capped at 63 chars; reserve a little headroom for safety.
  if (slug.length < 3 || slug.length > 60) return "Slug must be 3–60 characters.";
  if (!SLUG_RE.test(slug)) {
    return "Use lowercase letters, digits, and hyphens only (no leading/trailing hyphen).";
  }
  if (RESERVED.has(slug)) return "This name is reserved.";
  return null;
}

export function dockerProjectName(slug: string): string {
  return `wp-${slug}`;
}
