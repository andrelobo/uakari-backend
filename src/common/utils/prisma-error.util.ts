import { HttpStatus } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

export interface PrismaErrorMapping {
  code: string;
  message: string;
  statusCode: number;
}

export class PrismaError extends Error {
  readonly code: string;
  readonly statusCode: number;
  private readonly originalCause: unknown;

  constructor(cause: unknown) {
    super(PrismaError.map(cause).message);
    this.originalCause = cause;
    this.code = PrismaError.map(cause).code;
    this.statusCode = PrismaError.map(cause).statusCode;
  }

  static from(cause: unknown): never {
    throw new PrismaError(cause);
  }

  static isPrismaError(cause: unknown): boolean {
    return (
      cause instanceof Prisma.PrismaClientKnownRequestError ||
      cause instanceof Prisma.PrismaClientValidationError ||
      cause instanceof Prisma.PrismaClientInitializationError ||
      cause instanceof Prisma.PrismaClientRustPanicError
    );
  }

  static map(cause: unknown): PrismaErrorMapping {
    if (cause instanceof Prisma.PrismaClientKnownRequestError) {
      switch (cause.code) {
        case 'P2002':
          return {
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
            message: 'Resource already exists with the same unique value',
            statusCode: HttpStatus.CONFLICT,
          };
        case 'P2003':
          return {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Referenced resource does not exist',
            statusCode: HttpStatus.CONFLICT,
          };
        case 'P2025':
          return { code: 'NOT_FOUND', message: 'Resource not found', statusCode: HttpStatus.NOT_FOUND };
        default:
          return { code: 'DATABASE_ERROR', message: 'Database operation failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
      }
    }
    if (cause instanceof Prisma.PrismaClientValidationError) {
      return { code: 'INVALID_INPUT', message: 'Invalid input data', statusCode: HttpStatus.BAD_REQUEST };
    }
    return { code: 'DATABASE_UNAVAILABLE', message: 'Database is unavailable', statusCode: HttpStatus.SERVICE_UNAVAILABLE };
  }

  static toApiError(err: PrismaError): PrismaErrorMapping {
    return { code: err.code, message: err.message, statusCode: err.statusCode };
  }
}