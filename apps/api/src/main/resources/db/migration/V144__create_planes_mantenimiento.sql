CREATE TABLE IF NOT EXISTS mantenimientos.planes_mantenimiento (
    id             UUID PRIMARY KEY,
    tipo_activo_id UUID         NOT NULL,
    codigo         VARCHAR(30)  NOT NULL,
    nombre         VARCHAR(200) NOT NULL,
    descripcion    TEXT,
    created_at     TIMESTAMPTZ  NOT NULL,
    updated_at     TIMESTAMPTZ,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    created_by_id  UUID,
    updated_by_id  UUID,
    CONSTRAINT uk_plan_mantenimiento_codigo UNIQUE (codigo),
    CONSTRAINT fk_plan_mantenimiento_tipo_activo FOREIGN KEY (tipo_activo_id)
        REFERENCES activos.tipos_activo (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_plan_mantenimiento_tipo_activo
    ON mantenimientos.planes_mantenimiento (tipo_activo_id);
