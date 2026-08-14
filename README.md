# SIGMA

Sistema de gestión de activos para ENDE Corani. Monorepo con API Spring Boot (Java 21) y frontend React 19.

## Requisitos

- **Docker** + **Docker Compose** (forma recomendada)
- O, para desarrollo local:
  - **Java 21** (JDK)
  - **Node 22** + **pnpm 11+**
  - **PostgreSQL 16**
  - **Keycloak** (realm `sigma`)

## Inicio rápido (Docker)

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env con los valores de tu entorno (Keycloak, DB, etc.)

# 2. Levantar todo el stack (PostgreSQL + API + Web)
docker compose up -d --build

# 3. Verificar
# API:     http://localhost:8080/swagger-ui.html
# Web:     http://localhost:3000
# Postgres: localhost:5432
```

## Estructura del monorepo

```
sigma/
├── apps/
│   ├── api/              Spring Boot 4.1 (Java 21) — arquitectura hexagonal
│   │   ├── src/main/java/com/endecorani/sigma_api/
│   │   │   ├── modules/          Módulos de negocio (package-by-feature)
│   │   │   │   ├── activos/      Gestión de activos, tipos, categorías, componentes, documentos
│   │   │   │   ├── organizacion/ Áreas, cargos, personas, empleados, migración
│   │   │   │   ├── parametros/   Catálogos, gestiones, períodos, ubicaciones, tipos de dato
│   │   │   │   └── auth/         Login, refresh, logout, me
│   │   │   ├── shared/           CRUD genérico, excepciones, storage, paginación
│   │   │   └── config/           Security, CORS, Keycloak, OpenAPI, storage, JPA
│   │   └── src/main/resources/
│   │       ├── application.yaml
│   │       └── db/migration/     27 migraciones Flyway (schemas: activos, parametros, organizacion)
│   │
│   └── web/              React 19 + Vite 8 + TanStack Router/Query + Tailwind 4 + shadcn/ui
│       └── src/
│           ├── app/             Config, providers, stores, router
│           ├── modules/         Feature modules (espejo de la API)
│           ├── shared/           UI kit, types, utils, hooks
│           └── routes/           TanStack file-based routes
│
├── infrastructure/
│   └── nginx/conf.d/    Reverse proxy config para producción
│
├── docs/                Documentación (arquitectura, DB, API)
├── compose.yml          Stack de desarrollo (PostgreSQL + API + Web)
├── compose.prod.yml     Stack de producción (API + Web + Nginx, DB externa)
└── .env.example         Variables de entorno requeridas
```

## Desarrollo local (sin Docker)

### API

```bash
cd apps/api

# Compilar
./mvnw clean compile

# Ejecutar tests
./mvnw test

# Arrancar (requiere PostgreSQL + Keycloak activos)
./mvnw spring-boot:run
```

Ver [`apps/api/AGENTS.md`](apps/api/AGENTS.md) para detalles de arquitectura y convenciones.

### Web

```bash
cd apps/web

pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # build de producción
pnpm lint         # ESLint
```

## Módulos de la API

| Módulo | Descripción | Endpoints base |
|--------|-------------|----------------|
| `activos` | Gestión de activos, tipos de activo, categorías, componentes, atributos, documentos | `/api/v1/activos`, `/api/v1/tipos-activo`, `/api/v1/categorias`, `/api/v1/componentes`, `/api/v1/documentos`, ... |
| `organizacion` | Áreas, cargos, personas, empleados, registros de migración | `/api/v1/areas`, `/api/v1/cargos`, `/api/v1/personas`, `/api/v1/empleados`, ... |
| `parametros` | Catálogos, gestiones, períodos, tipos de dato, ubicaciones | `/api/v1/catalogos`, `/api/v1/gestiones`, `/api/v1/ubicaciones`, ... |
| `auth` | Autenticación BFF con Keycloak | `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me` |

## Seguridad

- **Keycloak** OAuth2 Resource Server (JWT)
- Endpoints públicos: `POST /api/v1/auth/{login,refresh,logout}`, Swagger UI, API docs
- Resto requiere JWT válido + rol `ADMIN`
- Frontend usa BFF pattern (password grant contra Keycloak)

## Base de datos

PostgreSQL 16 con 3 schemas:

- `activos` — activos, tipos de activo, categorías, componentes, atributos, documentos
- `parametros` — catálogos, items, gestiones, períodos, tipos de dato, ubicaciones
- `organizacion` — personas, áreas, cargos, empleados, registros de migración

Esquema gestionado por Flyway (`ddl-auto=validate`).