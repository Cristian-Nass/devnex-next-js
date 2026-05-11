import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.site.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        slug: true,
        published: true,
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

  async create(userId: string, dto: CreateSiteDto) {
    const existing = await this.prisma.site.findFirst({
      where: { userId, slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already in use');

    return this.prisma.site.create({
      data: {
        userId,
        name: dto.name,
        slug: dto.slug,
        data: makeInitialData(dto.slug),
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateSiteDto) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    if (site.userId !== userId) throw new ForbiddenException();

    return this.prisma.site.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.data !== undefined && {
          data: dto.data as Prisma.InputJsonValue,
        }),
        ...(dto.published !== undefined && { published: dto.published }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    if (site.userId !== userId) throw new ForbiddenException();

    await this.prisma.site.delete({ where: { id } });
    return { message: 'Site deleted' };
  }
}
