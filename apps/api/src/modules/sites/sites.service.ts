import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto & { companyId?: string }) {
    const where: any = { organizationId: orgId };
    if (q.companyId) where.companyId = q.companyId;
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.site.count({ where }),
      this.prisma.site.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { name: 'asc' }, include: { company: true, warehouses: true },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const s = await this.prisma.site.findFirst({
      where: { id, organizationId: orgId },
      include: { company: true, warehouses: true },
    });
    if (!s) throw new NotFoundException();
    return s;
  }

  async create(orgId: string, dto: any) {
    const exists = await this.prisma.site.findUnique({
      where: { organizationId_code: { organizationId: orgId, code: dto.code } },
    });
    if (exists) throw new ConflictException('Ce code site existe déjà.');
    return this.prisma.site.create({ data: { ...dto, organizationId: orgId } });
  }

  async update(orgId: string, id: string, dto: any) {
    const s = await this.prisma.site.findFirst({ where: { id, organizationId: orgId } });
    if (!s) throw new NotFoundException();
    return this.prisma.site.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const s = await this.prisma.site.findFirst({ where: { id, organizationId: orgId } });
    if (!s) throw new NotFoundException();
    await this.prisma.site.delete({ where: { id } });
    return { success: true };
  }
}
