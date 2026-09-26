-- ============================================================================
-- Migración: V118__create_solicitud_vehicular_adjuntos.sql
-- Descripción: Crear tabla de adjuntos para solicitudes vehiculares.
-- ============================================================================

CREATE TABLE IF NOT EXISTS gestion_vehicular.solicitud_vehicular_adjuntos (
    id                      UUID          PRIMARY KEY,
    solicitud_vehicular_id  UUID          NOT NULL,
    nombre_archivo          VARCHAR(255)  NOT NULL,
    nombre_original         VARCHAR(255)  NOT NULL,
    url                     VARCHAR(1000) NOT NULL,
    mime_type               VARCHAR(100)  NOT NULL,
    size                    BIGINT        NOT NULL,
    descripcion             VARCHAR(500),
    created_at              TIMESTAMPTZ   NOT NULL,
    updated_at              TIMESTAMPTZ,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    created_by_id           UUID,
    updated_by_id           UUID,
    CONSTRAINT fk_solicitud_vehicular_adjunto_solicitud
        FOREIGN KEY (solicitud_vehicular_id)
        REFERENCES gestion_vehicular.solicitudes_vehiculares (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_solicitud_vehicular_adjunto_solicitud
    ON gestion_vehicular.solicitud_vehicular_adjuntos (solicitud_vehicular_id);
