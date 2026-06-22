import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Fournisseurs')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get() @RequirePermissions(PERMISSIONS.SUPPLIER_READ)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto) { return this.service.list(o, q); }

  @Get(':id') @RequirePermissions(PERMISSIONS.SUPPLIER_READ)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.SUPPLIER_MANAGE)
  create(@OrgId() o: string, @Body() d: CreateSupplierDto) { return this.service.create(o, d); }

  @Patch(':id') @RequirePermissions(PERMISSIONS.SUPPLIER_MANAGE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: UpdateSupplierDto) {
    return this.service.update(o, id, d);
  }

  @Delete(':id') @RequirePermissions(PERMISSIONS.SUPPLIER_MANAGE)
  remove(@OrgId() o: string, @Param('id') id: string) { return this.service.remove(o, id); }
}
