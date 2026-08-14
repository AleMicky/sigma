CREATE TABLE parametros.ubicaciones (
    id                  UUID PRIMARY KEY,
    codigo              VARCHAR(30)    NOT NULL,
    nombre              VARCHAR(150)   NOT NULL,
    descripcion         VARCHAR(250),
    tipo                VARCHAR(30)    NOT NULL,
    ubicacion_padre_id  UUID REFERENCES parametros.ubicaciones(id),
    direccion           VARCHAR(250),
    latitud             NUMERIC(10,7),
    longitud            NUMERIC(10,7),
    created_at          TIMESTAMPTZ    NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100)
);

CREATE UNIQUE INDEX uk_ubicacion_codigo
    ON parametros.ubicaciones (LOWER(codigo));

CREATE INDEX ix_ubicacion_padre
    ON parametros.ubicaciones (ubicacion_padre_id);

CREATE INDEX ix_ubicacion_tipo
    ON parametros.ubicaciones (tipo);