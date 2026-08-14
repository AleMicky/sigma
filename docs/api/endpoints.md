# API REST — Endpoints

Base URL: `/api/v1` (constante `ApiConstants.API_V1`)

Todos los endpoints requieren JWT + rol `ADMIN`, excepto los de auth (públicos).

## Auth

| Método | Path | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login BFF (password grant Keycloak) | Público |
| POST | `/auth/refresh` | Renovar token | Público |
| POST | `/auth/logout` | Cerrar sesión | Público |
| GET | `/auth/me` | Usuario actual | Autenticado |

## Activos

| Método | Path | Descripción | Notas |
|--------|------|-------------|------|
| POST | `/activos` | Crear activo | |
| PUT | `/activos/{id}` | Actualizar activo | |
| GET | `/activos/{id}` | Obtener activo | |
| GET | `/activos` | Listar (paginado) | Filtros: `?tipoActivoId=`, `?q=` |
| DELETE | `/activos/{id}` | Eliminar activo | |
| POST | `/activos/{id}/imagen` | Subir imagen | multipart/form-data |
| DELETE | `/activos/{id}/imagen` | Eliminar imagen | |

| Método | Path | Descripción | Notas |
|--------|------|-------------|------|
| *CRUD* | `/tipos-activo` | Tipos de activo | |
| *CRUD* | `/categorias` | Categorías | Filtro: `?q=` |
| *CRUD* | `/componentes` | Componentes | Filtro: `?tipoActivoId=`, `PATCH /{id}/activo` (toggle) |
| *CRUD* | `/activo-atributos` | Atributos de activo | Filtro: `?tipoActivoId=` |
| *CRUD* | `/activo-atributo-valores` | Valores de atributos | Filtro: `?activoId=` |
| *CRUD* | `/documentos` | Documentos | `POST` solo multipart (`data` + `file`); JSON sin archivo → 422; filtros: `?activoId`, `?tipoDocumentoId`, `?q=`; `POST /{id}/archivo` (reemplazar) |
| *CRUD* | `/tipos-documento` | Tipos de documento | Filtro: `?q=` |

`*CRUD*` = POST, PUT, GET/{id}, GET/ (paginado), DELETE/{id} heredados de `AbstractCrudController`.

## Organización

| Método | Path | Descripción | Notas |
|--------|------|-------------|------|
| *CRUD* | `/areas` | Áreas | Filtro: `?q=` |
| *CRUD* | `/cargos` | Cargos | Filtro: `?q=` |
| *CRUD* | `/personas` | Personas | Filtro: `?q=` |
| *CRUD* | `/empleados` | Empleados | `GET /buscar` (filtros: `?personaId`, `?areaId`, `?cargoId`, `?q=`) |
| GET | `/registros-migracion` | Listar registros | Filtros: `?sistemaOrigen`, `?entidad`, `?estado`, `?fechaDesde`, `?fechaHasta`, `?q=` |
| GET | `/registros-migracion/{id}` | Obtener registro | |

## Parámetros

| Método | Path | Descripción | Notas |
|--------|------|-------------|------|
| *CRUD* | `/catalogos` | Catálogos | Filtro: `?q=` |
| *CRUD* | `/catalogo-items` | Ítems de catálogo | Filtro: `?catalogoId=` |
| *CRUD* | `/gestiones` | Gestiones | Filtro: `?q=` |
| *CRUD* | `/periodos` | Períodos | Filtro: `?gestionId=` |
| *CRUD* | `/tipos-dato` | Tipos de dato | Filtro: `?q=` |
| *CRUD* | `/ubicaciones` | Ubicaciones | Filtros: `?q=`, `?tipo=`; `GET /raices`, `GET /arbol`, `GET /{id}/hijos`, `GET /{id}/arbol` |

## Archivos

| Método | Path | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/files/{folder}/{filename}` | Servir archivo subido | Autenticado |

## Paginación

Todas las listas (`GET /`) usan `PageRequestDto`:

```
?page=0          (índice 0-based, default 0)
&size=20         (tamaño de página, default 20)
&sort=codigo,asc (campo[,-dir], default id,asc)
```

Respuesta: `PageResponse<T>` con `content`, `page`, `size`, `totalElements`, `totalPages`.

## Errores

Todas las respuestas de error siguen `ApiErrorResponse`:

```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "INVALID_EMPLEADO_CODIGO",
  "message": "El código debe tener entre 2 y 50 caracteres",
  "path": "/api/v1/empleados",
  "fieldErrors": []
}
```

| HTTP | Causa | Code prefix |
|------|-------|-------------|
| 400 | Validación de entrada (Bean Validation, parámetros mal formados) | `VALIDATION_ERROR`, `BAD_REQUEST`, `INVALID_SORT_FIELD` |
| 422 | Validación de negocio / reglas de dominio | `INVALID_*`, `*_REQUIRED`, `BUSINESS_RULE_VIOLATION` |
| 404 | Recurso no encontrado | `RESOURCE_NOT_FOUND` |
| 409 | Conflicto (unicidad) | `*_ALREADY_EXISTS` |
| 403 | Sin permisos | `FORBIDDEN` |
| 401 | No autenticado | `UNAUTHORIZED` |