import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.sitesService.findAll(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSiteDto,
  ) {
    return this.sitesService.create(user.id, dto);
  }

  /** Must be registered before `@Get(':id')` so `/sites/public/...` is not captured as `:id`. */
  @Public()
  @Get('public/:id')
  findPublic(@Param('id') id: string) {
    return this.sitesService.findPublic(id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.sitesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
  ) {
    return this.sitesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.sitesService.remove(id, user.id);
  }
}
