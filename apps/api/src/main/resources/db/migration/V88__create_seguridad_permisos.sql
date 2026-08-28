-- =========================================================
-- PERMISOS (Permisos HTTP por Menú)
-- =========================================================

CREATE TABLE seguridad.permisos
(
    id UUID PRIMARY KEY,
    menu_id UUID NOT NULL,
    codigo VARCHAR(200) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(500),
    metodo_http VARCHAR(10) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    CONSTRAINT uk_permisos_codigo
        UNIQUE (codigo),

    CONSTRAINT fk_permisos_menu
        FOREIGN KEY (menu_id)
        REFERENCES seguridad.menus (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_permisos_menu
    ON seguridad.permisos (menu_id);

CREATE INDEX idx_permisos_activo
    ON seguridad.permisos (activo);
