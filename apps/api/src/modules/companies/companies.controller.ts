import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Sociétés')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get() @RequirePermissions(PERMISSIONS.COMPANY_MANAGE)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto) { return this.service.list(o, q); }

  @Get(':id') @RequirePermissions(PERMISSIONS.COMPANY_MANAGE)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.COMPANY_MANAGE)
  create(@OrgId() o: string, @Body() d: CreateCompanyDto) { return this.service.create(o, d); }

  @Patch(':id') @RequirePermissions(PERMISSIONS.COMPANY_MANAGE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: UpdateCompanyDto) {
    return this.service.update(o, id, d);
  }

  @Delete(':id') @RequirePermissions(PERMISSIONS.COMPANY_MANAGE)
  remove(@OrgId() o: string, @Param('id') id: string) { return this.service.remove(o, id); }
}
