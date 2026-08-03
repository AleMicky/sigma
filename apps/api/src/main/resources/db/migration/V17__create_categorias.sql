CREATE TABLE activos.categorias (
    id          UUID PRIMARY KEY,
    codigo      VARCHAR(50)   NOT NULL,
    nombre      VARCHAR(100)  NOT NULL,
    descripcion VARCHAR(255),
    orden       INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL,
    updated_at  TIMESTAMPTZ,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE UNIQUE INDEX uk_categorias_codigo_ci
    ON activos.categorias (LOWER(codigo));
