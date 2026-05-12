-- One site per user: keep the most recently updated row per user, delete the rest.
DELETE FROM "Site" s
WHERE s.id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) AS rn
    FROM "Site"
  ) x
  WHERE x.rn > 1
);

CREATE TYPE "ProvisioningType" AS ENUM ('SUBDOMAIN', 'CUSTOM_DOMAIN');

DROP INDEX IF EXISTS "Site_userId_slug_key";

ALTER TABLE "Site" ADD COLUMN "provisioningType" "ProvisioningType" NOT NULL DEFAULT 'SUBDOMAIN';
ALTER TABLE "Site" ADD COLUMN "customDomain" TEXT;
ALTER TABLE "Site" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Site" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Site" ADD COLUMN "gtmContainerId" TEXT;

CREATE UNIQUE INDEX "Site_userId_key" ON "Site"("userId");
