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

| Módulo | Descripción | Modelos de dominio |
|--------|-------------|-------------------|
| `activos` | Gestión de activos | Activo, TipoActivo, Categoria, Componente, ActivoAtributo, ActivoAtributoValor, Documentos, TiposDocumento |
| `organizacion` | Estructura organizacional | Persona, Area, Cargo, Empleado, RegistroMigracion |
| `parametros` | Catálogos y parámetros | Catalogo, CatalogoItem, Gestion, Periodo, TipoDato, Ubicacion |
| `auth` | Autenticación BFF | (sin modelos propios; usa Keycloak) |

## Seguridad

```
Request → Spring Security Filter Chain → BearerTokenResolver
    → KeycloakJwtAuthenticationConverter (extrae roles de realm_access.roles)
    → @PreAuthorize("hasAnyRole('ADMIN')")
    → Controller → Service → Domain → Repository → PostgreSQL
```

- **OAuth2 Resource Server** con JWT de Keycloak
- **Stateless** (sin sesiones)
- **CSRF** deshabilitado (API REST stateless)
- **Endpoints públicos**: `/api/v1/auth/{login,refresh,logout}`, Swagger, API docs, actuator health
- **Resto**: requiere JWT válido + rol `ADMIN`
- **BFF pattern**: el frontend (`sigma-web`) hace password grant directamente contra Keycloak

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