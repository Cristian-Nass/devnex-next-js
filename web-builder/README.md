# web-builder

Next.js editor for visual sites. Owns the `Site` table in its own Postgres,
trusts netmart's auth via the cross-subdomain `netmart_session` cookie.

## Architecture (this app's role)

```
            ┌──── netmart (platform) ────┐
            │  api.netmart.se            │  ← /auth/introspect
Browser ────│  www.netmart.se            │  ← login UI
            └────────────────────────────┘
                       cookie .netmart.se (`netmart_session`)
            ┌──── web-builder ───────────┐
            │  builder.netmart.se        │  this app
            │  ├── editor pages          │
            │  ├── /api/sites/*          │
            │  └── Postgres (its own)    │
            └────────────────────────────┘
                       │
                       ▼ public payload
            ┌──── web-viewer ────────────┐
            │  *.publish.netmart.se      │
            └────────────────────────────┘
```

## Local dev

```bash
# 1. Make sure netmart's backend is running on http://localhost:5000.
# 2. Create the builder Postgres database (matches DATABASE_URL).
# 3. Install + generate Prisma:
npm install
npm run prisma:migrate:dev
# 4. Start the editor:
npm run dev      # → http://localhost:3001
```

To exercise cross-subdomain auth locally, set `COOKIE_DOMAIN=.lvh.me` in
`netmart/backend/.env` and use `lvh.me:3000` for the platform UI and
`builder.lvh.me:3001` for the editor.

## Env

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Builder Postgres. Separate from netmart's DB. |
| `PLATFORM_API_URL` | Server-side base for `/auth/introspect`. Include `/api`. |
| `NEXT_PUBLIC_PLATFORM_FRONTEND_URL` | Client-side / middleware redirect target for login. |
| `ROOT_DOMAIN_WEB_BUILDER`, `CLOUDFLARE_*_WEB_BUILDER`, `SERVER_PUBLIC_IP_WEB_BUILDER` | Cloudflare DNS publishing for subdomain sites. |
