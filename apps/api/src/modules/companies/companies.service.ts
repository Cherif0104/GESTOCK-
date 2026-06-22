import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: PaginationQueryDto) {
    const where = {
      organizationId: orgId,
      ...(q.search
        ? { OR: [
            { name: { contains: q.search, mode: 'insensitive' as const } },
            { code: { contains: q.search, mode: 'insensitive' as const } },
          ] }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
        where, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
        orderBy: { name: 'asc' },
      }),
    ]);
    return { data, meta: buildPaginationMeta(total, q.page, q.pageSize) };
  }

  async getById(orgId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, organizationId: orgId },
      include: { sites: true },
    });
    if (!company) throw new NotFoundException('Société introuvable.');
    return company;
  }

  async create(orgId: string, dto: any) {
    const exists = await this.prisma.company.findUnique({
      where: { organizationId_code: { organizationId: orgId, code: dto.code } },
    });
    if (exists) throw new ConflictException('Ce code société existe déjà.');
    return this.prisma.company.create({ data: { ...dto, organizationId: orgId } });
  }

  async update(orgId: string, id: string, dto: any) {
    const c = await this.prisma.company.findFirst({ where: { id, organizationId: orgId } });
    if (!c) throw new NotFoundException();
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const c = await this.prisma.company.findFirst({ where: { id, organizationId: orgId } });
    if (!c) throw new NotFoundException();
    await this.prisma.company.delete({ where: { id } });
    return { success: true };
  }
}
