FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY src/api/package.json ./
RUN pnpm install

COPY src/api/tsconfig.json ./
COPY src/api/src ./src
COPY src/api/scripts ./scripts
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY src/api/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY src/web /app/web
ENV PUBLIC_PATH=/app/web

USER node
EXPOSE 3000

CMD ["node", "dist/src/server.js"]
