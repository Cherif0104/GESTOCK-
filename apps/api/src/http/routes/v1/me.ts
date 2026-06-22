import { ErrorResponseSchema, MeResponseSchema } from "@gestock/contracts/http";
import type { FastifyPluginAsync } from "fastify";
import { requireAuthenticated, requirePermission } from "../../plugins/guards.js";

export const meRoute: FastifyPluginAsync = async (app) => {
  app.get(
    "/me",
    {
      preHandler: [requireAuthenticated, requirePermission("me.read")],
      schema: {
        response: {
          200: MeResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema
        }
      }
    },
    async (request) => ({
      user: {
        id: request.context.user!.id,
        email: request.context.user!.email,
        roles: request.context.user!.roles,
        tenantId: request.context.user!.tenantId
      },
      auth: {
        authenticationMode: request.context.authenticationMode,
        tokenSource: request.context.tokenSource
      }
    })
  );
};
