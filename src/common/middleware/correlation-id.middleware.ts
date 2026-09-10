import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AppLogger } from '../logger/app-logger.service.js';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export function correlationIdMiddleware(logger: AppLogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const incoming = req.header(CORRELATION_ID_HEADER);
    const correlationId = incoming && /^[a-zA-Z0-9-]{8,64}$/.test(incoming) ? incoming : randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    const startedAt = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
        'HttpRequest',
        { correlationId, method: req.method, url: req.originalUrl, statusCode: res.statusCode, durationMs },
      );
    });

    next();
  };
}