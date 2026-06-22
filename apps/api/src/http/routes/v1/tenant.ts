import {
  ErrorResponseSchema,
  TenantResponseSchema,
  TenantSnapshotResponseSchema
} from "@gestock/contracts/http";
import type { FastifyPluginAsync } from "fastify";
import type { AuditLogRepository } from "../../../infrastructure/db/audit-log-repository.js";
import type { TenantRepository } from "../../../infrastructure/db/tenant-repository.js";
import {
  requireAuthenticated,
  requirePermission,
  requireTenantContext
} from "../../plugins/guards.js";

type TenantRoutesOptions = {
  tenantRepository: TenantRepository;
  auditLogRepository: AuditLogRepository;
};

export const tenantRoutes: FastifyPluginAsync<TenantRoutesOptions> = async (app, options) => {
  app.get(
    "/tenant",
    {
      preHandler: [
        requireAuthenticated,
        requireTenantContext,
        requirePermission("tenant.read")
      ],
      schema: {
        response: {
          200: TenantResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema
        }
      }
    },
    async (request, reply) => {
      const tenantId = request.context.tenant.id;
      const tenant = await options.tenantRepository.getTenantById(tenantId);

      if (!tenant) {
        return reply.notFound(`Tenant not found: ${tenantId}`);
      }

      return {
        tenant
      };
    }
  );

  app.get(
    "/tenant/snapshot",
    {
      preHandler: [
        requireAuthenticated,
        requireTenantContext,
        requirePermission("tenant.snapshot.read")
      ],
      schema: {
        response: {
          200: TenantSnapshotResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema
        }
      }
    },
    async (request, reply) => {
      const tenantId = request.context.tenant.id;
      const tenant = await options.tenantRepository.getTenantById(tenantId);

      if (!tenant) {
        return reply.notFound(`Tenant not found: ${tenantId}`);
      }

      const snapshot = await options.tenantRepository.getSnapshotByTenantId(tenantId);

      await options.auditLogRepository.append({
        tenantId,
        actorUserId: request.context.user!.id,
        action: "tenant.snapshot.read",
        resourceType: "tenant_snapshot",
        resourceId: tenantId,
        metadata: {
          route: "/v1/tenant/snapshot"
        }
      });

      return {
        tenant,
        snapshot
      };
    }
  );
};
