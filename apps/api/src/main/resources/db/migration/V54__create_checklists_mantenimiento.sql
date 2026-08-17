CREATE TABLE mantenimientos.checklists_mantenimiento (
    id                            UUID PRIMARY KEY,
    actividad_mantenimiento_id    UUID          NOT NULL,
    codigo                        VARCHAR(50)   NOT NULL,
    nombre                        VARCHAR(150)  NOT NULL,
    descripcion                   VARCHAR(500),
    created_at                    TIMESTAMPTZ   NOT NULL,
    updated_at                    TIMESTAMPTZ,
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),
    CONSTRAINT uk_checklist_mantenimiento_codigo UNIQUE (codigo),
    CONSTRAINT fk_checklist_actividad
        FOREIGN KEY (actividad_mantenimiento_id)
        REFERENCES mantenimientos.actividades_mantenimiento (id)
);

CREATE INDEX idx_checklist_actividad
    ON mantenimientos.checklists_mantenimiento
    (actividad_mantenimiento_id);
