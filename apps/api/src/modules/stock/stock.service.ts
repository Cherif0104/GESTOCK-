import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AdjustStockDto, TransferStockDto, StockMovementFilterDto } from './dto/stock.dto';

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // Lecture des positions
  // --------------------------------------------------------------------------
  async positions(
    orgId: string,
    q: PaginationQueryDto & { warehouseId?: string; productId?: string; lowStock?: string },
  ) {
    const where: any = { organizationId: orgId };
    if (q.warehouseId) where.warehouseId = q.warehouseId;
    if (q.productId) where.productId = q.productId;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.stockItem.count({ where }),
      this.prisma.stockItem.findMany({
        where,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: { include: { unit: true, category: true } },
          warehouse: true,
        },
      }),
    ]);

    let filtered = data;
    if (q.lowStock === 'true') {
      filtered = data.filter(
        (s) => Number(s.quantity) <= Number(s.product.reorderPoint ?? 0),
      );
    }

    return {
      data: filtered.map((s) => ({
        ...s,
        quantity: Number(s.quantity),
        reservedQty: Number(s.reservedQty),
        available: Number(s.quantity) - Number(s.reservedQty),
      })),
      meta: buildPaginationMeta(total, q.page, q.pageSize),
    };
  }

  // --------------------------------------------------------------------------
  // Liste des mouvements
  // --------------------------------------------------------------------------
  async movements(orgId: string, q: PaginationQueryDto & StockMovementFilterDto) {
    const where: any = { organizationId: orgId };
    if (q.productId) where.productId = q.productId;
    if (q.type) where.type = q.type;
    if (q.warehouseId) {
      where.OR = [{ fromWarehouseId: q.warehouseId }, { toWarehouseId: q.warehouseId }];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        orderBy: { occurredAt: 'desc' },
        include: {
          product: true,
          fromWarehouse: true,
          toWarehouse: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    return {
      data: data.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        unitCost: Number(m.unitCost),
      })),
      meta: buildPaginationMeta(total, q.page, q.pageSize),
    };
  }

  // --------------------------------------------------------------------------
  // Transfert inter-entrepôts
  // --------------------------------------------------------------------------
  async transfer(orgId: string, userId: string, dto: TransferStockDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException("L'entrepôt source et destination doivent être différents.");
    }
    if (dto.quantity <= 0) throw new BadRequestException('Quantité invalide.');

    return this.prisma.$transaction(async (tx) => {
      await this.assertWarehouse(tx as unknown as Tx, orgId, dto.fromWarehouseId);
      await this.assertWarehouse(tx as unknown as Tx, orgId, dto.toWarehouseId);
      await this.assertProduct(tx as unknown as Tx, orgId, dto.productId);

      const fromItem = await this.getOrCreateStockItem(
        tx as unknown as Tx,
        orgId,
        dto.fromWarehouseId,
        dto.productId,
      );
      if (Number(fromItem.quantity) < dto.quantity) {
        throw new BadRequestException('Stock insuffisant pour le transfert.');
      }

      const toItem = await this.getOrCreateStockItem(
        tx as unknown as Tx,
        orgId,
        dto.toWarehouseId,
        dto.productId,
      );

      const newFromQty = Number(fromItem.quantity) - dto.quantity;
      const newToQty = Number(toItem.quantity) + dto.quantity;

      await tx.stockItem.update({
        where: { id: fromItem.id },
        data: { quantity: newFromQty },
      });
      await tx.stockItem.update({
        where: { id: toItem.id },
        data: { quantity: newToQty, avgCost: Number(fromItem.avgCost) },
      });

      const baseMovement: Prisma.StockMovementCreateInput = {
        organization: { connect: { id: orgId } },
        product: { connect: { id: dto.productId } },
        quantity: dto.quantity,
        unitCost: Number(fromItem.avgCost),
        type: 'TRANSFER_OUT',
        fromWarehouse: { connect: { id: dto.fromWarehouseId } },
        toWarehouse: { connect: { id: dto.toWarehouseId } },
        user: { connect: { id: userId } },
        reference: dto.reference,
        reason: dto.reason,
      };

      const outMv = await tx.stockMovement.create({ data: baseMovement });
      const inMv = await tx.stockMovement.create({
        data: { ...baseMovement, type: 'TRANSFER_IN' },
      });

      return { out: outMv, in: inMv };
    });
  }

  // --------------------------------------------------------------------------
  // Ajustement (correction d'inventaire ponctuel)
  // --------------------------------------------------------------------------
  async adjust(orgId: string, userId: string, dto: AdjustStockDto) {
    if (dto.quantity === 0) throw new BadRequestException('Quantité nulle.');

    return this.prisma.$transaction(async (tx) => {
      await this.assertWarehouse(tx as unknown as Tx, orgId, dto.warehouseId);
      await this.assertProduct(tx as unknown as Tx, orgId, dto.productId);

      const item = await this.getOrCreateStockItem(
        tx as unknown as Tx,
        orgId,
        dto.warehouseId,
        dto.productId,
      );
      const newQty = Number(item.quantity) + dto.quantity;
      if (newQty < 0) throw new BadRequestException('Le stock ne peut pas devenir négatif.');

      await tx.stockItem.update({ where: { id: item.id }, data: { quantity: newQty } });

      return tx.stockMovement.create({
        data: {
          organizationId: orgId,
          productId: dto.productId,
          quantity: Math.abs(dto.quantity),
          unitCost: Number(item.avgCost),
          type: dto.quantity > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
          toWarehouseId: dto.quantity > 0 ? dto.warehouseId : null,
          fromWarehouseId: dto.quantity < 0 ? dto.warehouseId : null,
          userId,
          reason: dto.reason,
          reference: dto.reference,
        },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Helpers internes (réutilisés par d'autres modules : réceptions, inventaires)
  // --------------------------------------------------------------------------
  async getOrCreateStockItem(
    tx: Tx,
    organizationId: string,
    warehouseId: string,
    productId: string,
  ) {
    const existing = await tx.stockItem.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } },
    });
    if (existing) return existing;
    return tx.stockItem.create({
      data: { organizationId, warehouseId, productId, quantity: 0, reservedQty: 0, avgCost: 0 },
    });
  }

  async applyReceipt(
    tx: Tx,
    orgId: string,
    userId: string | null,
    productId: string,
    warehouseId: string,
    quantity: number,
    unitCost: number,
    extra: { reference?: string; batchNumber?: string; serialNumber?: string; expiryDate?: Date | null },
  ) {
    if (quantity <= 0) throw new BadRequestException('Quantité reçue invalide.');

    const item = await this.getOrCreateStockItem(tx, orgId, warehouseId, productId);
    const currentQty = Number(item.quantity);
    const currentAvg = Number(item.avgCost);
    const newQty = currentQty + quantity;
    const newAvgCost =
      currentQty + quantity === 0
        ? unitCost
        : (currentQty * currentAvg + quantity * unitCost) / (currentQty + quantity);

    await tx.stockItem.update({
      where: { id: item.id },
      data: { quantity: newQty, avgCost: newAvgCost },
    });

    return tx.stockMovement.create({
      data: {
        organizationId: orgId,
        productId,
        type: 'RECEIPT',
        quantity,
        unitCost,
        toWarehouseId: warehouseId,
        userId: userId ?? undefined,
        reference: extra.reference,
        batchNumber: extra.batchNumber,
        serialNumber: extra.serialNumber,
        expiryDate: extra.expiryDate ?? undefined,
      },
    });
  }

  private async assertWarehouse(tx: Tx, orgId: string, id: string) {
    const w = await tx.warehouse.findFirst({ where: { id, organizationId: orgId } });
    if (!w) throw new NotFoundException(`Entrepôt ${id} introuvable.`);
  }

  private async assertProduct(tx: Tx, orgId: string, id: string) {
    const p = await tx.product.findFirst({ where: { id, organizationId: orgId } });
    if (!p) throw new NotFoundException(`Article ${id} introuvable.`);
  }
}
