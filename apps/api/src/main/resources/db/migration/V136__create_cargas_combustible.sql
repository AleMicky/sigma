-- ============================================================================
-- Migración: V136__create_cargas_combustible.sql
-- Descripción: Crear tabla de cargas de combustible para gestión vehicular.
-- ============================================================================

CREATE TABLE IF NOT EXISTS gestion_vehicular.cargas_combustible (
    id                    UUID            PRIMARY KEY,
    activo_id             UUID            NOT NULL,
    viaje_vehicular_id    UUID,
    insumo_id             UUID            NOT NULL,
    fecha_carga           TIMESTAMPTZ     NOT NULL,
    litros                NUMERIC(12, 3)  NOT NULL,
    precio_total          NUMERIC(14, 2)  NOT NULL,
    numero_factura        VARCHAR(100),
    empleado_id           UUID            NOT NULL,
    created_at            TIMESTAMPTZ     NOT NULL,
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    created_by_id         UUID,
    updated_by_id         UUID,
    CONSTRAINT fk_carga_combustible_activo
        FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_carga_combustible_viaje
        FOREIGN KEY (viaje_vehicular_id)
        REFERENCES gestion_vehicular.viajes_vehiculares (id) ON DELETE SET NULL,
    CONSTRAINT fk_carga_combustible_insumo
        FOREIGN KEY (insumo_id)
        REFERENCES inventarios.insumos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_carga_combustible_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES organizacion.empleados (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_carga_combustible_activo
    ON gestion_vehicular.cargas_combustible (activo_id);

CREATE INDEX IF NOT EXISTS idx_carga_combustible_viaje
    ON gestion_vehicular.cargas_combustible (viaje_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_carga_combustible_fecha
    ON gestion_vehicular.cargas_combustible (fecha_carga);

CREATE INDEX IF NOT EXISTS idx_carga_combustible_empleado
    ON gestion_vehicular.cargas_combustible (empleado_id);
