# Uakari — E-commerce de Peças

Plataforma de comércio eletrônico para venda de peças, construída pela **Muirakitan**.

- **Mascote:** Uakari — o macaquinho vermelho da Amazônia que **busca as peças com velocidade**.
- **Backend:** NestJS 12 + TypeScript + PostgreSQL (Prisma 7) + Redis
- **Frontend:** Vue 3 + Vite + Pinia + Tailwind CSS
- **Pagamentos:** Stripe + PayPal (arquitetura desacoplada via `PaymentProvider`)
- **Deploy:** Frontend → Vercel (✅ no ar) · Backend → VPS `lobojow` (imagem pronta, aguardando RAM)

## Estado atual (2026-09-10)

- **Milestone 0** ✅ e **Milestone 1** ✅ — foundation entregue: schema Prisma + migration aplicada,
  logging (pino), erros consistentes, segurança (helmet + rate limit), health, Docker, testes.
- **Frontend** no ar em https://uakari-frontend.vercel.app (storefront base, deploy Vercel).
- **Backend producão:** imagem `uakari-api:latest` validada localmente; rota Caddy
  `https://uakari-api.136-248-90-172.nip.io` registrada no VPS (retorna 502 até subir o serviço).
  Deploy no VPS **bloqueado**: o box tem só 952MiB de RAM (já hospeda zera/climate/muirakitan/
  portainer) e o `docker load` da imagem (≈253MB) é OOM-killed. Decisão: adiar deploy e seguir o roadmap.

## Repositórios

| Aplicação | Repo | Endereço de produção |
|---|---|---|
| Backend (API) | `andrelobo/uakari-backend` | https://uakari-api.136-248-90-172.nip.io/api/v1 (pendente) |
| Frontend (Store) | `andrelobo/uakari-frontend` | https://uakari-frontend.vercel.app ✅ |

## Infra de produção (VPS `lobojow`)

- Caddy (container `climate-caddy`) faz HTTPS automático via subdomínios `*.136-248-90-172.nip.io`.
- O backend deve anexar-se à rede Docker externa `climate-backend_climate` e ser apontado no
  Caddyfile como `reverse_proxy uakari-api:3000`.
- **Porta 3000 no host já é usada** pelo `zera-backend-api` — o `uakari-api` NÃO publica porta no
  host; fica acessível apenas via rede interna + Caddy.
- Compose de produção: `/opt/uakari-backend/docker-compose.yml` no VPS (postgres/redis sem porta
  publicada; API sem porta publicada). `.env` com secrets no mesmo diretório.

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