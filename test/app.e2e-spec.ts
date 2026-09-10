import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { AppLogger } from './../src/common/logger/app-logger.service.js';
import { configureApp, mountNotFoundHandler } from './../src/app.setup.js';

class MockPrismaService {
  $connect(): Promise<void> {
    return Promise.resolve();
  }
  $disconnect(): Promise<void> {
    return Promise.resolve();
  }
  $queryRaw(): Promise<unknown[]> {
    return Promise.resolve([{ '?column?': 1 }]);
  }
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(new MockPrismaService())
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, moduleFixture.get(AppLogger));
    await app.init();
    mountNotFoundHandler(app);
  });

  it('GET /api/v1 → service info', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect(({ body }) => {
        expect(body.service).toBe('uakari-api');
        expect(body.status).toBe('ok');
      });
  });

  it('health with DB unavailable → consistent 503 error contract', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(503)
      .expect(({ body }) => {
        expect(body).toHaveProperty('statusCode', 503);
        expect(body).toHaveProperty('code');
        expect(body).toHaveProperty('message');
      });
  });

  it('unknown route → consistent NOT_FOUND error shape', () => {
    return request(app.getHttpServer())
      .get('/api/v1/nope')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toHaveProperty('statusCode', 404);
        expect(body).toHaveProperty('code', 'NOT_FOUND');
        expect(body).toHaveProperty('message');
        expect(body).toHaveProperty('path');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});