# Esquema de Base de Datos

PostgreSQL 16 con **9 schemas** creados por Flyway (`CREATE SCHEMA IF NOT EXISTS`) y **166 archivos de migración** (`V*.sql`, versiones `V1`–`V179`; faltan 14 números: `31`, `33`, `37`, `64` y `91`–`99`). Hibernate usa `ddl-auto=validate`, por lo que las entidades JPA deben coincidir con lo creado en `apps/api/src/main/resources/db/migration/`.

Estado actual verificado cruzando migraciones y entidades: **84 tablas** mapeadas por entidades JPA + **1 vista** (`organizacion.vempleados`, creada en `V109`). No hay schema propio para `auth` (Keycloak gestiona identidad/tokens).

| # | Schema | Tablas | Módulo(s) relacionado(s) |
|:-:|--------|:------:|--------------------------|
| 1 | `activos` | 13 | `activos` |
| 2 | `incidentes` | 3 | `incidentes` |
| 3 | `mantenimientos` | 20 | `mantenimientos` |
| 4 | `gestion_vehicular` | 18 | `gestionvehicular` |
| 5 | `inventarios` | 5 | `inventarios` |
| 6 | `organizacion` | 10 (+1 vista) | `organizacion` |
| 7 | `parametros` | 8 | `parametros` |
| 8 | `seguridad` | 6 | `seguridad` |
| 9 | `workflow` | 1 | `workflow` (solo definiciones; el runtime vive en Flowable) |

## Schema `activos`

| Tabla | Descripción |
|-------|-------------|
| `activos` | Activos registrados (cabecera) |
| `tipos_activo` | Tipos de activo (vehículo, computador, etc.) |
| `categorias` | Categorías de tipos de activo |
| `componentes` | Componentes por tipo de activo |
| `accesorios` | Accesorios por tipo de activo |
| `activo_accesorios` | Relación activo ↔ accesorio |
| `activo_atributos` | Atributos dinámicos por tipo de activo |
| `activo_atributo_valores` | Valores de atributos por activo |
| `activo_asignaciones` | Asignaciones de activos a empleados/áreas |
| `activo_documento` | Documentos del activo (tabla vigente) |
| `tipos_documento` | Tipos de documento (con/sin vencimiento) |
| `estados_operativos` | Catálogo de estados operativos |
| `tipos_activo_estados` | Relación tipo de activo ↔ estado operativo |

> `activos.documentos` (tabla legacy documentada antes) fue migrada a `activo_documento` y eliminada en `V176`.

## Schema `incidentes`

| Tabla | Descripción |
|-------|-------------|
| `incidentes_activos` | Incidentes reportados sobre activos |
| `incidentes_involucrados` | Personas/empleados involucrados |
| `incidentes_evidencias` | Evidencias (imágenes/documentos) del incidente |

## Schema `mantenimientos`

| Tabla | Descripción |
|-------|-------------|
| `solicitudes_mantenimiento` | Solicitudes de mantenimiento |
| `solicitudes_mantenimiento_adjuntos` | Adjuntos de la solicitud |
| `solicitudes_mantenimiento_trazabilidad` | Trazabilidad de estados |
| `planes_mantenimiento` | Planes preventivos |
| `plan_mantenimiento_actividades` | Actividades del plan |
| `plan_mantenimiento_activos` | Activos cubiertos por el plan |
| `programaciones_mantenimiento` | Programaciones generadas |
| `programacion_mantenimiento_criterios` | Criterios de programación |
| `programacion_mantenimiento_historial` | Historial de la programación |
| `orden_trabajo` | Órdenes de trabajo |
| `orden_trabajo_actividades` | Actividades de la orden |
| `orden_trabajo_actividad_evidencias` | Evidencias de actividades |
| `orden_trabajo_adjuntos` | Adjuntos de la orden |
| `actividades_mantenimiento` | Catálogo de actividades |
| `actividad_mantenimiento_aplicaciones` | Aplicaciones por actividad |
| `checklist_items` | Ítems de checklist |
| `control_activo` | Controles de activos |
| `control_activo_detalle` | Detalle de cada control |
| `prioridades` | Catálogo de prioridades |
| `tipos_mantenimiento` | Catálogo de tipos de mantenimiento |

> Nota: `mantenimientos.checklists_mantenimiento` fue eliminada en `V107` y no debe considerarse tabla vigente; su contenido se conservó en `checklist_items`, recreada en esa misma migración.

## Schema `gestion_vehicular`

| Tabla | Descripción |
|-------|-------------|
| `flotas_vehiculares` | Flotas |
| `flota_vehiculos` | Vehículos de cada flota |
| `conductores` | Conductores |
| `conductor_licencias` | Licencias de conductores |
| `responsables_flota` | Responsables de flota |
| `solicitudes_vehiculares` | Solicitudes de viaje/vehículo |
| `tipos_solicitud_vehicular` | Catálogo de tipos de solicitud |
| `solicitud_vehicular_adjuntos` | Adjuntos de la solicitud |
| `asignaciones_vehiculares` | Asignaciones de vehículo/conductor |
| `viajes_vehiculares` | Viajes registrados |
| `salidas_vehiculares` | Salidas vehiculares |
| `salidas_vehiculares_eventos` | Eventos/acciones BPMN de la salida |
| `registros_porteria` | Registros de entrada/salida de portería |
| `registros_porteria_activos` | Activos/vínculos por registro de portería |
| `control_activo` | Control de activos vehiculares |
| `control_activo_detalle` | Detalle del control vehicular |
| `cargas_combustible` | Cargas de combustible |
| `bitacoras_vehiculares` | Bitácora de uso del vehículo |

> La tabla de portería se llama `gestion_vehicular.registros_porteria`, pero su ruta HTTP es `/api/v1/porteria`.

## Schema `inventarios`

| Tabla | Descripción |
|-------|-------------|
| `insumos` | Insumos |
| `tipos_insumo` | Tipos de insumo |
| `tipo_insumo_atributos` | Atributos dinámicos por tipo de insumo |
| `categorias_insumo` | Categorías de insumo |
| `insumo_atributo_valores` | Valores de atributos por insumo |

## Schema `organizacion`

| Tabla | Descripción |
|-------|-------------|
| `personas` | Datos personales |
| `areas` | Áreas organizacionales |
| `cargos` | Cargos |
| `empleados` | Empleados (persona + área + cargo) |
| `responsabilidades` | Catálogo de responsabilidades |
| `empleados_responsabilidades` | Relación empleado ↔ responsabilidad |
| `grupos_aprobadores` | Grupos aprobadores |
| `grupos_aprobadores_detalles` | Miembros del grupo |
| `grupos_aprobadores_dependientes` | Dependencias entre grupos |
| `registros_migracion` | Log de migración desde sistemas externos (sin auditoría estándar; usa `fecha_registro`) |

Vista: `vempleados` (`V109`), mapeada por `VEmpleadoEntity`.

## Schema `parametros`

| Tabla | Descripción |
|-------|-------------|
| `catalogos` | Catálogos maestros |
| `catalogo_items` | Ítems de catálogo |
| `gestiones` | Gestiones (años fiscales) |
| `periodos` | Períodos dentro de una gestión |
| `tipos_dato` | Tipos de dato para atributos dinámicos |
| `ubicaciones` | Ubicaciones jerárquicas (`ubicacion_padre_id`) |
| `unidades_medida` | Unidades de medida |
| `correlativos` | Correlativos numéricos por entidad/gestión |

## Schema `seguridad`

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios (vinculados a Keycloak) |
| `roles` | Roles |
| `usuarios_roles` | Relación usuario ↔ rol |
| `menus` | Menús dinámicos jerárquicos |
| `roles_menus` | Relación rol ↔ menú |
| `permisos` | Permisos por menú/recurso |

## Schema `workflow`

| Tabla | Descripción |
|-------|-------------|
| `workflows` | Definiciones/configuración de flujos BPMN (despliegue, código, versión). Las instancias, tareas e historial se consultan al motor Flowable REST, no se persisten aquí. |

## Convenciones

- **IDs**: `UUID` (`@UuidGenerator` en JPA, `UUID` en PostgreSQL).
- **Auditoría**: `created_at`, `updated_at`, `created_by`, `updated_by` en la mayoría de tablas; excepción confirmada: `organizacion.registros_migracion` (`fecha_registro`).
- **Timestamps**: `Instant` (Java) ↔ `timestamptz` (PostgreSQL); `V173` normalizó las columnas de timestamp a `timestamptz`.
- **FKs e índices**: definidos en Flyway (incluidas adiciones de `V174` y restricciones parciales de `V175`), no solo en JPA.
- **Paginación/orden**: los servicios validan `sortBy` contra una whitelist (`allowedSortFields()`); el DTO base `PageRequestDto` usa `createdAt` / `DESC` por defecto y lanza `INVALID_SORT_FIELD` (422) si el campo no está permitido. Ver [../api/endpoints.md](../api/endpoints.md).
