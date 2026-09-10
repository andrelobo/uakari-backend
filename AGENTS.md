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

## Build de produção (Docker) — gotchas já resolvidos

O Dockerfile usa `npm install --ignore-scripts` (o lock é gerado pelo npm 12 da máquina local;
`npm ci` no node:22-alpine/npm10 falha). `prisma generate` roda explicitamente no builder após
copiar o schema. No runner, `prisma migrate deploy` (no CMD) precisa de escrita em
`/app/node_modules` → o Dockerfile faz `chown -R uakari:uakari /app` antes do `USER uakari`.

- Existe `.dockerignore` excluindo `src/generated` (client gerado NÃO entra no contexto do build).
- O client Prisma ESM (`moduleFormat = esm`) importa arquivos internos com `.ts`; o tsconfig tem
  **`rewriteRelativeImportExtensions: true`** para o emit gerar `.js` (sem isso o container crasha
  com `ERR_MODULE_NOT_FOUND ... internal/class.ts`).
- Build: `docker build -t uakari-api:latest .` → export em tar → `docker load` no VPS
  (guardando RAM: só transferir com o box menos pressurizado).

## Deploy no VPS `lobojow` (Oracle, 952MiB de RAM)

- Rodar pelo compose em `/opt/uakari-backend/docker-compose.yml` (imagem `uakari-api:latest`,
  postgres/redis sem porta publicada, network externa `climate-backend_climate`).
- Caddy (`climate-caddy`) já tem rota `uakari-api.136-248-90-172.nip.io` → `uakari-api:3000`.
- **Atenção RAM:** o box hospeda zera/climate/muirakitan/portainer e usa ~1.4Gi do swap de 2Gi.
  `docker load` de imagem grande é OOM-killed. Para destravar: adicionar swap e/ou enxugar a imagem.
- Porta 3000 do host é do `zera-backend-api` — o uakari não publica porta no host.