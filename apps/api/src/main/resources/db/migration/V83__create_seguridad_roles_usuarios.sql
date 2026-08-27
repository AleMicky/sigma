CREATE SCHEMA IF NOT EXISTS seguridad;

-- =========================================================
-- ROLES
-- =========================================================

CREATE TABLE seguridad.roles
(
    id UUID PRIMARY KEY,
    keycloak_role_id VARCHAR(100),
    codigo VARCHAR(100) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(300),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL,
    updated_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100),

    CONSTRAINT uk_roles_codigo
        UNIQUE (codigo),

    CONSTRAINT uk_roles_keycloak_role_id
        UNIQUE (keycloak_role_id)
);

CREATE INDEX idx_roles_activo
    ON seguridad.roles (activo);


-- =========================================================
-- USUARIOS
-- =========================================================

CREATE TABLE seguridad.usuarios
(
    id UUID PRIMARY KEY,
    keycloak_user_id VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    nombre VARCHAR(200),
    email VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL,
    updated_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100),

    CONSTRAINT uk_usuarios_keycloak_user_id
        UNIQUE (keycloak_user_id),

    CONSTRAINT uk_usuarios_username
        UNIQUE (username)
);

CREATE INDEX idx_usuarios_activo
    ON seguridad.usuarios (activo);

CREATE INDEX idx_usuarios_email
    ON seguridad.usuarios (email);