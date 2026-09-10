import { Injectable, Optional, type LoggerService } from '@nestjs/common';
import type { Writable } from 'node:stream';
import pino, { type DestinationStream, type Logger as PinoLogger, type LoggerOptions } from 'pino';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: PinoLogger;

  constructor(@Optional() destination?: DestinationStream | Writable) {
    const options: LoggerOptions = {
      level: process.env.LOG_LEVEL ?? 'info',
      base: {
        service: 'uakari-api',
        env: process.env.NODE_ENV ?? 'development',
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'passwordHash', '*.passwordHash', 'token', 'accessToken', 'refreshToken'],
        censor: '[REDACTED]',
      },
    };

    if (destination) {
      this.logger = pino(options, destination as DestinationStream);
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      options.transport = { target: 'pino-pretty', options: { colorize: true, singleLine: true } };
    }

    this.logger = pino(options);
  }

  private child(input?: Record<string, unknown>): PinoLogger {
    return input ? this.logger.child(input) : this.logger;
  }

  log(message: unknown, context?: string, input?: Record<string, unknown>): void {
    this.child({ ...input, context }).info(message);
  }

  info(message: unknown, context?: string, input?: Record<string, unknown>): void {
    this.child({ ...input, context }).info(message);
  }

  error(message: unknown, stackOrContext?: string, context?: string, input?: Record<string, unknown>): void {
    this.logger.error({ stack: stackOrContext, context, ...input }, String(message));
  }

  warn(message: unknown, context?: string, input?: Record<string, unknown>): void {
    this.child({ ...input, context }).warn(message);
  }

  debug(message: unknown, context?: string, input?: Record<string, unknown>): void {
    this.child({ ...input, context }).debug(message);
  }

  verbose(message: unknown, context?: string, input?: Record<string, unknown>): void {
    this.child({ ...input, context }).trace(message);
  }

  get rawLogger(): PinoLogger {
    return this.logger;
  }
}