-- =========================================================
-- MENUS
-- =========================================================

CREATE TABLE seguridad.menus
(
    id UUID PRIMARY KEY,
    menu_padre_id UUID,
    codigo VARCHAR(100) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    icono VARCHAR(100),
    ruta VARCHAR(300),
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    CONSTRAINT uk_menus_codigo
        UNIQUE (codigo),

    CONSTRAINT fk_menus_menu_padre
        FOREIGN KEY (menu_padre_id)
        REFERENCES seguridad.menus (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_menus_menu_padre_id
    ON seguridad.menus (menu_padre_id);

CREATE INDEX idx_menus_activo
    ON seguridad.menus (activo);
