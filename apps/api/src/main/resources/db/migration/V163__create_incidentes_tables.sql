-- ============================================================================
-- Migración: V163__create_incidentes_tables.sql
-- Descripción: Crear esquema y tablas para el módulo de gestión de incidentes
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS incidentes;

-- 1. Tabla principal de incidentes de activos
CREATE TABLE IF NOT EXISTS incidentes.incidentes_activos (
    id                    UUID            PRIMARY KEY,
    activo_id             UUID            NOT NULL,
    tipo_incidente        VARCHAR(100)    NOT NULL,
    prioridad             VARCHAR(50)     NOT NULL,
    estado                VARCHAR(50)     NOT NULL,
    fecha_hora            TIMESTAMP       NOT NULL,
    ubicacion             VARCHAR(255),
    latitud               NUMERIC(10, 7),
    longitud              NUMERIC(10, 7),
    descripcion           TEXT            NOT NULL,
    empleado_reporta_id   UUID            NOT NULL,
    process_instance_id   VARCHAR(100),
    created_at            TIMESTAMPTZ     NOT NULL,
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    created_by_id         UUID,
    updated_by_id         UUID,
    CONSTRAINT fk_incidente_activo
        FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_incidente_activo_activo_id
    ON incidentes.incidentes_activos (activo_id);

CREATE INDEX IF NOT EXISTS idx_incidente_activo_estado
    ON incidentes.incidentes_activos (estado);

CREATE INDEX IF NOT EXISTS idx_incidente_activo_fecha_hora
    ON incidentes.incidentes_activos (fecha_hora);

CREATE INDEX IF NOT EXISTS idx_incidente_activo_empleado
    ON incidentes.incidentes_activos (empleado_reporta_id);

-- 2. Tabla de personas involucradas en el incidente
CREATE TABLE IF NOT EXISTS incidentes.incidentes_involucrados (
    id                    UUID            PRIMARY KEY,
    incidente_activo_id   UUID            NOT NULL,
    tipo_involucrado      VARCHAR(100)    NOT NULL,
    empleado_id           UUID,
    nombre                VARCHAR(255),
    documento_identidad   VARCHAR(100),
    descripcion           TEXT,
    created_at            TIMESTAMPTZ     NOT NULL,
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    created_by_id         UUID,
    updated_by_id         UUID,
    CONSTRAINT fk_incidente_involucrado_incidente
        FOREIGN KEY (incidente_activo_id)
        REFERENCES incidentes.incidentes_activos (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidente_involucrado_incidente
    ON incidentes.incidentes_involucrados (incidente_activo_id);

CREATE INDEX IF NOT EXISTS idx_incidente_involucrado_empleado
    ON incidentes.incidentes_involucrados (empleado_id);

-- 3. Tabla de archivos y evidencias del incidente
CREATE TABLE IF NOT EXISTS incidentes.incidentes_evidencias (
    id                    UUID            PRIMARY KEY,
    incidente_activo_id   UUID            NOT NULL,
    nombre_archivo        VARCHAR(255)    NOT NULL,
    url                   VARCHAR(1000)   NOT NULL,
    mime_type             VARCHAR(100)    NOT NULL,
    size                  BIGINT          NOT NULL,
    created_at            TIMESTAMPTZ     NOT NULL,
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    created_by_id         UUID,
    updated_by_id         UUID,
    CONSTRAINT fk_incidente_evidencia_incidente
        FOREIGN KEY (incidente_activo_id)
        REFERENCES incidentes.incidentes_activos (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidente_evidencia_incidente
    ON incidentes.incidentes_evidencias (incidente_activo_id);

-- 4. Registrar Workflow para Incidentes de Activos
INSERT INTO workflow.workflows (
    id,
    codigo,
    nombre,
    descripcion,
    modulo,
    process_definition_key,
    activo
) VALUES (
    gen_random_uuid(),
    'INCIDENTE_ACTIVO',
    'Gestión de Incidentes de Activos',
    'Workflow para el ciclo de vida y atención de incidentes y siniestros de activos',
    'INCIDENTES',
    'procesoIncidentesActivos',
    TRUE
) ON CONFLICT (codigo) DO NOTHING;


