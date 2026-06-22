import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Entrepôts')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get() @RequirePermissions(PERMISSIONS.WAREHOUSE_READ)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto & { siteId?: string }) {
    return this.service.list(o, q);
  }

  @Get(':id') @RequirePermissions(PERMISSIONS.WAREHOUSE_READ)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.WAREHOUSE_MANAGE)
  create(@OrgId() o: string, @Body() d: CreateWarehouseDto) { return this.service.create(o, d); }

  @Patch(':id') @RequirePermissions(PERMISSIONS.WAREHOUSE_MANAGE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: UpdateWarehouseDto) {
    return this.service.update(o, id, d);
  }

  @Delete(':id') @RequirePermissions(PERMISSIONS.WAREHOUSE_MANAGE)
  remove(@OrgId() o: string, @Param('id') id: string) { return this.service.remove(o, id); }
}
