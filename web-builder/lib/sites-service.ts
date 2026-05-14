import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  BadGateway,
  BadRequest,
  Conflict,
  Forbidden,
  NotFound,
} from "./http-errors";
import {
  buildRecordName,
  createARecord,
  deleteDnsRecordSafe,
  isPublishConfigured,
} from "./cloudflare-dns";
import type { CreateSiteInput, UpdateSiteInput } from "./validators";

/**
 * Direct port of `netmart/backend/src/sites/sites.service.ts` into plain
 * functions over a shared Prisma client. Behaviour, validations, and SQL
 * are 1:1 with the original Nest service so the data migration drops in
 * cleanly.
 */

function makeInitialData(slug: string) {
  return {
    theme: { primaryColor: "#3B82F6", fontFamily: "Inter" },
    pages: [{ pageId: `page-${Date.now()}`, slug, label: "Home", rows: [] }],
  };
}

function normalizeHost(raw: string): string {
  return raw.split(":")[0].trim().toLowerCase();
}

function stripQuotes(s: string): string {
  const t = s.trim();
  return t.length >= 2 &&
    ((t[0] === '"' && t.at(-1) === '"') || (t[0] === "'" && t.at(-1) === "'"))
    ? t.slice(1, -1)
    : t;
}

const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Suffixes to try when matching a request host against ROOT_DOMAIN_WEB_BUILDER.
 * e.g. `web.arvidn.dev` → [`web.arvidn.dev`, `arvidn.dev`]
 */
function hostSuffixes(rootDomain: string): string[] {
  const labels = rootDomain.split(".");
  return labels.slice(0, -1).map((_, i) => labels.slice(i).join("."));
}

/**
 * DB slug candidates for the left label of the request host.
 * `shop-web` → [`shop-web`, `shop`] — strips the `-web` suffix from the
 * default DNS template.
 */
function slugCandidates(prefix: string): string[] {
  if (!SLUG_RE.test(prefix)) return [];
  const out = [prefix];
  if (prefix.length > 4 && prefix.endsWith("-web")) out.push(prefix.slice(0, -4));
  return out;
}

async function assertNameAvailable(name: string, excludeId?: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw BadRequest("Site name cannot be empty");

  // Use the LOWER(TRIM()) expression index for case/whitespace-insensitive
  // uniqueness — Prisma can't express functional indexes natively so we
  // hand-roll the lookup the same way the Nest service did.
  const rows = excludeId
    ? await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Site"
        WHERE LOWER(TRIM(name)) = LOWER(${trimmed}) AND id <> ${excludeId}
        LIMIT 1
      `
    : await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Site"
        WHERE LOWER(TRIM(name)) = LOWER(${trimmed})
        LIMIT 1
      `;

  if (rows.length > 0) throw Conflict("This site name is already taken");
  return trimmed;
}

export async function findAllSites(userId: string) {
  return prisma.site.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      slug: true,
      published: true,
      provisioningType: true,
      customDomain: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findOneSite(id: string, userId: string) {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) throw NotFound("Site not found");
  if (site.userId !== userId) throw Forbidden();
  return site;
}

export async function findPublicSiteById(id: string) {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) throw NotFound("Site not found");
  return site;
}

/**
 * Host → published site JSON for the edge viewer. Subdomain sites match
 * both `{slug}.{ROOT_DOMAIN_WEB_BUILDER}` and the default DNS record format
 * `{slug}-{ROOT_DOMAIN_WEB_BUILDER}` (e.g. `shop-web.arvidn.dev`). Custom
 * domain sites must equal `customDomain`.
 */
export async function findPublicSitePayloadByHost(rawHost: string) {
  const host = normalizeHost(rawHost);
  if (!host) throw NotFound("unknown_host");

  const rootDomain = stripQuotes(
    process.env.ROOT_DOMAIN_WEB_BUILDER ?? "",
  ).toLowerCase();

  let site = null;

  if (rootDomain) {
    outer: for (const suffix of hostSuffixes(rootDomain)) {
      if (!host.endsWith("." + suffix)) continue;
      const prefix = host.slice(0, -(suffix.length + 1));
      for (const slug of slugCandidates(prefix)) {
        site = await prisma.site.findFirst({
          where: { slug, published: true, provisioningType: "SUBDOMAIN" },
        });
        if (site) break outer;
      }
    }
  }

  if (!site) {
    site = await prisma.site.findFirst({
      where: { published: true, provisioningType: "CUSTOM_DOMAIN", customDomain: host },
    });
  }

  if (!site) throw NotFound("unknown_host");

  const data = (
    site.data && !Array.isArray(site.data) && typeof site.data === "object"
      ? site.data
      : {}
  ) as Record<string, unknown>;

  const theme = (data.theme ?? {}) as Record<string, unknown>;
  const pages = Array.isArray(data.pages) ? data.pages : [];

  return {
    siteId: site.id,
    tenantKey: site.slug,
    head: {
      title: site.metaTitle?.trim() || site.name,
      ...(site.metaDescription?.trim() && { description: site.metaDescription.trim() }),
      ...(site.gtmContainerId?.trim() && { gtmContainerId: site.gtmContainerId.trim() }),
    },
    data: {
      theme: {
        primaryColor: String(theme.primaryColor ?? "#3B82F6"),
        fontFamily: String(theme.fontFamily ?? "Inter"),
      },
      pages,
    },
  };
}

export async function publishSubdomain(siteId: string, userId: string) {
  const site = await findOneSite(siteId, userId);

  if (site.provisioningType !== "SUBDOMAIN") {
    throw BadRequest("DNS publish is only available for subdomain provisioning.");
  }
  if (!isPublishConfigured()) {
    throw BadRequest(
      "Publishing is not configured. Set CLOUDFLARE_ZONE_ID_WEB_BUILDER, CLOUDFLARE_API_TOKEN_WEB_BUILDER, and SERVER_PUBLIC_IP_WEB_BUILDER.",
    );
  }
  if (site.published && site.cloudflareDnsRecordId) return site;

  let recordName: string;
  try {
    recordName = buildRecordName(site.slug);
  } catch (e) {
    throw BadRequest(e instanceof Error ? e.message : "Invalid DNS record name");
  }

  try {
    const recordId = await createARecord(recordName);
    return await prisma.site.update({
      where: { id: siteId },
      data: { published: true, cloudflareDnsRecordId: recordId },
    });
  } catch (e) {
    throw BadGateway(
      `Could not create DNS record: ${e instanceof Error ? e.message : "Unknown error"}`,
    );
  }
}

export async function createSite(userId: string, dto: CreateSiteInput) {
  if ((await prisma.site.count({ where: { userId } })) >= 1) {
    throw Conflict(
      "You already have a site. Delete it from site settings if you need a new one.",
    );
  }
  if (dto.provisioningType === "CUSTOM_DOMAIN" && !dto.customDomain?.trim()) {
    throw BadRequest("customDomain is required for custom domain provisioning");
  }

  const name = await assertNameAvailable(dto.name);
  const customDomain =
    dto.provisioningType === "CUSTOM_DOMAIN"
      ? dto.customDomain!.trim().toLowerCase()
      : null;

  try {
    return await prisma.site.create({
      data: {
        userId,
        name,
        slug: dto.slug,
        provisioningType: dto.provisioningType,
        customDomain,
        metaTitle: dto.metaTitle?.trim() || null,
        metaDescription: dto.metaDescription?.trim() || null,
        gtmContainerId: dto.gtmContainerId?.trim() || null,
        data: makeInitialData(dto.slug),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw Conflict("This site name is already taken");
    }
    throw e;
  }
}

export async function updateSite(id: string, userId: string, dto: UpdateSiteInput) {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) throw NotFound("Site not found");
  if (site.userId !== userId) throw Forbidden();

  const name =
    dto.name !== undefined ? await assertNameAvailable(dto.name, id) : undefined;

  const provisioningType = dto.provisioningType ?? site.provisioningType;
  let customDomain =
    dto.customDomain !== undefined
      ? dto.customDomain.trim().toLowerCase() || null
      : site.customDomain;
  if (provisioningType === "SUBDOMAIN") customDomain = null;
  if (provisioningType === "CUSTOM_DOMAIN" && !customDomain) {
    throw BadRequest(
      "customDomain is required when provisioning type is CUSTOM_DOMAIN",
    );
  }

  const patch: Prisma.SiteUpdateInput = {};
  if (name !== undefined) patch.name = name;
  if (dto.data !== undefined) patch.data = dto.data as Prisma.InputJsonValue;
  if (dto.published !== undefined) patch.published = dto.published;
  if (dto.provisioningType !== undefined || dto.customDomain !== undefined) {
    patch.provisioningType = provisioningType;
    patch.customDomain = customDomain;
  }
  if (dto.gtmContainerId !== undefined) patch.gtmContainerId = dto.gtmContainerId.trim() || null;
  if (dto.metaTitle !== undefined) patch.metaTitle = dto.metaTitle.trim() || null;
  if (dto.metaDescription !== undefined) patch.metaDescription = dto.metaDescription.trim() || null;

  try {
    return await prisma.site.update({ where: { id }, data: patch });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw Conflict("This site name is already taken");
    }
    throw e;
  }
}

export async function deleteSite(id: string, userId: string) {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) throw NotFound("Site not found");
  if (site.userId !== userId) throw Forbidden();

  if (site.cloudflareDnsRecordId) {
    await deleteDnsRecordSafe(site.cloudflareDnsRecordId);
  }
  await prisma.site.delete({ where: { id } });
  return { message: "Site deleted" };
}
