# Arquitetura do backend (MVC)

O backend segue o padrão **MVC** (Model-View-Controller). A “View” aqui é a resposta JSON; a lógica de apresentação está no frontend. Este documento descreve a estrutura e como **criar uma nova rota** seguindo os padrões do projeto.

## Estrutura de pastas

```
backend/src/
├── config/          # Configuração (env, db)
├── controllers/     # Handlers HTTP: recebem request/reply, validam, chamam model, respondem
├── middleware/      # Error handler e outros middlewares
├── models/         # Acesso a dados (queries ao banco); sem lógica HTTP
├── routes/         # Registro das rotas e mapeamento para controllers
├── app.ts          # Factory do Fastify (usado pelo server e pelos testes)
└── server.ts       # Entry point: buildApp + listen
```

Fluxo de uma requisição:

1. **Route** registra método e path e chama o **controller**.
2. **Controller** lê/valida query/body, chama o **model** e envia a resposta com **reply.send()**.
3. **Model** executa queries (pg) e retorna dados; não conhece request/reply.

## Convenções

- **Rotas**: um arquivo por domínio (ex.: `history.ts`, `stats.ts`), registrado em `app.ts` com prefixo (ex.: `/api/history`, `/api/stats`).
- **Controllers**: um arquivo por domínio; funções exportadas como objeto (ex.: `historyController.list`). Recebem `request` e `reply` do Fastify.
- **Models**: um arquivo por entidade/agregação; funções que recebem parâmetros e retornam dados (objetos/arrays). Usam o `pool` de `config/db.ts`.
- Nomes: **list**, **getById**, **overview**, **channels**, etc., conforme a ação.

## Como criar uma nova rota

Siga estes passos na ordem.

### 1. Model

- Arquivo: `src/models/<nome>Model.ts` (ou estender um existente).
- Função que recebe os parâmetros necessários e executa a(s) query(s).
- Retorno: tipo explícito (interface ou type); sem usar `request`/`reply`.

Exemplo (conceitual):

```ts
// src/models/exampleModel.ts
import { pool } from '../config/db.js';

export const exampleModel = {
  async getSomething(id: string): Promise<{ name: string } | null> {
    const result = await pool.query('SELECT name FROM ... WHERE id = $1', [id]);
    const row = result.rows[0];
    return row ? { name: row.name } : null;
  },
};
```

### 2. Controller

- Arquivo: `src/controllers/<nome>Controller.ts` (ou método novo em um existente).
- Handler async que recebe `request` e `reply`.
- Extrair e validar query/body (valores padrão, parseInt, etc.).
- Chamar o model e responder com `reply.send(...)`.

Exemplo:

```ts
// src/controllers/exampleController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { exampleModel } from '../models/exampleModel.js';

export const exampleController = {
  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const id = request.params.id;
    const data = await exampleModel.getSomething(id);
    if (!data) {
      await reply.status(404).send({ error: 'NotFound' });
      return;
    }
    await reply.send(data);
  },
};
```

### 3. Rota

- Arquivo: `src/routes/<nome>.ts`.
- Registrar o método e o path e chamar o controller.

Exemplo:

```ts
// src/routes/example.ts
import { FastifyInstance } from 'fastify';
import { exampleController } from '../controllers/exampleController.js';

export async function exampleRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:id', exampleController.get);
}
```

### 4. Registrar no app

- Em `src/app.ts`, importar as rotas e registrá-las com prefixo:

```ts
import { exampleRoutes } from './routes/example.js';
// ...
await app.register(exampleRoutes, { prefix: '/api/example' });
```

### 5. Testes

- Adicionar ou estender testes em `backend/tests/` (ex.: `example.test.ts`).
- Usar `buildApp()` e `app.inject()` para chamar a nova rota e afirmar status e corpo JSON.
- Seguir a regra do projeto: toda funcionalidade nova ou correção deve ter teste; em correção, escrever o teste que falha primeiro.

## Resumo

- **Nova rota** = model (dados) → controller (HTTP) → route (registro) → app (prefixo) + testes.
- Manter controllers finos (validação + chamada ao model + send); lógica de negócio e queries nos models.
- Consultar [docs/coding-standards.md](coding-standards.md) para estilo e convenções de código.
