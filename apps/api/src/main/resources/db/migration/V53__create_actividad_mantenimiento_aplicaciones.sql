CREATE TABLE mantenimientos.actividad_mantenimiento_aplicaciones (
    id                            UUID PRIMARY KEY,
    actividad_mantenimiento_id    UUID NOT NULL,
    tipo_activo_id                UUID NOT NULL,
    componente_id                 UUID,
    created_at                    TIMESTAMPTZ NOT NULL,
    updated_at                    TIMESTAMPTZ,
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),
    CONSTRAINT uk_actividad_aplicacion
        UNIQUE (actividad_mantenimiento_id, tipo_activo_id, componente_id),
    CONSTRAINT fk_actividad_aplicacion_actividad
        FOREIGN KEY (actividad_mantenimiento_id)
        REFERENCES mantenimientos.actividades_mantenimiento (id),
    CONSTRAINT fk_actividad_aplicacion_tipo_activo
        FOREIGN KEY (tipo_activo_id)
        REFERENCES activos.tipos_activo (id),
    CONSTRAINT fk_actividad_aplicacion_componente
        FOREIGN KEY (componente_id)
        REFERENCES activos.componentes (id)
);

CREATE INDEX idx_actividad_aplicacion_actividad
    ON mantenimientos.actividad_mantenimiento_aplicaciones
    (actividad_mantenimiento_id);

CREATE INDEX idx_actividad_aplicacion_tipo_activo
    ON mantenimientos.actividad_mantenimiento_aplicaciones
    (tipo_activo_id);

CREATE INDEX idx_actividad_aplicacion_componente
    ON mantenimientos.actividad_mantenimiento_aplicaciones
    (componente_id);
