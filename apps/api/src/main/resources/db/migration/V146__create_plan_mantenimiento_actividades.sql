CREATE TABLE IF NOT EXISTS mantenimientos.plan_mantenimiento_actividades (
    id                                    UUID PRIMARY KEY,
    plan_mantenimiento_id                 UUID         NOT NULL,
    actividad_mantenimiento_aplicacion_id UUID         NOT NULL,
    orden                                 INTEGER      NOT NULL DEFAULT 0,
    obligatorio                           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at                            TIMESTAMPTZ  NOT NULL,
    updated_at                            TIMESTAMPTZ,
    created_by                            VARCHAR(100),
    updated_by                            VARCHAR(100),
    created_by_id                         UUID,
    updated_by_id                         UUID,
    CONSTRAINT uk_plan_mantenimiento_actividad UNIQUE (plan_mantenimiento_id, actividad_mantenimiento_aplicacion_id),
    CONSTRAINT fk_plan_actividad_plan FOREIGN KEY (plan_mantenimiento_id)
        REFERENCES mantenimientos.planes_mantenimiento (id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_actividad_aplicacion FOREIGN KEY (actividad_mantenimiento_aplicacion_id)
        REFERENCES mantenimientos.actividad_mantenimiento_aplicaciones (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_plan_actividad_plan
    ON mantenimientos.plan_mantenimiento_actividades (plan_mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_plan_actividad_aplicacion
    ON mantenimientos.plan_mantenimiento_actividades (actividad_mantenimiento_aplicacion_id);
