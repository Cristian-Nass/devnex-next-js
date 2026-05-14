#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * One-shot data migration: copy every row from netmart's `Site` table into
 * web-builder's `Site` table. After this runs successfully, the destructive
 * removals (sites module from netmart/backend, builder pages from
 * netmart/frontend) become safe to apply.
 *
 *  Usage:
 *
 *    NETMART_DATABASE_URL=postgres://... \
 *    BUILDER_DATABASE_URL=postgres://... \
 *    npx tsx tools/migrate-sites-to-builder.ts            # dry-run
 *
 *    NETMART_DATABASE_URL=... BUILDER_DATABASE_URL=... \
 *    npx tsx tools/migrate-sites-to-builder.ts --apply    # actually copy
 *
 *  Safety:
 *
 *   - Default is dry-run. Pass `--apply` to write.
 *   - Idempotent: upsert by primary key (id). Re-running is safe and skips
 *     unchanged rows.
 *   - Preserves all columns 1:1 (including timestamps and Cloudflare DNS
 *     record id) so published sites keep working without re-publishing.
 *   - Does NOT delete from the source. Run the netmart-side cleanup
 *     migration only after verifying the destination data is correct.
 *
 *  Dependencies:
 *
 *   - `pg` only. No Prisma here on purpose so the script works regardless
 *     of which side's schema is currently checked out.
 */

import { Client } from 'pg';

type Row = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  data: unknown;
  published: boolean;
  provisioningType: 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
  customDomain: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  gtmContainerId: string | null;
  cloudflareDnsRecordId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function readEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(2);
  }
  return value;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const netmartUrl = readEnv('NETMART_DATABASE_URL');
  const builderUrl = readEnv('BUILDER_DATABASE_URL');

  console.log(`[migrate] mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`[migrate] source: ${maskUrl(netmartUrl)}`);
  console.log(`[migrate] target: ${maskUrl(builderUrl)}`);

  const source = new Client({ connectionString: netmartUrl });
  const target = new Client({ connectionString: builderUrl });
  await source.connect();
  await target.connect();

  try {
    const sourceCount = await tableCount(source);
    const targetCountBefore = await tableCount(target);
    console.log(`[migrate] source rows: ${sourceCount}`);
    console.log(`[migrate] target rows (before): ${targetCountBefore}`);

    if (sourceCount === 0) {
      console.log('[migrate] nothing to copy. Done.');
      return;
    }

    const rows = await source.query<Row>(
      `SELECT id, "userId", name, slug, data, published,
              "provisioningType", "customDomain", "metaTitle",
              "metaDescription", "gtmContainerId", "cloudflareDnsRecordId",
              "createdAt", "updatedAt"
       FROM "Site"`,
    );

    if (!apply) {
      const sample = rows.rows.slice(0, 3).map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.name,
        slug: r.slug,
        published: r.published,
        provisioningType: r.provisioningType,
      }));
      console.log(`[migrate] dry-run: would copy ${rows.rows.length} rows.`);
      console.log('[migrate] sample (first 3):', sample);
      console.log('[migrate] re-run with --apply to actually copy.');
      return;
    }

    await target.query('BEGIN');
    try {
      let inserted = 0;
      let updated = 0;
      for (const r of rows.rows) {
        const res = await target.query(
          `INSERT INTO "Site"
             (id, "userId", name, slug, data, published,
              "provisioningType", "customDomain", "metaTitle",
              "metaDescription", "gtmContainerId", "cloudflareDnsRecordId",
              "createdAt", "updatedAt")
           VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           ON CONFLICT (id) DO UPDATE SET
             "userId"               = EXCLUDED."userId",
             name                   = EXCLUDED.name,
             slug                   = EXCLUDED.slug,
             data                   = EXCLUDED.data,
             published              = EXCLUDED.published,
             "provisioningType"     = EXCLUDED."provisioningType",
             "customDomain"         = EXCLUDED."customDomain",
             "metaTitle"            = EXCLUDED."metaTitle",
             "metaDescription"      = EXCLUDED."metaDescription",
             "gtmContainerId"       = EXCLUDED."gtmContainerId",
             "cloudflareDnsRecordId" = EXCLUDED."cloudflareDnsRecordId",
             "createdAt"            = EXCLUDED."createdAt",
             "updatedAt"            = EXCLUDED."updatedAt"
           RETURNING xmax = 0 AS inserted`,
          [
            r.id,
            r.userId,
            r.name,
            r.slug,
            JSON.stringify(r.data),
            r.published,
            r.provisioningType,
            r.customDomain,
            r.metaTitle,
            r.metaDescription,
            r.gtmContainerId,
            r.cloudflareDnsRecordId,
            r.createdAt,
            r.updatedAt,
          ],
        );
        if ((res.rows[0] as { inserted: boolean }).inserted) inserted += 1;
        else updated += 1;
      }
      await target.query('COMMIT');
      const targetCountAfter = await tableCount(target);
      console.log(
        `[migrate] done. inserted=${inserted} updated=${updated} target rows (after)=${targetCountAfter}`,
      );
    } catch (err) {
      await target.query('ROLLBACK');
      console.error('[migrate] FAILED, rolled back:', err);
      process.exit(1);
    }
  } finally {
    await source.end();
    await target.end();
  }
}

async function tableCount(client: Client): Promise<number> {
  const r = await client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM "Site"');
  return Number(r.rows[0].count);
}

function maskUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return raw.replace(/:\/\/[^@]+@/, '://***@');
  }
}

main().catch((err) => {
  console.error('[migrate] unhandled error:', err);
  process.exit(1);
});
