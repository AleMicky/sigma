# API REST — Endpoints

Base URL: `/api/v1` (constante `ApiConstants.API_V1`). Las respuestas exitosas se envuelven en `ApiResponse<T>` (`success`, `message`, `data`, `timestamp`).

Fuentes de verdad: `@RequestMapping` en los controllers y reglas de `config/security/SecurityConfig.java`. Hay **85 controllers** con `@RequestMapping` (84 en `modules/` + `StoredFileController` compartido).

## Seguridad y roles (real)

| Tipo de endpoint | Regla efectiva |
|------------------|----------------|
| `POST /api/v1/auth/login`, `/refresh`, `/logout` | **Público** (`permitAll`); el `BearerTokenResolver` ignora el header en estas rutas para no consultar JWKS |
| `GET /api/v1/auth/me` | **Autenticado** (JWT válido) |
| `/health`, `/api/health`, `/api/v1/health`, `/actuator/health{,/**}`, Swagger (`/swagger-ui.html`, `/swagger-ui/**`, `/v3/api-docs{,/**}`) | **Público** |
| `/api/v1/admin/**` | **Rol `ADMIN`** (`hasRole("ADMIN")`) |
| Resto de `/api/v1/**` | **Cualquier JWT válido** (`authenticated()`); **no** exige `ADMIN` |
| Cualquier otra ruta | `denyAll()` |

- Los roles se obtienen del JWT: `realm_access.roles` y `resource_access.<cliente>.roles`, normalizados con prefijo `ROLE_` (`KeycloakJwtAuthenticationConverter`). El `principal` es `preferred_username` o, si falta, `sub`.
- `@PreAuthorize("hasRole('ADMIN')")` a nivel de clase en: `UsuarioController`, `RolController`, `RolMenuController`, `MenuController`, `PermisoController` y `KeycloakTestController` (`/admin/keycloak`).
- Excepción: `GET /api/v1/menus/mis-menus` lleva `@PreAuthorize("isAuthenticated()")` y está disponible para cualquier usuario autenticado.
- Control de alcance por área/usuario (`SecurityUtils`) en servicios de portería, salidas, solicitudes vehiculares y solicitudes de mantenimiento: un usuario no `ADMIN` solo ve/opera sobre su alcance (fail-closed si no hay empleado/interfaz asociados).
- Autenticación **stateless**: OAuth2 Resource Server, JWT de Keycloak, CSRF deshabilitado, sin sesión HTTP ni cookies `HttpOnly`.

## Auth

| Método | Path | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login BFF (password grant contra Keycloak; devuelve `accessToken`, `refreshToken`, `user`) | Público |
| POST | `/auth/refresh` | Renovar token con `refreshToken` | Público |
| POST | `/auth/logout` | Invalidar refresh token en Keycloak | Público |
| GET | `/auth/me` | Usuario actual a partir del JWT | Autenticado |

## Módulos y rutas base (verificadas en controllers)

| Módulo | Rutas base |
|--------|------------|
| `activos` | `/activos`, `/tipos-activo`, `/categorias`, `/componentes`, `/accesorios`, `/activo-accesorios`, `/activo-asignaciones`, `/activo-atributos`, `/activo-atributo-valores`, `/activo-documentos`, `/tipos-documento`, `/estados-operativos`, `/tipos-activo-estados` |
| `incidentes` | `/incidentes`, `/incidentes/{id}/evidencias`, `/incidentes/{id}/involucrados` |
| `mantenimientos` | `/solicitudes-mantenimiento`, `/planes-mantenimiento`, `/programaciones-mantenimiento`, `/ordenes-trabajo`, `/actividades-mantenimiento`, `/actividad-mantenimiento-aplicaciones`, `/checklist-items`, `/controles-activos`, `/controles-activos-detalles`, `/planes-mantenimiento-actividades`, `/planes-mantenimiento-activos`, `/ordenes-trabajo-actividades`, `/ordenes-trabajo-adjuntos`, `/ordenes-trabajo-actividad-evidencias`, `/programacion-mantenimiento-criterios`, `/solicitud-mantenimiento-adjuntos`, `/tipos-mantenimiento`, `/prioridades` |
| `gestionvehicular` | `/flotas-vehiculares`, `/flota-vehiculos`, `/conductores`, `/conductor-licencias`, `/responsables-flota`, `/solicitudes-vehiculares`, `/solicitudes-vehiculares/{solicitudVehicularId}/adjuntos`, `/tipos-solicitud-vehicular`, `/asignaciones-vehiculares`, `/viajes-vehiculares`, **`/porteria`**, `/salidas-vehiculares`, `/controles-activos-vehiculares`, `/controles-activos-vehiculares-detalles`, `/cargas-combustible`, `/bitacora-vehicular`, `/gestion-vehicular/dashboard`, `/gestion-vehicular/vehiculos`, `/reportes/solicitudes-vehiculares`, `/reportes/salidas-vehiculares` |
| `inventarios` | `/insumos`, `/tipos-insumo`, `/tipos-insumo-atributos`, `/categorias-insumo`, `/insumo-atributo-valores` |
| `organizacion` | `/areas`, `/cargos`, `/personas`, `/empleados`, `/empleado-responsabilidades`, `/responsabilidades`, `/grupos-aprobadores`, `/grupos-aprobadores/{grupoAprobadorId}/detalles`, `/registros-migracion` |
| `parametros` | `/catalogos`, `/catalogo-items`, `/gestiones`, `/periodos`, `/tipos-dato`, `/ubicaciones`, `/unidades-medida` |
| `seguridad` | `/usuarios`, `/roles`, `/roles/{rolId}/menus`, `/menus`, `/permisos`, `/admin/keycloak` |
| `workflow` | `/workflows` (definiciones) y **`/workflow`** (runtime: `/instances/{processInstanceId}/current-task`, `/actions`, `/history`, `/complete`) |
| `shared` | `/files/{folder}/{filename}` |

> La ruta de portería es `/api/v1/porteria` (controller `RegistroPorteriaController`), **no** `/api/v1/registros-porteria`. El runtime BPMN es `/api/v1/workflow` (controller `WorkflowRuntimeController`), **no** `/api/v1/workflow-runtime`. Las evidencias/involucrados de incidentes son subrecursos de `/incidentes/{id}`.

### Portería (`/porteria`)

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/porteria/salidas` | Registrar salida |
| POST | `/porteria/{id}/llegada` | Registrar llegada |
| POST | `/porteria/{id}/anular` | Anular registro |
| GET | `/porteria/afuera` | Registros pendientes de retorno |
| GET | `/porteria/reporte`, `/porteria/bitacora` | Consulta tabular |
| GET | `/porteria/reporte/pdf`, `/porteria/bitacora/pdf` | Reportes PDF |
| GET | `/porteria` (paginado) | Historial con `search`/`q`, `empleadoId`, `activoId`, `areaId`, `createdById`, `tipoMovimiento`, `estado`, `fechaDesde`, `fechaHasta` |
| GET | `/porteria/{id}` | Detalle |

### Workflow en tiempo real (`/workflow`)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/workflow/instances/{processInstanceId}/current-task` | Tarea actual |
| GET | `/workflow/instances/{processInstanceId}/actions` | Acciones disponibles |
| GET | `/workflow/instances/{processInstanceId}/history` | Historial |
| POST | `/workflow/instances/{processInstanceId}/complete` | Completar tarea (body `CompleteWorkflowTaskRequest`) |

### Archivos

| Método | Path | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/files/{folder}/{filename}` | Servir archivo subido (`Content-Disposition: attachment` para documentos; `inline` solo para imágenes raster seguras y PDF) | Autenticado |

## Paginación y orden

Los listados usan `PageRequestDto` (`@Valid @ModelAttribute`) o su extensión `SearchPageRequestDto` (añade `search` y `q`). **El parámetro de orden es `sortBy` + `direction`, no `sort=campo,dir`**:

```
?page=0              (índice 0-based; default 0)
&size=20             (default 20; máximo 500; valores < 1 se normalizan al default)
&sortBy=createdAt    (default createdAt; whitelist por servicio)
&direction=DESC      (ASC | DESC; default DESC)
&search=texto        (opcional; alternativa: &q=texto, prioriza search)
```

- `sortBy` se valida contra `allowedSortFields()` de cada servicio. Campos base: `id`, `createdAt`, `updatedAt`. Un campo no permitido produce `BusinessException` con código `INVALID_SORT_FIELD` → **422**, con el listado de campos válidos en el mensaje.
- `direction` es `Sort.Direction` (`ASC`/`DESC`); un valor inválido se rechaza en la conversión de parámetros (400).
- Respuesta: `ApiResponse<PageResponse<T>>`, donde `data` contiene `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `empty`.
- Los filtros concretos (por ejemplo `?tipoActivoId=`, `?activoId=`, `?tipoMovimiento=`) son `@RequestParam` propios de cada controller y se documentan en el código de cada uno.

## Errores

Todas las respuestas de error siguen `ApiErrorResponse` (`success`, `status`, `error`, `code`, `message`, `path`, `validationErrors`, `timestamp`):

```json
{
  "success": false,
  "status": 422,
  "error": "Unprocessable Entity",
  "code": "INVALID_EMPLEADO_CODIGO",
  "message": "El código debe tener entre 2 y 50 caracteres",
  "path": "/api/v1/empleados",
  "validationErrors": []
}
```

| HTTP | Causa | Códigos habituales |
|------|-------|--------------------|
| 400 | Validación de entrada / parámetros mal formados | `VALIDATION_ERROR`, `BAD_REQUEST` |
| 401 | No autenticado / credenciales Keycloak inválidas | `UNAUTHORIZED` |
| 403 | Sin permisos (falta `ADMIN` o alcance insuficiente) | `FORBIDDEN` |
| 404 | Recurso no encontrado | `RESOURCE_NOT_FOUND` |
| 409 | Conflicto de unicidad | `*_ALREADY_EXISTS` |
| 413 | Archivo demasiado grande | `INVALID_IMAGE_SIZE` |
| 422 | Regla de negocio / `sortBy` fuera de whitelist | `INVALID_*`, `*_REQUIRED`, `BUSINESS_RULE_VIOLATION`, `INVALID_SORT_FIELD` |
