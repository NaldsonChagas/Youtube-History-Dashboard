FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY src/backend/package.json ./
RUN pnpm install

COPY src/backend/tsconfig.json ./
COPY src/backend/src ./src
COPY src/backend/scripts ./scripts
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY src/backend/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY src/backend/entrypoint.sh /app/entrypoint.sh
COPY src/frontend /app/frontend
RUN chmod +x /app/entrypoint.sh
ENV PUBLIC_PATH=/app/frontend

USER node
EXPOSE 3000

CMD ["node", "dist/src/server.js"]
