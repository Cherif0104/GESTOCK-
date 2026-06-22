import type { FastifyReply, FastifyRequest } from "fastify";
import { isAllowed, type Permission } from "../../shared/auth/authorization.js";

export const requireAuthenticated = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.context.user) {
    await reply.unauthorized(
      "Authentication required. Provide a dev header context or a bearer token."
    );
    return;
  }
};

export const requireTenantContext = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.context.tenant.id) {
    await reply.badRequest("Tenant context missing.");
    return;
  }
};

export const requirePermission = (permission: Permission) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.context.user) {
      await reply.unauthorized(
        "Authentication required. Provide a dev header context or a bearer token."
      );
      return;
    }

    const allowed = isAllowed(request.context.user, permission, request.context.tenant.id);
    if (!allowed) {
      await reply.forbidden(`Missing permission: ${permission}`);
      return;
    }
  };
};
