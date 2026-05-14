# Web deployer (edge Next template)

Next.js **App Router** app for **published** tenant sites: reads `Host`, calls the **main Devnex Nest API** (`GET /api/sites/public/by-host/:hostname`), renders block JSON like the in-app viewer.

There is **no separate Fastify service** — DNS points subdomains/custom domains at this stack; data comes from Postgres via the API.

## Requirements (main API)

1. **`ROOT_DOMAIN_WEB_BUILDER`** on the Nest backend (e.g. `web.arvidn.dev`). DNS records are created as `{slug}-web.arvidn.dev` (default template). The API resolves both `{slug}.web.arvidn.dev` and `{slug}-web.arvidn.dev` to the site with that `slug` (**published** + `SUBDOMAIN`).
2. **Custom domain** sites: `CUSTOM_DOMAIN` + `customDomain` set, **published**, host must match `customDomain`.
3. **CORS**: allow the edge origin in `CORS_ORIGIN` if browsers ever call the API from the client (this template fetches **server-side** only).

## Copy into your own repo

1. Copy `next-site-template/` (and optional `docker-compose.yml`).
2. Keep `lib/site-types.ts` aligned with builder JSON (`data.pages`, block types).

## Local dev

**Terminal 1 — Nest API** (repo root backend, port 5000).

**Terminal 2 — Edge Next**

```bash
cd next-site-template
npm install
cp .env.example .env.local
# Set SITE_API_URL=http://localhost:5000/api
npm run dev
```

Use a real tenant host (e.g. add to `hosts`: `127.0.0.1 myslug.web.arvidn.dev`) that matches a **published** site, or a custom domain you configured. Plain `localhost` will not match subdomain rules unless you add handling for that.

## Production (Docker)

From `web-deployer/`:

```bash
SITE_API_URL=https://api.yourdomain.com/api docker compose up --build
```

If the web-viewer and API containers share the same Docker network (`my-bridge-network`), use the **container name** as the host instead of a public URL:

```bash
# docker-compose.yml default — both containers on my-bridge-network
SITE_API_URL=http://devnex-api:5000/api docker compose up --build
```

Do **not** use `host.docker.internal` on Linux servers — it only resolves on Docker Desktop (Mac/Windows).

## Flow

1. **Middleware** sets `x-tenant-host` from `x-forwarded-host` or `Host`.
2. **Layout / pages** call `SITE_API_URL/sites/public/by-host/<hostname>` (`cache: 'no-store'`).
3. **Metadata + GTM** use `head`; body uses `data` + `PageRenderer`.

## Security

- Only **published** sites are returned.
- Do not expose internal API URLs on the client; `SITE_API_URL` is server-only.
