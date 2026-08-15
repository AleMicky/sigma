CREATE TABLE inventarios.tipos_insumo (
    id           UUID PRIMARY KEY,
    codigo       VARCHAR(30)   NOT NULL,
    nombre       VARCHAR(100)  NOT NULL,
    descripcion  VARCHAR(300),
    created_at   TIMESTAMPTZ   NOT NULL,
    updated_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100)
);

CREATE UNIQUE INDEX uk_tipos_insumo_codigo_ci
    ON inventarios.tipos_insumo (LOWER(codigo));
