# PROJECT_SPEC — Uakari E-commerce de Peças

- **Status:** Milestone 0 (Discovery)
- **Data:** 2026-09-10
- **Repo:** `andrelobo/uakari-backend` · `andrelobo/uakari-frontend`

---

## 1. Produto

Plataforma de e-commerce para venda de **peças**, com identidade amazônica
(empresa Muirakitan). O mascote é o **Uakari**, macaco vermelho amazônico
que "busca as peças com velocidade".

## 2. Público e contexto

- **Loja virtual** responsiva (mobile-first) para clientes finais.
- **Painel administrativo** para operação da loja.
- Venda de peças exige rigor em **estoque**, **valores** e **rastreio**.

## 3. Escopo funcional

### Cliente
Cadastro, login/logout, recuperação de senha, perfil, endereços, catálogo,
busca, filtros, página de produto, carrinho, checkout, cupons, pagamento,
histórico/detalhe/rastreamento de pedidos, recomendações.

### Administração
Dashboard, usuários, clientes, produtos, categorias, estoque, pedidos,
pagamentos, cupons, entregas, rastreio, relatórios básicos.

### Pagamentos
Stripe e PayPal via abstração `PaymentProvider` (desacoplado do domínio).

## 4. Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS 12 · TS strict · REST/WebSocket · OpenAPI |
| Banco | PostgreSQL (Prisma 7, migrations versionadas) |
| Cache/Jobs | Redis |
| Frontend | Vue 3 · Vite · Pinia · Vue Router · Tailwind |
| Testes | Vitest (unit) · Supertest (e2e) |
| Segurança | Helmet · rate-limit · class-validator · RBAC · bcrypt/argon2 · webhook signature verification |
| Infra | Docker Compose · Vercel (front) · VPS (back) |

## 5. Bounded contexts

`auth · users · customers · products · categories · inventory · search ·
recommendations · cart · checkout · orders · payments · coupons ·
addresses · delivery · tracking · notifications · admin`

## 6. Regras de negócio críticas

1. **Backend é a autoridade** de preço, desconto, estoque, cupom, pedido, pagamento e autorização. O frontend nunca define `total`, `price` ou `discount`.
2. **Checkout recalcula tudo** — valida produtos, preços, estoque, cupom, endereço, frete e total.
3. **Estado final do pagamento** é confirmado pelo backend via provider/webhook (nunca pelo frontend).
4. **Idempotência** obrigatória em criação/confirmação de pagamento, webhook, criação de order e refund.
5. **Statemachines** explícitas para `OrderStatus` e `PaymentStatus`.
6. **RBAC real no backend** — `CUSTOMER | ADMIN | MANAGER`.
7. Nenhum secret no Git/frontend/código; webhooks com assinatura verificada.

## 7. Estado inicial do repositório

Repo novo (greenfield). Milestone 0 concluído: análise de repositório,
stack e skills; documentos de arquitetura e plano criados; fundação iniciada
(Milestone 1 em curso).

## 8. Fora do escopo (MVP)

Microservices, ML/LLM de recomendação (v1 heurística), multitenancy,
checkout B2B/parcelamento.