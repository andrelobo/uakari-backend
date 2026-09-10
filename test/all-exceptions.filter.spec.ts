import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { AppLogger } from '../src/common/logger/app-logger.service.js';
import { Prisma } from '../src/generated/prisma/client.js';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter(new AppLogger());

  const response = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  });

  const host = (res: ReturnType<typeof response>) =>
    ({
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => ({ headers: {}, originalUrl: '/test' }),
      }),
    }) as never;

  it('formats HttpException with code', () => {
    const res = response();
    const error = new HttpException({ statusCode: 400, code: 'INVALID_COUPON', message: 'Coupon is invalid' }, HttpStatus.BAD_REQUEST);
    filter.catch(error, host(res));
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body).toMatchObject({ statusCode: 400, code: 'INVALID_COUPON', message: 'Coupon is invalid' });
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('path', '/test');
  });

  it('formats plain HttpException string message', () => {
    const res = response();
    filter.catch(new HttpException('Not found', HttpStatus.NOT_FOUND), host(res));
    const body = res.json.mock.calls[0][0];
    expect(body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND', message: 'Not found' });
  });

  it('never leaks internal error details for unknown errors', () => {
    const res = response();
    filter.catch(new Error('S3 bucket password = hunter2 secret'), host(res));
    const body = res.json.mock.calls[0][0];
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(body.message).not.toContain('hunter2');
  });

  it('maps Prisma conflict error to 409', () => {
    const res = response();
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '7.10.0',
    });
    filter.catch(prismaError, host(res));
    const body = res.json.mock.calls[0][0];
    expect(body).toMatchObject({ statusCode: 409, code: 'UNIQUE_CONSTRAINT_VIOLATION' });
  });
});