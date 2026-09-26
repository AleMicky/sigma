-- ============================================================================
-- Migración: V119__create_asignaciones_vehiculares.sql
-- Descripción: Crear tabla de asignaciones vehiculares.
-- ============================================================================

CREATE TABLE IF NOT EXISTS gestion_vehicular.asignaciones_vehiculares (
    id                      UUID          PRIMARY KEY,
    solicitud_vehicular_id  UUID          NOT NULL,
    activo_id               UUID          NOT NULL,
    conductor_id            UUID          NOT NULL,
    asignado_por_id         UUID          NOT NULL,
    fecha_asignacion        TIMESTAMPTZ   NOT NULL,
    observacion             VARCHAR(1000),
    created_at              TIMESTAMPTZ   NOT NULL,
    updated_at              TIMESTAMPTZ,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    created_by_id           UUID,
    updated_by_id           UUID,
    CONSTRAINT fk_asignacion_vehicular_solicitud
        FOREIGN KEY (solicitud_vehicular_id)
        REFERENCES gestion_vehicular.solicitudes_vehiculares (id),
    CONSTRAINT fk_asignacion_vehicular_conductor
        FOREIGN KEY (conductor_id)
        REFERENCES gestion_vehicular.conductores (id)
);

CREATE INDEX IF NOT EXISTS idx_asignacion_vehicular_solicitud
    ON gestion_vehicular.asignaciones_vehiculares (solicitud_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_asignacion_vehicular_activo
    ON gestion_vehicular.asignaciones_vehiculares (activo_id);

CREATE INDEX IF NOT EXISTS idx_asignacion_vehicular_conductor
    ON gestion_vehicular.asignaciones_vehiculares (conductor_id);

CREATE INDEX IF NOT EXISTS idx_asignacion_vehicular_asignado_por
    ON gestion_vehicular.asignaciones_vehiculares (asignado_por_id);
