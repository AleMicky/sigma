-- ============================================================================
-- Migración: V126__create_viajes_vehiculares.sql
-- Descripción: Crear tabla de viajes vehiculares (registro y control de viajes asignados a conductores).
-- ============================================================================

CREATE TABLE IF NOT EXISTS gestion_vehicular.viajes_vehiculares (
    id                          UUID          PRIMARY KEY,
    asignacion_vehicular_id     UUID          NOT NULL,
    fecha_salida_real           TIMESTAMPTZ,
    kilometraje_salida          BIGINT,
    nivel_combustible_salida    INTEGER,
    fecha_retorno_real          TIMESTAMPTZ,
    kilometraje_retorno         BIGINT,
    nivel_combustible_retorno   INTEGER,
    estado                      VARCHAR(30)   NOT NULL DEFAULT 'PROGRAMADO',
    observacion                 VARCHAR(1000),
    created_at                  TIMESTAMPTZ   NOT NULL,
    updated_at                  TIMESTAMPTZ,
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    created_by_id               UUID,
    updated_by_id               UUID,
    CONSTRAINT uk_viaje_vehicular_asignacion
        UNIQUE (asignacion_vehicular_id),
    CONSTRAINT fk_viaje_vehicular_asignacion
        FOREIGN KEY (asignacion_vehicular_id)
        REFERENCES gestion_vehicular.asignaciones_vehiculares (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_viaje_vehicular_asignacion
    ON gestion_vehicular.viajes_vehiculares (asignacion_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_viaje_vehicular_estado
    ON gestion_vehicular.viajes_vehiculares (estado);
