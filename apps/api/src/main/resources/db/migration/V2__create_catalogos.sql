CREATE SCHEMA IF NOT EXISTS parametros;

CREATE TABLE parametros.catalogos (
    id          UUID PRIMARY KEY,
    codigo      VARCHAR(50)   NOT NULL,
    nombre      VARCHAR(100)  NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL,
    updated_at  TIMESTAMPTZ,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE UNIQUE INDEX uk_catalogos_codigo_ci
    ON parametros.catalogos (LOWER(codigo));
