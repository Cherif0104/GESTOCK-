import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterOrganizationDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'une nouvelle organisation et de son administrateur' })
  register(@Body() dto: RegisterOrganizationDto) {
    return this.auth.registerOrganization(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, {
      userAgent: req.headers['user-agent']?.toString(),
      ip: req.ip,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renouveler le token d\'accès' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion (révocation du refresh token)' })
  logout(@Body() body: { refreshToken?: string }) {
    return this.auth.logout(body?.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère la session de l\'utilisateur courant' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getSession(user.sub);
  }
}
