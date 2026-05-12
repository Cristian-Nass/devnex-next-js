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
    pages: [
      {
        pageId: `page-${Date.now()}`,
        slug,
        label: 'Home',
        rows: [],
      },
    ],
  };
}

function stripOuterQuotes(s: string): string {
  const t = s.trim();
  if (
    t.length >= 2 &&
    ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function normalizeRequestHost(raw: string): string {
  return raw.split(':')[0].trim().toLowerCase();
}

const SLUG_HOST_PATTERN = /^[a-z0-9-]+$/;

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflareDns: CloudflareDnsService,
    private readonly config: ConfigService,
  ) {}

  /** Case-insensitive uniqueness on LOWER(TRIM(name)) — see migration `Site_name_lower_trim_unique`. */
  private async assertSiteNameAvailable(
    name: string,
    excludeSiteId?: string,
  ): Promise<string> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Site name cannot be empty');
    }
    const rows = excludeSiteId
      ? await this.prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Site"
          WHERE LOWER(TRIM(name)) = LOWER(${trimmed}) AND id <> ${excludeSiteId}
          LIMIT 1
        `
      : await this.prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Site"
          WHERE LOWER(TRIM(name)) = LOWER(${trimmed})
          LIMIT 1
        `;
    if (rows.length > 0) {
      throw new ConflictException('This site name is already taken');
    }
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

  /** Latest saved JSON for this id (no publish gate — external publish/domain comes later). */
  async findPublic(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  /**
   * Tenant host → site JSON for the edge Next deployer (`web-deployer/next-site-template`).
   * Only **published** sites. Subdomain: `HOST` must be `{slug}.{ROOT_DOMAIN_WEB_BUILDER}`.
   * Custom domain: `HOST` must match `customDomain` (lowercase).
   */
  async findPublicSitePayloadByHost(rawHost: string) {
    const host = normalizeRequestHost(rawHost);
    if (!host) throw new NotFoundException('unknown_host');

    const rootDomain = stripOuterQuotes(
      this.config.get<string>('ROOT_DOMAIN_WEB_BUILDER') ?? '',
    )
      .trim()
      .toLowerCase();

    let site = null;

    if (rootDomain && host.endsWith('.' + rootDomain)) {
      const slug = host.slice(0, host.length - rootDomain.length - 1);
      if (slug && SLUG_HOST_PATTERN.test(slug)) {
        site = await this.prisma.site.findFirst({
          where: {
            slug,
            published: true,
            provisioningType: 'SUBDOMAIN',
          },
        });
      }
    }

    if (!site) {
      site = await this.prisma.site.findFirst({
        where: {
          published: true,
          provisioningType: 'CUSTOM_DOMAIN',
          customDomain: host,
        },
      });
    }

    if (!site) throw new NotFoundException('unknown_host');

    const data =
      site.data && typeof site.data === 'object' && !Array.isArray(site.data)
        ? (site.data as Record<string, unknown>)
        : {};
    const theme = (data.theme as Record<string, unknown>) ?? {};
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
      throw new BadRequestException(
        'DNS publish is only available for subdomain provisioning.',
      );
    }
    if (!this.cloudflareDns.isPublishConfigured()) {
      throw new BadRequestException(
        'Publishing is not configured. Set CLOUDFLARE_ZONE_ID_WEB_BUILDER, CLOUDFLARE_API_TOKEN_WEB_BUILDER, and SERVER_PUBLIC_IP_WEB_BUILDER.',
      );
    }
    if (site.published && site.cloudflareDnsRecordId) {
      return site;
    }

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
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new BadGatewayException(`Could not create DNS record: ${msg}`);
    }
  }

  async create(userId: string, dto: CreateSiteDto) {
    const count = await this.prisma.site.count({ where: { userId } });
    if (count >= 1) {
      throw new ConflictException(
        'You already have a site. Delete it from site settings if you need a new one.',
      );
    }

    if (dto.provisioningType === 'CUSTOM_DOMAIN' && !dto.customDomain?.trim()) {
      throw new BadRequestException('customDomain is required for custom domain provisioning');
    }

    const gtm = dto.gtmContainerId?.trim();
    const metaTitle = dto.metaTitle?.trim();
    const metaDescription = dto.metaDescription?.trim();
    const customDomain =
      dto.provisioningType === 'CUSTOM_DOMAIN'
        ? dto.customDomain!.trim().toLowerCase()
        : null;

    const name = await this.assertSiteNameAvailable(dto.name);

    try {
      return await this.prisma.site.create({
        data: {
          userId,
          name,
          slug: dto.slug,
          provisioningType: dto.provisioningType,
          customDomain,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          gtmContainerId: gtm || null,
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

    if (dto.name !== undefined && !dto.name.trim()) {
      throw new BadRequestException('Site name cannot be empty');
    }

    let nextName: string | undefined;
    if (dto.name !== undefined) {
      nextName = await this.assertSiteNameAvailable(dto.name, id);
    }

    const provisioningType =
      dto.provisioningType ?? site.provisioningType;

    let customDomain = site.customDomain;
    if (dto.customDomain !== undefined) {
      customDomain = dto.customDomain.trim().toLowerCase() || null;
    }
    if (provisioningType === 'SUBDOMAIN') {
      customDomain = null;
    }
    if (provisioningType === 'CUSTOM_DOMAIN' && !customDomain) {
      throw new BadRequestException(
        'customDomain is required when provisioning type is CUSTOM_DOMAIN',
      );
    }

    const gtm =
      dto.gtmContainerId !== undefined
        ? dto.gtmContainerId.trim() || null
        : undefined;
    const metaTitle =
      dto.metaTitle !== undefined ? dto.metaTitle.trim() || null : undefined;
    const metaDescription =
      dto.metaDescription !== undefined
        ? dto.metaDescription.trim() || null
        : undefined;

    const shouldWriteCustom =
      dto.customDomain !== undefined || dto.provisioningType !== undefined;

    try {
      return await this.prisma.site.update({
        where: { id },
        data: {
          ...(nextName !== undefined && { name: nextName }),
          ...(dto.data !== undefined && {
            data: dto.data as Prisma.InputJsonValue,
          }),
          ...(dto.published !== undefined && { published: dto.published }),
          ...(dto.provisioningType !== undefined && {
            provisioningType: dto.provisioningType,
          }),
          ...(shouldWriteCustom && { customDomain }),
          ...(gtm !== undefined && { gtmContainerId: gtm }),
          ...(metaTitle !== undefined && { metaTitle }),
          ...(metaDescription !== undefined && { metaDescription }),
        },
      });
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
