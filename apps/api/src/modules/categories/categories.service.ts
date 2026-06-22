import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(orgId: string) {
    return this.prisma.category.findMany({
      where: { organizationId: orgId },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
  }

  async create(orgId: string, dto: { code: string; name: string; parentId?: string; description?: string }) {
    const exists = await this.prisma.category.findUnique({
      where: { organizationId_code: { organizationId: orgId, code: dto.code } },
    });
    if (exists) throw new ConflictException('Code catégorie déjà utilisé.');
    return this.prisma.category.create({ data: { ...dto, organizationId: orgId } });
  }

  async update(orgId: string, id: string, dto: any) {
    const c = await this.prisma.category.findFirst({ where: { id, organizationId: orgId } });
    if (!c) throw new NotFoundException();
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const c = await this.prisma.category.findFirst({ where: { id, organizationId: orgId } });
    if (!c) throw new NotFoundException();
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
