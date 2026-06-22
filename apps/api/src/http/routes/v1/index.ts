import type { FastifyPluginAsync } from "fastify";
import type { AuditLogRepository } from "../../../infrastructure/db/audit-log-repository.js";
import type { TenantRepository } from "../../../infrastructure/db/tenant-repository.js";
import { meRoute } from "./me.js";
import { tenantRoutes } from "./tenant.js";

type V1RoutesOptions = {
  tenantRepository: TenantRepository;
  auditLogRepository: AuditLogRepository;
};

export const v1Routes: FastifyPluginAsync<V1RoutesOptions> = async (app, options) => {
  await app.register(meRoute);
  await app.register(tenantRoutes, {
    tenantRepository: options.tenantRepository,
    auditLogRepository: options.auditLogRepository
  });
};
