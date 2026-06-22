import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { StockService } from './stock.service';
import { AdjustStockDto, StockMovementFilterDto, TransferStockDto } from './dto/stock.dto';
import { CurrentUser, OrgId, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get('positions') @RequirePermissions(PERMISSIONS.STOCK_READ)
  positions(
    @OrgId() o: string,
    @Query() q: PaginationQueryDto & { warehouseId?: string; productId?: string; lowStock?: string },
  ) {
    return this.service.positions(o, q);
  }

  @Get('movements') @RequirePermissions(PERMISSIONS.STOCK_READ)
  movements(@OrgId() o: string, @Query() q: PaginationQueryDto & StockMovementFilterDto) {
    return this.service.movements(o, q);
  }

  @Post('transfers') @RequirePermissions(PERMISSIONS.STOCK_TRANSFER)
  transfer(@OrgId() o: string, @CurrentUser() u: AuthenticatedUser, @Body() dto: TransferStockDto) {
    return this.service.transfer(o, u.sub, dto);
  }

  @Post('adjustments') @RequirePermissions(PERMISSIONS.STOCK_ADJUST)
  adjust(@OrgId() o: string, @CurrentUser() u: AuthenticatedUser, @Body() dto: AdjustStockDto) {
    return this.service.adjust(o, u.sub, dto);
  }
}
