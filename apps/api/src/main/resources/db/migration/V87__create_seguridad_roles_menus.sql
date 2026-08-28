-- =========================================================
-- ROLES_MENUS (Mapeo de Menús asignados a Roles)
-- =========================================================

CREATE TABLE seguridad.roles_menus
(
    id UUID PRIMARY KEY,
    rol_id UUID NOT NULL,
    menu_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    CONSTRAINT uk_roles_menus_rol_menu
        UNIQUE (rol_id, menu_id),

    CONSTRAINT fk_roles_menus_rol
        FOREIGN KEY (rol_id)
        REFERENCES seguridad.roles (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_roles_menus_menu
        FOREIGN KEY (menu_id)
        REFERENCES seguridad.menus (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_roles_menus_rol
    ON seguridad.roles_menus (rol_id);

CREATE INDEX idx_roles_menus_menu
    ON seguridad.roles_menus (menu_id);
