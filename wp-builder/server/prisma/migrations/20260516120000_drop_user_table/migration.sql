-- Drop the local User table. wp-builder no longer manages identities;
-- netmart's backend is the single source of truth and `Site.userId`
-- now stores a netmart `User.id` validated via `/auth/introspect`.
--
-- WARNING: existing `Site.userId` values previously referenced the
-- (now-dropped) wp-builder User table. They will become stale after
-- this migration unless you remap them with a migration script first.

ALTER TABLE "Site" DROP CONSTRAINT IF EXISTS "Site_userId_fkey";
DROP TABLE IF EXISTS "User";

CREATE INDEX IF NOT EXISTS "Site_userId_idx" ON "Site" ("userId");
