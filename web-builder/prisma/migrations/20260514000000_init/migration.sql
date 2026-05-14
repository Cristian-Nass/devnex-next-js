-- Consolidated init migration for the web-builder database.
--
-- This is the equivalent of running every Site-related migration in netmart's
-- backend (`20260511000001_add_sites`, `20260512_..._one_per_user`,
-- `20260513_..._name_unique`, `20260514_..._cloudflare_dns_record`) against
-- an empty schema — and WITHOUT the foreign key to `User`, since the User
-- table lives in netmart's database now. `Site.userId` is a logical
-- reference only.

-- CreateEnum
CREATE TYPE "ProvisioningType" AS ENUM ('SUBDOMAIN', 'CUSTOM_DOMAIN');

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "provisioningType" "ProvisioningType" NOT NULL DEFAULT 'SUBDOMAIN',
    "customDomain" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "gtmContainerId" TEXT,
    "cloudflareDnsRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (Prisma-managed indexes mirroring the schema's @@unique / @@index)
CREATE UNIQUE INDEX "Site_userId_key" ON "Site"("userId");
CREATE INDEX "Site_userId_idx" ON "Site"("userId");
CREATE INDEX "Site_name_idx" ON "Site"("name");
CREATE INDEX "Site_slug_idx" ON "Site"("slug");

-- Globally unique site name (case-insensitive, trimmed). Matches the
-- constraint netmart enforced before the split so existing data migrates
-- cleanly. The expression index is declared in raw SQL because Prisma
-- schema syntax does not support functional indexes.
CREATE UNIQUE INDEX "Site_name_lower_trim_unique" ON "Site" (LOWER(TRIM("name")));
