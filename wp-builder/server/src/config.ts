import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),

  /**
   * Origin of the wp-builder Next.js dashboard (e.g. `https://wp.netmart.se`).
   * Used by CORS — the dashboard makes credentialed cross-origin fetches to
   * this API and the browser refuses to send the `netmart_session` cookie
   * unless the origin is explicitly allow-listed.
   */
  WEB_ORIGIN: z.string().url(),

  /**
   * Base URL of netmart's API including the `/api` prefix (e.g.
   * `https://api.netmart.se/api`). Used by `lib/platform-auth.ts` to
   * validate the `netmart_session` cookie via `/auth/introspect`.
   */
  PLATFORM_API_URL: z.string().url(),

  /**
   * Repo root as seen by this API process — used to locate `infra/site-docker-compose.yml`.
   * When the API runs inside Docker, set this to the in-container mount (e.g. `/opt/wp-builder`), not the host path.
   */
  REPO_ROOT: z.string().min(1),
  /** Each site is stored at WEBSITES_ROOT/<slug>/ (wp/, mysql/, .env). Example: /home/wordpress/websites */
  WEBSITES_ROOT: z.string().min(1),
  /**
   * Optional: host UID/GID for each site's `.env` after write (API container runs as root).
   * Set to the user that runs `docker compose` on the host (e.g. output of `id -u wordpress` / `id -g wordpress`) so SSH sessions can read `--env-file`.
   */
  WEBSITES_ENV_OWNER_UID: z.coerce.number().int().positive().optional(),
  WEBSITES_ENV_OWNER_GID: z.coerce.number().int().positive().optional(),
  ROOT_DOMAIN: z.string().min(3),
  SERVER_PUBLIC_IP: z.string().min(7),
  /**
   * Whether to orange-cloud DNS records through Cloudflare (TLS termination at Cloudflare edge).
   * Set to "false" or "0" for DNS-only A records. Defaults to "true" (proxied on).
   */
  CLOUDFLARE_DNS_PROXIED: z
    .string()
    .optional()
    .default("true")
    .transform((v) => v !== "false" && v !== "0"),
  CLOUDFLARE_API_TOKEN: z.string().min(10).transform((s) => s.trim()),
  CLOUDFLARE_ZONE_ID: z.string().min(10).transform((s) => s.trim()),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(3),
  /**
   * Enable per-site disk quotas using Linux ext4 project quotas.
   * Requires the host filesystem to have prjquota mount option and quota tools installed.
   * Run scripts/setup-quotas.sh once on the host before enabling.
   */
  QUOTA_ENABLED: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
  /** Default disk quota in GB for each new site. Can be overridden per site via the API. */
  SITE_DISK_QUOTA_GB: z.coerce.number().int().positive().default(5),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export function composePaths() {
  const composeFile = `${env.REPO_ROOT.replace(/\\/g, "/")}/infra/site-docker-compose.yml`;
  return { composeFile };
}
