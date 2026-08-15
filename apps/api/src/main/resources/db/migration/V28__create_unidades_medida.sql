CREATE TABLE parametros.unidades_medida (
    id               UUID PRIMARY KEY,
    codigo           VARCHAR(50)   NOT NULL,
    nombre           VARCHAR(100)  NOT NULL,
    simbolo          VARCHAR(20)   NOT NULL,
    permite_decimal  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ   NOT NULL,
    updated_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100)
);

CREATE UNIQUE INDEX uk_unidades_medida_codigo_ci
    ON parametros.unidades_medida (LOWER(codigo));
