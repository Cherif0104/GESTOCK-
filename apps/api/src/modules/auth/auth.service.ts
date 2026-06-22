import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RefreshTokenDto, RegisterOrganizationDto } from './dto/auth.dto';
import { ALL_PERMISSIONS, SystemRole } from '@gestock/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // --------------------------------------------------------------------------
  // Inscription d'une nouvelle organisation + admin initial
  // --------------------------------------------------------------------------
  async registerOrganization(dto: RegisterOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
    });
    if (existing) {
      throw new ConflictException('Ce slug d\'organisation est déjà utilisé.');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const org = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          slug: dto.organizationSlug,
          legalName: dto.organizationName,
          displayName: dto.organizationName,
          country: dto.country ?? 'CI',
          defaultCurrency: dto.currency ?? 'XOF',
        },
      });

      const adminRole = await tx.role.create({
        data: {
          organizationId: organization.id,
          key: SystemRole.ORG_ADMIN,
          name: 'Administrateur',
          description: 'Accès complet à l\'organisation.',
          isSystem: true,
          permissions: [...ALL_PERMISSIONS],
        },
      });

      const viewerRole = await tx.role.create({
        data: {
          organizationId: organization.id,
          key: SystemRole.VIEWER,
          name: 'Consultation',
          description: 'Accès en lecture seule.',
          isSystem: true,
          permissions: [
            'organization:read',
            'user:read',
            'role:read',
            'warehouse:read',
            'product:read',
            'supplier:read',
            'purchase:read',
            'receipt:read',
            'stock:read',
            'inventory:read',
            'dashboard:read',
            'report:read',
          ],
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: 'ACTIVE',
          userRoles: { create: [{ roleId: adminRole.id }] },
        },
        include: { userRoles: { include: { role: true } } },
      });

      // Données de base : devise/UOM par défaut
      await tx.unitOfMeasure.createMany({
        data: [
          { organizationId: organization.id, code: 'UN', name: 'Unité', symbol: 'u', precision: 0 },
          { organizationId: organization.id, code: 'KG', name: 'Kilogramme', symbol: 'kg', precision: 3 },
          { organizationId: organization.id, code: 'L', name: 'Litre', symbol: 'L', precision: 2 },
          { organizationId: organization.id, code: 'CT', name: 'Carton', symbol: 'ctn', precision: 0 },
        ],
      });

      return { organization, user, _viewerRoleId: viewerRole.id };
    });

    return this.issueTokens(org.user.id);
  }

  // --------------------------------------------------------------------------
  // Connexion
  // --------------------------------------------------------------------------
  async login(dto: LoginDto, meta?: { userAgent?: string; ip?: string }) {
    const where = dto.organizationSlug
      ? {
          organizationId_email: {
            organizationId: (
              await this.prisma.organization.findUnique({
                where: { slug: dto.organizationSlug },
                select: { id: true },
              })
            )?.id ?? '__none__',
            email: dto.email.toLowerCase(),
          },
        }
      : undefined;

    const user = where
      ? await this.prisma.user.findUnique({ where })
      : await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase() } });

    if (!user) throw new UnauthorizedException('Identifiants invalides.');
    if (user.status !== 'ACTIVE')
      throw new UnauthorizedException('Compte désactivé.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(user.id, meta);
  }

  // --------------------------------------------------------------------------
  // Rafraîchissement
  // --------------------------------------------------------------------------
  async refresh(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.userId);
  }

  // --------------------------------------------------------------------------
  // Déconnexion (révocation refresh)
  // --------------------------------------------------------------------------
  async logout(refreshToken?: string) {
    if (!refreshToken) return { success: true };
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // Récupère la session courante
  // --------------------------------------------------------------------------
  async getSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        userRoles: { include: { role: true } },
      },
    });
    if (!user) throw new UnauthorizedException();

    const roles = user.userRoles.map((ur) => ur.role.key);
    const permissions = Array.from(
      new Set(user.userRoles.flatMap((ur) => ur.role.permissions)),
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      locale: user.locale,
      organization: {
        id: user.organization.id,
        slug: user.organization.slug,
        displayName: user.organization.displayName,
        defaultCurrency: user.organization.defaultCurrency,
        defaultLocale: user.organization.defaultLocale,
        country: user.organization.country,
      },
      roles,
      permissions,
    };
  }

  // --------------------------------------------------------------------------
  // Helpers internes
  // --------------------------------------------------------------------------
  private async issueTokens(userId: string, meta?: { userAgent?: string; ip?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const accessExpiresIn = this.config.get<string>('jwt.accessExpiresIn') ?? '15m';
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, organizationId: user.organizationId, email: user.email },
      { expiresIn: accessExpiresIn },
    );

    const refreshTokenRaw = randomBytes(48).toString('hex');
    const refreshTokenHash = this.hashToken(refreshTokenRaw);
    const refreshExpiresAt = this.computeExpiry(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
        userAgent: meta?.userAgent,
        ip: meta?.ip,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.parseSeconds(accessExpiresIn),
      tokenType: 'Bearer',
    };
  }

  private async hashPassword(plain: string) {
    if (plain.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
    }
    const rounds = this.config.get<number>('security.bcryptRounds') ?? 12;
    return bcrypt.hash(plain, rounds);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private computeExpiry(expr: string): Date {
    const seconds = this.parseSeconds(expr);
    return new Date(Date.now() + seconds * 1000);
  }

  private parseSeconds(expr: string): number {
    const match = /^(\d+)([smhd])$/.exec(expr.trim());
    if (!match) return 900;
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return value;
    }
  }
}
