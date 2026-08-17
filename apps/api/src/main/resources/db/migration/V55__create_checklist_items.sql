CREATE TABLE mantenimientos.checklist_items (
    id                            UUID PRIMARY KEY,
    checklist_mantenimiento_id    UUID          NOT NULL,
    codigo                        VARCHAR(50)   NOT NULL,
    nombre                        VARCHAR(200)  NOT NULL,
    descripcion                   VARCHAR(500),
    tipo_dato_id                  UUID          NOT NULL,
    orden                         INTEGER       NOT NULL,
    obligatorio                   BOOLEAN       NOT NULL DEFAULT FALSE,
    opciones                      JSONB,
    created_at                    TIMESTAMPTZ   NOT NULL,
    updated_at                    TIMESTAMPTZ,
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),
    CONSTRAINT uk_checklist_item_codigo
        UNIQUE (checklist_mantenimiento_id, codigo),
    CONSTRAINT fk_checklist_item_checklist
        FOREIGN KEY (checklist_mantenimiento_id)
        REFERENCES mantenimientos.checklists_mantenimiento (id),
    CONSTRAINT fk_checklist_item_tipo_dato
        FOREIGN KEY (tipo_dato_id)
        REFERENCES parametros.tipos_dato (id)
);

CREATE INDEX idx_checklist_item_checklist
    ON mantenimientos.checklist_items
    (checklist_mantenimiento_id);
