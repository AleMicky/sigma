CREATE TABLE parametros.tipos_dato (
    id                UUID PRIMARY KEY,
    codigo            VARCHAR(50)   NOT NULL,
    nombre            VARCHAR(100)  NOT NULL,
    descripcion       VARCHAR(255),
    permite_opciones  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ   NOT NULL,
    updated_at        TIMESTAMPTZ,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100)
);

CREATE UNIQUE INDEX uk_tipos_dato_codigo_ci
    ON parametros.tipos_dato (LOWER(codigo));
