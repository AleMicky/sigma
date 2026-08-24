CREATE TABLE mantenimientos.orden_trabajo_actividad_evidencias (
    id                         UUID          PRIMARY KEY,
    orden_trabajo_actividad_id UUID          NOT NULL,
    nombre_archivo             VARCHAR(255)  NOT NULL,
    tipo_mime                  VARCHAR(100)  NOT NULL,
    tamanio                    BIGINT,
    url                        VARCHAR(1000) NOT NULL,
    created_at                 TIMESTAMPTZ   NOT NULL,
    updated_at                 TIMESTAMPTZ,
    created_by                 VARCHAR(100),
    updated_by                 VARCHAR(100)
);

CREATE INDEX idx_ot_actividad_evidencia_actividad
    ON mantenimientos.orden_trabajo_actividad_evidencias (orden_trabajo_actividad_id);
