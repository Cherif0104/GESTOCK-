import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Sites')
@ApiBearerAuth()
@Controller('sites')
export class SitesController {
  constructor(private readonly service: SitesService) {}

  @Get() @RequirePermissions(PERMISSIONS.SITE_MANAGE)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto & { companyId?: string }) {
    return this.service.list(o, q);
  }

  @Get(':id') @RequirePermissions(PERMISSIONS.SITE_MANAGE)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.SITE_MANAGE)
  create(@OrgId() o: string, @Body() d: CreateSiteDto) { return this.service.create(o, d); }

  @Patch(':id') @RequirePermissions(PERMISSIONS.SITE_MANAGE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: UpdateSiteDto) {
    return this.service.update(o, id, d);
  }

  @Delete(':id') @RequirePermissions(PERMISSIONS.SITE_MANAGE)
  remove(@OrgId() o: string, @Param('id') id: string) { return this.service.remove(o, id); }
}
