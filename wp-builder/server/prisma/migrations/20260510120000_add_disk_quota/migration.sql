-- Add disk quota fields to Site
ALTER TABLE "Site" ADD COLUMN "diskQuotaGb" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Site" ADD COLUMN "quotaProjectId" INTEGER;
CREATE UNIQUE INDEX "Site_quotaProjectId_key" ON "Site"("quotaProjectId");
