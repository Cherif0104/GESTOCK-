import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@gestock/shared';

export const PERMISSIONS_KEY = 'requiredPermissions';
export const RequirePermissions = (...permissions: Permission[]): MethodDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
