import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { AuditService } from './audit.service';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get() @RequirePermissions(PERMISSIONS.AUDIT_READ)
  list(
    @OrgId() o: string,
    @Query() q: PaginationQueryDto & { entityType?: string; entityId?: string; userId?: string },
  ) {
    return this.service.list(o, q);
  }
}
