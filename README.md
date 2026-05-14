# netmart monorepo

Top-level workspace for **netmart** (the platform) and its sibling SaaS
products. Each app deploys independently — [Turbo](https://turborepo.com)
orchestrates dev / build / lint / typecheck and caches per-package output
so changing one app never rebuilds the others.

> **Design goal:** "avoid a big build process". Touching `web-builder/`
> only rebuilds web-builder. Touching `packages/*` rebuilds the two
> consumers (web-builder + web-viewer). Touching `netmart/` or
> `wp-builder/` only rebuilds *that* project — they live outside the
> Turbo workspace on purpose.

---

## 1. Layout

```
netmart/                      # this directory (monorepo root)
├── packages/                 # shared TypeScript-source workspaces (no build step)
│   ├── auth-client/          # @netmart/auth-client — server-side session helper
│   └── builder-core/         # @netmart/builder-core — shared block types + renderer
│
├── netmart/                  # platform: identity, billing, admin (yarn workspaces)
│   ├── backend/              #   NestJS API           → api.netmart.se
│   └── frontend/             #   Next.js marketing+login → www.netmart.se
│
├── web-builder/              # visual site editor (Next 16) → builder.netmart.se
├── web-viewer/               # public site renderer (Next 16) → *.web.netmart.se
│
├── wp-builder/               # per-customer WordPress provisioner → wp.netmart.se
│   ├── server/               #   Fastify control-plane (standalone, NOT a workspace)
│   └── web/                  #   Next.js dashboard (root workspace)
│
├── tools/                    # one-off scripts (data migrations, maintenance)
├── package.json              # root: workspaces + turbo scripts
├── turbo.json                # turbo pipeline definitions
└── .github/workflows/        # CI (paths-filtered) + per-project deploys
```

### Which apps are inside Turbo?

| App | In Turbo workspace? | Why |
| --- | --- | --- |
| `packages/auth-client` | ✅ | Source-only TS package, consumed by sibling apps via `transpilePackages`. |
| `packages/builder-core` | ✅ | Same. |
| `web-builder` | ✅ | New Next 16 app authored inside the monorepo. |
| `web-viewer` | ✅ | New Next 16 app authored inside the monorepo. |
| `wp-builder/web` | ✅ | Next 16 dashboard for the WordPress provisioner. Uses `@netmart/auth-client`. |
| `netmart/` (backend + frontend) | ❌ — own yarn workspaces | Pre-existing internal workspace setup. Has its own `yarn dev`/`yarn build`. |
| `wp-builder/server` | ❌ — own `package.json` + lockfile | Fastify control plane (needs docker-cli at runtime). Inlines its own introspect helper that mirrors `@netmart/auth-client`. |

The two "outside" projects still ship from this monorepo and have their
own root-level GitHub Actions deploy workflows; they just don't share
Turbo's task graph.

### Service responsibilities

| Concern | Owner | Notes |
| --- | --- | --- |
| Identity (users, auth, sessions) | `netmart/backend` | Single source of truth. Issues JWT + `netmart_session` cookie on `Domain=.netmart.se`. |
| Billing / subscriptions / entitlements | `netmart/backend` | Plans + entitlement checks live here for every SaaS product. |
| `Site` rows | `web-builder` | Owns its own Postgres after the split. |
| Published site rendering | `web-viewer` | Stateless. Pulls payload from `web-builder`'s `/api/sites/public/by-host/:host`. |
| WordPress provisioning | `wp-builder/server` | Fastify control plane. Own Postgres + own Docker host. Validates `netmart_session` against netmart-API via `/auth/introspect`. |
| WordPress dashboard UI | `wp-builder/web` | Next.js 16 app (sister to `web-builder`). Uses `@netmart/auth-client` for `requireUser()`; calls the Fastify API cross-origin with `credentials: "include"`. |

---

## 2. Shared authentication (read once, never reimplement)

All apps trust **netmart/backend** as the identity provider:

1. User logs in on `www.netmart.se` → `netmart-api` sets the
   `netmart_session` HTTP-only cookie on `Domain=.netmart.se`.
2. Any sibling app receives that cookie automatically because the
   browser sends every cookie that matches the parent domain.
3. The sibling app validates the cookie by calling
   `GET ${PLATFORM_API_URL}/auth/introspect` (server-to-server).
4. The helper `@netmart/auth-client` (`requireUser` / `getUserOrNull` /
   `hasRole`) wraps that call for Next.js server components and route
   handlers. **Always use the helper** — never roll your own.

Two env vars per sibling app drive the integration:

- `PLATFORM_API_URL` (server-side) — base URL of netmart-API, e.g.
  `https://api.netmart.se/api`.
- `NEXT_PUBLIC_PLATFORM_FRONTEND_URL` (client-side) — login redirect
  target, e.g. `https://www.netmart.se`.

---

## 3. Dev URLs (local)

| App | Port | URL |
| --- | --- | --- |
| netmart frontend | 3000 | http://localhost:3000 |
| netmart backend | 5000 | http://localhost:5000/api |
| **web-builder** | 3001 | http://localhost:3001/{en\|sv}/builder |
| web-viewer | 3002 | http://localhost:3002 (host-driven; usually behind nginx-proxy locally) |
| **wp-builder web** | 3003 | http://localhost:3003/{en\|sv}/sites |
| wp-builder API (Fastify) | 3001\* | http://localhost:3001/api |

\* Fastify and web-builder both default to port 3001 in dev. If you run
them at the same time, change one (e.g. `PORT=3010 npm run dev` in
`wp-builder/server`, then point `wp-builder/web/.env`'s
`NEXT_PUBLIC_WP_BUILDER_API_URL` at `http://localhost:3010`).

---

## 4. Quick start

### 4.1. One-time bootstrap

```bash
# from the monorepo root
npm install                      # installs packages/* + web-builder + web-viewer

cd netmart && yarn install       # installs netmart/{backend,frontend}
cd ../wp-builder/server && npm install
cd ../web && npm install
```

You'll also need:

- Node ≥ 20 (declared in root `package.json#engines`).
- Postgres (one DB for netmart, one for web-builder, one for wp-builder).
- Docker — only required for production-style runs.

### 4.2. Run a single app in dev

Two equivalent ways. Pick whichever is more familiar:

```bash
# Workspace-aware npm (fastest, no Turbo overhead)
npm run dev --workspace=web-builder
npm run dev --workspace=web-viewer
npm run dev --workspace=wp-builder-web

# Turbo (computes its own dep graph; rebuilds workspace packages if needed)
npx turbo run dev --filter=web-builder
npx turbo run dev --filter=wp-builder-web
```

For the projects outside Turbo:

```bash
# netmart (yarn workspaces)
cd netmart
yarn workspace backend start:dev          # NestJS, port 5000
yarn workspace frontend dev               # Next.js, port 3000

# wp-builder Fastify control plane (standalone, NOT a root workspace)
cd wp-builder/server && npm install && npm run dev       # Fastify, port 3001 by default
```

### 4.3. Run everything at once

```bash
npm run dev          # `turbo run dev --parallel` — starts every Turbo app
```

This will *not* start netmart or `wp-builder/server`. Run those in
separate terminals as shown above.

---

## 5. Building

### 5.1. Build commands

```bash
# Build the whole monorepo (Turbo handles ordering + caching).
npm run build

# Build just one app and its workspace deps.
npm run build:builder        # web-builder + packages it imports
npm run build:viewer         # web-viewer  + packages it imports
npm run build:packages       # only packages/*

# Static checks
npm run typecheck
npm run lint
```

For the projects outside Turbo:

```bash
cd netmart && yarn workspace backend build   # nest build (incl. prisma generate)
cd netmart && yarn workspace frontend build  # next build

cd wp-builder/server && npm run build        # tsc (Fastify control plane)
```

The Next.js dashboard at `wp-builder/web` is a root workspace — build it
with `npm run build --workspace=wp-builder-web` (or `npx turbo run build
--filter=wp-builder-web...`).

### 5.2. Production (Docker)

Each Turbo app ships its own `Dockerfile` + `docker-compose.yml`. The
build context is the **monorepo root** so the workspace `packages/*` are
visible:

```bash
# from monorepo root
docker compose -f web-builder/docker-compose.yml --env-file web-builder/.env.prod up -d --build
docker compose -f web-viewer/docker-compose.yml  --env-file web-viewer/.env.prod  up -d --build

# wp-builder is a single compose file with two services (api + web).
# The web service uses workspace-root build context for @netmart/auth-client.
docker compose -f wp-builder/docker-compose.yml up -d --build

# netmart has its own internal compose file
docker compose -f netmart/docker-compose.yml up -d --build
```

GitHub Actions deploys do the same via SSH + SCP — see
`.github/workflows/deploy-*.yml`.

---

## 6. Environment ownership

Each project owns its own `.env`. **Never** copy secrets across apps —
the only cross-app variable is `PLATFORM_API_URL`, which is a public
HTTPS endpoint, not a secret.

| File | Owner | Highlights |
| --- | --- | --- |
| `netmart/backend/.env.prod` | netmart-api | `DATABASE_URL`, `JWT_SECRET`, `COOKIE_DOMAIN=.netmart.se`, Google OAuth |
| `netmart/frontend/.env.prod` | netmart-web | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEB_BUILDER_URL`, `VIRTUAL_HOST` |
| `web-builder/.env.prod` | web-builder | own `DATABASE_URL`, `PLATFORM_API_URL`, Cloudflare DNS creds |
| `web-viewer/.env` | web-viewer | `SITE_API_URL` → web-builder's `/api` |
| `wp-builder/server/.env.prod` | wp-builder-api | own `DATABASE_URL`, `PLATFORM_API_URL`, `WEB_ORIGIN`, Cloudflare DNS, SMTP. **No JWT secret** — netmart owns identities. |
| `wp-builder/web/.env.prod` | wp-builder-web | `PLATFORM_API_URL`, `NEXT_PUBLIC_PLATFORM_FRONTEND_URL`, `NEXT_PUBLIC_WP_BUILDER_API_URL` |
| repo root | (none) | No root `.env` — secrets live with the project that needs them. |

---

## 7. Adding a new SaaS product

Two supported patterns. Pick the one that matches your stack.

### 7.1. Pattern A — Next.js SaaS inside Turbo (like `web-builder`)

Best fit: a new Next.js app written in the monorepo that should share
auth, share Turbo's cache, and ship the same Docker / Actions stack.
End-to-end checklist:

1. **Scaffold the app at the repo root.**

   ```bash
   npx create-next-app@latest my-saas --ts --app --eslint --tailwind
   ```

2. **Pick a free port** (currently used: 3000, 3001, 3002, 3003, 5000).
   Use, say, 3004. Update `package.json#scripts`:

   ```jsonc
   {
     "scripts": {
       "dev":       "next dev -p 3003",
       "build":     "next build",
       "start":     "next start -p 3003",
       "lint":      "eslint",
       "typecheck": "tsc --noEmit"
     }
   }
   ```

3. **Register it as a workspace.** Root `package.json`:

   ```jsonc
   {
     "workspaces": [
       "packages/*",
       "web-builder",
       "web-viewer",
       "my-saas"
     ]
   }
   ```

4. **Wire shared auth.** Add to `my-saas/package.json`:

   ```jsonc
   "dependencies": {
     "@netmart/auth-client": "file:../packages/auth-client"
   }
   ```

   And in `my-saas/next.config.ts`:

   ```ts
   import path from "node:path";
   const nextConfig = {
     output: "standalone",
     outputFileTracingRoot: path.join(__dirname, ".."),
     transpilePackages: ["@netmart/auth-client"],
   };
   export default nextConfig;
   ```

   Set `preserveSymlinks: true` in `my-saas/tsconfig.json` (otherwise
   TypeScript can't resolve `react/jsx-runtime` when it walks into the
   linked package's source — same fix web-builder uses).

5. **Add a `proxy.ts` for auth-gating.** Copy from
   `web-builder/proxy.ts` and trim the locale logic if you don't need
   i18n. The pattern is: redirect unauthenticated requests to
   `${NEXT_PUBLIC_PLATFORM_FRONTEND_URL}/${locale}/login?redirectTo=…`.

6. **Use the auth helper inside route handlers / server components:**

   ```ts
   import { requireUser } from "@netmart/auth-client";

   export async function GET(req: Request) {
     const user = await requireUser(req);
     // user.id, user.email, user.roles
   }
   ```

7. **(Optional) Add a dedicated database.** Copy the pattern from
   `web-builder/prisma/`:

   ```
   my-saas/
   ├── prisma/
   │   ├── schema.prisma            # datasource db { provider = "postgresql" }
   │   ├── prisma.config.ts
   │   └── migrations/...
   └── lib/prisma.ts                # client singleton
   ```

   Add `npm run prisma:generate`, `prisma:migrate:dev`, and
   `prisma:migrate:deploy` scripts to `package.json` (verbatim from
   `web-builder/package.json`). Wire `prisma generate` into your
   `build` script:

   ```jsonc
   "build": "prisma generate && next build"
   ```

8. **Add the env files** at `my-saas/.env`, `my-saas/.env.example`, and
   `my-saas/.env.prod.example`. Required keys for any sibling app:

   ```env
   PLATFORM_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_PLATFORM_FRONTEND_URL=http://localhost:3000
   # + your own DATABASE_URL, VIRTUAL_HOST, etc.
   ```

9. **Add Docker.** Copy `web-builder/Dockerfile`,
   `web-builder/.dockerignore`, and `web-builder/docker-compose.yml`
   into `my-saas/`. Search-and-replace `web-builder` → `my-saas` and
   update the port. The Dockerfile already does the right thing with
   the monorepo build context — leave that untouched.

10. **Hook into root CI.** Edit `.github/workflows/ci.yml`:

    - Add a `my-saas` output on the `detect` job.
    - Add a `my-saas` filter under `paths-filter` (include
      `my-saas/**`, `packages/**`, `package.json`,
      `package-lock.json`, `turbo.json` — same set as web-builder).
    - Add a `my-saas:` job that runs
      `npx turbo run lint build --filter=my-saas...`.

11. **Add the deploy workflow.** Copy
    `.github/workflows/deploy-web-builder.yml` to
    `.github/workflows/deploy-my-saas.yml`. Update the `paths:` filter,
    `concurrency.group`, the compose file path, and the build/up
    service name. Make sure `my-saas/.env.prod` exists on the server
    (the workflow refuses to deploy without it).

12. **DNS + reverse proxy.** Point `my-saas.netmart.se` (or whatever
    subdomain you pick) at the server. Because the cookie is on
    `Domain=.netmart.se`, no additional auth wiring is needed.

13. **(Optional) Surface it on the marketing site.** Add the new
    product to `netmart/frontend/components/main-sections/Products.tsx`
    with a link to the new subdomain (see how `NEXT_PUBLIC_WEB_BUILDER_URL`
    is used as a template).

Done. The new app shows up in `npm run dev`, in `npm run build`, and in
CI, and its deploys are independent.

### 7.2. Pattern B — Self-contained service (like `wp-builder`)

Best fit: a service that needs a stack outside the Node/Next world, or
that needs total isolation from the Turbo cache (e.g. Go, Rust, Python,
or a multi-process setup with its own server/+web split).

1. **Drop the project at the repo root**, e.g. `my-service/`. Keep its
   own `package.json` (don't add it to root `workspaces`). For the
   wp-builder style two-package layout, give it `server/` and `web/`
   with their own `package.json`'s and lockfiles.

2. **Re-implement the auth check inline.** You can't import
   `@netmart/auth-client` from outside the Turbo workspace, but the
   logic is ~20 lines: read the `netmart_session` cookie, send it as
   `Cookie: netmart_session=…` to `GET ${PLATFORM_API_URL}/auth/introspect`,
   take the `200 OK` body as the user. Copy this pattern from
   `packages/auth-client/src/index.ts`.

3. **Add its own Dockerfile + docker-compose.yml** inside the project
   (see `wp-builder/server/Dockerfile`). Build context is the project
   directory, not the monorepo root.

4. **Hook into root CI** by adding another filter + job to
   `.github/workflows/ci.yml` (same pattern as `wp-builder` already
   uses). Don't rely on Turbo here — call the project's own
   `npm run build` / `yarn build` / `go build` directly.

5. **Add a root-level deploy workflow** under `.github/workflows/`
   (see `.github/workflows/deploy-web-builder.yml` and the existing
   per-project `deploy.yml`s inside `netmart/` and `wp-builder/` for
   reference). Per-project `.github/workflows/deploy.yml` files inside
   sub-directories are **not** picked up by GitHub Actions on a
   monorepo — they must live at the repo root.

6. **DNS + reverse proxy** — same as Pattern A. As long as the
   subdomain is under `*.netmart.se`, the `netmart_session` cookie
   reaches it automatically.

### 7.3. Common mistakes to avoid

- **Don't** add a new auth system. Use the introspect endpoint.
- **Don't** set your own session cookie from a sibling app — only
  `netmart/backend` ever writes `netmart_session`.
- **Don't** add the new app to `web-builder`'s Dockerfile `COPY` list
  unless web-builder depends on it. Each app's Dockerfile copies only
  what it needs.
- **Don't** forget the `paths-filter` block in root `ci.yml` — without
  it your PR will green-light without ever running your build.
- **Don't** put `.env.prod` in git. Add it to `.dockerignore` and rely
  on the deploy workflow to verify it exists on the server.

---

## 8. CI / deploys

`.github/workflows/ci.yml` runs lint + typecheck + build for each
**changed** project (filtered via
[`dorny/paths-filter`](https://github.com/dorny/paths-filter)). Six
filters today: `packages`, `web-builder`, `web-viewer`, `netmart`,
`wp-builder`, `tools`.

`.github/workflows/deploy-web-builder.yml` is the template for
per-project deploys. Copy it for each new app and tighten the `paths:`
filter so unrelated commits don't trigger redeploys.

---

## 9. Web-builder split — migration runbook

The web-builder was extracted from `netmart` as a sibling app. The
**in-tree** cleanup (removing builder pages/components from netmart and
dropping the `Site` table from netmart's schema) has already landed on
`master` — see migrations `20260516000000_drop_sites_table`. The
runbook below is the order to follow **on a production environment**
that still has the old in-netmart builder live:

1. **Deploy web-builder with an empty DB.** Apply
   `web-builder/prisma/migrations/.../init`. Confirm the editor at
   `https://builder.netmart.se` loads and the public renderer at
   `https://<slug>.web.netmart.se` 404s cleanly.
2. **Quiesce writes on the old builder.** Either disable the
   `/builder/*` routes in `netmart-web` (feature flag) or accept a
   short writes-paused window.
3. **Copy the data.**

   ```bash
   NETMART_DATABASE_URL="postgres://...netmart..."   \
   BUILDER_DATABASE_URL="postgres://...web_builder..." \
   npm run migrate:sites -- --apply
   ```

   `tools/migrate-sites-to-builder.ts` upserts by primary key and
   preserves `cloudflareDnsRecordId` so published sites keep working
   without re-publishing. Safe to re-run.
4. **Repoint the viewer.** Set
   `SITE_API_URL=https://builder.netmart.se/api` in `web-viewer/.env`
   and restart.
5. **Smoke-test.** Hit 2–3 published `<slug>.web.netmart.se` URLs.
6. **Deploy the new netmart.** The `20260516000000_drop_sites_table`
   migration drops the legacy `Site` table and `ProvisioningType`
   enum. After this, only `web-builder`'s DB stores sites.

---

## 10. Related docs

- [`AGENTS.md`](AGENTS.md) — assistant rules: where things live, what
  not to reimplement, common pitfalls.
- [`packages/auth-client/README.md`](packages/auth-client/README.md) —
  how sibling apps validate the session cookie.
- [`packages/builder-core/README.md`](packages/builder-core/README.md)
  — the shared block contract (editor ↔ viewer).
- [`tools/README.md`](tools/README.md) — the data migration script.
- [`PLAN.md`](PLAN.md) — design rationale for the web-builder split.
