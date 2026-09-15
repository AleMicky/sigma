CREATE TABLE IF NOT EXISTS mantenimientos.solicitudes_mantenimiento_trazabilidad
(
    id                            UUID PRIMARY KEY,
    solicitud_mantenimiento_id    UUID         NOT NULL,
    estado_anterior               VARCHAR(50),
    estado_nuevo                  VARCHAR(50)  NOT NULL,
    comentario                    VARCHAR(2000),
    empleado_id                   UUID         NOT NULL,
    fecha                         TIMESTAMP    NOT NULL,

    CONSTRAINT fk_trazabilidad_solicitud_mantenimiento
        FOREIGN KEY (solicitud_mantenimiento_id)
        REFERENCES mantenimientos.solicitudes_mantenimiento (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trazabilidad_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES organizacion.empleados (id)
);

CREATE INDEX IF NOT EXISTS idx_solicitud_trazabilidad_solicitud
    ON mantenimientos.solicitudes_mantenimiento_trazabilidad (solicitud_mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_solicitud_trazabilidad_fecha
    ON mantenimientos.solicitudes_mantenimiento_trazabilidad (fecha);

CREATE INDEX IF NOT EXISTS idx_solicitud_trazabilidad_empleado
    ON mantenimientos.solicitudes_mantenimiento_trazabilidad (empleado_id);
