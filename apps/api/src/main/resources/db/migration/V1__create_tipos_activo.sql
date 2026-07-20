CREATE SCHEMA IF NOT EXISTS activos;

CREATE TABLE activos.tipos_activo (
    id          UUID PRIMARY KEY,
    nombre      VARCHAR(100)  NOT NULL,
    descripcion VARCHAR(255),
    activo      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL,
    updated_at  TIMESTAMPTZ,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE UNIQUE INDEX uk_tipos_activo_nombre_ci
    ON activos.tipos_activo (LOWER(nombre));
