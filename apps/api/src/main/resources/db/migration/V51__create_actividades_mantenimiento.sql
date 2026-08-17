CREATE TABLE mantenimientos.actividades_mantenimiento (
    id                        UUID PRIMARY KEY,
    codigo                    VARCHAR(50)   NOT NULL,
    nombre                    VARCHAR(150)  NOT NULL,
    descripcion               VARCHAR(500),
    aplica_todos_tipos_activo BOOLEAN       NOT NULL DEFAULT FALSE,
    requiere_checklist        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at                TIMESTAMPTZ   NOT NULL,
    updated_at                TIMESTAMPTZ,
    created_by                VARCHAR(100),
    updated_by                VARCHAR(100),
    CONSTRAINT uk_actividad_mantenimiento_codigo UNIQUE (codigo)
);
