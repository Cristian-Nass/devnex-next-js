# wp-builder

Per-customer WordPress provisioner. Two services:

- **`server/`** — Fastify control plane (TypeScript, Prisma 7, PostgreSQL).
  Receives "create site" requests, talks to Cloudflare DNS + host
  Docker, runs `wp-cli core install`, and emails admin credentials.
- **`web/`** — Next.js 16 dashboard (App Router, `next-intl`, Tailwind v4,
  shadcn UI). The end-user UI. Lives in the root npm workspace alongside
  `web-builder` and `web-viewer`.

Each customer site is a dedicated Docker Compose stack
(MySQL + WordPress) attached to the shared **`wp-bridge-network`** behind
**`nginx-proxy`**. **TLS** terminates at **Cloudflare** (orange cloud).

## Identity

There is **no User table** in this project. Login lives on
`www.netmart.se`; both `server/` and `web/` validate the
**`netmart_session`** cookie against `${PLATFORM_API_URL}/auth/introspect`.

- `web/` uses `@netmart/auth-client`'s `requireUser()` in Server
  Components.
- `server/` uses an inline equivalent at
  `server/src/lib/platform-auth.ts` (Fastify lives outside the npm
  workspace so it can't import the package directly — but the contract
  is identical: `PlatformUser`, same endpoint).

## Repository layout

- [`server/`](server/) — Fastify API + Prisma. Owns the `Site` table.
- [`web/`](web/) — Next.js dashboard. Cross-origin fetch to `server/`
  with `credentials: "include"`.
- [`infra/site-docker-compose.yml`](infra/site-docker-compose.yml) —
  per-site stack (DB + WordPress + `wpcli` profile). Loaded by the
  control plane via `REPO_ROOT`.
- [`docker/php/`](docker/php/) — shared PHP overrides copied into each
  site's `.wp-builder/php/` at provision time.
- [`scripts/`](scripts/), [`deploy/`](deploy/) — host setup helpers.
- [`docker-compose.yml`](docker-compose.yml) — control-plane stack: the
  Fastify api + the Next.js web service.

## Local development

```bash
# 1. Install everything from the monorepo root
cd ../             # if you started inside wp-builder/
npm install        # installs root workspaces (incl. wp-builder/web)
cd wp-builder/server && npm install   # standalone — has its own lockfile

# 2. Start the platform (in another terminal — wp-builder needs it)
cd netmart && yarn workspace backend start:dev      # netmart-api on :5000

# 3. Run the wp-builder API (Fastify, port 3001 by default)
cd wp-builder/server && npm run dev

# 4. Run the wp-builder dashboard (Next, port 3003)
cd ../../   # back to the monorepo root
npm run dev --workspace=wp-builder-web
```

> If `web-builder` is also running (also defaults to 3001), give the
> Fastify server a different port: `PORT=3010 npm run dev` and update
> `wp-builder/web/.env`'s `NEXT_PUBLIC_WP_BUILDER_API_URL`.

Open http://localhost:3003 — the proxy bounces you to netmart's login
on http://localhost:3000 if you don't have a session yet.

## Server prerequisites (Ubuntu host)

1. **Docker** + **Docker Compose v2**, user running the API in group
   **`docker`** (socket access).
2. **`nginx-proxy`** attached to **`wp-bridge-network`** (HTTP to
   origin; TLS at Cloudflare).
3. **DNS**: Cloudflare zone for **`ROOT_DOMAIN`** (apex), e.g. zone
   **`netmart.se`** → tenant sites **`*.wp.netmart.se`**.
4. **Cloudflare API token** with **Zone → DNS → Edit** on that zone;
   **`CLOUDFLARE_ZONE_ID`** from the zone overview.
5. **PostgreSQL** reachable from wherever the API runs. Set
   **`DATABASE_URL`** in **`server/.env.prod`**.
6. **SMTP** for outbound mail (transactional provider recommended).

```bash
sudo mkdir -p /opt/wp-builder /home/wordpress/websites
sudo chown -R "$USER:$USER" /opt/wp-builder /home/wordpress/websites
```

## Configuration

| File | Notes |
| --- | --- |
| `server/.env.prod` | `DATABASE_URL`, `PLATFORM_API_URL`, `WEB_ORIGIN` (the public dashboard URL), Cloudflare creds, SMTP, `ROOT_DOMAIN`, `SERVER_PUBLIC_IP`, `VIRTUAL_HOST` (for nginx-proxy) |
| `web/.env.prod` | `PLATFORM_API_URL`, `NEXT_PUBLIC_PLATFORM_FRONTEND_URL`, `NEXT_PUBLIC_WP_BUILDER_API_URL`, `VIRTUAL_HOST` |

There is **no `JWT_SECRET`** in `server/.env.prod` anymore — netmart's
backend issues and validates sessions.

## Production

The single compose file builds and runs both services:

```bash
# from the monorepo root
docker compose -f wp-builder/docker-compose.yml up -d --build
```

CI deploys it via [`.github/workflows/deploy-wp-builder.yml`](../.github/workflows/deploy-wp-builder.yml).

## Provisioning details

A `POST /api/sites` (authenticated) creates a row, fires `provisionSite`
in the background, and returns 202. The background job:

1. Creates the Cloudflare A record (`<slug>-<ROOT_DOMAIN>`).
2. Creates `WEBSITES_ROOT/<slug>/{wp,mysql,.wp-builder/php}/` and writes
   a per-site `.env`.
3. `docker compose up -d` for project `wp-<slug>` against
   `infra/site-docker-compose.yml`.
4. Waits for WordPress core files, runs `wp-cli core install`, then
   `chown -R www-data:www-data /var/www/html/wp-content`.
5. Updates the `Site` row to `READY` and emails admin credentials to
   the netmart user (email comes from the introspected session — see
   `provisionSite(siteId, adminEmail)` in
   [`server/src/provision.ts`](server/src/provision.ts)).

If anything in steps 1-4 fails the job marks the row `FAILED`, runs
`docker compose down --volumes`, deletes the site root, and removes the
DNS record.

## Deleting a site

`DELETE /api/sites/:id` (authenticated). The API runs
`docker compose down`, removes the site root, deletes the Cloudflare A
record, and removes the `Site` row. Disabled while `PROVISIONING`.

## Database access

phpMyAdmin used to be exposed per site at `https://db-<slug>.<ROOT_DOMAIN>`
but was removed because keeping a public DB admin UI alive 24/7 per
tenant is unacceptable attack surface. For ad-hoc access, exec into the
**`db`** service of the relevant tenant stack:

```bash
SITE_ROOT=$WEBSITES_ROOT/<slug>
source $SITE_ROOT/.env
docker compose -p wp-<slug> -f infra/site-docker-compose.yml --env-file $SITE_ROOT/.env \
  exec db mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"
```

## Production notes

- **TLS / Cloudflare**: Terminate HTTPS at Cloudflare (orange cloud is
  the default via `CLOUDFLARE_DNS_PROXIED=true`). Origin nginx-proxy
  serves HTTP; WordPress still sees `X-Forwarded-Proto: https` from
  Cloudflare so admin URLs stay correct (see
  [`docker/php/wp-config-extra.php`](docker/php/wp-config-extra.php)).
- **Security**: The API must run on a trusted host; it shells out to
  `docker compose` and writes secrets + WP/MySQL data under
  `WEBSITES_ROOT/<slug>/`.
- **Database**: Prisma 7 reads `DATABASE_URL` from
  [`server/prisma.config.ts`](server/prisma.config.ts) for Migrate; the
  runtime client uses `@prisma/adapter-pg`
  ([`server/src/db.ts`](server/src/db.ts)) — `url` in `schema.prisma`
  is not allowed in Prisma 7.

## Troubleshooting

### Provisioning writes `.env` as root → SSH user can't read

Provisioning writes each site `.env` as **root** in the API container
with mode `0600`. Set `WEBSITES_ENV_OWNER_UID` and
`WEBSITES_ENV_OWNER_GID` in `server/.env.prod` to your SSH user's
`id -u` / `id -g` so new sites get `chown` automatically. For existing
sites: `sudo chown wordpress:wordpress "$SITE/.env"`.

### WordPress uploads — "could not be moved to wp-content/uploads"

Apache runs as `www-data` (UID 33). New sites get the chown
automatically. For existing sites:

```bash
sudo find /home/wordpress/websites -mindepth 1 -maxdepth 3 -type d -name wp-content -exec chown -R 33:33 {} +
```

### Prisma `P1013` (`DATABASE_URL`)

Use a `postgresql://…` URI reachable from **inside** the container
(`host.docker.internal`, LAN IP, or service name — not `localhost`
unless Postgres is in the same container).

### `migrate deploy`: "No migration found in prisma/migrations"

Verify the migration `.sql` files are committed to git, then
`docker compose -f wp-builder/docker-compose.yml build api --no-cache &&
docker compose -f wp-builder/docker-compose.yml up -d api`.

## Manual backups

Use [`scripts/backup-db.sh`](scripts/backup-db.sh) against a single
manual stack if needed; per-site dumps can be added similarly using each
project's compose project name.
