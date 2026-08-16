CREATE TABLE activos.activo_asignaciones (
    id                     UUID PRIMARY KEY,
    activo_id              UUID NOT NULL,
    empleado_id            UUID,
    area_id                UUID,
    fecha_asignacion       TIMESTAMP NOT NULL,
    fecha_devolucion       TIMESTAMP,
    observacion_asignacion VARCHAR(500),
    observacion_devolucion VARCHAR(500),
    created_at             TIMESTAMPTZ NOT NULL,
    updated_at             TIMESTAMPTZ,
    created_by             VARCHAR(100),
    updated_by             VARCHAR(100)
);

CREATE INDEX idx_activo_asignacion_activo
    ON activos.activo_asignaciones (activo_id);

CREATE INDEX idx_activo_asignacion_empleado
    ON activos.activo_asignaciones (empleado_id);

CREATE INDEX idx_activo_asignacion_area
    ON activos.activo_asignaciones (area_id);

CREATE INDEX idx_activo_asignacion_fecha
    ON activos.activo_asignaciones (fecha_asignacion);

ALTER TABLE activos.activo_asignaciones
    ADD CONSTRAINT fk_activo_asignacion_activo
    FOREIGN KEY (activo_id) REFERENCES activos.activos (id);
