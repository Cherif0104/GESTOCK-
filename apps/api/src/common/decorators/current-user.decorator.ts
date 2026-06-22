import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface AuthenticatedUser {
  sub: string;
  organizationId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);

export const OrgId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  return (request.user as AuthenticatedUser)?.organizationId;
});
