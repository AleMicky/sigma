-- Drop old checklist items and checklists tables
DROP TABLE IF EXISTS mantenimientos.checklist_items CASCADE;
DROP TABLE IF EXISTS mantenimientos.checklists_mantenimiento CASCADE;

-- Drop legacy columns from actividades_mantenimiento if they exist
ALTER TABLE mantenimientos.actividades_mantenimiento
    DROP COLUMN IF EXISTS requiere_checklist;

ALTER TABLE mantenimientos.actividades_mantenimiento
    DROP COLUMN IF EXISTS aplica_todos_tipos_activo;

-- Remove standalone checklist menu entries
DELETE FROM seguridad.roles_menus WHERE menu_id = 'e0000000-0000-4000-a000-000000000066';
DELETE FROM seguridad.menus WHERE codigo = 'MENU_MANT_CHECKLISTS' OR id = 'e0000000-0000-4000-a000-000000000066';

-- Create new checklist items table linked directly to actividad_mantenimiento_aplicaciones
CREATE TABLE mantenimientos.checklist_items (
    id                                      UUID PRIMARY KEY,
    actividad_mantenimiento_aplicacion_id  UUID NOT NULL,
    nombre                                  VARCHAR(200) NOT NULL,
    descripcion                             VARCHAR(500),
    orden                                   INTEGER NOT NULL DEFAULT 0,
    created_at                              TIMESTAMPTZ NOT NULL,
    updated_at                              TIMESTAMPTZ,
    created_by                              VARCHAR(100),
    updated_by                              VARCHAR(100),
    created_by_id                           UUID,
    updated_by_id                           UUID,
    CONSTRAINT fk_checklist_item_aplicacion
        FOREIGN KEY (actividad_mantenimiento_aplicacion_id)
        REFERENCES mantenimientos.actividad_mantenimiento_aplicaciones (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_checklist_items_aplicacion
    ON mantenimientos.checklist_items (actividad_mantenimiento_aplicacion_id);
