import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudflareDnsService } from './cloudflare-dns.service';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [PrismaModule],
  controllers: [SitesController],
  providers: [SitesService, CloudflareDnsService],
})
export class SitesModule {}
