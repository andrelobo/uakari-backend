# IMPLEMENTATION_PLAN — Uakari

Roadmap por milestones. Executar sequencialmente; cada milestone exige
**lint + test + build** antes de avançar.

| # | Milestone | Entrega |
|---|---|---|
| 0 | Discovery | PROJECT_SPEC, ARCHITECTURE, IMPLEMENTATION_PLAN ✅ |
| 1 | Foundation | Config, Prisma, migrations, logging, errors, security, health, Docker, testes ✅/em curso |
| 2 | Auth / Users | register, login, refresh, logout, recovery, RBAC, customers |
| 3 | Products | products, categories, inventory, search, filters, paginação |
| 4 | Customer frontend | auth UI, catálogo, produto, conta, endereços |
| 5 | Cart | carrinho, itens, quantidade, totais, validação de estoque |
| 6 | Checkout | endereço, cupom, validação de preço, criação de order (pagamento mock) |
| 7 | Payments | abstração, Stripe, PayPal, webhooks, idempotência, states |
| 8 | Orders/Delivery | ciclo do pedido, delivery, tracking, WebSocket |
| 9 | Admin | dashboard, CRUD produtos/estoque/pedidos/clientes/cupons/pagamentos/entregas |
| 10 | Recommendations | popular, related, recentes, frequentes (heurística) |
| 11 | Hardening | security/performance review, índices, acessibilidade, cobertura, config produção |

## Skills mapeadas

| Área | Skill | Milestones |
|---|---|---|
| Architecture | api-design · performance · analise-arquitetural | 0/1/3/11 |
| Backend | nestjs · typescript · nodejs | 1-8 |
| Database | postgresql · redis | 1/3/5/6/8 |
| Frontend | react/nextjs (base Vue no front) | 4/5/6/9 |
| Security | jwt · oauth · security-audit | 1/2/7/11 |
| Testing | test-strategy · test-generation · playwright | todos |
| DevOps | docker · docker-compose · deploy · cicd · logs | 1/11 |
| Documentation | doc-writer | todos |
| AI | rag · recomendação futura | 10 |

## Definition of Done (cada feature)

- Código implementado · tipos corretos · validação · segurança
- Testes relevantes · lint OK · build OK · docs atualizadas
- Nenhum TODO crítico · nenhuma gambiarra conhecida · nenhum secret exposto

## Critérios de qualidade

`está correto? seguro? testável? manutenível? coerente com o domínio? preparado para evolução?`

Evitar: god classes, lógica em controllers, preço no frontend, duplicação,
magic numbers/strings, acoplamento desnecessário.