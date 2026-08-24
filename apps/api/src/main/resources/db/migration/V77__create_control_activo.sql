CREATE TABLE mantenimientos.control_activo (
    id                        UUID          PRIMARY KEY,
    solicitud_mantenimiento_id UUID        NOT NULL,
    orden_trabajo_id          UUID,
    activo_id                 UUID          NOT NULL,
    tipo                      VARCHAR(20)   NOT NULL,
    entregado_por_id          UUID,
    recibido_por_id           UUID,
    fecha                     TIMESTAMPTZ   NOT NULL,
    conforme                  BOOLEAN       NOT NULL,
    observacion               VARCHAR(500),
    created_at                TIMESTAMPTZ   NOT NULL,
    updated_at                TIMESTAMPTZ,
    created_by                VARCHAR(100),
    updated_by                VARCHAR(100)
);

CREATE INDEX idx_control_activo_solicitud
    ON mantenimientos.control_activo (solicitud_mantenimiento_id);

CREATE INDEX idx_control_activo_ot
    ON mantenimientos.control_activo (orden_trabajo_id);

CREATE INDEX idx_control_activo_activo
    ON mantenimientos.control_activo (activo_id);
