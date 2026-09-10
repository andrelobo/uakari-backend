import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaError } from '../utils/prisma-error.util.js';
import { AppLogger } from '../logger/app-logger.service.js';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware.js';

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  correlationId?: string;
  path?: string;
  timestamp?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const correlationId = request.headers[CORRELATION_ID_HEADER] as string | undefined;

    const { statusCode, code, message, details } = this.toApiError(exception);

    if (statusCode >= 500) {
      this.logger.error(`Unhandled ${code}: ${message}`, exception instanceof Error ? String(exception.stack) : '', 'ExceptionFilter', {
        correlationId,
        path: request.originalUrl,
      });
    }

    const body: ApiErrorResponse = {
      statusCode,
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(correlationId ? { correlationId } : {}),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private toApiError(exception: unknown): { statusCode: number; code: string; message: string; details?: unknown } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { statusCode: status, code: this.codeForStatus(status), message: response };
      }
      const body = response as Record<string, unknown>;
      return {
        statusCode: status,
        code: (body.code as string) ?? this.codeForStatus(status),
        message: (body.message as string) ?? exception.message,
        details: Array.isArray(body.message) ? body.message : body.details,
      };
    }

    if (exception instanceof PrismaError) {
      return PrismaError.toApiError(exception);
    }

    if (PrismaError.isPrismaError(exception)) {
      return PrismaError.map(exception);
    }

    if (exception instanceof Error) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, code: 'INTERNAL_ERROR', message: 'Internal server error' };
    }

    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, code: 'INTERNAL_ERROR', message: 'Internal server error' };
  }

  private codeForStatus(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return map[status] ?? 'HTTP_ERROR';
  }
}