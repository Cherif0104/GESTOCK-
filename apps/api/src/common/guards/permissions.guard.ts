import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@gestock/shared';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) throw new ForbiddenException('Utilisateur non authentifié.');

    const granted = new Set(user.permissions ?? []);
    const missing = required.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Permission(s) manquante(s) : ${missing.join(', ')}`,
      );
    }
    return true;
  }
}
