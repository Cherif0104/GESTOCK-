import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Santé')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    let db = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      service: 'gestock-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      dependencies: { database: db },
    };
  }
}
