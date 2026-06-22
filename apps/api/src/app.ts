import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyInstance } from "fastify";
import type { ApiEnv } from "./config/env.js";
import { loadEnv } from "./config/env.js";
import { LoggerAuditLogRepository } from "./infrastructure/db/audit-log-repository.js";
import { createDatabaseClient } from "./infrastructure/db/db-client.js";
import { InMemoryTenantRepository } from "./infrastructure/db/tenant-repository.js";
import { registerPlugins } from "./http/plugins/register-plugins.js";
import { healthRoutes } from "./http/routes/health.js";
import { v1Routes } from "./http/routes/v1/index.js";
import { UnsafeJwtPassthroughVerifier } from "./shared/auth/token-verifier.js";

export type AppBuildOptions = {
  env?: ApiEnv;
};

export const buildApp = async (options: AppBuildOptions = {}): Promise<FastifyInstance> => {
  const env = options.env ?? loadEnv();
  const app = Fastify({
    logger: true
  }).withTypeProvider<TypeBoxTypeProvider>();

  const dbClient = createDatabaseClient(env.databaseMode);
  const tenantRepository = new InMemoryTenantRepository(env);
  const auditLogRepository = new LoggerAuditLogRepository(app.log);
  const tokenVerifier = new UnsafeJwtPassthroughVerifier();

  await registerPlugins(app, { env, tokenVerifier });
  await app.register(healthRoutes, { serviceName: env.serviceName, dbClient });
  await app.register(v1Routes, {
    prefix: env.apiPrefix,
    tenantRepository,
    auditLogRepository
  });

  return app;
};
