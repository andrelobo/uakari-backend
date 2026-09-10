# ARCHITECTURE — Uakari Backend

## 1. Visão geral

**Modular monolith** — NestJS organizado por bounded contexts. Cada módulo
possui fronteiras claras (domain → application → infrastructure) para
extração futura em microserviços **somente se** houver necessidade real.

```
HTTP/WebSocket
     │
     ▼
┌──────────────────────────── AppModule ────────────────────────────┐
│  Common: filters · middleware · logger · errors · validation       │
│  Config: env · typed configuration                                  │
│  Health: /api/v1/health                                             │
├────────────────────────────────────────────────────────────────────┤
│  Bounded contexts (modules)                                        │
│  auth · users · customers · products · categories · inventory      │
│  search · recommendations · cart · checkout · orders · payments    │
│  coupons · addresses · delivery · tracking · notifications · admin │
└────────────────────────────────────────────────────────────────────┘
     │                          │                          │
     ▼                          ▼                          ▼
  PostgreSQL (Prisma)       Redis (cache/rate/filas)   Stripe · PayPal
```

## 2. Estrutura

```
src/
├── main.ts                  bootstrap: helmet, CORS, rate-limit, validation, swagger
├── app.module.ts            raiz
├── config/                  configuration.ts (env tipado)
├── prisma/                  PrismaModule/PrismaService (adapter-pg)
├── common/                  filters, middleware, logger, utils
├── health/                  healthcheck (prisma ping)
└── <context>/               módulos de domínio (ex.: auth/, products/, payments/)
    ├── domain/              entidades/enums/regras do domínio (independente de infra)
    ├── application/         services/casos de uso (ports)
    └── infrastructure/      adapters (Prisma repos, providers HTTP)
```

`src/generated/prisma/` é gerado (gitignored) via `prisma generate`.

## 3. Princípios

- **SOLID + Clean Architecture pragmático**: controllers finos, services com
  regras, repositories persistem.
- **Dependency Inversion**: `payments` define `PaymentProvider` (interface);
  `stripe/` e `paypal/` são adapters. O domínio não importa SDKs.
- **Separation of Concerns**: lógica de preço/pedido nunca em controllers.
- **Modules sem acoplamento cíclico.** Fronteiras prONTAS para extração.

## 4. Dados (PostgreSQL via Prisma)

Modelos: `User`, `RefreshToken`, `Customer`, `Address`, `Category`,
`Product`, `ProductImage`, `Inventory`, `Coupon`, `Cart`, `CartItem`,
`Order`, `OrderItem`, `Payment`, `Delivery`, `TrackingEvent`.

- Enums: `UserRole`, `ProductStatus`, `OrderStatus`, `PaymentStatus`,
  `CouponStatus`, `DeliveryStatus`, etc.
- Índices nos campos de filtro/busca (status, categoria, preço, data).
- Transações (`$transaction`) em checkout, criação de order, reserva de
  estoque, uso de cupom e transições de pagamento.
- Concorrência: reserva de estoque valida `quantity >= requested`.

## 5. Pagamentos — abstração

```
Checkout
   ▼
PaymentService (application)
   ▼
PaymentProvider (interface)
   ├── StripePaymentProvider   dir= payments/stripe
   └── PayPalPaymentProvider   dir= payments/paypal
```

- Criar/confirmar/refund via provider; **webhooks** com verificação de
  assinatura; **idempotencyKey** (unique) em Payment.
- Estado final do pagamento confirmado **somente** via backend/webhook.
- `PaymentStatus` statemachine: `PENDING → PROCESSING → PAID | FAILED |
  CANCELLED | REFUNDED`.

## 6. Pedidos — statemachine

```
PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
        └──────────────→ CANCELLED (regras específicas)
```

Transições inválidas são rejeitadas (ex.: `SHIPPED → PENDING_PAYMENT`).

## 7. Segurança

- Helmet, CORS restrito (`CORS_ORIGINS`), rate limiting global.
- ValidationPipe global (whitelist + forbidNonWhitelisted).
- Erros consistentes: `{ statusCode, code, message, details?, correlationId }`
  — sem stack traces em produção; Prisma errors mapeados (`P2002 → 409`).
- JWT access + refresh com revogação (RefreshToken com token hash).
- RBAC via guards no backend; autorização nunca no frontend.
- Logs estruturados (Pino) com redação de segredos e `x-correlation-id`.

## 8. Observabilidade (base)

- `GET /api/v1/health` (Terminus + Prisma ping).
- Logging estruturado JSON em produção, correlation ID por request.
- Sem APM/prometheus no MVP.

## 9. Frontend

Repo separado `uakari-frontend`:
Vue 3 + Vite + Pinia + Vue Router + Tailwind.
Organização por feature (`auth/`, `catalog/`, `cart/`, `checkout/`, `orders/`,
`account/`, `admin/`, `shared/`). Contrato explícito com a API; frontend não
deduz regras de negócio críticas.

## 10. Decisões (ADR)

- **PostgreSQL + Prisma** (vs Mongo): integridade referencial, constraints,
  transações e migrations — essenciais para e-commerce/estoque.
- **Modular monolith** (vs microservices): simplicidade operacional no MVP;
  fronteiras preparadas para extração.
- **Rate limiting via express-rate-limit** (vs @nestjs/throttler): compatível
  com Nest 12 (throttler ainda exige Nest ≤11).
- **Pagamento desacoplado** (`PaymentProvider`): testes e troca de provedor
  sem tocar no domínio.