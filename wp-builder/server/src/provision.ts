import fs from "node:fs/promises";
import path from "node:path";
import { env, composePaths } from "./config.js";
import { prisma } from "./db.js";
import {
  composeChownWpContent,
  composeDown,
  composeUp,
  waitForWordPressFiles,
  wpCoreInstall,
} from "./lib/docker.js";
import { createARecord, deleteDnsRecord } from "./lib/cloudflare.js";
import { sendSiteCredentials } from "./lib/mailer.js";
import { randomHex } from "./lib/crypto.js";
import { dockerProjectName } from "./lib/slug.js";

const WP_ADMIN_USER = "admin";

// Simple concurrency guard: prevents resource exhaustion when many sites are created at once.
let activeProvisions = 0;
const MAX_CONCURRENT_PROVISIONS = 3;

async function copyPhpSnippetTemplates(siteRoot: string): Promise<void> {
  const dstDir = path.join(siteRoot, ".wp-builder", "php");
  await fs.mkdir(dstDir, { recursive: true });
  const srcDir = path.join(env.REPO_ROOT, "docker", "php");
  for (const name of ["uploads.ini", "wp-config-extra.php"] as const) {
    await fs.copyFile(path.join(srcDir, name), path.join(dstDir, name));
  }
}

/**
 * Provision a WordPress site end-to-end:
 *
 *   Cloudflare DNS → site root + .env → docker compose up → wait for
 *   WordPress core files → wp-cli core install → email credentials.
 *
 * `adminEmail` is the netmart user's email (resolved by the route from
 * `req.user.email`). The wp-builder DB no longer stores users, so the
 * email must be passed in explicitly — it is used as the WP admin email
 * and as the recipient of the credentials email.
 */
export async function provisionSite(siteId: string, adminEmail: string): Promise<void> {
  if (activeProvisions >= MAX_CONCURRENT_PROVISIONS) {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "FAILED",
        provisionError: `Server is busy (max ${MAX_CONCURRENT_PROVISIONS} sites provisioning at once). Delete this site and try again in a few minutes.`,
      },
    });
    return;
  }

  activeProvisions++;
  try {
    await _provisionSite(siteId, adminEmail);
  } finally {
    activeProvisions--;
  }
}

async function _provisionSite(siteId: string, adminEmail: string): Promise<void> {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return;

  const { composeFile } = composePaths();
  const project = dockerProjectName(site.slug);
  const siteRoot = path.resolve(env.WEBSITES_ROOT, site.slug);
  const siteRootPosix = siteRoot.replace(/\\/g, "/");
  const envFile = path.join(siteRoot, ".env");

  // Track what gets created so the catch block can clean up accurately.
  let cfWpId: string | null = null;
  let siteRootCreated = false;
  let stackStarted = false;

  try {
    await prisma.site.update({
      where: { id: siteId },
      data: { status: "PROVISIONING", provisionError: null },
    });

    // Persist the DNS record ID to the DB immediately so failure cleanup can find it.
    cfWpId = await createARecord(site.slug);
    await prisma.site.update({
      where: { id: siteId },
      data: { cloudflareRecordId: cfWpId },
    });

    await fs.mkdir(path.join(siteRoot, "wp"), { recursive: true });
    await fs.mkdir(path.join(siteRoot, "mysql"), { recursive: true });
    siteRootCreated = true;
    await copyPhpSnippetTemplates(siteRoot);

    const dbSafe = site.slug.replace(/-/g, "_");
    const dbName = `wp_${dbSafe}`.slice(0, 63);
    const dbUser = `u_${dbSafe}`.slice(0, 32);
    const dbPass = randomHex(16);
    const rootPass = randomHex(16);

    const fqdn = site.fqdn;
    const envContents =
      [
        `SITE_ROOT=${siteRootPosix}`,
        `MYSQL_DATABASE=${dbName}`,
        `MYSQL_USER=${dbUser}`,
        `MYSQL_PASSWORD=${dbPass}`,
        `MYSQL_ROOT_PASSWORD=${rootPass}`,
        `WORDPRESS_HOST=${fqdn}`,
        `WORDPRESS_HOME=https://${fqdn}`,
        `WORDPRESS_SITEURL=https://${fqdn}`,
        "",
      ].join("\n");

    await fs.writeFile(envFile, envContents, { mode: 0o600 });
    if (env.WEBSITES_ENV_OWNER_UID !== undefined && env.WEBSITES_ENV_OWNER_GID !== undefined) {
      try {
        await fs.chown(envFile, env.WEBSITES_ENV_OWNER_UID, env.WEBSITES_ENV_OWNER_GID);
      } catch (e) {
        console.warn("chown site .env skipped", envFile, e);
      }
    }

    await composeUp(project, composeFile, envFile);
    stackStarted = true;
    await waitForWordPressFiles(project, composeFile, envFile);
    await composeChownWpContent(project, composeFile, envFile);

    const adminPass = randomHex(12);
    await wpCoreInstall({
      project,
      composeFile,
      envFile,
      url: `https://${fqdn}`,
      title: `${site.slug}`,
      adminUser: WP_ADMIN_USER,
      adminPassword: adminPass,
      adminEmail,
    });

    await composeChownWpContent(project, composeFile, envFile);

    await prisma.site.update({
      where: { id: siteId },
      data: { status: "READY", wpAdminUsername: WP_ADMIN_USER, provisionError: null },
    });

    try {
      await sendSiteCredentials({
        to: adminEmail,
        fqdn,
        adminUser: WP_ADMIN_USER,
        adminPassword: adminPass,
      });
    } catch (emailErr) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("sendSiteCredentials", siteId, emailErr);
      await prisma.site.update({
        where: { id: siteId },
        data: {
          provisionError: `WordPress is ready but credentials email failed (${msg}). Reset password in WP or use wpcli.`,
        },
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);

    await prisma.site.update({
      where: { id: siteId },
      data: { status: "FAILED", provisionError: message },
    }).catch((dbErr) => console.error("provision: failed to update status to FAILED", siteId, dbErr));

    if (stackStarted) {
      await composeDown(project, composeFile, envFile, {
        swallowErrors: true,
        removeVolumes: true,
      });
    }

    if (siteRootCreated) {
      await fs.rm(siteRoot, { recursive: true, force: true }).catch((rmErr) =>
        console.error("provision: failed to remove siteRoot", siteRoot, rmErr),
      );
    }

    if (cfWpId) {
      await deleteDnsRecord(cfWpId).catch((err) =>
        console.error("provision: cleanup deleteDnsRecord wp", siteId, err),
      );
    }
  }
}
