import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InventoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto & { warehouseId?: string; status?: string }) {
    const where: any = { organizationId: orgId };
    if (q.warehouseId) where.warehouseId = q.warehouseId;
    if (q.status) where.status = q.status;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.inventory.count({ where }),
      this.prisma.inventory.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { createdAt: 'desc' }, include: { warehouse: true },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { id, organizationId: orgId },
      include: { warehouse: true, lines: { include: { product: { include: { unit: true } } } } },
    });
    if (!inv) throw new NotFoundException();
    return inv;
  }

  /**
   * Lance un inventaire : crée une fiche PLANNED puis pré-remplit
   * les lignes avec les positions actuelles du stock.
   */
  async start(orgId: string, dto: { warehouseId: string; reference?: string; notes?: string }) {
    const reference = dto.reference ?? (await this.nextReference(orgId));
    const stock = await this.prisma.stockItem.findMany({
      where: { organizationId: orgId, warehouseId: dto.warehouseId },
    });

    return this.prisma.inventory.create({
      data: {
        organizationId: orgId,
        warehouseId: dto.warehouseId,
        reference,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        notes: dto.notes,
        lines: {
          create: stock.map((s) => ({
            productId: s.productId,
            expectedQty: s.quantity,
            countedQty: s.quantity,
            variance: 0,
          })),
        },
      },
      include: { lines: true },
    });
  }

  async updateLine(orgId: string, id: string, lineId: string, countedQty: number, notes?: string) {
    const inv = await this.prisma.inventory.findFirst({ where: { id, organizationId: orgId } });
    if (!inv) throw new NotFoundException();
    if (inv.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Inventaire non modifiable.');
    }
    const line = await this.prisma.inventoryLine.findUnique({ where: { id: lineId } });
    if (!line || line.inventoryId !== id) throw new NotFoundException();
    const variance = countedQty - Number(line.expectedQty);
    return this.prisma.inventoryLine.update({
      where: { id: lineId },
      data: { countedQty, variance, notes },
    });
  }

  async complete(orgId: string, id: string) {
    const inv = await this.prisma.inventory.findFirst({ where: { id, organizationId: orgId } });
    if (!inv) throw new NotFoundException();
    if (inv.status !== 'IN_PROGRESS') throw new BadRequestException();
    return this.prisma.inventory.update({
      where: { id }, data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  /**
   * Valide l'inventaire : applique les écarts au stock comme mouvements INVENTORY.
   */
  async validate(orgId: string, id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findFirst({
        where: { id, organizationId: orgId }, include: { lines: true },
      });
      if (!inv) throw new NotFoundException();
      if (inv.status !== 'COMPLETED') {
        throw new BadRequestException('L\'inventaire doit être COMPLETED.');
      }

      for (const line of inv.lines) {
        const variance = Number(line.variance);
        if (variance === 0) continue;

        const item = await tx.stockItem.findUnique({
          where: { warehouseId_productId: { warehouseId: inv.warehouseId, productId: line.productId } },
        });
        const currentQty = item ? Number(item.quantity) : 0;
        const newQty = currentQty + variance;
        if (item) {
          await tx.stockItem.update({ where: { id: item.id }, data: { quantity: newQty } });
        } else {
          await tx.stockItem.create({
            data: {
              organizationId: orgId,
              warehouseId: inv.warehouseId,
              productId: line.productId,
              quantity: newQty,
              reservedQty: 0,
              avgCost: 0,
            },
          });
        }

        await tx.stockMovement.create({
          data: {
            organizationId: orgId,
            productId: line.productId,
            type: 'INVENTORY',
            quantity: Math.abs(variance),
            unitCost: 0,
            toWarehouseId: variance > 0 ? inv.warehouseId : null,
            fromWarehouseId: variance < 0 ? inv.warehouseId : null,
            userId,
            reference: inv.reference,
            reason: 'Validation inventaire',
          },
        });
      }

      return tx.inventory.update({
        where: { id }, data: { status: 'VALIDATED', validatedAt: new Date() },
      });
    });
  }

  private async nextReference(orgId: string) {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `INV-${ym}-`;
    const last = await this.prisma.inventory.findFirst({
      where: { organizationId: orgId, reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
    });
    const lastSeq = last ? Number(last.reference.split('-').pop()) || 0 : 0;
    return `${prefix}${String(lastSeq + 1).padStart(4, '0')}`;
  }
}
