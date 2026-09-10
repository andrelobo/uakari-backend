import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AppLogger } from './common/logger/app-logger.service.js';
import { configureApp, mountNotFoundHandler } from './app.setup.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  configureApp(app, logger);
  await app.init();
  mountNotFoundHandler(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Uakari API')
    .setDescription('E-commerce de peças — modular monolith (NestJS + PostgreSQL)')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 3000);
  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');

  logger.log(`Uakari API running on http://0.0.0.0:${port}/api/v1 (${process.env.NODE_ENV ?? 'development'})`, 'Bootstrap');
  logger.log(`Swagger docs available at http://0.0.0.0:${port}/docs`, 'Bootstrap');
}

await bootstrap();