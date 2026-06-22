import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateReceiptDto } from './dto/receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  async list(orgId: string, q: PaginationQueryDto & { warehouseId?: string; status?: string }) {
    const where: any = { organizationId: orgId };
    if (q.warehouseId) where.warehouseId = q.warehouseId;
    if (q.status) where.status = q.status;
    if (q.search) where.reference = { contains: q.search, mode: 'insensitive' };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.receipt.count({ where }),
      this.prisma.receipt.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { receivedAt: 'desc' },
        include: { warehouse: true, purchaseOrder: { include: { supplier: true } } },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const r = await this.prisma.receipt.findFirst({
      where: { id, organizationId: orgId },
      include: {
        warehouse: true,
        purchaseOrder: { include: { supplier: true } },
        lines: { include: { product: { include: { unit: true } } } },
      },
    });
    if (!r) throw new NotFoundException();
    return r;
  }

  async create(orgId: string, dto: CreateReceiptDto) {
    const reference = dto.reference ?? (await this.nextReference(orgId));

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, organizationId: orgId },
    });
    if (!warehouse) throw new BadRequestException('Entrepôt invalide.');

    if (dto.purchaseOrderId) {
      const po = await this.prisma.purchaseOrder.findFirst({
        where: { id: dto.purchaseOrderId, organizationId: orgId },
      });
      if (!po) throw new BadRequestException('Commande invalide.');
      if (!['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
        throw new BadRequestException(
          `Impossible de réceptionner sur une commande à l'état ${po.status}.`,
        );
      }
    }

    return this.prisma.receipt.create({
      data: {
        organizationId: orgId,
        reference,
        warehouseId: dto.warehouseId,
        purchaseOrderId: dto.purchaseOrderId,
        notes: dto.notes,
        lines: {
          create: dto.lines.map((l) => ({
            productId: l.productId,
            purchaseOrderLineId: l.purchaseOrderLineId,
            quantity: l.quantity,
            unitCost: l.unitCost ?? 0,
            batchNumber: l.batchNumber,
            serialNumber: l.serialNumber,
            expiryDate: l.expiryDate ? new Date(l.expiryDate) : null,
          })),
        },
      },
      include: { lines: true },
    });
  }

  /**
   * Confirme une réception : impacte le stock et met à jour la commande liée.
   */
  async confirm(orgId: string, id: string, userId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id, organizationId: orgId },
      include: { lines: true, purchaseOrder: { include: { lines: true } } },
    });
    if (!receipt) throw new NotFoundException();
    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException('Seule une réception en brouillon peut être confirmée.');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of receipt.lines) {
        await this.stock.applyReceipt(
          tx as any,
          orgId,
          userId,
          line.productId,
          receipt.warehouseId,
          Number(line.quantity),
          Number(line.unitCost ?? 0),
          {
            reference: receipt.reference,
            batchNumber: line.batchNumber ?? undefined,
            serialNumber: line.serialNumber ?? undefined,
            expiryDate: line.expiryDate ?? undefined,
          },
        );

        if (line.purchaseOrderLineId) {
          const pol = await tx.purchaseOrderLine.findUnique({
            where: { id: line.purchaseOrderLineId },
          });
          if (pol) {
            await tx.purchaseOrderLine.update({
              where: { id: pol.id },
              data: { receivedQty: Number(pol.receivedQty) + Number(line.quantity) },
            });
          }
        }
      }

      if (receipt.purchaseOrder) {
        const po = await tx.purchaseOrder.findUnique({
          where: { id: receipt.purchaseOrder.id },
          include: { lines: true },
        });
        if (po) {
          const fullyReceived = po.lines.every(
            (l) => Number(l.receivedQty) >= Number(l.quantity),
          );
          const partiallyReceived = po.lines.some((l) => Number(l.receivedQty) > 0);
          await tx.purchaseOrder.update({
            where: { id: po.id },
            data: {
              status: fullyReceived ? 'RECEIVED' : partiallyReceived ? 'PARTIALLY_RECEIVED' : po.status,
              closedAt: fullyReceived ? new Date() : undefined,
            },
          });
        }
      }

      return tx.receipt.update({
        where: { id }, data: { status: 'CONFIRMED' },
      });
    });
  }

  async cancel(orgId: string, id: string) {
    const r = await this.prisma.receipt.findFirst({ where: { id, organizationId: orgId } });
    if (!r) throw new NotFoundException();
    if (r.status === 'CONFIRMED') {
      throw new BadRequestException('Une réception confirmée ne peut pas être annulée.');
    }
    return this.prisma.receipt.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  private async nextReference(orgId: string) {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `RC-${ym}-`;
    const last = await this.prisma.receipt.findFirst({
      where: { organizationId: orgId, reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
    });
    const lastSeq = last ? Number(last.reference.split('-').pop()) || 0 : 0;
    return `${prefix}${String(lastSeq + 1).padStart(4, '0')}`;
  }
}
