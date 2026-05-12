-- Cloudflare DNS record id for published subdomain (A record).
ALTER TABLE "Site" ADD COLUMN "cloudflareDnsRecordId" TEXT;
