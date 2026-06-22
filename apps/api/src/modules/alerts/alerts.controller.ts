import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { AlertsService } from './alerts.service';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Alertes')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get() @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  list(
    @OrgId() o: string,
    @Query() q: PaginationQueryDto & { acknowledged?: string; severity?: string; type?: string },
  ) {
    return this.service.list(o, q);
  }

  @Post(':id/acknowledge') @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  ack(@OrgId() o: string, @Param('id') id: string) { return this.service.acknowledge(o, id); }

  @Post('recompute') @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  recompute(@OrgId() o: string) { return this.service.recompute(o); }
}
