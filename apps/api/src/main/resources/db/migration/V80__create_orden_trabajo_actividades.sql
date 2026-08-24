CREATE TABLE mantenimientos.orden_trabajo_actividades (
    id                        UUID          PRIMARY KEY,
    orden_trabajo_id          UUID          NOT NULL,
    actividad_mantenimiento_id UUID,
    descripcion               VARCHAR(1000) NOT NULL,
    realizado                 BOOLEAN       NOT NULL,
    observacion               VARCHAR(1500),
    fecha_realizacion         TIMESTAMPTZ,
    created_at                TIMESTAMPTZ   NOT NULL,
    updated_at                TIMESTAMPTZ,
    created_by                VARCHAR(100),
    updated_by                VARCHAR(100)
);

CREATE INDEX idx_ot_actividad_orden
    ON mantenimientos.orden_trabajo_actividades (orden_trabajo_id);

CREATE INDEX idx_ot_actividad_catalogo
    ON mantenimientos.orden_trabajo_actividades (actividad_mantenimiento_id);
