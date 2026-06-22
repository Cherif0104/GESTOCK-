import type { FastifyBaseLogger } from "fastify";

export type AuditLogEntry = {
  tenantId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

export interface AuditLogRepository {
  append(entry: AuditLogEntry): Promise<void>;
}

export class LoggerAuditLogRepository implements AuditLogRepository {
  constructor(private readonly logger: FastifyBaseLogger) {}

  async append(entry: AuditLogEntry): Promise<void> {
    // Placeholder d'audit: aujourd'hui log applicatif, demain insertion SQL
    // transactionnelle dans app.audit_logs.
    this.logger.info({ audit: entry }, "audit-event");
  }
}
