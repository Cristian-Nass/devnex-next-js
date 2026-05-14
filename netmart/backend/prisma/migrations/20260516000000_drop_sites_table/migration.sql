-- Drop the Site table and ProvisioningType enum.
-- Site management lives in the standalone `web-builder` service (own DB).
-- Run `tools/migrate-sites-to-builder.ts` BEFORE applying this migration on
-- any environment that has user-owned sites you want to keep.

DROP TABLE IF EXISTS "Site";
DROP TYPE IF EXISTS "ProvisioningType";
