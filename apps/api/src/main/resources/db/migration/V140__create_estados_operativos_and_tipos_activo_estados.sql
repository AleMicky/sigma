-- ============================================================================
-- Migración: V140__create_estados_operativos_and_tipos_activo_estados.sql
-- Descripción: Crear tablas de estados operativos y relación con tipos de activo.
-- ============================================================================

CREATE TABLE IF NOT EXISTS activos.estados_operativos (
    id            UUID PRIMARY KEY,
    codigo        VARCHAR(50)  NOT NULL,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   VARCHAR(255),
    color         VARCHAR(7),
    created_at    TIMESTAMPTZ  NOT NULL,
    updated_at    TIMESTAMPTZ,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    created_by_id UUID,
    updated_by_id UUID,
    CONSTRAINT uk_estados_operativos_codigo UNIQUE (codigo)
);

CREATE INDEX IF NOT EXISTS idx_estados_operativos_codigo_ci
    ON activos.estados_operativos (LOWER(codigo));

CREATE INDEX IF NOT EXISTS idx_estados_operativos_nombre_ci
    ON activos.estados_operativos (LOWER(nombre));

CREATE TABLE IF NOT EXISTS activos.tipos_activo_estados (
    id                  UUID PRIMARY KEY,
    tipo_activo_id      UUID NOT NULL,
    estado_operativo_id UUID NOT NULL,
    predeterminado      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT uk_tipo_activo_estado
        UNIQUE (tipo_activo_id, estado_operativo_id),
    CONSTRAINT fk_tipo_activo_estado_tipo_activo
        FOREIGN KEY (tipo_activo_id)
        REFERENCES activos.tipos_activo (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tipo_activo_estado_estado_operativo
        FOREIGN KEY (estado_operativo_id)
        REFERENCES activos.estados_operativos (id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_tipos_activo_estados_tipo_activo
    ON activos.tipos_activo_estados (tipo_activo_id);

CREATE INDEX IF NOT EXISTS idx_tipos_activo_estados_estado_operativo
    ON activos.tipos_activo_estados (estado_operativo_id);
