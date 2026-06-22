import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { DashboardService } from './dashboard.service';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview') @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  overview(@OrgId() o: string) { return this.service.overview(o); }

  @Get('movements-by-type') @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  movements(@OrgId() o: string, @Query('days') days?: string) {
    return this.service.movementsByType(o, days ? Number(days) : 30);
  }

  @Get('top-products') @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  topProducts(@OrgId() o: string, @Query('limit') limit?: string) {
    return this.service.topProducts(o, limit ? Number(limit) : 10);
  }
}
