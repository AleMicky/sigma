CREATE TABLE activos.activos (
    id                UUID PRIMARY KEY,
    codigo            VARCHAR(50)   NOT NULL,
    nombre            VARCHAR(100)  NOT NULL,
    descripcion       VARCHAR(255),
    tipo_activo_id    UUID          NOT NULL,
    ubicacion         VARCHAR(255),
    fecha_adquisicion DATE,
    url_imagen        VARCHAR(500),
    created_at        TIMESTAMPTZ   NOT NULL,
    updated_at        TIMESTAMPTZ,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100),
    CONSTRAINT fk_activos_tipo_activo
        FOREIGN KEY (tipo_activo_id)
        REFERENCES activos.tipos_activo (id)
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uk_activos_codigo_ci
    ON activos.activos (LOWER(codigo));

CREATE INDEX idx_activos_tipo_activo_id
    ON activos.activos (tipo_activo_id);

ALTER TABLE activos.activo_atributos
    ADD COLUMN url_imagen VARCHAR(500);
