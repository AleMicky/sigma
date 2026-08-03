CREATE TABLE organizacion.registros_migracion (
    id                UUID PRIMARY KEY,
    sistema_origen    VARCHAR(50)  NOT NULL,
    entidad           VARCHAR(100) NOT NULL,
    id_origen         VARCHAR(200) NOT NULL,
    id_destino        UUID,
    estado            VARCHAR(20)  NOT NULL,
    mensaje           TEXT,
    fecha_registro    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uk_registros_migracion_origen
    ON organizacion.registros_migracion (sistema_origen, entidad, id_origen);

CREATE INDEX idx_registros_migracion_estado
    ON organizacion.registros_migracion (estado);

CREATE INDEX idx_registros_migracion_fecha_registro
    ON organizacion.registros_migracion (fecha_registro);

CREATE INDEX idx_registros_migracion_entidad
    ON organizacion.registros_migracion (entidad);