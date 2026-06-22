import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async list(organizationId: string, query: PaginationQueryDto) {
    const { page, pageSize, search } = query;
    const where = {
      organizationId,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { userRoles: { include: { role: true } } },
      }),
    ]);

    return {
      data: items.map((u) => this.toView(u)),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  }

  async getById(organizationId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.toView(user);
  }

  async create(organizationId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { organizationId_email: { organizationId, email: dto.email.toLowerCase() } },
    });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    await this.assertRolesBelongToOrg(organizationId, dto.roleIds);

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.config.get<number>('security.bcryptRounds') ?? 12,
    );

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        locale: dto.locale ?? 'fr',
        status: 'ACTIVE',
        userRoles: { create: dto.roleIds.map((roleId) => ({ roleId })) },
      },
      include: { userRoles: { include: { role: true } } },
    });

    return this.toView(user);
  }

  async update(organizationId: string, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const data: Record<string, unknown> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      locale: dto.locale,
    };
    if (typeof dto.isActive === 'boolean') {
      data.status = dto.isActive ? 'ACTIVE' : 'DISABLED';
    }
    if (dto.password) {
      if (dto.password.length < 8) {
        throw new BadRequestException('Mot de passe trop court.');
      }
      data.passwordHash = await bcrypt.hash(
        dto.password,
        this.config.get<number>('security.bcryptRounds') ?? 12,
      );
    }

    if (dto.roleIds) {
      await this.assertRolesBelongToOrg(organizationId, dto.roleIds);
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { userRoles: { include: { role: true } } },
    });
    return this.toView(updated);
  }

  async remove(organizationId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  private async assertRolesBelongToOrg(organizationId: string, roleIds: string[]) {
    const count = await this.prisma.role.count({
      where: { id: { in: roleIds }, organizationId },
    });
    if (count !== roleIds.length) {
      throw new BadRequestException("Un ou plusieurs rôles n'appartiennent pas à votre organisation.");
    }
  }

  private toView(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      locale: user.locale,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      roles: user.userRoles?.map((ur: any) => ({ id: ur.role.id, key: ur.role.key, name: ur.role.name })) ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
