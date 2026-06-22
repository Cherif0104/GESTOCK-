import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto & { siteId?: string }) {
    const where: any = { organizationId: orgId };
    if (q.siteId) where.siteId = q.siteId;
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.warehouse.count({ where }),
      this.prisma.warehouse.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { name: 'asc' },
        include: { site: { include: { company: true } } },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const w = await this.prisma.warehouse.findFirst({
      where: { id, organizationId: orgId },
      include: { site: { include: { company: true } }, locations: true },
    });
    if (!w) throw new NotFoundException();
    return w;
  }

  async create(orgId: string, dto: any) {
    const exists = await this.prisma.warehouse.findUnique({
      where: { organizationId_code: { organizationId: orgId, code: dto.code } },
    });
    if (exists) throw new ConflictException('Ce code entrepôt existe déjà.');
    return this.prisma.warehouse.create({ data: { ...dto, organizationId: orgId } });
  }

  async update(orgId: string, id: string, dto: any) {
    const w = await this.prisma.warehouse.findFirst({ where: { id, organizationId: orgId } });
    if (!w) throw new NotFoundException();
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const w = await this.prisma.warehouse.findFirst({ where: { id, organizationId: orgId } });
    if (!w) throw new NotFoundException();
    await this.prisma.warehouse.delete({ where: { id } });
    return { success: true };
  }
}
