import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto & { categoryId?: string; isActive?: string }) {
    const where: any = { organizationId: orgId };
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.isActive !== undefined) where.isActive = q.isActive === 'true';
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { sku: { contains: q.search, mode: 'insensitive' } },
        { barcode: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = q.sortBy
      ? { [q.sortBy]: q.sortDir ?? 'asc' }
      : { name: 'asc' };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize, orderBy,
        include: { category: true, unit: true },
      }),
    ]);

    const ids = data.map((p) => p.id);
    const stockSums = ids.length
      ? await this.prisma.stockItem.groupBy({
          by: ['productId'],
          where: { organizationId: orgId, productId: { in: ids } },
          _sum: { quantity: true, reservedQty: true },
        })
      : [];
    const stockByProduct = new Map(
      stockSums.map((s) => [s.productId, Number(s._sum.quantity ?? 0)]),
    );

    return {
      data: data.map((p) => ({ ...p, totalStock: stockByProduct.get(p.id) ?? 0 })),
      meta: buildPaginationMeta(total, q.page, q.pageSize),
    };
  }

  async getById(orgId: string, id: string) {
    const p = await this.prisma.product.findFirst({
      where: { id, organizationId: orgId },
      include: {
        category: true,
        unit: true,
        stockItems: { include: { warehouse: true } },
        supplierLinks: { include: { supplier: true } },
      },
    });
    if (!p) throw new NotFoundException('Article introuvable.');
    return p;
  }

  async create(orgId: string, dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { organizationId_sku: { organizationId: orgId, sku: dto.sku } },
    });
    if (exists) throw new ConflictException('Ce SKU existe déjà.');
    return this.prisma.product.create({ data: { ...dto, organizationId: orgId } });
  }

  async update(orgId: string, id: string, dto: UpdateProductDto) {
    const p = await this.prisma.product.findFirst({ where: { id, organizationId: orgId } });
    if (!p) throw new NotFoundException();
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const p = await this.prisma.product.findFirst({ where: { id, organizationId: orgId } });
    if (!p) throw new NotFoundException();
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  // UoM list (utile au frontend)
  listUnits(orgId: string) {
    return this.prisma.unitOfMeasure.findMany({
      where: { organizationId: orgId }, orderBy: { code: 'asc' },
    });
  }
}
