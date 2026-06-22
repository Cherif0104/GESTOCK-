import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto & { status?: string; supplierId?: string }) {
    const where: any = { organizationId: orgId };
    if (q.status) where.status = q.status;
    if (q.supplierId) where.supplierId = q.supplierId;
    if (q.search) where.reference = { contains: q.search, mode: 'insensitive' };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { orderDate: 'desc' },
        include: { supplier: true, createdBy: { select: { firstName: true, lastName: true } } },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId: orgId },
      include: {
        supplier: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        lines: { include: { product: { include: { unit: true } } } },
        receipts: true,
      },
    });
    if (!po) throw new NotFoundException('Commande introuvable.');
    return po;
  }

  async create(orgId: string, userId: string, dto: CreatePurchaseOrderDto) {
    const reference = dto.reference ?? (await this.nextReference(orgId));

    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, organizationId: orgId },
    });
    if (!supplier) throw new BadRequestException('Fournisseur invalide.');

    const productIds = dto.lines.map((l) => l.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, organizationId: orgId },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Un ou plusieurs articles sont invalides.');
    }

    const subtotal = dto.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const taxAmount = dto.lines.reduce(
      (s, l) => s + l.unitPrice * l.quantity * (l.taxRate ?? 0),
      0,
    );
    const total = subtotal + taxAmount;

    try {
      return await this.prisma.purchaseOrder.create({
        data: {
          organizationId: orgId,
          reference,
          supplierId: dto.supplierId,
          currency: dto.currency ?? supplier.currency ?? 'XOF',
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
          notes: dto.notes,
          subtotal, taxAmount, total,
          createdById: userId,
          lines: {
            create: dto.lines.map((l) => ({
              productId: l.productId,
              description: l.description,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              taxRate: l.taxRate ?? 0,
              lineTotal: l.unitPrice * l.quantity * (1 + (l.taxRate ?? 0)),
            })),
          },
        },
        include: { lines: true, supplier: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Référence déjà utilisée.');
      throw e;
    }
  }

  async update(orgId: string, id: string, dto: UpdatePurchaseOrderDto) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, organizationId: orgId } });
    if (!po) throw new NotFoundException();
    if (po.status !== 'DRAFT') {
      throw new BadRequestException('Seule une commande en brouillon peut être modifiée.');
    }
    // Mise à jour simple (les lignes peuvent être remplacées en bloc)
    return this.prisma.$transaction(async (tx) => {
      if (dto.lines) {
        await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } });
        const subtotal = dto.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
        const taxAmount = dto.lines.reduce(
          (s, l) => s + l.unitPrice * l.quantity * (l.taxRate ?? 0),
          0,
        );
        await tx.purchaseOrderLine.createMany({
          data: dto.lines.map((l) => ({
            purchaseOrderId: id,
            productId: l.productId,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate ?? 0,
            lineTotal: l.unitPrice * l.quantity * (1 + (l.taxRate ?? 0)),
          })),
        });
        await tx.purchaseOrder.update({
          where: { id },
          data: { subtotal, taxAmount, total: subtotal + taxAmount },
        });
      }
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          notes: dto.notes,
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        },
        include: { lines: true },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Workflow
  // --------------------------------------------------------------------------
  async submit(orgId: string, id: string) {
    return this.transition(orgId, id, 'DRAFT', 'SUBMITTED');
  }
  async approve(orgId: string, id: string, userId: string) {
    const updated = await this.transition(orgId, id, 'SUBMITTED', 'APPROVED');
    return this.prisma.purchaseOrder.update({
      where: { id: updated.id },
      data: { approvedById: userId, approvedAt: new Date() },
    });
  }
  async markOrdered(orgId: string, id: string) {
    return this.transition(orgId, id, 'APPROVED', 'ORDERED');
  }
  async cancel(orgId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, organizationId: orgId } });
    if (!po) throw new NotFoundException();
    if (['RECEIVED', 'CLOSED', 'CANCELLED'].includes(po.status)) {
      throw new BadRequestException('Cette commande ne peut plus être annulée.');
    }
    return this.prisma.purchaseOrder.update({
      where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  private async transition(orgId: string, id: string, expected: string, next: string) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, organizationId: orgId } });
    if (!po) throw new NotFoundException();
    if (po.status !== expected) {
      throw new BadRequestException(`Transition impossible depuis l'état ${po.status}.`);
    }
    return this.prisma.purchaseOrder.update({
      where: { id }, data: { status: next as any },
    });
  }

  // --------------------------------------------------------------------------
  // Référence auto : PO-YYYYMM-NNNN
  // --------------------------------------------------------------------------
  private async nextReference(orgId: string) {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `PO-${ym}-`;
    const last = await this.prisma.purchaseOrder.findFirst({
      where: { organizationId: orgId, reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
    });
    const lastSeq = last ? Number(last.reference.split('-').pop()) || 0 : 0;
    return `${prefix}${String(lastSeq + 1).padStart(4, '0')}`;
  }
}
