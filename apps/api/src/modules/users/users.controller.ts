import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@gestock/shared';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { OrgId } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  list(@OrgId() orgId: string, @Query() query: PaginationQueryDto) {
    return this.service.list(orgId, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER_READ)
  get(@OrgId() orgId: string, @Param('id') id: string) {
    return this.service.getById(orgId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_CREATE)
  create(@OrgId() orgId: string, @Body() dto: CreateUserDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER_UPDATE)
  update(@OrgId() orgId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USER_DELETE)
  remove(@OrgId() orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
