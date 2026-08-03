CREATE TABLE activos.tipos_documento (
    id                   UUID PRIMARY KEY,
    codigo               VARCHAR(50)  NOT NULL,
    nombre               VARCHAR(100) NOT NULL,
    descripcion          VARCHAR(255),
    requiere_vencimiento BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ  NOT NULL,
    updated_at           TIMESTAMPTZ,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE UNIQUE INDEX uk_tipos_documento_codigo_ci
    ON activos.tipos_documento (LOWER(codigo));