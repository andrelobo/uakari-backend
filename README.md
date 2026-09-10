# Uakari — E-commerce de Peças

Plataforma de comércio eletrônico para venda de peças, construída pela **Muirakitan**.

- **Mascote:** Uakari — o macaquinho vermelho da Amazônia que **busca as peças com velocidade**.
- **Backend:** NestJS 12 + TypeScript + PostgreSQL (Prisma 7) + Redis
- **Frontend:** Vue 3 + Vite + Pinia + Tailwind CSS
- **Pagamentos:** Stripe + PayPal (arquitetura desacoplada via `PaymentProvider`)
- **Deploy:** Frontend → Vercel · Backend → VPS (Docker Compose)

## Repositórios

| Aplicação | Repo | Endereço de produção |
|---|---|---|
| Backend (API) | `andrelobo/uakari-backend` | https://api-uakari.<dominio>/api/v1 |
| Frontend (Store) | `andrelobo/uakari-frontend` | Vercel |

## Documentação

- [PROJECT_SPEC.md](./PROJECT_SPEC.md) — especificação do produto
- [ARCHITECTURE.md](./ARCHITECTURE.md) — arquitetura técnica
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — roadmap por milestones

## Stack

```
NestJS 12 · TypeScript strict · Prisma 7 (PostgreSQL) · Redis · Docker
Helmet · express-rate-limit · class-validator · Swagger/OpenAPI · Pino
Vitest · Supertest · Stripe · PayPal
```

## Desenvolvimento local

```bash
# 1. subir postgres + redis
docker compose up -d postgres redis

# 2. configurar ambiente
cp .env.example .env

# 3. instalar e preparar schema
npm install
npm run prisma:generate
npm run prisma:migrate

# 4. rodar
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/api/v1/health`

## Testes · Lint · Build

```bash
npm test          # unit
npm run test:e2e  # integração
npm run lint
npm run build
```

## Variáveis de ambiente

Ver [.env.example](./.env.example). **Nunca** commitar secrets.

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `REDIS_URL` | Cache/rate-limit/filas |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Autenticação |
| `CORS_ORIGINS` | Origens permitidas (csv) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal |
| `DRAFT_MODE` | Habilita pagamento mock em dev |