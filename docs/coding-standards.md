# Padrões de codificação

Este documento define os padrões de código do projeto, alinhados ao **Google TypeScript Style Guide** e a boas práticas de código limpo. Deve ser seguido em todo o código e nas revisões.

## Princípios gerais

- **Código limpo**: nomes que explicam a intenção; funções pequenas e com uma responsabilidade; pouca carga cognitiva por função.
- **Sem comentários desnecessários**: o código deve ser autoexplicativo. Comentar apenas quando a decisão de negócio ou um workaround não for óbvio.
- **Consistência**: seguir os padrões abaixo em todo o repositório.

## TypeScript

- Usar **strict mode** (já habilitado no `tsconfig.json`).
- Preferir `interface` para objetos públicos; `type` para unions/intersections e quando precisar de tipos utilitários.
- Evitar `any`; usar `unknown` e type guards quando o tipo não for conhecido.
- Nomes: **camelCase** para variáveis e funções; **PascalCase** para tipos, interfaces e classes.
- Exportar apenas o necessário; preferir export nomeado.

## Funções

- Uma responsabilidade por função.
- Preferir funções puras quando possível; efeitos colaterais explícitos (I/O, mutação) concentrados em poucos pontos.
- Parâmetros: no máximo alguns; se muitos, agrupar em um objeto.
- Nomes de funções devem ser verbos ou verbos + substantivo (ex.: `parseHistoryHtml`, `list`, `buildWhere`).

## Arquivos e módulos

- Um conceito principal por arquivo; nome do arquivo reflete o conteúdo (ex.: `historyModel.ts`, `errorHandler.ts`).
- Imports: ordem alfabética ou agrupados (externos primeiro, depois internos); usar extensão `.js` em imports relativos para ESM.

## Tratamento de erros

- Não engolir erros; propagar ou logar e reenviar.
- Em handlers HTTP, usar o error handler global do Fastify; em scripts, `process.exit(1)` após logar.

## Formatação e estilo

- Indentação: 2 espaços.
- Ponto e vírgula no final de instruções.
- Aspas duplas para strings, a menos que aspas simples evitem escape.
- Linhas longas: quebrar em pontos lógicos (parâmetros, encadeamentos); evitar linhas muito longas.

## Injeção de dependências

- Usar **injection-js** para injeção de dependências. Tokens em `di/tokens.ts`; providers (incluindo `useClass` e `useFactory`) em `di/providers.ts`; container criado em `app.ts` com `buildContainerWithDataSource()`.
- Controllers e use cases **não instanciam** dependências: recebem-nas pelo construtor (via container). Use cases dependem apenas de **interfaces** de repositório (ex.: `IStatsRepository`); as implementações concretas ficam em `infrastructure/repositories/` e são injetadas no ponto de composição.

## Core e bibliotecas externas

- Em **`domain/`** e **`use-cases/`**: não importar TypeORM, injection-js, Fastify nem outras libs de infra. Nenhum decorator de ORM ou de DI no core. Interfaces e tipos são TypeScript puro.
- Implementações e detalhes de framework ficam em **`infrastructure/`** e em **`di/`**. Controllers podem usar Fastify (request/reply) e decorators de injection-js para receber use cases.

## Lint

- O projeto usa **ESLint** com **typescript-eslint** (substituição ao TSLint).
- Rodar `npm run lint` no backend antes de commitar; corrigir avisos e erros.
- Regras principais: sem variáveis não usadas (exceto com prefixo `_`), aviso para `any`, estilo consistente.

## Referência

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) – base para as convenções acima.
