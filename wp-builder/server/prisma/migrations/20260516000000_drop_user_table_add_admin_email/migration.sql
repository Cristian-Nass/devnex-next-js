-- Move identity to netmart-api: drop wp-builder's local User table and the
-- Site → User foreign key. `Site.userId` continues to exist as a plain
-- string column referencing netmart's User.id (no DB-level FK because the
-- referenced row lives in a separate database).
--
-- Snapshots the WordPress admin email onto Site so provisioning no longer
-- has to join into User. New rows get this from `requireUser(req).email`.

-- Drop the FK first so the table-drop doesn't fail.
ALTER TABLE "Site" DROP CONSTRAINT IF EXISTS "Site_userId_fkey";

-- Backfill `adminEmail` from existing User rows BEFORE dropping the table,
-- so that any pre-cutover rows keep working. New deploys of wp-builder will
-- start with an empty database, in which case the JOIN no-ops.
ALTER TABLE "Site" ADD COLUMN "adminEmail" TEXT;

UPDATE "Site"
   SET "adminEmail" = u."email"
  FROM "User" u
 WHERE "Site"."userId" = u."id"
   AND "Site"."adminEmail" IS NULL;

-- Any orphan Site rows (no matching user) get a placeholder so the NOT NULL
-- constraint can be enforced. Operators can clean these up afterwards.
UPDATE "Site"
   SET "adminEmail" = 'unknown@local.invalid'
 WHERE "adminEmail" IS NULL;

ALTER TABLE "Site" ALTER COLUMN "adminEmail" SET NOT NULL;

-- Now safe to drop the User table.
DROP TABLE IF EXISTS "User";
