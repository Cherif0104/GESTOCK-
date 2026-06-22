import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    orgId: string,
    userId: string | null,
    action: string,
    entityType: string,
    entityId?: string | null,
    payload?: any,
    meta?: { ip?: string; userAgent?: string },
  ) {
    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action,
        entityType,
        entityId: entityId ?? null,
        payload: payload ?? undefined,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      },
    });
  }

  async list(
    orgId: string,
    q: PaginationQueryDto & { entityType?: string; entityId?: string; userId?: string },
  ) {
    const where: any = { organizationId: orgId };
    if (q.entityType) where.entityType = q.entityType;
    if (q.entityId) where.entityId = q.entityId;
    if (q.userId) where.userId = q.userId;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }
}
