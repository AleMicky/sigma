-- ============================================================================
-- Migración: V129__create_flotas_vehiculares_and_relaciones.sql
-- Descripción: Crear tablas para flotas vehiculares, asignación de vehículos y responsables de flota.
-- ============================================================================

CREATE TABLE IF NOT EXISTS gestion_vehicular.flotas_vehiculares (
    id                       UUID          PRIMARY KEY,
    codigo                   VARCHAR(50)   NOT NULL,
    nombre                   VARCHAR(150)  NOT NULL,
    descripcion              VARCHAR(500),
    activo                   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ   NOT NULL,
    updated_at               TIMESTAMPTZ,
    created_by               VARCHAR(100),
    updated_by               VARCHAR(100),
    created_by_id            UUID,
    updated_by_id            UUID,
    CONSTRAINT uk_flota_vehicular_codigo
        UNIQUE (codigo)
);

CREATE INDEX IF NOT EXISTS idx_flota_vehicular_activo
    ON gestion_vehicular.flotas_vehiculares (activo);

CREATE TABLE IF NOT EXISTS gestion_vehicular.flota_vehiculos (
    id                       UUID          PRIMARY KEY,
    flota_vehicular_id       UUID          NOT NULL,
    activo_id                UUID          NOT NULL,
    activo                   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ   NOT NULL,
    updated_at               TIMESTAMPTZ,
    created_by               VARCHAR(100),
    updated_by               VARCHAR(100),
    created_by_id            UUID,
    updated_by_id            UUID,
    CONSTRAINT uk_flota_vehiculo
        UNIQUE (flota_vehicular_id, activo_id),
    CONSTRAINT fk_flota_vehiculo_flota
        FOREIGN KEY (flota_vehicular_id)
        REFERENCES gestion_vehicular.flotas_vehiculares (id) ON DELETE CASCADE,
    CONSTRAINT fk_flota_vehiculo_activo
        FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_flota_vehiculo_flota
    ON gestion_vehicular.flota_vehiculos (flota_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_flota_vehiculo_activo_id
    ON gestion_vehicular.flota_vehiculos (activo_id);

CREATE INDEX IF NOT EXISTS idx_flota_vehiculo_activo
    ON gestion_vehicular.flota_vehiculos (activo);

CREATE TABLE IF NOT EXISTS gestion_vehicular.responsables_flota (
    id                       UUID          PRIMARY KEY,
    flota_vehicular_id       UUID          NOT NULL,
    empleado_id              UUID          NOT NULL,
    principal                BOOLEAN       NOT NULL DEFAULT FALSE,
    activo                   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ   NOT NULL,
    updated_at               TIMESTAMPTZ,
    created_by               VARCHAR(100),
    updated_by               VARCHAR(100),
    created_by_id            UUID,
    updated_by_id            UUID,
    CONSTRAINT uk_responsable_flota
        UNIQUE (flota_vehicular_id, empleado_id),
    CONSTRAINT fk_responsable_flota_flota
        FOREIGN KEY (flota_vehicular_id)
        REFERENCES gestion_vehicular.flotas_vehiculares (id) ON DELETE CASCADE,
    CONSTRAINT fk_responsable_flota_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES organizacion.empleados (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_responsable_flota_flota
    ON gestion_vehicular.responsables_flota (flota_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_responsable_flota_empleado
    ON gestion_vehicular.responsables_flota (empleado_id);

CREATE INDEX IF NOT EXISTS idx_responsable_flota_activo
    ON gestion_vehicular.responsables_flota (activo);
