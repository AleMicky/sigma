CREATE TABLE IF NOT EXISTS mantenimientos.plan_mantenimiento_activos (
    id                    UUID PRIMARY KEY,
    plan_mantenimiento_id UUID        NOT NULL,
    activo_id             UUID        NOT NULL,
    responsable_id        UUID,
    fecha_inicio          DATE        NOT NULL,
    fecha_fin             DATE,
    activo                BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL,
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    created_by_id         UUID,
    updated_by_id         UUID,
    CONSTRAINT fk_plan_mantenimiento_activo_plan FOREIGN KEY (plan_mantenimiento_id)
        REFERENCES mantenimientos.planes_mantenimiento (id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_mantenimiento_activo_activo FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_plan_mantenimiento_activo_responsable FOREIGN KEY (responsable_id)
        REFERENCES organizacion.empleados (id) ON DELETE SET NULL,
    CONSTRAINT chk_plan_activo_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_plan_mantenimiento_activo_plan
    ON mantenimientos.plan_mantenimiento_activos (plan_mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_plan_mantenimiento_activo_activo
    ON mantenimientos.plan_mantenimiento_activos (activo_id);

CREATE INDEX IF NOT EXISTS idx_plan_mantenimiento_activo_responsable
    ON mantenimientos.plan_mantenimiento_activos (responsable_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_plan_activo_asignacion_activa
    ON mantenimientos.plan_mantenimiento_activos (plan_mantenimiento_id, activo_id)
    WHERE activo = TRUE;
