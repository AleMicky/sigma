CREATE SCHEMA IF NOT EXISTS mantenimientos;

CREATE TABLE mantenimientos.prioridades (
    id           UUID PRIMARY KEY,
    codigo       VARCHAR(30)   NOT NULL,
    nombre       VARCHAR(100)  NOT NULL,
    descripcion  VARCHAR(300),
    nivel        INTEGER       NOT NULL,
    created_at   TIMESTAMPTZ   NOT NULL,
    updated_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100)
);

CREATE UNIQUE INDEX uk_prioridades_codigo_ci
    ON mantenimientos.prioridades (LOWER(codigo));