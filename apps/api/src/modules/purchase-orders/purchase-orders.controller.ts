import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';
import { CurrentUser, OrgId, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Achats')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Get() @RequirePermissions(PERMISSIONS.PURCHASE_READ)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto & { status?: string; supplierId?: string }) {
    return this.service.list(o, q);
  }

  @Get(':id') @RequirePermissions(PERMISSIONS.PURCHASE_READ)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.PURCHASE_CREATE)
  create(@OrgId() o: string, @CurrentUser() u: AuthenticatedUser, @Body() d: CreatePurchaseOrderDto) {
    return this.service.create(o, u.sub, d);
  }

  @Patch(':id') @RequirePermissions(PERMISSIONS.PURCHASE_CREATE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: UpdatePurchaseOrderDto) {
    return this.service.update(o, id, d);
  }

  @Post(':id/submit') @RequirePermissions(PERMISSIONS.PURCHASE_CREATE)
  submit(@OrgId() o: string, @Param('id') id: string) { return this.service.submit(o, id); }

  @Post(':id/approve') @RequirePermissions(PERMISSIONS.PURCHASE_APPROVE)
  approve(@OrgId() o: string, @Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.approve(o, id, u.sub);
  }

  @Post(':id/order') @RequirePermissions(PERMISSIONS.PURCHASE_APPROVE)
  order(@OrgId() o: string, @Param('id') id: string) { return this.service.markOrdered(o, id); }

  @Post(':id/cancel') @RequirePermissions(PERMISSIONS.PURCHASE_CANCEL)
  cancel(@OrgId() o: string, @Param('id') id: string) { return this.service.cancel(o, id); }
}
