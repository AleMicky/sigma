-- ============================================================================
-- Migración: V110__create_conductores.sql
-- Descripción: Crear esquema y tabla de conductores del parque vehicular.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gestion_vehicular;

CREATE TABLE gestion_vehicular.conductores (
    id                  UUID          PRIMARY KEY,
    empleado_id         UUID          NOT NULL,
    numero_licencia     VARCHAR(50)   NOT NULL,
    categoria_licencia  VARCHAR(20)   NOT NULL,
    fecha_vencimiento   DATE          NOT NULL,
    activo              BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT uk_conductor_empleado        UNIQUE (empleado_id),
    CONSTRAINT uk_conductor_numero_licencia UNIQUE (numero_licencia)
);

CREATE INDEX idx_conductor_fecha_vencimiento
    ON gestion_vehicular.conductores (fecha_vencimiento);

CREATE INDEX idx_conductor_activo
    ON gestion_vehicular.conductores (activo);