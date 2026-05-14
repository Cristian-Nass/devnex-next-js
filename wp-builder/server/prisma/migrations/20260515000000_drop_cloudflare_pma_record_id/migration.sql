-- Drop the column that tracked the Cloudflare DNS record for each site's
-- phpMyAdmin subdomain (`db-<slug>.<ROOT_DOMAIN>`). phpMyAdmin has been
-- removed from the per-site stack because keeping a public DB admin UI
-- alive 24/7 per tenant is an unacceptable attack surface. Operators who
-- still need ad-hoc DB access should `docker compose exec db mysql ...`.
ALTER TABLE "Site" DROP COLUMN IF EXISTS "cloudflarePmaRecordId";
