# ── Stage 1: Build ────────────────────────────────────────────
FROM node:22-alpine AS build

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /build

# Copy dependency files first (cache layer)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build-time variables for Vite
ARG VITE_API_URL=http://localhost:8080
ARG VITE_APP_NAME=SIGMA

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN pnpm build

# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:alpine AS runtime

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /build/dist /usr/share/nginx/html

# Simple SPA-friendly Nginx config for this container
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
