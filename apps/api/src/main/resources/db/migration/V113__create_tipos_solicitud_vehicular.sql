-- ============================================================================
-- Migración: V113__create_tipos_solicitud_vehicular.sql
-- Descripción: Crear tabla de tipos de solicitud vehicular.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gestion_vehicular;

CREATE TABLE gestion_vehicular.tipos_solicitud_vehicular (
    id                  UUID          PRIMARY KEY,
    codigo              VARCHAR(50)   NOT NULL,
    nombre              VARCHAR(150)  NOT NULL,
    descripcion         VARCHAR(500),
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT uk_tipo_solicitud_vehicular_codigo UNIQUE (codigo)
);

CREATE INDEX idx_tipo_solicitud_vehicular_codigo
    ON gestion_vehicular.tipos_solicitud_vehicular (codigo);
