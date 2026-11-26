# Arquitectura — Visión General

## Patrón

Arquitectura **hexagonal** (ports & adapters), organizada **package-by-feature**.

```
                    ┌─────────────────────────────────┐
                    │           Presentation          │
                    │   (REST Controllers, DTOs)       │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │           Application           │
                    │   (Services / Use Cases)        │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │             Domain              │
                    │   (Models, Repository IFs,      │
                    │     Enums, Exceptions)          │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │         Infrastructure          │
                    │   (JPA Entities, Mappers,       │
                    │     Repository Impl, Storage)   │
                    └─────────────────────────────────┘
```

## Capas por módulo

Cada módulo bajo `modules/<module>/` sigue la misma estructura:

| Capa | Paquete | Responsabilidad | Dependencias |
|------|---------|-----------------|--------------|
| **Presentation** | `presentation/controller` | REST endpoints, request mapping | Spring Web, Swagger |
| **Application** | `application/service` + `application/dto` | Casos de uso, lógica de validación, DTOs | Domain, shared |
| **Domain** | `domain/model` + `domain/repository` + `domain/enums` | Modelos POJO puros, interfaces de repositorio, enums | Ninguna (sin framework) |
| **Infrastructure** | `infrastructure/persistence/{entity,mapper,repository}` | Entidades JPA, mappers domain↔entity, impl de repositorios | Spring Data JPA, Domain |

## Abstracciones CRUD genéricas

```
shared/
├── application/crud/
│   ├── CrudService<T,REQ,RES,ID>         (interface)
│   └── AbstractCrudService<...>          (template method: create, update, findById, findAll, delete)
├── domain/repository/
│   └── CrudRepository<T,ID>             (interface: save, findById, findAll, deleteById, existsById)
├── infrastructure/persistence/
│   ├── AbstractJpaRepositoryAdapter<...> (adapter: domain↔Spring Data)
│   └── model/BaseEntity                 (@MappedSuperclass: id, createdAt, updatedAt, createdBy, updatedBy)
└── presentation/controller/
    └── AbstractCrudController<...>       (5 endpoints CRUD heredados)
```

Nuevo recurso CRUD = ~3 archivos triviales (controller extiende base, service extiende base, mapper).

## Módulos

Los 10 módulos reales bajo `modules/` (verificado en `apps/api/src/main/java/com/endecorani/sigma_api/modules/`). 84 controllers de módulo + 1 controller compartido (`StoredFileController`); 9 módulos tienen entidades JPA (todos salvo `auth`).

| Módulo | Responsabilidad real | Modelos de dominio (representativos) |
|--------|----------------------|--------------------------------------|
| `activos` | Activos, tipos/categorías/componentes/accesorios, atributos dinámicos, asignaciones, estados operativos y documentos | `Activo`, `TipoActivo`, `Categoria`, `Componente`, `Accesorio`, `ActivoAtributo`, `ActivoAtributoValor`, `ActivoAsignacion`, `ActivoDocumento`, `TiposDocumento`, `EstadoOperativo`, `TipoActivoEstado` |
| `auth` | BFF de autenticación: login/refresh/logout/me contra Keycloak | Sin modelos ni tablas propias; DTOs `LoginRequest`, `RefreshTokenRequest`, `LogoutRequest`, `AuthTokenResponse`, `AuthUserResponse` |
| `gestionvehicular` | Flotas, conductores, solicitudes, asignaciones, viajes, salidas, portería, control de activos, combustible, bitácora y reportes | `FlotaVehicular`, `FlotaVehiculo`, `Conductor`, `SolicitudVehicular`, `AsignacionVehicular`, `ViajeVehicular`, `SalidaVehicular`, `RegistroPorteria`, `ControlActivo`, `CargaCombustible`, `BitacoraVehicular` |
| `incidentes` | Incidentes de activos, involucrados y evidencias | `IncidenteActivo`, `IncidenteInvolucrado`, `IncidenteEvidencia` |
| `inventarios` | Insumos, tipos/categorías de insumo y atributos dinámicos | `Insumo`, `TipoInsumo`, `TipoInsumoAtributo`, `CategoriaInsumo`, `InsumoAtributoValor` |
| `mantenimientos` | Solicitudes, planes, programaciones, órdenes de trabajo, actividades, evidencias, checklists y controles | `SolicitudMantenimiento`, `PlanMantenimiento`, `ProgramacionMantenimiento`, `OrdenTrabajo`, `ActividadMantenimiento`, `ChecklistItem`, `ControlActivo`, `Prioridad`, `TipoMantenimiento` |
| `organizacion` | Personas, áreas, cargos, empleados, responsabilidades, grupos aprobadores y migración | `Persona`, `Area`, `Cargo`, `Empleado`, `Responsabilidad`, `GrupoAprobador`, `RegistroMigracion` |
| `parametros` | Catálogos e ítems, gestiones, períodos, tipos de dato, ubicaciones, unidades de medida y correlativos | `Catalogo`, `CatalogoItem`, `Gestion`, `Periodo`, `TipoDato`, `Ubicacion`, `UnidadMedida`, `Correlativo` |
| `seguridad` | Usuarios, roles, menús dinámicos y permisos | `Usuario`, `Rol`, `Menu`, `TipoMenu`, `RolMenu`, `Permiso` |
| `workflow` | Definiciones de procesos (`/workflows`) y runtime Flowable (`/workflow`); el motor BPMN es externo | `Workflow` (solo definición; las tareas/historial viven en Flowable) |

> Nota: `workflow` tiene sus controllers en `presentation/` (no en `presentation/controller/`), a diferencia del resto de módulos.

## Seguridad

```
Cliente (Web / Móvil)
    │  POST /api/v1/auth/login|refresh|logout  (público, sin JWT)
    ▼
API (BFF de auth) → KeycloakTokenClient (RestClient) → Keycloak (password/refresh/logout)
    │  accessToken + refreshToken en el cuerpo JSON
    ▼
Cliente guarda tokens y envía Authorization: Bearer <accessToken>
    ▼
Nginx (/api/ → API) → Spring Security Filter Chain → BearerTokenResolver
    → KeycloakJwtAuthenticationConverter (realm_access.roles + resource_access.<client>.roles → ROLE_*)
    → reglas SecurityConfig / @PreAuthorize → Controller → Service → Domain → Repository → PostgreSQL
```

- **OAuth2 Resource Server** con JWT de Keycloak, **stateless**, **CSRF deshabilitado**.
- **Públicos**: `/swagger-ui.html`, `/swagger-ui/**`, `/v3/api-docs{,/**}`, `/health`, `/api/health`, `/api/v1/health`, `/actuator/health{,/**}` y `POST /api/v1/auth/{login,refresh,logout}`. `GET /auth/me` **sí** requiere JWT.
- **Regla general**: `/api/v1/admin/**` → rol `ADMIN`; el resto de `/api/v1/**` → `authenticated()` (cualquier JWT válido); `anyRequest().denyAll()`.
- **Reglas a nivel de método**: `@PreAuthorize("hasRole('ADMIN')")` a nivel de clase en `UsuarioController`, `RolController`, `RolMenuController`, `MenuController` (salvo `GET /menus/mis-menus`, que es `isAuthenticated()`), `PermisoController` y `KeycloakTestController`. Los servicios aplican además control de alcance por área/usuario (`SecurityUtils`) en portería, salidas, solicitudes y mantenimiento.
- **BFF real (no idealizado)**: el BFF existe **solo para autenticación** y es la API la que habla con Keycloak (`AuthService` + `KeycloakTokenClient`, `RestClient`). **No** es el frontend quien hace password grant directo, **no** hay cookies `HttpOnly` ni sesión de servidor, y **no** hay proxy BFF para los endpoints de negocio: los tokens se devuelven al cliente en JSON, Web los persiste con Zustand `persist` (localStorage) y Móvil con `FlutterSecureStorage`, y ambos los reenvían como Bearer; el refresh lo inicia el cliente interceptor llamando a `POST /api/v1/auth/refresh`.

## Configuración

| Clase | Función |
|-------|----------|
| `SecurityConfig` | Filter chain, reglas de autorización, JWT resolver |
| `KeycloakConfig` | `RestClient` bean para llamadas a Keycloak |
| `KeycloakTokenClient` | Password grant, refresh, logout |
| `CorsConfig` | CORS configurable via `app.cors.allowed-origins` |
| `JpaAuditingConfig` | `AuditorAware` desde JWT principal (`createdBy`/`updatedBy`) |
| `OpenApiConfig` | Swagger con Bearer JWT security scheme |
| `StorageConfig` | Properties para imágenes y documentos |
| `DotEnvLoader` | Carga `.env` del monorepo root antes de Spring |

## Excepciones

```
DomainException (abstract)
├── ResourceNotFoundException  → 404
├── ConflictException          → 409
├── BusinessException          → 422
├── UnauthorizedException      → 401
└── ForbiddenException          → 403

GlobalExceptionHandler (@RestControllerAdvice) → ApiErrorResponse JSON
```