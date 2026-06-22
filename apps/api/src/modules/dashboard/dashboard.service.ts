import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(orgId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30 = new Date(now.getTime() - 30 * 86400 * 1000);

    const [
      products,
      activeWarehouses,
      suppliers,
      stockItems,
      openPOs,
      monthPOs,
      criticalAlerts,
      recentMovements,
    ] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.warehouse.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.supplier.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.stockItem.count({ where: { organizationId: orgId } }),
      this.prisma.purchaseOrder.count({
        where: {
          organizationId: orgId,
          status: { in: ['SUBMITTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'] },
        },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { organizationId: orgId, orderDate: { gte: startOfMonth } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.alert.count({
        where: { organizationId: orgId, severity: 'CRITICAL', acknowledged: false },
      }),
      this.prisma.stockMovement.findMany({
        where: { organizationId: orgId, occurredAt: { gte: last30 } },
        orderBy: { occurredAt: 'desc' },
        take: 10,
        include: {
          product: { select: { sku: true, name: true } },
          fromWarehouse: { select: { code: true, name: true } },
          toWarehouse: { select: { code: true, name: true } },
        },
      }),
    ]);

    const stockValueAgg = await this.prisma.$queryRawUnsafe<{ value: number | null }[]>(
      `SELECT COALESCE(SUM(quantity * "avgCost"), 0)::float AS value
       FROM stock_items WHERE "organizationId" = $1`,
      orgId,
    );
    const stockValue = Number(stockValueAgg?.[0]?.value ?? 0);

    return {
      kpis: {
        activeProducts: products,
        activeWarehouses,
        activeSuppliers: suppliers,
        stockItems,
        openPurchaseOrders: openPOs,
        criticalAlerts,
        monthlyPurchases: {
          count: monthPOs._count,
          total: Number(monthPOs._sum.total ?? 0),
        },
        stockValue,
      },
      recentMovements,
    };
  }

  async movementsByType(orgId: string, days = 30) {
    const since = new Date(Date.now() - days * 86400 * 1000);
    const grouped = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: { organizationId: orgId, occurredAt: { gte: since } },
      _count: true,
      _sum: { quantity: true },
    });
    return grouped.map((g) => ({
      type: g.type,
      count: g._count,
      quantity: Number(g._sum.quantity ?? 0),
    }));
  }

  async topProducts(orgId: string, limit = 10) {
    const rows = await this.prisma.$queryRawUnsafe<
      { productId: string; sku: string; name: string; totalQty: number }[]
    >(
      `SELECT p.id AS "productId", p.sku, p.name, COALESCE(SUM(si.quantity), 0)::float AS "totalQty"
       FROM products p
       LEFT JOIN stock_items si ON si."productId" = p.id
       WHERE p."organizationId" = $1
       GROUP BY p.id ORDER BY "totalQty" DESC LIMIT $2`,
      orgId,
      limit,
    );
    return rows;
  }
}
