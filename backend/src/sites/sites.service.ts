import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareDnsService } from './cloudflare-dns.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

function makeInitialData(slug: string) {
  return {
    theme: { primaryColor: '#3B82F6', fontFamily: 'Inter' },
    pages: [{ pageId: `page-${Date.now()}`, slug, label: 'Home', rows: [] }],
  };
}

function normalizeHost(raw: string): string {
  return raw.split(':')[0].trim().toLowerCase();
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
  const labels = rootDomain.split('.');
  return labels.slice(0, -1).map((_, i) => labels.slice(i).join('.'));
}

/**
 * DB slug candidates for the left label of the request host.
 * `shop-web` → [`shop-web`, `shop`] — strips the `-web` suffix from the default DNS template.
 */
function slugCandidates(prefix: string): string[] {
  if (!SLUG_RE.test(prefix)) return [];
  const out = [prefix];
  if (prefix.length > 4 && prefix.endsWith('-web')) out.push(prefix.slice(0, -4));
  return out;
}

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflareDns: CloudflareDnsService,
    private readonly config: ConfigService,
  ) {}

  private async assertNameAvailable(name: string, excludeId?: string): Promise<string> {
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Site name cannot be empty');

    const rows = excludeId
      ? await this.prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Site"
          WHERE LOWER(TRIM(name)) = LOWER(${trimmed}) AND id <> ${excludeId}
          LIMIT 1
        `
      : await this.prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Site"
          WHERE LOWER(TRIM(name)) = LOWER(${trimmed})
          LIMIT 1
        `;

    if (rows.length > 0) throw new ConflictException('This site name is already taken');
    return trimmed;
  }

  async findAll(userId: string) {
    return this.prisma.site.findMany({
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
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    if (site.userId !== userId) throw new ForbiddenException();
    return site;
  }

  async findPublic(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  /**
   * Host → published site JSON for the edge Next deployer.
   * Subdomain sites: resolves both `{slug}.{ROOT_DOMAIN_WEB_BUILDER}` and the default
   * DNS record format `{slug}-{ROOT_DOMAIN_WEB_BUILDER}` (e.g. `shop-web.arvidn.dev`).
   * Custom domain sites: host must equal `customDomain`.
   */
  async findPublicSitePayloadByHost(rawHost: string) {
    const host = normalizeHost(rawHost);
    if (!host) throw new NotFoundException('unknown_host');

    const rootDomain = stripQuotes(
      this.config.get<string>('ROOT_DOMAIN_WEB_BUILDER') ?? '',
    ).toLowerCase();

    let site = null;

    if (rootDomain) {
      outer: for (const suffix of hostSuffixes(rootDomain)) {
        if (!host.endsWith('.' + suffix)) continue;
        const prefix = host.slice(0, -(suffix.length + 1));
        for (const slug of slugCandidates(prefix)) {
          site = await this.prisma.site.findFirst({
            where: { slug, published: true, provisioningType: 'SUBDOMAIN' },
          });
          if (site) break outer;
        }
      }
    }

    if (!site) {
      site = await this.prisma.site.findFirst({
        where: { published: true, provisioningType: 'CUSTOM_DOMAIN', customDomain: host },
      });
    }

    if (!site) throw new NotFoundException('unknown_host');

    const data = (
      site.data && !Array.isArray(site.data) && typeof site.data === 'object'
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
          primaryColor: String(theme.primaryColor ?? '#3B82F6'),
          fontFamily: String(theme.fontFamily ?? 'Inter'),
        },
        pages,
      },
    };
  }

  async publishSubdomain(siteId: string, userId: string) {
    const site = await this.findOne(siteId, userId);

    if (site.provisioningType !== 'SUBDOMAIN') {
      throw new BadRequestException('DNS publish is only available for subdomain provisioning.');
    }
    if (!this.cloudflareDns.isPublishConfigured()) {
      throw new BadRequestException(
        'Publishing is not configured. Set CLOUDFLARE_ZONE_ID_WEB_BUILDER, CLOUDFLARE_API_TOKEN_WEB_BUILDER, and SERVER_PUBLIC_IP_WEB_BUILDER.',
      );
    }
    if (site.published && site.cloudflareDnsRecordId) return site;

    let recordName: string;
    try {
      recordName = this.cloudflareDns.buildRecordName(site.slug);
    } catch (e) {
      throw new BadRequestException(e instanceof Error ? e.message : 'Invalid DNS record name');
    }

    try {
      const recordId = await this.cloudflareDns.createARecord(recordName);
      return await this.prisma.site.update({
        where: { id: siteId },
        data: { published: true, cloudflareDnsRecordId: recordId },
      });
    } catch (e) {
      throw new BadGatewayException(
        `Could not create DNS record: ${e instanceof Error ? e.message : 'Unknown error'}`,
      );
    }
  }

  async create(userId: string, dto: CreateSiteDto) {
    if ((await this.prisma.site.count({ where: { userId } })) >= 1) {
      throw new ConflictException(
        'You already have a site. Delete it from site settings if you need a new one.',
      );
    }
    if (dto.provisioningType === 'CUSTOM_DOMAIN' && !dto.customDomain?.trim()) {
      throw new BadRequestException('customDomain is required for custom domain provisioning');
    }

    const name = await this.assertNameAvailable(dto.name);
    const customDomain =
      dto.provisioningType === 'CUSTOM_DOMAIN'
        ? dto.customDomain!.trim().toLowerCase()
        : null;

    try {
      return await this.prisma.site.create({
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
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This site name is already taken');
      }
      throw e;
    }
  }

  async update(id: string, userId: string, dto: UpdateSiteDto) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    if (site.userId !== userId) throw new ForbiddenException();

    const name =
      dto.name !== undefined ? await this.assertNameAvailable(dto.name, id) : undefined;

    const provisioningType = dto.provisioningType ?? site.provisioningType;
    let customDomain =
      dto.customDomain !== undefined
        ? dto.customDomain.trim().toLowerCase() || null
        : site.customDomain;
    if (provisioningType === 'SUBDOMAIN') customDomain = null;
    if (provisioningType === 'CUSTOM_DOMAIN' && !customDomain) {
      throw new BadRequestException(
        'customDomain is required when provisioning type is CUSTOM_DOMAIN',
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
      return await this.prisma.site.update({ where: { id }, data: patch });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This site name is already taken');
      }
      throw e;
    }
  }

  async remove(id: string, userId: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    if (site.userId !== userId) throw new ForbiddenException();

    if (site.cloudflareDnsRecordId) {
      await this.cloudflareDns.deleteDnsRecordSafe(site.cloudflareDnsRecordId);
    }
    await this.prisma.site.delete({ where: { id } });
    return { message: 'Site deleted' };
  }
}
