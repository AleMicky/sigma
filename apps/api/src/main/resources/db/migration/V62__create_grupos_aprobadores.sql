CREATE TABLE organizacion.grupos_aprobadores (
    id              UUID PRIMARY KEY,
    codigo          VARCHAR(30)  NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(250),
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE UNIQUE INDEX uk_grupos_aprobadores_codigo_ci
    ON organizacion.grupos_aprobadores (LOWER(codigo));
