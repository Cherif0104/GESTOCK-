import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/receipt.dto';
import { CurrentUser, OrgId, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Réceptions')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly service: ReceiptsService) {}

  @Get() @RequirePermissions(PERMISSIONS.RECEIPT_READ)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto & { warehouseId?: string; status?: string }) {
    return this.service.list(o, q);
  }

  @Get(':id') @RequirePermissions(PERMISSIONS.RECEIPT_READ)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.RECEIPT_CREATE)
  create(@OrgId() o: string, @Body() d: CreateReceiptDto) { return this.service.create(o, d); }

  @Post(':id/confirm') @RequirePermissions(PERMISSIONS.RECEIPT_CONFIRM)
  confirm(@OrgId() o: string, @Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.confirm(o, id, u.sub);
  }

  @Post(':id/cancel') @RequirePermissions(PERMISSIONS.RECEIPT_CONFIRM)
  cancel(@OrgId() o: string, @Param('id') id: string) { return this.service.cancel(o, id); }
}
