export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  databaseUrl: string;
  redisUrl?: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  frontendUrl: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  draftMode: boolean;
}

export function configuration(): AppConfig {
  return {
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    apiPrefix: 'api/v1',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    databaseUrl: process.env.DATABASE_URL ?? 'postgresql://uakari:uakari@localhost:5432/uakari',
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    draftMode: process.env.DRAFT_MODE === 'true',
  };
}