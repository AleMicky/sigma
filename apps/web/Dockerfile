# ── Stage 1: Build (monorepo workspace context) ──────────────
FROM node:22.23.5-alpine3.23 AS build

# Enable corepack con versión fijada de pnpm
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

WORKDIR /workspace

# Copiar manifiestos del monorepo primero (cache layer)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm --filter web install --frozen-lockfile

# Copiar código fuente de web
COPY apps/web ./apps/web

# Build-time variables for Vite
ARG VITE_API_URL=http://localhost:8080
ARG VITE_APP_NAME=SIGMA

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN pnpm --filter web build

# ── Stage 2: Serve with unprivileged Nginx ───────────────────
FROM nginxinc/nginx-unprivileged:1.29-alpine3.23 AS runtime

# SPA + gzip + caché de assets versionados (el imagen ya corre como usuario no-root)
COPY infrastructure/nginx/web-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html

EXPOSE 8080
