import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto & { acknowledged?: string; severity?: string; type?: string }) {
    const where: any = { organizationId: orgId };
    if (q.acknowledged !== undefined) where.acknowledged = q.acknowledged === 'true';
    if (q.severity) where.severity = q.severity;
    if (q.type) where.type = q.type;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.alert.count({ where }),
      this.prisma.alert.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: [{ acknowledged: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async acknowledge(orgId: string, id: string) {
    const a = await this.prisma.alert.findFirst({ where: { id, organizationId: orgId } });
    if (!a) throw new NotFoundException();
    return this.prisma.alert.update({
      where: { id },
      data: { acknowledged: true, acknowledgedAt: new Date() },
    });
  }

  /**
   * Génère les alertes de stock bas / rupture / périmé en analysant les positions.
   * À appeler via un cron ou un endpoint dédié.
   */
  async recompute(orgId: string) {
    const stock = await this.prisma.stockItem.findMany({
      where: { organizationId: orgId },
      include: { product: true, warehouse: true },
    });

    const created: any[] = [];
    for (const item of stock) {
      const qty = Number(item.quantity);
      const reorder = Number(item.product.reorderPoint ?? 0);
      const min = Number(item.product.minStock ?? 0);

      if (qty <= 0 && item.product.isStockable) {
        created.push(
          await this.prisma.alert.create({
            data: {
              organizationId: orgId,
              type: 'OUT_OF_STOCK',
              severity: 'CRITICAL',
              title: `Rupture : ${item.product.name}`,
              message: `Stock épuisé pour ${item.product.sku} dans ${item.warehouse.name}.`,
              entityType: 'Product',
              entityId: item.productId,
            },
          }),
        );
      } else if (reorder > 0 && qty <= reorder) {
        created.push(
          await this.prisma.alert.create({
            data: {
              organizationId: orgId,
              type: 'LOW_STOCK',
              severity: 'WARNING',
              title: `Stock bas : ${item.product.name}`,
              message: `Quantité (${qty}) en dessous du point de réapprovisionnement (${reorder}).`,
              entityType: 'Product',
              entityId: item.productId,
            },
          }),
        );
      }
    }
    return { created: created.length };
  }
}
