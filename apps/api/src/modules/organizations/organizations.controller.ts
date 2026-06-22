import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { OrganizationsService } from './organizations.service';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Organisations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get('current')
  @RequirePermissions(PERMISSIONS.ORG_READ)
  current(@OrgId() orgId: string) {
    return this.service.getCurrent(orgId);
  }

  @Patch('current')
  @RequirePermissions(PERMISSIONS.ORG_UPDATE)
  update(@OrgId() orgId: string, @Body() dto: Record<string, string>) {
    return this.service.updateCurrent(orgId, dto);
  }

  @Get('current/stats')
  @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  stats(@OrgId() orgId: string) {
    return this.service.stats(orgId);
  }
}
