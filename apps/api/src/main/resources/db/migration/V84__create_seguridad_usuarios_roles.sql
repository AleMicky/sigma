-- =========================================================
-- USUARIOS_ROLES (Mapeo de Roles asignados a Usuarios)
-- =========================================================

CREATE TABLE seguridad.usuarios_roles
(
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    rol_id UUID NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    CONSTRAINT uk_usuarios_roles_usuario_rol
        UNIQUE (usuario_id, rol_id),

    CONSTRAINT fk_usuarios_roles_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES seguridad.usuarios (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuarios_roles_rol
        FOREIGN KEY (rol_id)
        REFERENCES seguridad.roles (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_usuarios_roles_usuario
    ON seguridad.usuarios_roles (usuario_id);

CREATE INDEX idx_usuarios_roles_rol
    ON seguridad.usuarios_roles (rol_id);

CREATE INDEX idx_usuarios_roles_activo
    ON seguridad.usuarios_roles (activo);
