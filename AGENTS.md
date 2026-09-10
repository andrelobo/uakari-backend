# Uakari Backend — AGENTS.md

Guia de convenções para agentes contribuindo neste repositório.

Leia **PROJECT_SPEC.md**, **ARCHITECTURE.md** e **IMPLEMENTATION_PLAN.md** antes de codar.

## Convenções

- **Arquitetura:** modular monolith por bounded contexts (`src/<context>/`).
  - `domain/` — regras/entidades independentes de infra (NestJS/Prisma).
  - `application/` — services/casos de uso, dependem de ports.
  - `infrastructure/` — adapters (repos Prisma, providers HTTP).
- **Controllers** são finos; lógica de negócio vai em services. Lógica de preço/pedido/pagamento nunca fica no controller.
- **Pagamentos:** nunca acoplar domínio a Stripe/PayPal. Usar `PaymentProvider` (interfaces). Estado final sempre via webhook/backend.
- **Backend é autoridade** de preço, desconto, estoque, cupom, pedido e autorização. Nunca confiar em valores do frontend.
- **Idempotência** em operações financeiras (payment create/confirm, webhook, order create, refund).
- **Validação** com DTOs + `ValidationPipe` (whitelist). Erros via estrutura consistente `{ statusCode, code, message }`.
- **Segurança:** Helmet, rate limit, RBAC no backend, secrets só via environment, webhook signature, logs sem dados sensíveis.

## Qualidade

Cada fase exige: `npm run lint` · `npm test` · `npm run build`.
`npm run test:e2e` para integração (DB necessário).

## Dados

- Prisma 7. Schema em `prisma/schema.prisma`. Migrations versionadas (`prisma/migrations`).
- Não commitar `src/generated/` (gerado por `prisma generate` — roda em postinstall).
- Não commitar `.env*`. Usar `.env.example` como referência.

## Git

Commits pequenos e semânticos, ex.: `feat(auth): implement customer authentication`.

## Running

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install && npm run prisma:migrate
npm run start:dev
```
Swagger em `/docs`. Health em `/api/v1/health`.