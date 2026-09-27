-- ============================================================================
-- Migración: V125__create_control_activo_gestion_vehicular.sql
-- Descripción: Crear tablas de control de activo (entrega y devolución) y sus detalles para gestión vehicular.
-- ============================================================================

CREATE TABLE IF NOT EXISTS gestion_vehicular.control_activo (
    id                        UUID          PRIMARY KEY,
    solicitud_vehicular_id    UUID,
    asignacion_vehicular_id   UUID,
    activo_id                 UUID          NOT NULL,
    tipo                      VARCHAR(20)   NOT NULL,
    recibido_por_id           UUID,
    fecha                     TIMESTAMPTZ   NOT NULL,
    conforme                  BOOLEAN       NOT NULL,
    observacion               VARCHAR(500),
    created_at                TIMESTAMPTZ   NOT NULL,
    updated_at                TIMESTAMPTZ,
    created_by                VARCHAR(100),
    updated_by                VARCHAR(100),
    created_by_id             UUID,
    updated_by_id             UUID,
    CONSTRAINT fk_control_activo_gv_solicitud
        FOREIGN KEY (solicitud_vehicular_id)
        REFERENCES gestion_vehicular.solicitudes_vehiculares (id) ON DELETE SET NULL,
    CONSTRAINT fk_control_activo_gv_asignacion
        FOREIGN KEY (asignacion_vehicular_id)
        REFERENCES gestion_vehicular.asignaciones_vehiculares (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_control_activo_gv_solicitud
    ON gestion_vehicular.control_activo (solicitud_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_control_activo_gv_asignacion
    ON gestion_vehicular.control_activo (asignacion_vehicular_id);

CREATE INDEX IF NOT EXISTS idx_control_activo_gv_activo
    ON gestion_vehicular.control_activo (activo_id);

CREATE TABLE IF NOT EXISTS gestion_vehicular.control_activo_detalle (
    id                   UUID          PRIMARY KEY,
    control_activo_id    UUID          NOT NULL,
    accesorio_id         UUID          NOT NULL,
    cantidad_esperada    INTEGER       NOT NULL,
    cantidad_encontrada  INTEGER       NOT NULL,
    conforme             BOOLEAN       NOT NULL,
    observacion          VARCHAR(300),
    created_at           TIMESTAMPTZ   NOT NULL,
    updated_at           TIMESTAMPTZ,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    created_by_id        UUID,
    updated_by_id        UUID,
    CONSTRAINT fk_control_activo_detalle_gv_control
        FOREIGN KEY (control_activo_id)
        REFERENCES gestion_vehicular.control_activo (id) ON DELETE CASCADE,
    CONSTRAINT uk_control_activo_gv_accesorio
        UNIQUE (control_activo_id, accesorio_id)
);

CREATE INDEX IF NOT EXISTS idx_control_activo_detalle_gv_control
    ON gestion_vehicular.control_activo_detalle (control_activo_id);

CREATE INDEX IF NOT EXISTS idx_control_activo_detalle_gv_accesorio
    ON gestion_vehicular.control_activo_detalle (accesorio_id);
