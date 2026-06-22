import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Articles')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get('units') @RequirePermissions(PERMISSIONS.PRODUCT_READ)
  units(@OrgId() o: string) { return this.service.listUnits(o); }

  @Get() @RequirePermissions(PERMISSIONS.PRODUCT_READ)
  list(@OrgId() o: string, @Query() q: PaginationQueryDto & { categoryId?: string; isActive?: string }) {
    return this.service.list(o, q);
  }

  @Get(':id') @RequirePermissions(PERMISSIONS.PRODUCT_READ)
  get(@OrgId() o: string, @Param('id') id: string) { return this.service.getById(o, id); }

  @Post() @RequirePermissions(PERMISSIONS.PRODUCT_MANAGE)
  create(@OrgId() o: string, @Body() d: CreateProductDto) { return this.service.create(o, d); }

  @Patch(':id') @RequirePermissions(PERMISSIONS.PRODUCT_MANAGE)
  update(@OrgId() o: string, @Param('id') id: string, @Body() d: UpdateProductDto) {
    return this.service.update(o, id, d);
  }

  @Delete(':id') @RequirePermissions(PERMISSIONS.PRODUCT_MANAGE)
  remove(@OrgId() o: string, @Param('id') id: string) { return this.service.remove(o, id); }
}
