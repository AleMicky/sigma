CREATE TABLE mantenimientos.orden_trabajo (
    id                          UUID          PRIMARY KEY,
    numero                      VARCHAR(30)   NOT NULL,
    solicitud_mantenimiento_id  UUID          NOT NULL,
    activo_id                   UUID          NOT NULL,
    responsable_id              UUID          NOT NULL,
    fecha_inicio                TIMESTAMPTZ,
    fecha_fin                   TIMESTAMPTZ,
    diagnostico                 VARCHAR(2000),
    trabajo_realizado           VARCHAR(4000),
    observacion                 VARCHAR(2000),
    created_at                  TIMESTAMPTZ   NOT NULL,
    updated_at                  TIMESTAMPTZ,
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    CONSTRAINT uk_ot_numero     UNIQUE (numero),
    CONSTRAINT uk_ot_solicitud  UNIQUE (solicitud_mantenimiento_id)
);

CREATE INDEX idx_ot_solicitud
    ON mantenimientos.orden_trabajo (solicitud_mantenimiento_id);

CREATE INDEX idx_ot_activo
    ON mantenimientos.orden_trabajo (activo_id);

CREATE INDEX idx_ot_responsable
    ON mantenimientos.orden_trabajo (responsable_id);
