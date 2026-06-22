import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  organizationId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') ?? 'change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Compte utilisateur invalide ou désactivé.');
    }

    const roles = user.userRoles.map((ur) => ur.role.key);
    const permissions = Array.from(
      new Set(user.userRoles.flatMap((ur) => ur.role.permissions)),
    );

    return {
      sub: user.id,
      organizationId: user.organizationId,
      email: user.email,
      roles,
      permissions,
    };
  }
}
