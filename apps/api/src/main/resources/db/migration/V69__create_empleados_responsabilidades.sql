CREATE TABLE organizacion.empleados_responsabilidades (
    id                  UUID PRIMARY KEY,
    empleado_id         UUID          NOT NULL,
    responsabilidad_id  UUID          NOT NULL,
    fecha_inicio        DATE          NOT NULL,
    fecha_fin           DATE,
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    CONSTRAINT fk_empleados_responsabilidades_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES organizacion.empleados (id),
    CONSTRAINT fk_empleados_responsabilidades_responsabilidad
        FOREIGN KEY (responsabilidad_id)
        REFERENCES organizacion.responsabilidades (id)
);

CREATE INDEX idx_empleado_responsabilidad_empleado
    ON organizacion.empleados_responsabilidades (empleado_id);

CREATE INDEX idx_empleado_responsabilidad_responsabilidad
    ON organizacion.empleados_responsabilidades (responsabilidad_id);
