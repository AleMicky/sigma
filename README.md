# SIGMA

Sistema integral de gestión de activos, mantenimiento, inventarios y flota vehicular para **ENDE Corani**. Monorepo con API **Spring Boot 4.1** (Java 21) y frontend **React 19** (Vite 8 + TypeScript).

## Requisitos

- **Docker** + **Docker Compose** (forma recomendada)
- O, para desarrollo local:
  - **Java 21** (JDK)
  - **Node 22** + **pnpm 12+**
  - **PostgreSQL 16**
  - **Keycloak** (realm `sigma`)
  - **Flowable REST** (motor BPMN para workflows)

## Comandos Rápidos (Makefile)

El proyecto incluye un [Makefile](Makefile) para simplificar tareas de despliegue y desarrollo:

```bash
# Ver todos los comandos disponibles
make help

# Despliegue en PRODUCCIÓN (crea red, .env, compila y levanta en segundo plano)
make deploy

# Actualizar desde Git y re-desplegar en PRODUCCIÓN
make pull-deploy

# Despliegue en entorno TEST / STAGING
make deploy-test

# Ver logs de producción
make logs

# Iniciar entorno de DESARROLLO local
make dev-up

# Detener entorno de desarrollo
make dev-down

# Ejecutar tests de la API / compilar frontend Web
make test-api
make build-web
```

## Estructura del monorepo

```
sigma/
├── apps/
│   ├── api/              Spring Boot 4.1 (Java 21) — arquitectura hexagonal
│   │   ├── src/main/java/com/endecorani/sigma_api/
│   │   │   ├── modules/              Módulos de negocio (package-by-feature)
│   │   │   │   ├── activos/          Activos, tipos, categorías, componentes, accesorios, documentos, disponibilidad
│   │   │   │   ├── incidentes/       Incidentes de activos, involucrados y evidencias
│   │   │   │   ├── mantenimientos/   Solicitudes, planes, programaciones, órdenes de trabajo, checklists, controles
│   │   │   │   ├── gestionvehicular/ Flotas, conductores, solicitudes, asignaciones, viajes, salidas, portería, combustible, reportes
│   │   │   │   ├── inventarios/      Insumos, tipos, categorías y atributos dinámicos
│   │   │   │   ├── organizacion/     Áreas, cargos, personas, empleados, responsabilidades, grupos aprobadores, migración
│   │   │   │   ├── parametros/       Catálogos, gestiones, períodos, ubicaciones, tipos de dato, unidades de medida
│   │   │   │   ├── seguridad/        Usuarios, roles, menús dinámicos y permisos
│   │   │   │   ├── workflow/         Despliegue y runtime de procesos BPMN (Flowable)
│   │   │   │   └── auth/             Login, refresh, logout, me (BFF contra Keycloak)
│   │   │   ├── shared/               CRUD genérico, excepciones, storage, paginación, reportes Jasper/ZXing
│   │   │   └── config/               Security, CORS, Keycloak, Flowable, OpenAPI, storage, JPA
│   │   └── src/main/resources/
│   │       ├── application.yaml
│   │       ├── db/migration/         159 migraciones Flyway (9 schemas PostgreSQL)
│   │       ├── processes/            4 procesos BPMN 2.0 (Flowable)
│   │       └── reports/              Plantillas JasperReports (.jrxml) y recursos gráficos
│   │
│   └── web/              React 19 + Vite 8 + TanStack Router/Query/Table/Form + Tailwind 4 + shadcn/ui
│       ├── nginx.conf                Configuración Nginx SPA (gzip, caché inmutable, cabeceras de seguridad)
│       └── src/
│           ├── app/                  Config, providers, stores (Zustand), router, query client
│           ├── layouts/              Layout principal y navegación
│           ├── modules/              Feature modules (espejo de la API)
│           ├── shared/               UI kit, cliente HTTP/Axios, hooks, tipos y utilidades
│           └── routes/               Rutas basadas en archivos (TanStack Router)
│
├── infrastructure/
│   └── nginx/conf.d/     Reverse proxy config para producción
│
├── docs/                 Documentación (arquitectura, DB, API)
├── compose.yml           Stack de desarrollo (PostgreSQL + API + Web)
├── compose.test.yml      Stack de pruebas/staging
├── compose.prod.yml      Stack de producción (API + Web, DB externa)
├── Jenkinsfile           Pipeline CI/CD
└── .env.example          Variables de entorno requeridas
```

## Desarrollo local (sin Docker)

### API

```bash
cd apps/api

# Compilar
./mvnw clean compile

# Ejecutar tests
./mvnw test

# Arrancar (requiere PostgreSQL, Keycloak y Flowable activos)
./mvnw spring-boot:run
```

### Web

Desde la raíz del monorepo (usando el único `pnpm-lock.yaml` del workspace):

```bash
pnpm --filter web install
pnpm --filter web dev       # http://localhost:5173
pnpm --filter web build     # build de producción
pnpm --filter web lint      # ESLint
```

## Módulos de la API

| Módulo | Descripción | Recursos / Endpoints base |
| :--- | :--- | :--- |
| `activos` | Activos, tipos de activo, categorías, componentes, accesorios, atributos, asignaciones, estados operativos y documentos | `/api/v1/activos`, `/api/v1/tipos-activo`, `/api/v1/categorias`, `/api/v1/componentes`, `/api/v1/accesorios`, `/api/v1/documentos` |
| `incidentes` | Incidentes sobre activos, involucrados y evidencias | `/api/v1/incidentes`, `/api/v1/incidentes-evidencias`, `/api/v1/incidentes-involucrados` |
| `mantenimientos` | Solicitudes, planes, programaciones preventivas, órdenes de trabajo, actividades, checklists y controles de activos | `/api/v1/solicitudes-mantenimiento`, `/api/v1/ordenes-trabajo`, `/api/v1/planes-mantenimiento`, `/api/v1/controles-activos` |
| `gestionvehicular` | Flotas, conductores, solicitudes, asignaciones, viajes, salidas, portería, bitácoras, combustible, dashboard y reportes PDF/Excel | `/api/v1/flotas-vehiculares`, `/api/v1/solicitudes-vehiculares`, `/api/v1/salidas-vehiculares`, `/api/v1/registros-porteria`, `/api/v1/controles-activos-vehiculares` |
| `inventarios` | Insumos, categorías, tipos de insumo y atributos dinámicos | `/api/v1/insumos`, `/api/v1/tipos-insumo`, `/api/v1/categorias-insumo` |
| `organizacion` | Áreas, cargos, personas, empleados, responsabilidades, grupos aprobadores y migración | `/api/v1/areas`, `/api/v1/cargos`, `/api/v1/personas`, `/api/v1/empleados`, `/api/v1/grupos-aprobadores` |
| `parametros` | Catálogos e ítems, gestiones, períodos, tipos de dato, ubicaciones y unidades de medida | `/api/v1/catalogos`, `/api/v1/gestiones`, `/api/v1/ubicaciones`, `/api/v1/unidades-medida` |
| `seguridad` | Usuarios, roles, menús dinámicos y permisos vinculados con Keycloak | `/api/v1/usuarios`, `/api/v1/roles`, `/api/v1/menus`, `/api/v1/permisos` |
| `workflow` | Gestión y ejecución en tiempo real de procesos BPMN (Flowable) | `/api/v1/workflows`, `/api/v1/workflow-runtime` |
| `auth` | Autenticación BFF contra Keycloak | `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me` |

## Workflows BPMN (Flowable) y Reportes

* **Procesos BPMN** ([apps/api/src/main/resources/processes](apps/api/src/main/resources/processes)):
  * `solicitudMantenimientoProcess.bpmn20.xml` — Flujo de solicitudes de mantenimiento.
  * `procesoGestionViajesMovilidad.bpmn20.xml` — Flujo de solicitudes y viajes vehiculares.
  * `procesoSalidaVehicular.bpmn20.xml` — Flujo de salidas vehiculares.
  * `procesoIncidentesActivos.bpmn20.xml` — Flujo de atención de incidentes de activos.
* **Reportes y exportación**:
  * **JasperReports 7** (PDF) para actas de control de activos, solicitudes, órdenes de trabajo y gestión vehicular.
  * **Apache POI** (Excel) y **ZXing** (códigos de barras / QR).

## Seguridad

* **Keycloak** OAuth2 Resource Server (JWT).
* Endpoints públicos: `POST /api/v1/auth/{login,refresh,logout}`, healthchecks (`/actuator/health`, `/api/v1/health`) y OpenAPI/Swagger.
* El resto de `/api/v1/**` requiere JWT válido (`/api/v1/admin/**` exige rol `ADMIN`).
* El frontend utiliza el patrón BFF para autenticación y refresco automático de sesión.

## Base de datos

PostgreSQL 16 con **9 schemas** gestionados mediante **159 migraciones Flyway** (`ddl-auto=validate`):

* `activos` — activos, tipos, categorías, componentes, accesorios, atributos, asignaciones y documentos
* `incidentes` — incidentes de activos, involucrados y evidencias
* `mantenimientos` — solicitudes, planes, programaciones, órdenes de trabajo, checklists y controles
* `gestion_vehicular` — flotas, conductores, solicitudes, asignaciones, viajes, salidas, portería, bitácoras y combustible
* `inventarios` — insumos, categorías, tipos y atributos
* `organizacion` — personas, áreas, cargos, empleados, responsabilidades, grupos aprobadores y migración
* `parametros` — catálogos, ítems, gestiones, períodos, tipos de dato, ubicaciones y unidades de medida
* `seguridad` — usuarios, roles, menús y permisos
* `workflow` — definiciones y trazabilidad de procesos BPMN
