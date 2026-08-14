# Esquema de Base de Datos

PostgreSQL 16 con 3 schemas gestionados por Flyway (`ddl-auto=validate`).

## Schema `activos`

```
                    ┌──────────────┐
                    │ categorias   │
                    │ (V17)        │
                    └──────┬───────┘
                           │ 1:N
                    ┌──────▼───────┐
                    │ tipos_activo │
                    │ (V1)        │
                    └──┬───┬───┬──┘
                       │   │   │
              ┌────────┘   │   └────────────┐
              │ 1:N        │ 1:N             │ 1:N
     ┌────────▼──┐  ┌──────▼─────┐  ┌────────▼──────┐
     │ activos   │  │ componentes │  │ activo_       │
     │ (V14)     │  │ (V12, V27)  │  │ atributos    │
     └──┬────┬───┘  └────────────┘  │ (V10)         │
        │    │                      └───────┬───────┘
        │    │                              │ 1:N
        │    │                      ┌──────▼────────────┐
        │    │  N:1                  │ activo_atributo_ │
        │    └──────────────────────►│ valores          │
        │                            │ (V15)            │
        │                            └──────────────────┘
  ┌─────▼──────────┐
  │ documentos     │
  │ (V20)          │
  └───────────────-┘
  │ documentos     │
  │ (V20)          │
  └───────┬────────┘
          │ N:1
  ┌───────▼──────────┐
  │ tipos_documento  │
  │ (V19)            │
  └──────────────────┘
```

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `tipos_activo` | V1, V8, V9, V18 | Tipos de activo (vehículo, computador, etc.) |
| `activos` | V14, V16 | Activos registrados |
| `categorias` | V17 | Categorías de tipos de activo |
| `componentes` | V12, V27 | Componentes de tipos de activo |
| `activo_atributos` | V10, V16 | Atributos dinámicos por tipo de activo |
| `activo_atributo_valores` | V15 | Valores de atributos por activo |
| `tipos_documento` | V19 | Tipos de documento (con/sin vencimiento) |
| `documentos` | V20 | Documentos asociados a activos |

## Schema `parametros`

```
  ┌──────────────┐       ┌───────────┐
  │ catalogos    │──1:N─►│ catalogo_ │
  │ (V2)         │       │ items (V3)│
  └──────────────┘       └───────────┘

  ┌──────────────┐       ┌───────────┐
  │ gestiones    │──1:N─►│ periodos  │
  │ (V5)         │       │ (V5)      │
  └──────────────┘       └───────────┘

  ┌──────────────┐
  │ tipo_dato    │
  │ (V6, V7)     │
  └──────────────┘

  ┌──────────────────┐
  │ ubicaciones      │  (self-ref: ubicacion_padre_id)
  │ (V25, V26)      │
  └──────────────────┘
```

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `catalogos` | V2 | Catálogos maestros |
| `catalogo_items` | V3, V4 | Ítems de catálogo (con orden único) |
| `gestiones` | V5 | Gestiones (años fiscales) |
| `periodos` | V5 | Períodos dentro de una gestión |
| `tipo_dato` | V6, V7 | Tipos de dato para atributos dinámicos |
| `ubicaciones` | V25, V26 | Ubicaciones jerárquicas (self-referencia) |

## Schema `organizacion`

```
  ┌──────────┐   ┌──────┐   ┌────────┐
  │ personas │   │ areas │   │ cargos │
  │ (V21)    │   │ (V21) │   │ (V21)  │
  └────┬─────┘   └──┬───┘   └───┬────┘
       │            │           │
       └────────────┼───────────┘
                    │ N:1 (cada uno)
             ┌──────▼──────┐
             │  empleados  │
             │  (V21)      │
             └─────────────┘

  ┌────────────────────┐
  │ registros_         │
  │ migracion (V23,24) │  (log, sin FKs)
  └────────────────────┘
```

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `personas` | V21, V22 | Personas (datos personales) |
| `areas` | V21, V22 | Áreas organizacionales |
| `cargos` | V21, V22 | Cargos |
| `empleados` | V21 | Empleados (relaciona persona + área + cargo) |
| `registros_migracion` | V23, V24 | Log de migración desde sistemas externos (n8n) |

## Convenciones

- **IDs**: UUID (`@UuidGenerator` en JPA, tipo `UUID` en DB)
- **Auditoría**: `created_at`, `updated_at`, `created_by`, `updated_by` en todas las tablas (excepto `registros_migracion`)
- **Timestamps**: `Instant` (Java) ↔ `timestamptz` (DB, zona UTC)
- **FKs**: Constraints a nivel DB (Flyway), no JPA `@ManyToOne` (excepto 3 casos: Catalogo↔CatalogoItem, Gestion↔Periodo, Ubicacion↔UbicacionPadre)
- **Sort fields**: Whitelist por service (`allowedSortFields()`)