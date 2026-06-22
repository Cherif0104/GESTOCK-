import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { CategoriesService } from './categories.service';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Catégories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get() @RequirePermissions(PERMISSIONS.PRODUCT_READ)
  list(@OrgId() o: string) { return this.service.list(o); }

  @Post() @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  create(@OrgId() o: string, @Body() d: any) { return this.service.create(o, d); }

  @Patch(':id') @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: any) {
    return this.service.update(o, id, d);
  }

  @Delete(':id') @RequirePermissions(PERMISSIONS.CATEGORY_MANAGE)
  remove(@OrgId() o: string, @Param('id') id: string) { return this.service.remove(o, id); }
}
