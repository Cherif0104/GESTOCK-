import { HealthResponseSchema, ReadyResponseSchema } from "@gestock/contracts/http";
import type { FastifyPluginAsync } from "fastify";
import type { DatabaseClient } from "../../infrastructure/db/db-client.js";

type HealthRoutesOptions = {
  serviceName: string;
  dbClient: DatabaseClient;
};

export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (app, options) => {
  app.get(
    "/health",
    {
      schema: {
        response: {
          200: HealthResponseSchema
        }
      }
    },
    async () => ({
      status: "ok",
      service: options.serviceName,
      timestamp: new Date().toISOString()
    })
  );

  app.get(
    "/ready",
    {
      schema: {
        response: {
          200: ReadyResponseSchema,
          503: ReadyResponseSchema
        }
      }
    },
    async (request, reply) => {
      const dbReady = await options.dbClient.ping();
      const tenantContextReady = Boolean(request.context?.tenant?.id);
      const ready = dbReady && tenantContextReady;

      const payload = {
        status: ready ? "ready" : "degraded",
        checks: {
          database: dbReady,
          tenantContext: tenantContextReady
        },
        timestamp: new Date().toISOString()
      } as const;

      if (!ready) {
        request.log.warn(payload, "Readiness check degraded.");
        return reply.status(503).send(payload);
      }

      return payload;
    }
  );
};
