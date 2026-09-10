import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppLogger } from './common/logger/app-logger.service.js';
import { correlationIdMiddleware, CORRELATION_ID_HEADER } from './common/middleware/correlation-id.middleware.js';

export function configureApp(app: INestApplication, logger: AppLogger): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((o) => o.trim()).filter(Boolean);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.use(correlationIdMiddleware(logger));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', CORRELATION_ID_HEADER],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}

/**
 * Fallback 404. Registrado APÓS `app.init()` — caso contrário roda antes do
 * router do Nest e devolve 404 para rotas válidas. Responde JSON direto
 * porque exceções lançadas em middleware de fora do router do Nest não passam
 * pelo pipeline de filters.
 */
export function mountNotFoundHandler(app: INestApplication): void {
  app.use((req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.originalUrl,
      ...(req.header(CORRELATION_ID_HEADER) ? { correlationId: req.header(CORRELATION_ID_HEADER) } : {}),
      timestamp: new Date().toISOString(),
    });
  });
}