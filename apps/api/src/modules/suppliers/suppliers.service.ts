import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto) {
    const where: any = { organizationId: orgId };
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { name: 'asc' },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const s = await this.prisma.supplier.findFirst({
      where: { id, organizationId: orgId },
      include: { productLinks: { include: { product: true } } },
    });
    if (!s) throw new NotFoundException('Fournisseur introuvable.');
    return s;
  }

  async create(orgId: string, dto: any) {
    const exists = await this.prisma.supplier.findUnique({
      where: { organizationId_code: { organizationId: orgId, code: dto.code } },
    });
    if (exists) throw new ConflictException('Ce code fournisseur existe déjà.');
    return this.prisma.supplier.create({ data: { ...dto, organizationId: orgId } });
  }

  async update(orgId: string, id: string, dto: any) {
    const s = await this.prisma.supplier.findFirst({ where: { id, organizationId: orgId } });
    if (!s) throw new NotFoundException();
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const s = await this.prisma.supplier.findFirst({ where: { id, organizationId: orgId } });
    if (!s) throw new NotFoundException();
    await this.prisma.supplier.delete({ where: { id } });
    return { success: true };
  }
}
