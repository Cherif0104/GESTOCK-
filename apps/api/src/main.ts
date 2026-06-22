import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  const port = Number(process.env.API_PORT ?? 4000);
  const host = process.env.API_HOST ?? '0.0.0.0';
  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GESTOCK API')
    .setDescription(
      "API REST de la plateforme GESTOCK — gestion des stocks, achats, entrepôts et supply chain.",
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, host);
  Logger.log(`🚀 GESTOCK API démarrée sur http://${host}:${port}/api/v1`, 'Bootstrap');
  Logger.log(`📚 Documentation Swagger : http://${host}:${port}/api/docs`, 'Bootstrap');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Erreur fatale au démarrage de GESTOCK API:', err);
  process.exit(1);
});
