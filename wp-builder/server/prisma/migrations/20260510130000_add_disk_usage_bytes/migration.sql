-- Add disk usage tracking column (updated by background du poller, not the kernel)
ALTER TABLE "Site" ADD COLUMN "diskUsageBytes" BIGINT NOT NULL DEFAULT 0;
