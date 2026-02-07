# Arquitetura do backend

O backend segue uma arquitetura em camadas: **Controller → Use case → Repository**. A persistência é feita via **TypeORM** em `infrastructure/`. A injeção de dependências usa **injection-js**; o core da aplicação não depende de bibliotecas externas (TypeORM, injection-js, Fastify). Este documento descreve a estrutura e como **criar uma nova rota**.

## Estrutura de pastas

```
backend/src/
├── config/              # Configuração (env)
├── controllers/         # Handlers HTTP: recebem request/reply, validam, chamam use case, respondem
├── di/                  # Injeção de dependências (injection-js): tokens, providers, container
├── domain/              # Interfaces de repositórios e tipos de domínio (sem libs externas)
├── infrastructure/      # Detalhes de persistência e libs externas
│   ├── data-source.ts   # Criação do DataSource TypeORM
│   ├── entities/        # Entidades TypeORM
│   └── repositories/    # Implementações dos repositórios (implementam interfaces do domain)
├── middleware/          # Error handler e outros middlewares
├── routes/              # Registro das rotas; recebem controller injetado
├── use-cases/           # Casos de uso (lógica de negócio); dependem só de interfaces do domain
├── app.ts               # Factory do Fastify: monta container, obtém controllers, registra rotas
└── server.ts            # Entry point: buildApp + listen
```

## Fluxo de uma requisição

1. **Route** registra método e path; o handler é um método do **controller** (instância obtida do container).
2. **Controller** lê/valida query/body, chama o **use case** injetado e envia a resposta com `reply.send()`.
3. **Use case** orquestra a regra de negócio e delega ao **repositório** (interface injetada).
4. **Repositório** (implementação em `infrastructure/repositories/`) acessa o banco via TypeORM.

## Core e bibliotecas externas

**Nenhum detalhe de biblioteca externa** (TypeORM, injection-js, Fastify) deve aparecer em `domain/` nem em `use-cases/`. Apenas interfaces e tipos TypeScript. As implementações e o uso de frameworks ficam em `infrastructure/`, `di/`, `controllers/` (Fastify) e `app.ts`.

## Convenções

- **Rotas**: um arquivo por domínio (ex.: `history.ts`, `stats.ts`). Função que recebe `app` e o **controller** (obtido do container em `app.ts`) e registra os handlers com `controller.método.bind(controller)`.
- **Controllers**: classes com `@Injectable()`; construtor recebe use cases via `@Inject(TOKEN)`. Não instanciam use cases nem repositórios.
- **Use cases**: classes com método `execute(...)`; construtor recebe apenas a interface do repositório (ex.: `IStatsRepository`). Implementação do repositório é injetada pelo container.
- **Repositórios**: interface em `domain/` (ex.: `IHistoryRepository`); implementação em `infrastructure/repositories/`, usando TypeORM (DataSource, QueryBuilder, entidades).
- **DI**: tokens em `di/tokens.ts`; providers em `di/providers.ts`; container criado em `app.ts` com `buildContainerWithDataSource()`; controllers obtidos do container e passados para as funções de rota.

## Como criar uma nova rota

1. **Interface no domain** (se for novo repositório): criar `domain/I<Nome>Repository.ts` com os métodos necessários; tipos/DTOs em `domain/` ou junto da interface.
2. **Implementação em infrastructure**: criar entidade em `infrastructure/entities/` (se nova tabela) e classe em `infrastructure/repositories/` que implementa a interface e usa TypeORM.
3. **Use case**: criar classe em `use-cases/<domínio>/` com `execute(...)` que recebe a interface do repositório no construtor (será injetada via factory em `di/providers.ts`).
4. **Tokens e providers**: adicionar tokens em `di/tokens.ts`; registrar repositório, use case e controller em `di/providers.ts`.
5. **Controller**: classe com `@Injectable()` e construtor recebendo o use case via `@Inject(TOKEN)`; método que extrai query/body, chama `useCase.execute(...)` e `reply.send()`.
6. **Rotas e app**: em `routes/<nome>.ts`, função que recebe `app` e o controller e registra as rotas; em `app.ts`, obter o controller do container e chamar essa função com prefixo.

## Resumo

- **Nova rota** = interface (domain) → implementação repositório (infrastructure) → use case → tokens/providers (di) → controller → rota registrada em app + testes.
- Controllers finos (validação + use case + send); lógica de negócio nos use cases; acesso a dados nos repositórios.
- Consultar [docs/coding-standards.md](coding-standards.md) para estilo, injeção de dependências e regra do core sem libs externas.
