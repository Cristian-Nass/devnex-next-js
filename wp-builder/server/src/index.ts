import path from "node:path";
import { env } from "./config.js";
import { buildServer } from "./server.js";
import { prisma } from "./db.js";
import { getDiskUsageBytes } from "./lib/quota.js";

const app = await buildServer();

await app.listen({ port: env.PORT, host: "0.0.0.0" });

// Background job: update disk usage for every READY site every 5 minutes.
// Uses `du -sb` — no kernel quota system needed.
if (env.QUOTA_ENABLED) {
  async function refreshDiskUsage() {
    const sites = await prisma.site.findMany({
      where: { status: "READY" },
      select: { id: true, slug: true, diskQuotaGb: true },
    });

    for (const site of sites) {
      const siteRoot = path.resolve(env.WEBSITES_ROOT, site.slug);
      const bytes = await getDiskUsageBytes(siteRoot);
      if (bytes === null) continue;

      await prisma.site.update({
        where: { id: site.id },
        data: { diskUsageBytes: bytes },
      }).catch((e) => app.log.error({ err: e, slug: site.slug }, "diskUsage: DB update failed"));

      const limitBytes = BigInt(site.diskQuotaGb) * BigInt(1024 * 1024 * 1024);
      if (bytes > limitBytes) {
        app.log.warn(
          { slug: site.slug, usedGb: Number(bytes) / 1e9, quotaGb: site.diskQuotaGb },
          "Site exceeded disk quota",
        );
      }
    }
  }

  // Run once at startup, then every 5 minutes.
  setTimeout(() => {
    void refreshDiskUsage().catch((e) => app.log.error(e, "diskUsage: initial scan failed"));
    setInterval(() => {
      void refreshDiskUsage().catch((e) => app.log.error(e, "diskUsage: scan failed"));
    }, 5 * 60 * 1000);
  }, 30_000); // 30s delay to let the server finish starting
}
