# YouTube History Dashboard

Dashboard para visualização e análise do histórico de visualização do YouTube, alimentado por dados exportados via Google Takeout.

## O que é

- **Backend**: API REST em Fastify + TypeScript (MVC), com PostgreSQL. Os dados do Takeout são importados uma vez (seed) e consultados via banco.
- **Frontend**: Páginas estáticas (HTML, Tailwind, Chart.js) com tema escuro: dashboard com gráficos e lista paginada do histórico.

## Pré-requisitos

- Docker e Docker Compose (o build usa pnpm via Corepack)
- (Opcional, para desenvolvimento local) Node.js 20+, pnpm, PostgreSQL 16

## Como rodar

1. Coloque o export do Takeout na pasta `youtube-metadata/` (estrutura esperada: `youtube-metadata/histórico/histórico-de-visualização.html`).

2. Suba os serviços:

```bash
docker compose up --build
```

3. O backend sobe em `http://localhost:3000`. Na primeira execução, o entrypoint roda a migration e o seed (se a tabela estiver vazia). O frontend é servido pelo backend em `/` (raiz).

## Variáveis de ambiente

| Variável     | Descrição                          | Default        |
|-------------|-------------------------------------|----------------|
| `PORT`      | Porta do servidor                   | `3000`         |
| `PGHOST`    | Host do PostgreSQL                  | `localhost`    |
| `PGPORT`    | Porta do PostgreSQL                 | `5432`         |
| `PGUSER`    | Usuário do PostgreSQL              | `postgres`     |
| `PGPASSWORD`| Senha do PostgreSQL                | `postgres`     |
| `PGDATABASE`| Nome do banco                       | `youtube_history` |
| `DATA_PATH` | Caminho para a pasta do Takeout    | `./youtube-metadata` |
| `NODE_ENV`  | Ambiente                            | `development`  |

## Desenvolvimento local (sem Docker)

1. Instale dependências e rode a migration e o seed:

```bash
cd backend
pnpm install
pnpm run migrate
pnpm run seed
```

2. Inicie o servidor:

```bash
pnpm run dev
```

3. Rode os testes (PostgreSQL deve estar acessível com as variáveis acima):

```bash
pnpm run test
```

4. Lint:

```bash
pnpm run lint
```

## Documentação do projeto

- [docs/coding-standards.md](docs/coding-standards.md) – Padrões de código (Google Style Guide, código limpo).
- [docs/architecture.md](docs/architecture.md) – Arquitetura MVC do backend e como criar novas rotas.

## API

- `GET /api/history` – Lista paginada do histórico. Query: `page`, `limit`, `from`, `to`, `channel_id`.
- `GET /api/stats/overview` – Totais (visualizações, canais, primeira/última data).
- `GET /api/stats/channels` – Canais mais vistos. Query: `limit`, `from`, `to`.
- `GET /api/stats/by-hour` – Contagem por hora do dia.
- `GET /api/stats/by-weekday` – Contagem por dia da semana.
- `GET /api/stats/by-month` – Contagem por mês/ano.

Respostas em JSON. Filtros `from` e `to` em formato ISO 8601 (ex.: `2025-01-01`, `2025-12-31`).
