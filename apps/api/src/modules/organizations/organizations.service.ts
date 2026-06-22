import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(orgId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organisation introuvable.');
    return org;
  }

  async updateCurrent(
    orgId: string,
    data: Partial<{
      displayName: string;
      legalName: string;
      country: string;
      defaultLocale: string;
      defaultCurrency: string;
      timezone: string;
      taxId: string;
      logoUrl: string;
    }>,
  ) {
    return this.prisma.organization.update({ where: { id: orgId }, data });
  }

  async stats(orgId: string) {
    const [users, warehouses, products, suppliers, stockItems, openPOs] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { organizationId: orgId } }),
      this.prisma.warehouse.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.product.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.supplier.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.stockItem.count({ where: { organizationId: orgId } }),
      this.prisma.purchaseOrder.count({
        where: { organizationId: orgId, status: { in: ['SUBMITTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'] } },
      }),
    ]);
    return { users, warehouses, products, suppliers, stockItems, openPurchaseOrders: openPOs };
  }
}
