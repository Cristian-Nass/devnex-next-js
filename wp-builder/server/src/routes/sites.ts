import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { env, composePaths } from "../config.js";
import { prisma } from "../db.js";
import { composeDown } from "../lib/docker.js";
import { deleteDnsRecord } from "../lib/cloudflare.js";
import { dockerProjectName, normalizeSlug, validateSlug } from "../lib/slug.js";
import { provisionSite } from "../provision.js";

export async function sitesRoutes(app: FastifyInstance) {
  // Mounted at /api/sites — paths here are relative to that prefix.

  app.post("/", { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = z.object({ slug: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const slug = normalizeSlug(parsed.data.slug);
    const slugErr = validateSlug(slug);
    if (slugErr) {
      return reply.code(400).send({ error: slugErr });
    }

    const fqdn = `${slug}-${env.ROOT_DOMAIN}`;
    const userId = req.user.id;
    const adminEmail = req.user.email;

    let site;
    try {
      site = await prisma.site.create({
        data: { slug, fqdn, userId, status: "PENDING", diskQuotaGb: env.SITE_DISK_QUOTA_GB },
      });
    } catch {
      return reply.code(409).send({ error: "That site name is already taken." });
    }

    setImmediate(() => {
      provisionSite(site.id, adminEmail).catch((err) =>
        console.error("provisionSite", site.id, err),
      );
    });

    return reply.code(202).send({
      site: { id: site.id, slug: site.slug, fqdn: site.fqdn, status: site.status },
    });
  });

  app.get("/", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.id;
    const sites = await prisma.site.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        fqdn: true,
        status: true,
        wpAdminUsername: true,
        provisionError: true,
        diskQuotaGb: true,
        diskUsageBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      sites: sites.map((s) => ({
        ...s,
        diskUsageBytes: s.diskUsageBytes.toString(),
      })),
    };
  });

  app.get("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    const id = (req.params as { id: string }).id;
    const site = await prisma.site.findFirst({
      where: { id, userId },
      select: {
        id: true,
        slug: true,
        fqdn: true,
        status: true,
        wpAdminUsername: true,
        provisionError: true,
        diskQuotaGb: true,
        diskUsageBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!site) {
      return reply.code(404).send({ error: "Site not found" });
    }
    return {
      site: {
        ...site,
        diskUsageBytes: site.diskUsageBytes.toString(),
      },
    };
  });

  app.patch("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    const id = (req.params as { id: string }).id;

    const parsed = z.object({ diskQuotaGb: z.number().int().min(1).max(500) }).safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const site = await prisma.site.findFirst({ where: { id, userId }, select: { id: true } });
    if (!site) {
      return reply.code(404).send({ error: "Site not found" });
    }

    const { diskQuotaGb } = parsed.data;
    await prisma.site.update({ where: { id }, data: { diskQuotaGb } });
    return reply.code(200).send({ diskQuotaGb });
  });

  app.delete("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    const id = (req.params as { id: string }).id;

    const site = await prisma.site.findFirst({
      where: { id, userId },
      select: {
        id: true,
        slug: true,
        status: true,
        cloudflareRecordId: true,
      },
    });
    if (!site) {
      return reply.code(404).send({ error: "Site not found" });
    }

    if (site.status === "PROVISIONING") {
      return reply.code(409).send({
        error: "Site is currently being provisioned. Wait until it is READY or FAILED before deleting.",
      });
    }

    const { composeFile } = composePaths();
    const project = dockerProjectName(site.slug);
    const siteRoot = path.resolve(env.WEBSITES_ROOT, site.slug);
    const envFile = path.join(siteRoot, ".env");

    try {
      await composeDown(project, composeFile, envFile);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      req.log.error({ err: e, project }, "composeDown failed during site delete");
      return reply.code(500).send({
        error: `${message}. The Site row was not removed — fix Docker (compose path, socket, permissions) or run manually: docker compose -p ${project} -f ${composeFile} --env-file ${envFile} down`,
      });
    }

    try {
      await fs.rm(siteRoot, { recursive: true, force: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return reply.code(500).send({
        error: `Stopped Docker stack but could not delete files under ${siteRoot}: ${message}`,
      });
    }

    if (site.cloudflareRecordId) {
      try {
        await deleteDnsRecord(site.cloudflareRecordId);
      } catch (e) {
        console.error("deleteDnsRecord", site.cloudflareRecordId, e);
      }
    }

    await prisma.site.delete({ where: { id: site.id } });
    return reply.code(204).send();
  });
}
