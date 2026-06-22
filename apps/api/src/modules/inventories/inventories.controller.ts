import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { InventoriesService } from './inventories.service';
import { CurrentUser, OrgId, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Inventaires')
@ApiBearerAuth()
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly service: InventoriesService) {}

  @Get() @RequirePermissions(PERMISSIONS.INVENTORY_READ)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto & { warehouseId?: string; status?: string }) {
    return this.service.list(o, q);
  }

  @Get(':id') @RequirePermissions(PERMISSIONS.INVENTORY_READ)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  start(@OrgId() o: string, @Body() d: { warehouseId: string; reference?: string; notes?: string }) {
    return this.service.start(o, d);
  }

  @Patch(':id/lines/:lineId') @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  updateLine(
    @OrgId() o: string,
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @Body() d: { countedQty: number; notes?: string },
  ) {
    return this.service.updateLine(o, id, lineId, d.countedQty, d.notes);
  }

  @Post(':id/complete') @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  complete(@OrgId() o: string, @Param('id') id: string) { return this.service.complete(o, id); }

  @Post(':id/validate') @RequirePermissions(PERMISSIONS.INVENTORY_VALIDATE)
  validate(@OrgId() o: string, @Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.validate(o, id, u.sub);
  }
}
