# tools

One-off migration / maintenance scripts.

## `migrate-sites-to-builder.ts`

Copies the `Site` table from the netmart Postgres into the web-builder Postgres
as a one-shot during the web-builder split.

### Prerequisites

- Both databases reachable from the machine you run this on.
- The web-builder migration (`web-builder/prisma/migrations/.../init`) is
  already applied on the destination, i.e. the `Site` table exists with the
  consolidated schema.
- `pg` is installed locally (it is; the script depends on a single npm
  package). Run via `npx tsx`.

### Usage

```bash
# 1. Dry-run — prints what would be copied, never writes.
NETMART_DATABASE_URL="postgres://user:pw@netmart-host:5432/netmart" \
BUILDER_DATABASE_URL="postgres://user:pw@builder-host:5432/web_builder" \
npx tsx tools/migrate-sites-to-builder.ts

# 2. Apply for real.
NETMART_DATABASE_URL="postgres://user:pw@netmart-host:5432/netmart" \
BUILDER_DATABASE_URL="postgres://user:pw@builder-host:5432/web_builder" \
npx tsx tools/migrate-sites-to-builder.ts --apply
```

### Behaviour

- Default is dry-run; pass `--apply` to actually copy.
- Idempotent: rows are upserted by primary key (`id`), so re-running is
  safe and only touches changed columns.
- Preserves every column including `cloudflareDnsRecordId`, so already
  published sites keep working without you re-publishing them.
- Wrapped in a transaction on the destination — rollback on any failure.
- Never deletes from the source. Run the destructive netmart cleanup
  migration only after verifying the destination data is correct.

### Cutover order (suggested)

1. Deploy `web-builder` against an empty `web_builder` database. Confirm the
   editor and `/api/sites/public/by-host/...` work end-to-end with a test
   site.
2. Put the netmart frontend's `/builder/*` routes into read-only mode (or
   accept a short writes-paused window).
3. Run this script with `--apply`.
4. Repoint `web-viewer.SITE_API_URL` to the builder (already done in
   `web-viewer/.env.example`; verify the prod `.env` matches).
5. Smoke-test a few published sites.
6. Apply the destructive removals in `netmart/backend` and `netmart/frontend`
   (separate, paused-on todos).
